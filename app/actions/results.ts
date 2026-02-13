"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { validateNickname } from "@/utils/moderation";

export async function saveQuizResult(data: {
  sessionId: string;
  category: string;
  score: number;
  totalQuestions: number;
  nickname?: string;
}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || null;

    if (data.nickname) {
        const validation = validateNickname(data.nickname);
        if (!validation.success) {
            return { success: false, error: validation.error };
        }
    }

    // Check if there's a very recent result (last 1 minute)
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
    
    let query = supabase
      .from('quiz_results')
      .select('id')
      .eq('category', data.category)
      .eq('score', data.score)
      .gt('completed_at', oneMinuteAgo);

    if (userId) {
        query = query.eq('user_id', userId);
    } else {
        query = query.eq('session_id', data.sessionId);
    }

    const { data: existing } = await query.maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('quiz_results')
        .update({ nickname: data.nickname || null })
        .eq('id', existing.id);
      
      if (error) throw error;
      revalidatePath("/");
      return { success: true, updated: true };
    }

    const { error } = await supabase
      .from('quiz_results')
      .insert({
        session_id: data.sessionId,
        user_id: userId,
        category: data.category,
        score: data.score,
        total_questions: data.totalQuestions,
        nickname: data.nickname || null,
        completed_at: new Date().toISOString()
      });

    if (error) throw error;
    
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("❌ Failed to save quiz result:", error.message);
    return { success: false, error: error.message };
  }
}

export async function getRecentResults(sessionId: string) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        let query = supabase
            .from('quiz_results')
            .select('*')
            .order('completed_at', { ascending: false })
            .limit(10);
        
        if (user) {
            // Priority: User's own results
            query = query.eq('user_id', user.id);
        } else {
            // Fallback: Current session results
            query = query.eq('session_id', sessionId);
        }

        const { data, error } = await query;
        
        if (error) throw error;
        return data;
    } catch (error: any) {
        console.error("❌ Failed to fetch results:", error.message);
        return [];
    }
}

export async function updateQuizResultNickname(id: string, nickname: string) {
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
    } catch (error: any) {
        console.error("❌ Failed to update nickname:", error.message);
        return { success: false, error: error.message };
    }
}

export async function getLeaderboard(category: string) {
    try {
        const { data, error } = await supabase
            .from('quiz_results')
            .select('nickname, score, total_questions, completed_at')
            .eq('category', category)
            .not('nickname', 'is', null)
            .neq('nickname', '')
            .order('score', { ascending: false })
            .order('completed_at', { ascending: false })
            .limit(10);
            
        if (error) throw error;
        return data || [];
    } catch (error: any) {
        console.error("❌ Failed to fetch leaderboard:", error.message);
        return [];
    }
}
