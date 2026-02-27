"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/logger";
import { requireAdmin } from "@/lib/auth-utils";

// Use shared requireAdmin from lib/auth-utils
const isAdmin = requireAdmin;

export async function getAdminStats() {
    if (!await isAdmin()) {
        return { success: false, error: "Unauthorized" };
    }

    const supabase = createClient();
    try {
        // Count users
        const { count: userCount, error: userError } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });

        if (userError) throw userError;

        // Fetch some basic stats from quiz results
        const { data: results, count: quizCount, error: quizError } = await supabase
            .from('quiz_results')
            .select('score, total_questions', { count: 'exact' });

        if (quizError) throw quizError;

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
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
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
        const { data, error } = await supabase
            .from('quiz_results')
            .select('id, user_id, nickname, category, score, total_questions, completed_at, session_id')
            .order('completed_at', { ascending: false })
            .limit(limit);

        if (error) throw error;

        return { success: true, data: data || [] };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
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
        const { error } = await supabase
            .from('quiz_results')
            .delete()
            .eq('id', id);

        if (error) throw error;
        
        revalidatePath("/admin");
        revalidatePath("/"); // Update public leaderboard if needed
        return { success: true };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        logger.error("Failed to delete result:", error);
        return { success: false, error: message };
    }
}
