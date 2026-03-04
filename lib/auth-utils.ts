"use server";

import { createClient } from "@/utils/supabase/server";
import { logger } from "@/lib/logger";

/**
 * Checks if the current user is authenticated and returns their user object.
 * Returns null if not authenticated.
 */
export async function requireAuth() {
  try {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
  } catch (err: any) {
    if (err?.message !== 'Request timed out') {
      logger.warn("requireAuth failed with error:", err.message);
    }
    return null;
  }
}

/**
 * Checks if the current user is an admin.
 * Returns false if not authenticated or not admin.
 */
export async function requireAdmin(): Promise<boolean> {
  try {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return false;

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    return profile?.role === "admin";
  } catch (err: any) {
    if (err?.message !== 'Request timed out') {
      logger.warn("requireAdmin failed with error:", err.message);
    }
    return false;
  }
}

/**
 * Returns a configured Groq API key, using key rotation when available.
 * Falls back to direct env var if keyManager returns empty.
 */
export async function getGroqApiKey(): Promise<string> {
  // Lazy import to avoid circular deps at module level
  const { getNextKey } = require("@/utils/keyManager");
  const key = getNextKey("GROQ_API_KEY") || process.env.GROQ_API_KEY;
  if (!key) {
    logger.error("Groq API Key missing from environment");
  }
  return key || "";
}
