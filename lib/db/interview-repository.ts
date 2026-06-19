import { SupabaseClient } from "@supabase/supabase-js";
import { requireSingle, throwIfError } from "./base";

export interface SaveSessionData {
  userId: string | null;
  type: string;
  difficulty: string;
  topic: string | null;
  messages: any[];
  aiSummary: string | null;
  stats: any;
  durationSeconds: number;
}

export const interviewRepository = {
  async saveSession(db: SupabaseClient, data: SaveSessionData) {
    const res = await db
      .from("interview_sessions")
      .insert({
        user_id: data.userId,
        type: data.type,
        difficulty: data.difficulty,
        topic: data.topic,
        messages: data.messages,
        ai_summary: data.aiSummary,
        stats: data.stats,
        duration_seconds: data.durationSeconds,
      })
      .select("id")
      .single();
    
    return requireSingle(res);
  },

  async getSessions(db: SupabaseClient, userId: string, limit = 20) {
    const res = await db
      .from("interview_sessions")
      .select("id, type, difficulty, topic, stats, duration_seconds, ai_summary, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);
    
    return throwIfError(res);
  },

  async getSessionById(db: SupabaseClient, id: string, userId: string) {
    const res = await db
      .from("interview_sessions")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();
    
    return requireSingle(res);
  },
};
