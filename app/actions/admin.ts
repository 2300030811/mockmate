"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Checks if the current user is an admin.
 */
async function isAdmin() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
    
    return profile?.role === 'admin';
}

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

        // Count quizzes taken
        const { count: quizCount, error: quizError } = await supabase
            .from('quiz_results')
            .select('*', { count: 'exact', head: true });

        if (quizError) throw quizError;

        return { 
            success: true, 
            data: { 
                totalUsers: userCount || 0, 
                totalQuizzes: quizCount || 0 
            } 
        };
    } catch (error: any) {
        console.error("Failed to get admin stats:", error);
        return { success: false, error: error.message };
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
            .select('*')
            .order('completed_at', { ascending: false })
            .limit(limit);

        if (error) throw error;

        return { success: true, data: data || [] };
    } catch (error: any) {
        console.error("Failed to fetch all results:", error);
        return { success: false, error: error.message };
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
    } catch (error: any) {
        console.error("Failed to delete result:", error);
        return { success: false, error: error.message };
    }
}
