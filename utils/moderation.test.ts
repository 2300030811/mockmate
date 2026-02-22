import { describe, it, expect } from "vitest";
import { validateNickname } from "./moderation";

describe("validateNickname", () => {
  // --- Valid nicknames ---
  it("accepts normal alphanumeric nicknames", () => {
    expect(validateNickname("JohnDoe")).toEqual({ success: true });
  });

  it("accepts nicknames with underscores and hyphens", () => {
    expect(validateNickname("cool_player-1")).toEqual({ success: true });
  });

  it("accepts short nicknames (min 2)", () => {
    expect(validateNickname("ab")).toEqual({ success: true });
  });

  it("accepts maximum length nicknames (20 chars)", () => {
    expect(validateNickname("a".repeat(20))).toEqual({ success: true });
  });

  // --- Invalid: length and format ---
  it("rejects empty strings", () => {
    const result = validateNickname("");
    expect(result.success).toBe(false);
    expect(result.error).toContain("empty");
  });

  it("rejects too-short nicknames", () => {
    const result = validateNickname("a");
    expect(result.success).toBe(false);
    expect(result.error).toContain("short");
  });

  it("rejects too-long nicknames", () => {
    const result = validateNickname("a".repeat(21));
    expect(result.success).toBe(false);
    expect(result.error).toContain("long");
  });

  it("rejects special characters", () => {
    const result = validateNickname("hello@world!");
    expect(result.success).toBe(false);
    expect(result.error).toContain("invalid characters");
  });

  it("trims whitespace before validation", () => {
    expect(validateNickname("  valid  ")).toEqual({ success: true });
  });

  // --- Performance: pre-compiled patterns ---
  it("can validate many nicknames quickly (pre-compiled regex)", () => {
    const start = performance.now();
    for (let i = 0; i < 100; i++) {
      validateNickname(`player_${i}`);
    }
    const elapsed = performance.now() - start;
    // Should complete 100 validations well under 100ms
    expect(elapsed).toBeLessThan(100);
  });
});
