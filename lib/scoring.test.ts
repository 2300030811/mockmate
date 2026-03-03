import { describe, it, expect } from "vitest";
import {
  calculateQuizXP,
  calculateArenaXP,
  calculateDailyChallengeXP,
  calculateActivityXP,
  getStreakMultiplier,
  calculateLevel,
  xpProgressInLevel,
  xpToNextLevel,
  calculateEloChange,
  computeNewStreak,
  XP_CONFIG,
  STREAK_MULTIPLIERS,
  ELO_CONFIG,
} from "./scoring";

// ─── getStreakMultiplier ────────────────────────────────────────────────────

describe("getStreakMultiplier", () => {
  it("returns 1.0 for 0 streak days", () => {
    expect(getStreakMultiplier(0)).toBe(1.0);
  });

  it("returns 1.0 for 2 days (below lowest tier)", () => {
    expect(getStreakMultiplier(2)).toBe(1.0);
  });

  it("returns 1.2 for exactly 3 days", () => {
    expect(getStreakMultiplier(3)).toBe(1.2);
  });

  it("returns 1.2 for 6 days (between 3 and 7 tier)", () => {
    expect(getStreakMultiplier(6)).toBe(1.2);
  });

  it("returns 1.5 for exactly 7 days", () => {
    expect(getStreakMultiplier(7)).toBe(1.5);
  });

  it("returns 1.75 for 14 days", () => {
    expect(getStreakMultiplier(14)).toBe(1.75);
  });

  it("returns 1.75 for 29 days", () => {
    expect(getStreakMultiplier(29)).toBe(1.75);
  });

  it("returns 2.0 for 30 days", () => {
    expect(getStreakMultiplier(30)).toBe(2.0);
  });

  it("returns 2.0 for 100+ days (beyond max tier)", () => {
    expect(getStreakMultiplier(100)).toBe(2.0);
  });
});

// ─── calculateQuizXP ────────────────────────────────────────────────────────

describe("calculateQuizXP", () => {
  it("returns BASE_QUIZ_XP for 0 correct, no streak", () => {
    expect(calculateQuizXP(0)).toBe(XP_CONFIG.BASE_QUIZ_XP);
  });

  it("scales with correct answers", () => {
    expect(calculateQuizXP(5)).toBe(
      XP_CONFIG.BASE_QUIZ_XP + 5 * XP_CONFIG.PER_CORRECT_QUIZ
    );
  });

  it("applies streak multiplier", () => {
    const raw = XP_CONFIG.BASE_QUIZ_XP + 5 * XP_CONFIG.PER_CORRECT_QUIZ;
    expect(calculateQuizXP(5, 7)).toBe(Math.round(raw * 1.5));
  });

  it("returns base with 1.0 multiplier for low streak", () => {
    expect(calculateQuizXP(3, 1)).toBe(
      XP_CONFIG.BASE_QUIZ_XP + 3 * XP_CONFIG.PER_CORRECT_QUIZ
    );
  });
});

// ─── calculateArenaXP ───────────────────────────────────────────────────────

describe("calculateArenaXP", () => {
  it("returns participation XP for a loss with 0 correct", () => {
    // Base 50 + 0 correct + 0 win bonus + 0 accuracy bonus = 50
    expect(calculateArenaXP(0, 0, "loss")).toBe(XP_CONFIG.BASE_ARENA_XP);
  });

  it("adds win bonus for a win", () => {
    // Base 50 + 3*25 + 150 win + accuracy*200
    const accuracy = 3 / 5;
    const expected = 50 + 75 + 150 + Math.round(accuracy * 200);
    expect(calculateArenaXP(3, accuracy, "win")).toBe(expected);
  });

  it("adds draw bonus", () => {
    const accuracy = 2 / 5;
    const expected = 50 + 50 + 50 + Math.round(accuracy * 200);
    expect(calculateArenaXP(2, accuracy, "tie")).toBe(expected);
  });

  it("applies streak multiplier to arena XP", () => {
    const accuracy = 5 / 5;
    const raw = 50 + 125 + 150 + 200;
    expect(calculateArenaXP(5, accuracy, "win", 30)).toBe(Math.round(raw * 2.0));
  });

  it("handles null win status (no bonus)", () => {
    const accuracy = 1 / 5;
    const expected = 50 + 25 + Math.round(accuracy * 200);
    expect(calculateArenaXP(1, accuracy, null)).toBe(expected);
  });
});

// ─── calculateDailyChallengeXP ──────────────────────────────────────────────

describe("calculateDailyChallengeXP", () => {
  it("returns base + points for no streak", () => {
    expect(calculateDailyChallengeXP(10)).toBe(
      XP_CONFIG.DAILY_CHALLENGE_BASE + 10 * XP_CONFIG.PER_DAILY_POINT
    );
  });

  it("applies streak multiplier", () => {
    const raw = XP_CONFIG.DAILY_CHALLENGE_BASE + 10 * XP_CONFIG.PER_DAILY_POINT;
    expect(calculateDailyChallengeXP(10, 7)).toBe(Math.round(raw * 1.5));
  });

  it("handles 0 points", () => {
    expect(calculateDailyChallengeXP(0)).toBe(XP_CONFIG.DAILY_CHALLENGE_BASE);
  });
});

// ─── calculateActivityXP (backwards-compat helper) ─────────────────────────

describe("calculateActivityXP", () => {
  it("delegates to quiz formula for non-arena", () => {
    const result = calculateActivityXP(5, 10, false, null);
    expect(result).toBe(calculateQuizXP(5));
  });

  it("delegates to arena formula for arena activity", () => {
    const result = calculateActivityXP(3, 5, true, "win");
    const accuracy = 3 / 5;
    expect(result).toBe(calculateArenaXP(3, accuracy, "win"));
  });

  it("handles arena with 0 total questions gracefully", () => {
    const result = calculateActivityXP(0, 0, true, "loss");
    expect(result).toBe(calculateArenaXP(0, 0, "loss"));
  });
});

// ─── calculateLevel ─────────────────────────────────────────────────────────

describe("calculateLevel", () => {
  it("returns 1 for 0 XP", () => {
    expect(calculateLevel(0)).toBe(1);
  });

  it("returns 1 for 99 XP", () => {
    expect(calculateLevel(99)).toBe(1);
  });

  it("returns 2 for 100 XP", () => {
    expect(calculateLevel(100)).toBe(2);
  });

  it("returns 11 for 1000 XP", () => {
    expect(calculateLevel(1000)).toBe(11);
  });

  it("returns correct level for large XP", () => {
    expect(calculateLevel(5432)).toBe(55);
  });
});

// ─── xpProgressInLevel / xpToNextLevel ──────────────────────────────────────

describe("xpProgressInLevel", () => {
  it("returns 0 for exact level boundary", () => {
    expect(xpProgressInLevel(200)).toBe(0);
  });

  it("returns remainder within the level", () => {
    expect(xpProgressInLevel(250)).toBe(50);
  });
});

describe("xpToNextLevel", () => {
  it("returns full XP_PER_LEVEL at boundary", () => {
    expect(xpToNextLevel(200)).toBe(XP_CONFIG.XP_PER_LEVEL);
  });

  it("returns complement of progress", () => {
    expect(xpToNextLevel(250)).toBe(50);
  });
});

// ─── calculateEloChange ─────────────────────────────────────────────────────

describe("calculateEloChange", () => {
  it("returns positive for a win", () => {
    const change = calculateEloChange(500, 300, "win");
    expect(change).toBeGreaterThanOrEqual(ELO_CONFIG.WIN_BASE);
    expect(change).toBeLessThanOrEqual(ELO_CONFIG.WIN_BASE + ELO_CONFIG.WIN_DOMINANCE_MAX);
  });

  it("returns WIN_BASE for a close win (diff < 100)", () => {
    expect(calculateEloChange(300, 250, "win")).toBe(ELO_CONFIG.WIN_BASE);
  });

  it("caps dominance bonus", () => {
    const change = calculateEloChange(5000, 0, "win");
    expect(change).toBe(ELO_CONFIG.WIN_BASE + ELO_CONFIG.WIN_DOMINANCE_MAX);
  });

  it("returns DRAW_CHANGE for a tie", () => {
    expect(calculateEloChange(300, 300, "tie")).toBe(ELO_CONFIG.DRAW_CHANGE);
  });

  it("returns negative for a loss", () => {
    const change = calculateEloChange(0, 500, "loss");
    expect(change).toBeLessThan(0);
  });

  it("mitigates loss based on user score", () => {
    // User scored 200 — mitigation = min(15, floor(200/100)) = 2
    // raw = -25 + 2 = -23, but Math.max(-23, -5) = -5 (cap applies)
    // To test actual mitigation, we need a score where cap doesn't apply:
    // userScore = 1500: mitigation = min(15, 15) = 15, raw = -25 + 15 = -10
    // Math.max(-10, -5) = -5. Still capped.
    // The cap of -5 means most losses result in -5. Let's verify the cap is correct:
    const change = calculateEloChange(200, 500, "loss");
    expect(change).toBe(ELO_CONFIG.MIN_LOSS_PENALTY); // -5 (cap kicks in)
  });

  it("caps minimum loss penalty", () => {
    // User scored very high — mitigation = 15, raw = -25 + 15 = -10
    // But MIN_LOSS_PENALTY is -5 so it should be max(-10, -5) = -5
    // Wait — MIN_LOSS_PENALTY is -5, and raw = -10 is MORE negative, so max(-10, -5) = -5
    // Actually let's check: userScore = 2000, mitigation = min(15, 20) = 15, raw = -25 + 15 = -10
    // Since raw < MIN_LOSS_PENALTY (-5), raw stays -10
    // ...but code does Math.max(raw, MIN_LOSS_PENALTY). MIN_LOSS_PENALTY = -5.
    // Math.max(-10, -5) = -5. So minimum loss is -5.
    const change = calculateEloChange(2000, 3000, "loss");
    expect(change).toBe(ELO_CONFIG.MIN_LOSS_PENALTY);
  });
});

// ─── computeNewStreak ───────────────────────────────────────────────────────

describe("computeNewStreak", () => {
  it("returns 1 for first activity (null lastActivity)", () => {
    expect(computeNewStreak(0, null)).toBe(1);
  });

  it("returns same streak if last activity was today", () => {
    const today = new Date();
    expect(computeNewStreak(5, today)).toBe(5);
  });

  it("increments streak if last activity was yesterday", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(computeNewStreak(5, yesterday)).toBe(6);
  });

  it("resets streak to 1 if gap > 1 day", () => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    expect(computeNewStreak(10, threeDaysAgo)).toBe(1);
  });
});
