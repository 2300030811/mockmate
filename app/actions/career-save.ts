"use server";

import { createClient } from "@/utils/supabase/server";
import { CareerAnalysisResult } from "@/types/career";
import { careerPathRepository } from "@/lib/db/career-path-repository";

export async function saveCareerPath(result: CareerAnalysisResult) {
  const supabase = createClient();
  
  // Get user from server-side session — never trust client-provided IDs
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Authentication required to save career paths" };
  const identifier = user.id;

  try {
    await careerPathRepository.saveCareerPath(supabase, {
      sessionId: identifier,
      userId: user.id,
      jobRole: result.jobRole,
      company: result.company?.trim() || "",
      matchScore: result.matchScore,
      data: result,
    });

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
    const data = await careerPathRepository.getRecentCareerPaths(supabase, user.id, 5);
    return data || [];
  } catch (error) {
    console.error("❌ Failed to fetch career paths:", error instanceof Error ? error.message : error);
    return [];
  }
}
