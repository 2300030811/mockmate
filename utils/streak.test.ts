import { describe, it, expect } from "vitest";
import { calculateStreak } from "./streak";

describe("calculateStreak", () => {
  it("returns 0 for an empty array", () => {
    expect(calculateStreak([])).toBe(0);
  });

  it("returns 1 for a single timestamp from today", () => {
    const today = new Date().toISOString();
    expect(calculateStreak([today])).toBe(1);
  });

  it("counts consecutive days correctly", () => {
    const now = new Date();
    const dates = [
      now.toISOString(),
      new Date(now.getTime() - 86400000).toISOString(),     // yesterday
      new Date(now.getTime() - 86400000 * 2).toISOString(), // 2 days ago
    ];
    expect(calculateStreak(dates)).toBe(3);
  });

  it("breaks streak when a day is missed", () => {
    const now = new Date();
    const dates = [
      now.toISOString(),
      new Date(now.getTime() - 86400000).toISOString(),     // yesterday
      // gap: 2 days ago is missing
      new Date(now.getTime() - 86400000 * 3).toISOString(), // 3 days ago
    ];
    expect(calculateStreak(dates)).toBe(2); // only today + yesterday
  });

  it("returns 0 if the most recent date is more than 1 day old", () => {
    const now = new Date();
    const dates = [
      new Date(now.getTime() - 86400000 * 3).toISOString(), // 3 days ago
      new Date(now.getTime() - 86400000 * 4).toISOString(), // 4 days ago
    ];
    expect(calculateStreak(dates)).toBe(0);
  });

  it("handles duplicate dates on the same day", () => {
    const now = new Date();
    const dates = [
      now.toISOString(),
      new Date(now.getTime() - 3600000).toISOString(), // 1 hour ago (same day)
      new Date(now.getTime() - 86400000).toISOString(), // yesterday
    ];
    // Should still be 2: today + yesterday
    expect(calculateStreak(dates)).toBe(2);
  });

  it("handles unordered timestamps", () => {
    const now = new Date();
    const dates = [
      new Date(now.getTime() - 86400000 * 2).toISOString(), // 2 days ago
      now.toISOString(),                                      // today
      new Date(now.getTime() - 86400000).toISOString(),       // yesterday
    ];
    expect(calculateStreak(dates)).toBe(3);
  });
});
