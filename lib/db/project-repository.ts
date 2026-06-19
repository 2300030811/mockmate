import { SupabaseClient } from "@supabase/supabase-js";
import { throwIfError } from "./base";

export interface ProjectProgressData {
  userId: string;
  sessionId?: string;
  projectId: string;
  timeTaken: number;
  hintsUsed: number;
  score?: number | null;
  analysis_breakdown?: any;
}

export const projectRepository = {
  async saveProgress(db: SupabaseClient, data: ProjectProgressData) {
    const res = await db
      .from("project_results")
      .insert({
        user_id: data.userId,
        session_id: data.sessionId || null,
        project_id: data.projectId,
        time_taken: data.timeTaken,
        hints_used: data.hintsUsed,
        score: data.score ?? null,
        analysis_breakdown: data.analysis_breakdown ?? null,
      });
    return throwIfError(res);
  },

  async getCompletedProjects(db: SupabaseClient, userId: string) {
    const res = await db
      .from("project_results")
      .select("project_id")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false });
    return throwIfError(res);
  },

  async getProjectStats(db: SupabaseClient, projectId: string) {
    const res = await db
      .from("project_results")
      .select("score, time_taken")
      .eq("project_id", projectId);
    return throwIfError(res);
  },
};
