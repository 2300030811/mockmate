"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";
import { validateNickname } from "@/utils/moderation";
import { withRetry } from "@/lib/retry";
import { rateLimit } from "@/lib/rate-limit";

import { getRawQuestions } from "@/app/actions/quiz";
import { checkAnswer } from "@/utils/quiz-helpers";

import { ActivityItem, LeaderboardItem } from "@/types/dashboard";
import type { QuizQuestion } from "@/types";
import { Redis } from "@upstash/redis";
import { syncProfileStats } from "@/lib/profile-sync";
import { parseArenaBaseCategory } from "@/lib/arena-category";

// Initialize Redis if configured
const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
    ? Redis.fromEnv()
    : null;

export async function saveQuizResult(data: {
    sessionId: string;
    category: string;
    userAnswers: Record<string, string | string[] | Record<string, string> | boolean | number>;
    totalQuestions: number; // Claimed total
    nickname?: string;
    generatedQuiz?: QuizQuestion[]; // Optional: For AI generated quizzes where we pass the source of truth
    arenaStatus?: 'win' | 'loss' | 'tie';
    arenaTotalQuestions?: number;
}) {
    const supabase = createClient();
    const adminDb = createAdminClient(); // Initialize Admin Client

    try {
        const { data: { user } } = await withRetry(
          () => supabase.auth.getUser(),
          { retries: 1, baseDelay: 1000, label: "Save result auth" }
        ).then(r => r).catch(() => ({ data: { user: null } }));
        const userId = user?.id || null;

        // Resolve nickname (Required by DB constraint)
        let finalNickname = data.nickname;
        if (!finalNickname && userId) {
            const { data: profile } = await adminDb
                .from('profiles')
                .select('nickname')
                .eq('id', userId)
                .single();
            finalNickname = profile?.nickname;
        }
        if (!finalNickname) {
            finalNickname = "Guest";
        }

        if (data.nickname) {
            const validation = validateNickname(data.nickname);
            if (!validation.success) {
                return { success: false, error: validation.error };
            }
        }

        let questions: QuizQuestion[] = [];

        // 1. Determine Source of Truth
        if (data.generatedQuiz && (data.category === "AI Generated" || data.category.startsWith("PDF:"))) {
            // For AI quizzes, trust the passed quiz data as source of truth
            questions = data.generatedQuiz;
        } else {
            // For static quizzes, fetch from server-side source
            const sourceCategory = parseArenaBaseCategory(data.category);

            questions = await getRawQuestions(sourceCategory);
        }

        if (!questions || questions.length === 0) {
            throw new Error(`Failed to validate quiz: Questions not found for ${data.category}.`);
        }

        // 2. Calculate Score Server-Side
        let calculatedScore = 0;
        // ... rest of logic

        // Helper to normalize ID for map lookup (some are strings "1", some numbers 1)
        const questionMap = new Map(questions.map(q => [String(q.id), q]));

        Object.entries(data.userAnswers).forEach(([qId, ans]) => {
            const question = questionMap.get(String(qId));
            if (question) {
                if (checkAnswer(question, ans)) {
                    calculatedScore++;
                }
            }
        });

        const scoreToSave = calculatedScore;

        // Check if there's a very recent result (last 1 minute)
        const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();

        // Use Admin Client to query without RLS blocking (or standard client works for read if policy exists)
        // But for consistency/speed in this privileged action, let's use adminDb for the write check too.
        let query = adminDb
            .from('quiz_results')
            .select('id')
            .eq('category', data.category)
            .eq('score', scoreToSave)
            .gt('completed_at', oneMinuteAgo);

        if (userId) {
            query = query.eq('user_id', userId);
        } else {
            query = query.eq('session_id', data.sessionId);
        }

        // For arena matches, include session_id in de-duplication to allow distinct battles
        if (data.arenaStatus) {
            query = query.eq('session_id', data.sessionId);
        }

        const { data: existing } = await query.maybeSingle();

        if (existing) {
            // Use Admin Client to UPDATE
            const { error } = await adminDb
                .from('quiz_results')
                .update({ nickname: finalNickname })
                .eq('id', existing.id);

            if (error) throw error;
            revalidatePath("/");
            revalidatePath("/dashboard");
            return { success: true, updated: true };
        }

        // Use Admin Client to INSERT
        const { error } = await withRetry(
          () => Promise.resolve(adminDb
            .from('quiz_results')
            .insert({
                session_id: data.sessionId,
                user_id: userId,
                category: data.category,
                score: scoreToSave,
                total_questions: questions.length, // Ensure strict consistency with server-side count
                nickname: finalNickname,
                completed_at: new Date().toISOString()
            })),
          { retries: 2, baseDelay: 1000, label: "Insert quiz result" }
        );

        if (error) throw error;

        // ── Sync XP, Streak, Elo on profiles ──
        if (userId) {
          try {
            const isArena = data.category.includes("arena") || !!data.arenaStatus;
            const { parseArenaStatus } = await import("@/lib/arena-category");
            const winStatus = data.arenaStatus || parseArenaStatus(data.category);

            const syncType = isArena && winStatus
              ? "arena" as const
              : data.category === "daily-challenge"
                ? "daily-challenge" as const
                : "quiz" as const;

            await syncProfileStats({
              userId,
              type: syncType,
              score: scoreToSave,
              totalQuestions: data.arenaTotalQuestions || questions.length,
              arenaStatus: winStatus,
            });
          } catch (syncErr) {
            // Non-fatal — the quiz result was saved, stats sync can be retried
            console.error("⚠️ Failed to sync profile stats:", syncErr);
          }
        }

        revalidatePath("/");
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "An unknown error occurred";
        console.error("❌ Failed to save quiz result:", message);
        return { success: false, error: message };
    }
}

export async function getRecentResults(sessionId?: string): Promise<ActivityItem[]> {
    const supabase = createClient();
    try {
        const { data: { user } } = await supabase.auth.getUser();

        let query = supabase
            .from('quiz_results')
            .select('id, category, score, total_questions, completed_at, session_id, user_id')
            .order('completed_at', { ascending: false })
            .limit(10);

        if (user) {
            query = query.eq('user_id', user.id);
        } else {
            query = query.eq('session_id', sessionId);
        }

        const { data, error } = await withRetry(
          () => Promise.resolve(query),
          { retries: 2, baseDelay: 1000, label: "Fetch results" }
        );

        if (error) throw error;
        return (data as ActivityItem[]) || [];
    } catch (error: unknown) {
        console.error("❌ Failed to fetch results:", error instanceof Error ? error.message : "Unknown error");
        return [];
    }
}

export async function updateQuizResultNickname(id: string, nickname: string) {
    const supabase = createClient();
    try {
        const validation = validateNickname(nickname);
        if (!validation.success) {
            return { success: false, error: validation.error };
        }

        const { error } = await supabase
            .from('quiz_results')
            .update({ nickname })
            .eq('id', id);

        if (error) throw error;
        revalidatePath("/");
        return { success: true };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "An unknown error occurred";
        console.error("❌ Failed to update nickname:", message);
        return { success: false, error: message };
    }
}


export async function getLeaderboard(category: string, timeframe: 'all-time' | 'weekly' = 'all-time'): Promise<LeaderboardItem[]> {
    const cacheKey = `leaderboard:${category}:${timeframe}`;

    // 1. Try to fetch from Redis Cache
    try {
        if (redis) {
            const cached = await redis.get<LeaderboardItem[]>(cacheKey);
            if (cached) {
                return cached;
            }
        }
    } catch (e) {
        console.warn("⚠️ Redis cache read failed:", e);
    }

    const supabase = createClient();
    try {
        let query = supabase
            .from('quiz_results')
            .select('id, nickname, score, total_questions, completed_at')
            .eq('category', category)
            .not('nickname', 'is', null)
            .neq('nickname', '')
            .gt('score', 0);

        if (timeframe === 'weekly') {
            const now = new Date();
            const lastSunday = new Date(now);
            lastSunday.setDate(now.getDate() - now.getDay());
            lastSunday.setHours(0, 0, 0, 0);

            query = query.gte('completed_at', lastSunday.toISOString());
        }

        query = query
            .order('score', { ascending: false })
            .order('completed_at', { ascending: false })
            .limit(100); // Fetch top 100, then sort fairly by percentage to display top 50

        const { data, error } = await query;
        if (error) throw error;

        const rawResults = (data as LeaderboardItem[]) || [];

        // Pre-compute percentage and time to optimize sorting
        const withStats = rawResults.map(r => ({
            ...r,
            percent: r.total_questions > 0 ? r.score / r.total_questions : 0,
            timeMs: new Date(r.completed_at).getTime()
        }));

        // Sort fairly by percentage correct
        withStats.sort((a, b) => {
            if (b.percent !== a.percent) {
                return b.percent - a.percent;
            }
            // Tie-breaker 1: Total questions
            if (b.total_questions !== a.total_questions) {
                return b.total_questions - a.total_questions;
            }
            // Tie-breaker 2: Most recent
            return b.timeMs - a.timeMs;
        });

        // Strip back the added properties to match the interface
        const finalResults = withStats.slice(0, 50).map(({ percent, timeMs, ...rest }) => rest);

        // 3. Save to Redis Cache (expire in 5 minutes)
        try {
            if (redis && finalResults.length > 0) {
                // Background async cache set to not block response
                redis.set(cacheKey, finalResults, { ex: 300 }).catch(e => console.warn("Redis set failed:", e));
            }
        } catch (e) {
            console.warn("⚠️ Redis cache write failed:", e);
        }

        return finalResults;
    } catch (error: unknown) {
        console.error("❌ Failed to fetch leaderboard:", error instanceof Error ? error.message : "Unknown error");
        return [];
    }
}

export async function deleteQuizResult(id: string) {
    const supabase = createClient();
    try {
        const { success, message } = await rateLimit("default");
        if (!success) return { success: false, error: message || "Rate limited" };

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Unauthorized");

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            throw new Error("Forbidden: Admin access required");
        }

        const { error } = await supabase
            .from('quiz_results')
            .delete()
            .eq('id', id);

        if (error) throw error;
        revalidatePath("/");
        return { success: true };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "An unknown error occurred";
        console.error("❌ Failed to delete result:", message);
        return { success: false, error: message };
    }
}
