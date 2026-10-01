"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/logger";
import { requireAdmin } from "@/lib/auth-utils";
import { profileRepository } from "@/lib/db/profile-repository";
import { quizRepository } from "@/lib/db/quiz-repository";

// Use shared requireAdmin from lib/auth-utils
const isAdmin = requireAdmin;

export interface AdminDashboardData {
    totalUsers: number;
    totalQuizzes: number;
    avgScore: number;
    passRate: number;
    totalInterviews: number;
    modeBreakdown: {
        standard: number;
        arena: number;
        dailyChallenge: number;
    };
    topCategories: Array<{ category: string; count: number }>;
    recentActivity: Array<{
        id: string;
        nickname: string;
        category: string;
        score: number;
        total_questions: number;
        completed_at: string;
        quiz_mode?: string;
    }>;
}

export async function getAdminStats() {
    if (!await isAdmin()) {
        return { success: false, error: "Unauthorized" };
    }

    const supabase = createClient();
    try {
        // Count users
        const userCount = await profileRepository.countProfiles(supabase);

        // Fetch quiz results data for telemetry
        const { data: results, count: quizCount } = await supabase
            .from("quiz_results")
            .select("score, total_questions, category, quiz_mode", { count: "exact" });

        let totalScorePercentage = 0;
        let validQuizzes = 0;
        let passedQuizzes = 0;
        const modeCounts = { standard: 0, arena: 0, dailyChallenge: 0 };
        const categoryMap: Record<string, number> = {};

        if (results) {
            results.forEach((r: any) => {
                if (r.total_questions > 0) {
                    const pct = (r.score / r.total_questions) * 100;
                    totalScorePercentage += pct;
                    validQuizzes++;
                    if (pct >= 70) passedQuizzes++;
                }

                // Mode distribution
                if (r.quiz_mode === "arena") {
                    modeCounts.arena++;
                } else if (r.quiz_mode === "daily-challenge") {
                    modeCounts.dailyChallenge++;
                } else {
                    modeCounts.standard++;
                }

                // Category tally
                if (r.category) {
                    categoryMap[r.category] = (categoryMap[r.category] || 0) + 1;
                }
            });
        }
        
        const avgScore = validQuizzes > 0 ? Math.round(totalScorePercentage / validQuizzes) : 0;
        const passRate = validQuizzes > 0 ? Math.round((passedQuizzes / validQuizzes) * 100) : 0;

        // Top categories sorted by count
        const topCategories = Object.entries(categoryMap)
            .map(([category, count]) => ({ category, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // Fetch latest 6 results for live platform activity
        const recent = await quizRepository.getAllQuizResults(supabase, 6).catch(() => []);

        // Optional: count interview sessions
        let interviewCount = 0;
        try {
            const { count } = await supabase
                .from("interview_sessions")
                .select("id", { count: "exact", head: true });
            interviewCount = count || 0;
        } catch {
            interviewCount = 0;
        }

        const data: AdminDashboardData = {
            totalUsers: userCount || 0,
            totalQuizzes: quizCount || 0,
            avgScore,
            passRate,
            totalInterviews: interviewCount,
            modeBreakdown: modeCounts,
            topCategories,
            recentActivity: (recent || []).map((r: any) => ({
                id: r.id,
                nickname: r.nickname || "Guest",
                category: r.category,
                score: r.score,
                total_questions: r.total_questions,
                completed_at: r.completed_at,
                quiz_mode: r.quiz_mode || "standard",
            })),
        };

        return { 
            success: true, 
            data
        };
    } catch (error: any) {
        const message = error.message || "Unknown error";
        logger.error("Failed to get admin stats:", error);
        return { success: false, error: message };
    }
}

export async function getAllQuizResults(limit = 50) {
    if (!await isAdmin()) {
        return { success: false, error: "Unauthorized" };
    }

    const supabase = createClient();
    try {
        const data = await quizRepository.getAllQuizResults(supabase, limit);

        return { success: true, data: data || [] };
    } catch (error: any) {
        const message = error.message || "Unknown error";
        logger.error("Failed to fetch all results:", error);
        return { success: false, error: message };
    }
}

export async function deleteResult(id: string) {
    if (!await isAdmin()) {
        return { success: false, error: "Unauthorized" };
    }

    const supabase = createClient();
    try {
        await quizRepository.deleteResult(supabase, id);
        
        revalidatePath("/admin");
        revalidatePath("/"); // Update public leaderboard if needed
        return { success: true };
    } catch (error: any) {
        const message = error.message || "Unknown error";
        logger.error("Failed to delete result:", error);
        return { success: false, error: message };
    }
}
