"use server";

import { createClient } from "@/utils/supabase/server";
import { CareerAnalysisResult } from "@/types/career";

export async function saveCareerPath(result: CareerAnalysisResult) {
  const supabase = createClient();
  
  // Get user from server-side session — never trust client-provided IDs
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Authentication required to save career paths" };
  const identifier = user.id;

  try {
    const { error } = await supabase
      .from('career_paths')
      .upsert({
        session_id: identifier,
        user_id: user.id,
        job_role: result.jobRole,
        company: result.company?.trim() || "",
        match_score: result.matchScore,
        data: result,
        created_at: new Date().toISOString()
      }, {
        onConflict: 'session_id,job_role,company'  // prevents duplicate rows
      });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Failed to save career path:", message);
    return { success: false, error: message };
  }
}

export async function getRecentCareerPaths() {
    const supabase = createClient();
    
    // Get user from server-side session
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    try {
        const { data, error } = await supabase
            .from('career_paths')
            .select('id, job_role, company, match_score, created_at, data')
            .eq('session_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5);
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error("❌ Failed to fetch career paths:", error instanceof Error ? error.message : error);
        return [];
    }
}
