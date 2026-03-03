"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { logger } from "@/lib/logger";

interface SaveSessionInput {
  type: string;
  difficulty: string;
  topic?: string;
  messages: { role: string; content: string }[];
  aiSummary: string | null;
  stats: any;
  durationSeconds: number;
}

/**
 * Saves a completed interview session to the database.
 * Uses service role client to bypass RLS for insert.
 * Returns the session ID on success, or null on failure.
 */
export async function saveInterviewSession(input: SaveSessionInput): Promise<string | null> {
  try {
    // Validate inputs
    const ALLOWED_TYPES = ["behavioral", "technical"];
    const ALLOWED_DIFFICULTIES = ["junior", "mid", "senior"];
    const safeType = ALLOWED_TYPES.includes(input.type) ? input.type : "behavioral";
    const safeDifficulty = ALLOWED_DIFFICULTIES.includes(input.difficulty) ? input.difficulty : "mid";
    const safeMessages = Array.isArray(input.messages) ? input.messages.slice(0, 100) : [];
    const safeTopic = typeof input.topic === "string" ? input.topic.slice(0, 100) : null;
    const safeDuration = typeof input.durationSeconds === "number" ? Math.min(Math.max(0, input.durationSeconds), 7200) : 0;
    const safeStats = input.stats && typeof input.stats === "object" ? input.stats : {};

    // Get current user (optional — guests can also have sessions saved)
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const admin = createAdminClient();

    const { data, error } = await admin
      .from("interview_sessions")
      .insert({
        user_id: user?.id ?? null,
        type: safeType,
        difficulty: safeDifficulty,
        topic: safeTopic || null,
        messages: safeMessages,
        ai_summary: input.aiSummary,
        stats: safeStats,
        duration_seconds: safeDuration,
      })
      .select("id")
      .single();

    if (error) {
      logger.error("Failed to save interview session:", error);
      return null;
    }

    return data?.id ?? null;
  } catch (err) {
    logger.error("saveInterviewSession error:", err);
    return null;
  }
}

/**
 * Fetches interview sessions for the current authenticated user.
 * Returns empty array if not authenticated.
 */
export async function getInterviewSessions(limit = 20) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
      .from("interview_sessions")
      .select("id, type, difficulty, topic, stats, duration_seconds, ai_summary, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      logger.error("Failed to fetch interview sessions:", error);
      return [];
    }

    return data ?? [];
  } catch (err) {
    logger.error("getInterviewSessions error:", err);
    return [];
  }
}

/**
 * Fetches a single interview session by ID (with full messages).
 * Only returns if the session belongs to the current user.
 */
export async function getInterviewSessionById(id: string) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
      .from("interview_sessions")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      logger.error("Failed to fetch interview session:", error);
      return null;
    }

    return data;
  } catch (err) {
    logger.error("getInterviewSessionById error:", err);
    return null;
  }
}
