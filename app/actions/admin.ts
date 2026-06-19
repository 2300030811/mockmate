"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/logger";
import { requireAdmin } from "@/lib/auth-utils";
import { profileRepository } from "@/lib/db/profile-repository";
import { quizRepository } from "@/lib/db/quiz-repository";

// Use shared requireAdmin from lib/auth-utils
const isAdmin = requireAdmin;

export async function getAdminStats() {
    if (!await isAdmin()) {
        return { success: false, error: "Unauthorized" };
    }

    const supabase = createClient();
    try {
        // Count users
        const userCount = await profileRepository.countProfiles(supabase);

        // Fetch some basic stats from quiz results
        const { data: results, count: quizCount } = await quizRepository.countResults(supabase);

        let totalScorePercentage = 0;
        let validQuizzes = 0;

        if (results) {
            results.forEach(r => {
                if (r.total_questions > 0) {
                    totalScorePercentage += (r.score / r.total_questions) * 100;
                    validQuizzes++;
                }
            });
        }
        
        const avgScore = validQuizzes > 0 ? Math.round(totalScorePercentage / validQuizzes) : 0;

        return { 
            success: true, 
            data: { 
                totalUsers: userCount || 0, 
                totalQuizzes: quizCount || 0,
                avgScore: avgScore
            } 
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
