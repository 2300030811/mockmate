"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin"; // Import Admin Client
import { revalidatePath } from "next/cache";
import { validateNickname } from "@/utils/moderation";

import { getRawQuestions } from "@/app/actions/quiz";
import { checkAnswer } from "@/utils/quiz-helpers";

export async function saveQuizResult(data: {
  sessionId: string;
  category: string;
  userAnswers: Record<string, any>;
  totalQuestions: number; // Claimed total
  nickname?: string;
}) {
  const supabase = createClient();
  const adminDb = createAdminClient(); // Initialize Admin Client

  try {
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || null;

    if (data.nickname) {
        const validation = validateNickname(data.nickname);
        if (!validation.success) {
            return { success: false, error: validation.error };
        }
    }

    // 1. Fetch Source of Truth
    const questions = await getRawQuestions(data.category);
    if (!questions || questions.length === 0) {
        throw new Error("Failed to validate quiz: Source questions not found.");
    }

    // 2. Calculate Score Server-Side
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

    const { data: existing } = await query.maybeSingle();

    if (existing) {
      // Use Admin Client to UPDATE
      const { error } = await adminDb
        .from('quiz_results')
        .update({ nickname: data.nickname || null })
        .eq('id', existing.id);
      
      if (error) throw error;
      revalidatePath("/");
      return { success: true, updated: true };
    }

    // Use Admin Client to INSERT
    const { error } = await adminDb
      .from('quiz_results')
      .insert({
        session_id: data.sessionId,
        user_id: userId,
        category: data.category,
        score: scoreToSave,
        total_questions: questions.length, // Ensure strict consistency with server-side count
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
    const supabase = createClient();
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
    } catch (error: any) {
        console.error("❌ Failed to update nickname:", error.message);
        return { success: false, error: error.message };
    }
}

export async function getLeaderboard(category: string) {
    const supabase = createClient();
    try {
        const { data, error } = await supabase
            .from('quiz_results')
            .select('id, nickname, score, total_questions, completed_at')
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

export async function deleteQuizResult(id: string) {
    const supabase = createClient();
    try {
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
    } catch (error: any) {
        console.error("❌ Failed to delete result:", error.message);
        return { success: false, error: error.message };
    }
}
