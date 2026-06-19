/**
 * Centralised profile stats synchronisation.
 *
 * Extracts the duplicated "fetch profile → compute streak → calculate XP →
 * update profile" pattern from results.ts and challenge.ts into a single
 * reusable function.
 */

import { createAdminClient } from "@/utils/supabase/admin";
import {
  computeNewStreak,
  getStreakMultiplier,
  calculateQuizXP,
  calculateArenaXP,
  calculateDailyChallengeXP,
  calculateLevel,
  calculateEloChange,
  ELO_CONFIG,
} from "@/lib/scoring";
import { profileRepository } from "@/lib/db/profile-repository";

export interface SyncProfileInput {
  userId: string;
  type: "quiz" | "arena" | "daily-challenge";
  score: number;
  totalQuestions: number;
  arenaStatus?: "win" | "loss" | "tie" | null;
  dailyPoints?: number;
}

/**
 * Syncs XP, streak, level, and Elo on the user's profile after an activity.
 *
 * This is a "best-effort" sync — the caller should have already persisted
 * the quiz result before calling this. A failure here is non-fatal.
 */
export async function syncProfileStats(input: SyncProfileInput): Promise<void> {
  const adminDb = createAdminClient();

  try {
    const profile = await profileRepository.getStats(adminDb, input.userId);

    const currentXP = profile?.xp ?? 0;
    const currentStreak = profile?.streak ?? 0;
    const currentElo = profile?.elo ?? ELO_CONFIG.DEFAULT_ELO;
    const lastActivity = profile?.last_activity_at ?? null;

    // Compute streak
    const newStreak = computeNewStreak(currentStreak, lastActivity);

    // Calculate XP earned
    let xpEarned = 0;
    let eloChange = 0;

    if (input.type === "arena" && input.arenaStatus) {
      const accuracy =
        input.totalQuestions > 0 ? input.score / input.totalQuestions : 0;
      xpEarned = calculateArenaXP(
        input.score,
        accuracy,
        input.arenaStatus,
        newStreak,
      );
      // For elo, approximate opponent score
      const approximateOpponentScore = Math.max(
        0,
        input.totalQuestions - input.score,
      );
      eloChange = calculateEloChange(
        input.score,
        approximateOpponentScore,
        input.arenaStatus,
      );
    } else if (input.type === "daily-challenge") {
      const points = input.dailyPoints ?? input.score;
      xpEarned = calculateDailyChallengeXP(points, newStreak);
    } else {
      // Standard quiz
      xpEarned = calculateQuizXP(input.score, newStreak);
    }

    const newXP = currentXP + xpEarned;
    const newLevel = calculateLevel(newXP);
    const newElo = Math.max(0, currentElo + eloChange);

    await profileRepository.updateStats(adminDb, input.userId, {
      xp: newXP,
      level: newLevel,
      streak: newStreak,
      elo: newElo,
    });
  } catch (err) {
    console.error("⚠️ syncProfileStats database error:", err);
  }
}
