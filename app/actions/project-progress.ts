"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { logger } from "@/lib/logger";

export interface ProjectProgressData {
  projectId: string;
  timeTaken: number;
  hintsUsed: number;
  score?: number; // Optional: AI analysis score
  breakdown?: {
    correctness: number;
    codeQuality: number;
    bestPractices: number;
    completeness: number;
  };
}

/**
 * Save project completion to database for logged-in users.
 * Anonymous users rely on localStorage only.
 * This server action runs with SERVICE_ROLE privileges to bypass public INSERT restrictions.
 */
export async function saveProjectProgress(
  data: ProjectProgressData,
  sessionId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get authenticated user (if any)
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // If no user is logged in, only save to localStorage (handled client-side)
    if (!user) {
      logger.info("saveProjectProgress: Anonymous user, skipping DB save");
      return { success: false, error: "User not authenticated" };
    }

    // Use service role client to insert (bypasses RLS policies)
    const supabaseAdmin = createAdminClient();

    const { error } = await supabaseAdmin
      .from("project_results")
      .insert({
        user_id: user.id,
        session_id: sessionId,
        project_id: data.projectId,
        time_taken: data.timeTaken,
        hints_used: data.hintsUsed,
        score: data.score ?? null,
        analysis_breakdown: data.breakdown ?? null,
      });

    if (error) {
      logger.error("Failed to save project progress:", error);
      return { success: false, error: error.message };
    }

    logger.info(`Project progress saved: ${user.id} / ${data.projectId}`);
    return { success: true };
  } catch (err) {
    logger.error("saveProjectProgress error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Fetch completed projects for the logged-in user.
 * Returns an array of project IDs that have been completed.
 */
export async function getCompletedProjects(): Promise<string[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from("project_results")
      .select("project_id")
      .eq("user_id", user.id)
      .order("completed_at", { ascending: false });

    if (error) {
      logger.error("Failed to fetch completed projects:", error);
      return [];
    }

    return [...new Set((data || []).map((r) => r.project_id))]; // Deduplicate
  } catch (err) {
    logger.error("getCompletedProjects error:", err);
    return [];
  }
}

/**
 * Fetch project progress stats for a specific project.
 * Useful for displaying stats on project cards (e.g., completion rate, average time).
 */
export async function getProjectStats(projectId: string): Promise<{
  totalCompletions: number;
  averageScore: number | null;
  averageTimeTaken: number;
}> {
  try {
    const supabaseAdmin = createAdminClient();

    const { data, error } = await supabaseAdmin
      .from("project_results")
      .select("score, time_taken")
      .eq("project_id", projectId);

    if (error) {
      logger.error("Failed to fetch project stats:", error);
      return {
        totalCompletions: 0,
        averageScore: null,
        averageTimeTaken: 0,
      };
    }

    const results = data || [];
    if (results.length === 0) {
      return {
        totalCompletions: 0,
        averageScore: null,
        averageTimeTaken: 0,
      };
    }

    const scored = results.filter((r): r is typeof r & { score: number } => r.score !== null);
    const avgScore = scored.length > 0
      ? Math.round(scored.reduce((sum, r) => sum + r.score, 0) / scored.length)
      : null;

    const avgTime = Math.round(
      results.reduce((sum, r) => sum + (r.time_taken ?? 0), 0) / results.length
    );

    return {
      totalCompletions: results.length,
      averageScore: avgScore,
      averageTimeTaken: avgTime,
    };
  } catch (err) {
    logger.error("getProjectStats error:", err);
    return {
      totalCompletions: 0,
      averageScore: null,
      averageTimeTaken: 0,
    };
  }
}
