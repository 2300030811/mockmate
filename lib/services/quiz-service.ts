import { SupabaseClient } from "@supabase/supabase-js";
import { validateNickname } from "@/utils/moderation";
import { withRetry } from "@/lib/retry";
import { getRawQuestions } from "@/app/actions/quiz";
import { checkAnswer } from "@/utils/quiz-helpers";
import type { QuizQuestion } from "@/types";
import { Redis } from "@upstash/redis";
import { profileRepository } from "@/lib/db/profile-repository";
import { quizRepository } from "@/lib/db/quiz-repository";
import { profileService } from "./profile-service";
import { parseArenaBaseCategory } from "@/lib/arena-category";

// Initialize Redis if configured
const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  ? Redis.fromEnv()
  : null;

export const quizService = {
  async saveQuizResult(
    supabase: SupabaseClient,
    adminDb: SupabaseClient,
    data: {
      sessionId: string;
      category: string;
      userAnswers: Record<string, string | string[] | Record<string, string> | boolean | number>;
      totalQuestions: number;
      nickname?: string;
      generatedQuiz?: QuizQuestion[];
      arenaStatus?: "win" | "loss" | "tie";
      arenaTotalQuestions?: number;
    }
  ) {
    const { data: { user } } = await withRetry(
      () => supabase.auth.getUser(),
      { retries: 1, baseDelay: 1000, label: "Save result auth" }
    ).then(r => r).catch(() => ({ data: { user: null } }));
    const userId = user?.id || null;

    // Resolve nickname (Required by DB constraint)
    let finalNickname: string = data.nickname || "";
    if (!finalNickname && userId) {
      const profile = await profileRepository.getProfileFields(adminDb, userId, "nickname");
      finalNickname = profile?.nickname || "";
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

    // Determine Source of Truth
    if (data.generatedQuiz && (data.category === "AI Generated" || data.category.startsWith("PDF:"))) {
      questions = data.generatedQuiz;
    } else {
      const sourceCategory = parseArenaBaseCategory(data.category);
      questions = await getRawQuestions(sourceCategory);
    }

    if (!questions || questions.length === 0) {
      throw new Error(`Failed to validate quiz: Questions not found for ${data.category}.`);
    }

    // Calculate Score Server-Side
    let calculatedScore = 0;
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
    const recentTimeAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

    const existing = await quizRepository.findDuplicateResult(adminDb, {
      category: data.category,
      score: scoreToSave,
      sinceDate: recentTimeAgo,
      userId,
      sessionId: data.sessionId,
      arenaStatus: data.arenaStatus,
    });

    if (existing) {
      await quizRepository.updateNickname(adminDb, existing.id, finalNickname);
      if (redis) {
        redis.del(`leaderboard:${data.category}:all-time`, `leaderboard:${data.category}:weekly`).catch(e => console.warn("Redis del failed:", e));
      }
      return { success: true, updated: true };
    }

    await withRetry(
      () => quizRepository.saveResult(adminDb, {
        session_id: data.sessionId,
        user_id: userId,
        category: data.category,
        score: scoreToSave,
        total_questions: data.totalQuestions,
        nickname: finalNickname,
        completed_at: new Date().toISOString()
      }),
      { retries: 2, baseDelay: 1000, label: "Insert quiz result" }
    );

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

        await profileService.syncStats(
          userId,
          syncType,
          scoreToSave,
          data.arenaTotalQuestions || data.totalQuestions,
          winStatus
        );
      } catch (syncErr) {
        console.error("⚠️ Failed to sync profile stats:", syncErr);
      }
    }

    if (redis) {
      redis.del(`leaderboard:${data.category}:all-time`, `leaderboard:${data.category}:weekly`).catch(e => console.warn("Redis del failed:", e));
    }

    return { success: true };
  },

  async updateNickname(adminDb: SupabaseClient, id: string, nickname: string) {
    const validation = validateNickname(nickname);
    if (!validation.success) {
      return { success: false, error: validation.error };
    }

    const resultData = await quizRepository.getResultById(adminDb, id);
    await quizRepository.updateNickname(adminDb, id, nickname);

    if (redis && resultData?.category) {
      redis.del(`leaderboard:${resultData.category}:all-time`, `leaderboard:${resultData.category}:weekly`).catch(e => console.warn("Redis del failed:", e));
    }

    return { success: true };
  },

  async deleteQuizResult(supabase: SupabaseClient, userId: string, id: string) {
    const profile = await profileRepository.getProfileFields(supabase, userId, "role");

    if (profile?.role !== "admin") {
      throw new Error("Forbidden: Admin access required");
    }

    await quizRepository.deleteResult(supabase, id);
    return { success: true };
  }
};
