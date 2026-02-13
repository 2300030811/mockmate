"use server";

import { supabase } from "@/lib/supabase";
import { CareerAnalysisResult } from "@/types/career";

export async function saveCareerPath(sessionId: string, result: CareerAnalysisResult) {
  try {
    const { error } = await supabase
      .from('career_paths')
      .insert({
        session_id: sessionId,
        job_role: result.jobRole,
        company: result.company || null,
        match_score: result.matchScore,
        data: result,
        created_at: new Date().toISOString()
      });

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error("❌ Failed to save career path:", error.message);
    return { success: false, error: error.message };
  }
}

export async function getRecentCareerPaths(sessionId: string) {
    try {
        const { data, error } = await supabase
            .from('career_paths')
            .select('*')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: false })
            .limit(5);
        
        if (error) throw error;
        return data;
    } catch (error: any) {
        console.error("❌ Failed to fetch career paths:", error.message);
        return [];
    }
}
