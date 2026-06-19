"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";
import { rateLimit } from "@/lib/rate-limit";
import type { QuizQuestion } from "@/types";
import { ActivityItem, LeaderboardItem } from "@/types/dashboard";
import { quizService } from "@/lib/services/quiz-service";
import { leaderboardService } from "@/lib/services/leaderboard-service";
import { withRetry } from "@/lib/retry";
import { quizRepository } from "@/lib/db/quiz-repository";

import { getRawQuestions } from "@/app/actions/quiz";
export { getRawQuestions };

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
    const adminDb = createAdminClient();

    try {
        const result = await quizService.saveQuizResult(supabase, adminDb, data);
        revalidatePath("/");
        revalidatePath("/dashboard");
        return result;
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

        const queryFn = () => quizRepository.getRecentResults(
            supabase,
            user ? user.id : null,
            user ? null : (sessionId || null),
            10
        );

        const data = await withRetry(
            queryFn,
            { retries: 2, baseDelay: 1000, label: "Fetch results" }
        );

        return (data as ActivityItem[]) || [];
    } catch (error: unknown) {
        console.error("❌ Failed to fetch results:", error instanceof Error ? error.message : "Unknown error");
        return [];
    }
}

export async function updateQuizResultNickname(id: string, nickname: string) {
    const adminDb = createAdminClient();
    try {
        const result = await quizService.updateNickname(adminDb, id, nickname);
        revalidatePath("/");
        return result;
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "An unknown error occurred";
        console.error("❌ Failed to update nickname:", message);
        return { success: false, error: message };
    }
}

export async function getLeaderboard(category: string, timeframe: 'all-time' | 'weekly' = 'all-time'): Promise<LeaderboardItem[]> {
    const supabase = createClient();
    try {
        return await leaderboardService.getLeaderboard(supabase, category, timeframe);
    } catch (error: any) {
        console.error("❌ Failed to fetch leaderboard:", error?.message || JSON.stringify(error) || "Unknown error");
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

        const result = await quizService.deleteQuizResult(supabase, user.id, id);
        revalidatePath("/");
        return result;
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "An unknown error occurred";
        console.error("❌ Failed to delete result:", message);
        return { success: false, error: message };
    }
}
