import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * Tests for the in-memory rate limiting path (dev mode, no Upstash).
 *
 * We mock the Next.js / Supabase dependencies so that `rateLimit()` can
 * be called in a plain vitest environment.
 */

// ── Mocks ───────────────────────────────────────────────────────────────

// Mock Supabase client
vi.mock("@/utils/supabase/server", () => ({
  createClient: () => ({
    auth: { getUser: async () => ({ data: { user: null } }) },
  }),
}));

// Mock next/headers
vi.mock("next/headers", () => ({
  headers: () => new Map([["x-forwarded-for", "1.2.3.4"]]),
  cookies: () => ({ get: () => undefined }),
}));

// Ensure Upstash is NOT available so we hit the in-memory path
const originalEnv = process.env;

beforeEach(() => {
  process.env = { ...originalEnv };
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
});

afterEach(() => {
  process.env = originalEnv;
});

// ── Tests ───────────────────────────────────────────────────────────────

describe("rateLimit (in-memory path)", () => {
  it("should allow authenticated users within their tier limit", async () => {
    // Dynamic import so mocks are in place
    const { rateLimit } = await import("./rate-limit");

    const result = await rateLimit("generate", "user-123");
    expect(result.success).toBe(true);
    expect(result.remaining).toBeGreaterThan(0);
    expect(result.message).toBeUndefined();
  });

  it("should allow guests within daily quota", async () => {
    const { rateLimit } = await import("./rate-limit");

    const result = await rateLimit("generate", null);
    expect(result.success).toBe(true);
    expect(result.remaining).toBeGreaterThanOrEqual(0);
  });

  it("should enforce limits for authenticated users (not unlimited)", async () => {
    const { rateLimit } = await import("./rate-limit");

    // The generate tier allows 100 per day for authenticated users.
    // Calling 101 times should eventually fail.
    let lastResult: { success: boolean; remaining: number; message?: string } = { success: true, remaining: 0, message: undefined };
    for (let i = 0; i < 101; i++) {
      lastResult = await rateLimit("generate", "heavy-user");
    }
    expect(lastResult.success).toBe(false);
    expect(lastResult.message).toBeDefined();
    expect(lastResult.message).toContain("Rate limit exceeded");
  });
});
