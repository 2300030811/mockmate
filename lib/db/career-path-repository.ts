import { SupabaseClient } from "@supabase/supabase-js";
import { throwIfError } from "./base";

export interface CareerPathData {
  userId: string;
  sessionId: string;
  jobRole: string;
  company: string;
  matchScore: number;
  data: any;
}

export const careerPathRepository = {
  async saveCareerPath(db: SupabaseClient, data: CareerPathData) {
    const res = await db
      .from("career_paths")
      .upsert({
        session_id: data.sessionId,
        user_id: data.userId,
        job_role: data.jobRole,
        company: data.company,
        match_score: data.matchScore,
        data: data.data,
        created_at: new Date().toISOString(),
      }, {
        onConflict: "session_id,job_role,company",
      });
    return throwIfError(res);
  },

  async getRecentCareerPaths(db: SupabaseClient, sessionId: string, limit = 5) {
    const res = await db
      .from("career_paths")
      .select("id, job_role, company, match_score, created_at, data")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false })
      .limit(limit);
    return throwIfError(res);
  },
};
