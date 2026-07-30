"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { logger } from "@/lib/logger";
import { interviewRepository } from "@/lib/db/interview-repository";

interface SessionStats {
  wpm?: number;
  sentiment?: string;
  keyConcepts?: string[];
  confidenceScore?: number;
  fillerWordCount?: number;
  fillerWordsPerMinute?: number;
  answerDepth?: string;
  starMethodCount?: number;
  questionsCovered?: number;
  vocabularyRichness?: number;
  technicalAccuracy?: number;
  avgResponseTimeSec?: number;
  longestAnswerWords?: number;
  shortestAnswerWords?: number;
}

interface SaveSessionInput {
  type: string;
  difficulty: string;
  topic?: string;
  messages: { role: string; content: string }[];
  aiSummary: string | null;
  stats: SessionStats;
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

    const data = await interviewRepository.saveSession(admin, {
      userId: user?.id ?? null,
      type: safeType,
      difficulty: safeDifficulty,
      topic: safeTopic,
      messages: safeMessages,
      aiSummary: input.aiSummary,
      stats: safeStats,
      durationSeconds: safeDuration,
    });

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

    const data = await interviewRepository.getSessions(supabase, user.id, limit);
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

    const data = await interviewRepository.getSessionById(supabase, id, user.id);
    return data;
  } catch (err) {
    logger.error("getInterviewSessionById error:", err);
    return null;
  }
}
