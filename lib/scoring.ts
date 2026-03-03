/**
 * Centralised Scoring Engine
 *
 * Single source of truth for every XP, level, streak-multiplier and Elo calculation
 * used across the application. Import from here — never inline these formulas.
 */

// ─── XP Constants ───────────────────────────────────────────────────────────

export const XP_CONFIG = {
  /** Base XP awarded for completing any standard quiz */
  BASE_QUIZ_XP: 50,
  /** XP per correct answer in a standard quiz */
  PER_CORRECT_QUIZ: 10,

  /** Base XP awarded for participating in an arena match */
  BASE_ARENA_XP: 50,
  /** XP per correct answer in arena */
  PER_CORRECT_ARENA: 25,
  /** Bonus XP for winning an arena match */
  ARENA_WIN_BONUS: 150,
  /** Bonus XP for drawing an arena match */
  ARENA_DRAW_BONUS: 50,
  /** Maximum bonus from accuracy multiplier in arena (accuracy × this value) */
  ARENA_ACCURACY_MULTIPLIER: 200,

  /** Base XP for completing a daily challenge */
  DAILY_CHALLENGE_BASE: 10,
  /** XP per problem-point in daily challenge */
  PER_DAILY_POINT: 1,

  /** XP required per level (level = floor(xp / XP_PER_LEVEL) + 1) */
  XP_PER_LEVEL: 100,
} as const;

// ─── Streak Multiplier Tiers ────────────────────────────────────────────────

/**
 * Map of minimum streak days → XP multiplier.
 * The highest tier whose threshold is ≤ the user's current streak applies.
 */
export const STREAK_MULTIPLIERS: Record<number, number> = {
  3: 1.2,
  7: 1.5,
  14: 1.75,
  30: 2.0,
};

// ─── Elo Constants ──────────────────────────────────────────────────────────

export const ELO_CONFIG = {
  /** Starting Elo for new players */
  DEFAULT_ELO: 1000,
  /** Base Elo gain for a win */
  WIN_BASE: 25,
  /** Maximum dominance bonus added to a win (scaled by score difference) */
  WIN_DOMINANCE_MAX: 10,
  /** Elo change for a draw */
  DRAW_CHANGE: 5,
  /** Base Elo loss */
  LOSS_BASE: -25,
  /** Maximum mitigation on a loss (capped so minimum loss is ≥ MIN_LOSS_PENALTY) */
  LOSS_MITIGATION_MAX: 15,
  /** Minimum Elo penalty on a loss (always lose at least this much) */
  MIN_LOSS_PENALTY: -5,
} as const;

// ─── Helper: Streak Multiplier ──────────────────────────────────────────────

/**
 * Returns the XP multiplier for the given streak length.
 * Falls back to `1.0` if the streak doesn't reach the lowest tier.
 */
export function getStreakMultiplier(streakDays: number): number {
  const tiers = Object.keys(STREAK_MULTIPLIERS)
    .map(Number)
    .sort((a, b) => b - a); // descending

  for (const threshold of tiers) {
    if (streakDays >= threshold) {
      return STREAK_MULTIPLIERS[threshold];
    }
  }
  return 1.0;
}

// ─── XP Calculators ─────────────────────────────────────────────────────────

/**
 * Calculate XP earned for a standard quiz completion.
 */
export function calculateQuizXP(correctCount: number, streakDays: number = 0): number {
  const raw = XP_CONFIG.BASE_QUIZ_XP + correctCount * XP_CONFIG.PER_CORRECT_QUIZ;
  return Math.round(raw * getStreakMultiplier(streakDays));
}

/**
 * Calculate XP earned for an arena match.
 * Uses the rich formula: base + per-correct bonus + win/draw bonus + accuracy bonus.
 */
export function calculateArenaXP(
  correctCount: number,
  accuracy: number,
  winStatus: "win" | "loss" | "tie" | null,
  streakDays: number = 0,
): number {
  let raw = XP_CONFIG.BASE_ARENA_XP + correctCount * XP_CONFIG.PER_CORRECT_ARENA;

  if (winStatus === "win") raw += XP_CONFIG.ARENA_WIN_BONUS;
  else if (winStatus === "tie") raw += XP_CONFIG.ARENA_DRAW_BONUS;

  // Accuracy bonus (0–200 XP)
  raw += Math.round(accuracy * XP_CONFIG.ARENA_ACCURACY_MULTIPLIER);

  return Math.round(raw * getStreakMultiplier(streakDays));
}

/**
 * Calculate XP earned for solving a daily challenge.
 */
export function calculateDailyChallengeXP(points: number, streakDays: number = 0): number {
  const raw = XP_CONFIG.DAILY_CHALLENGE_BASE + points * XP_CONFIG.PER_DAILY_POINT;
  return Math.round(raw * getStreakMultiplier(streakDays));
}

/**
 * Backwards-compatible helper used by RecentActivity and similar display code.
 * Delegates to the appropriate specific calculator (no streak bonus in display context).
 */
export function calculateActivityXP(
  score: number,
  totalQuestions: number,
  isArena: boolean,
  winStatus: "win" | "loss" | "tie" | null,
): number {
  if (isArena) {
    const accuracy = totalQuestions > 0 ? score / totalQuestions : 0;
    return calculateArenaXP(score, accuracy, winStatus);
  }
  return calculateQuizXP(score);
}

// ─── Level ──────────────────────────────────────────────────────────────────

/**
 * Derive level from total XP.
 */
export function calculateLevel(xp: number): number {
  return Math.floor(xp / XP_CONFIG.XP_PER_LEVEL) + 1;
}

/**
 * XP progress within the current level (0 .. XP_PER_LEVEL - 1).
 */
export function xpProgressInLevel(xp: number): number {
  return xp % XP_CONFIG.XP_PER_LEVEL;
}

/**
 * XP required to reach the next level.
 */
export function xpToNextLevel(xp: number): number {
  return XP_CONFIG.XP_PER_LEVEL - xpProgressInLevel(xp);
}

// ─── Elo ────────────────────────────────────────────────────────────────────

/**
 * Calculate Elo change for an arena match.
 * @param userScore  Points the user scored
 * @param opponentScore  Points the opponent scored
 * @param winStatus  Match outcome
 * @returns The signed Elo delta (positive = gain, negative = loss)
 */
export function calculateEloChange(
  userScore: number,
  opponentScore: number,
  winStatus: "win" | "loss" | "tie",
): number {
  const scoreDiff = userScore - opponentScore;

  if (winStatus === "win") {
    const dominanceBonus = Math.min(
      ELO_CONFIG.WIN_DOMINANCE_MAX,
      Math.floor(Math.abs(scoreDiff) / 100),
    );
    return ELO_CONFIG.WIN_BASE + dominanceBonus;
  }

  if (winStatus === "tie") {
    return ELO_CONFIG.DRAW_CHANGE;
  }

  // Loss — mitigate based on how close the match was
  const mitigation = Math.min(
    ELO_CONFIG.LOSS_MITIGATION_MAX,
    Math.floor(userScore / 100),
  );
  const raw = ELO_CONFIG.LOSS_BASE + mitigation;
  return Math.max(raw, ELO_CONFIG.MIN_LOSS_PENALTY);
}

// ─── Streak (re-exported from utils/streak.ts) ─────────────────────────────

export { calculateStreak } from "@/utils/streak";

// ─── Streak Update Helper ───────────────────────────────────────────────────

/**
 * Given the user's last activity date, compute the new streak value.
 * Used by server actions when persisting to the profiles table.
 */
export function computeNewStreak(
  currentStreak: number,
  lastActivityAt: string | Date | null,
): number {
  if (!lastActivityAt) return 1;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const last = new Date(lastActivityAt);
  last.setHours(0, 0, 0, 0);

  const diffMs = today.getTime() - last.getTime();
  const diffDays = Math.round(diffMs / (1000 * 3600 * 24));

  if (diffDays === 0) return currentStreak; // Already active today
  if (diffDays === 1) return currentStreak + 1; // Consecutive day
  return 1; // Streak broken — start fresh
}
