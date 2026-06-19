"use server";

import { createClient } from "@/utils/supabase/server";
import { logger } from "@/lib/logger";
import { profileRepository } from "@/lib/db/profile-repository";

function shouldSuppressAuthWarning(err: unknown): boolean {
  if (err instanceof Error) {
    const dynamicDigest = (err as Error & { digest?: string }).digest;
    return (
      err.message === "Request timed out" ||
      dynamicDigest === "DYNAMIC_SERVER_USAGE" ||
      err.message.includes("Dynamic server usage:")
    );
  }

  return false;
}

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
  } catch (err: unknown) {
    if (!shouldSuppressAuthWarning(err)) {
      logger.warn("requireAuth failed with error:", err);
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

    const profile = await profileRepository.getProfileFields(supabase, user.id, "role");

    return profile?.role === "admin";
  } catch (err: unknown) {
    if (!shouldSuppressAuthWarning(err)) {
      logger.warn("requireAdmin failed with error:", err);
    }
    return false;
  }
}
