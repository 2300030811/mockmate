import { beforeEach, describe, expect, it, vi } from "vitest";
import { getBobChallengeHint, submitChallenge, getServerDailyStats } from "./challenge";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { rateLimit } from "@/lib/rate-limit";
import { challengeService } from "@/lib/services/challenge-service";
import { generateText } from "@/lib/ai/gateway";

// Mocks
vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/utils/supabase/admin", () => ({
  createAdminClient: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn(),
}));

vi.mock("@/lib/services/challenge-service", () => ({
  challengeService: {
    submitChallenge: vi.fn(),
    getServerDailyStats: vi.fn(),
    syncDailyChallenge: vi.fn(),
  },
}));

vi.mock("@/lib/ai/gateway", () => ({
  generateText: vi.fn(),
  AI_MODELS: { FAST: "fast" },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("challenge actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getBobChallengeHint", () => {
    it("returns error when rate limited", async () => {
      vi.mocked(rateLimit).mockResolvedValue({ success: false, message: "Limit exceeded" } as any);
      const res = await getBobChallengeHint("Array Intersection", "let x = 1;", "javascript");
      expect(res.markdown).toContain("Limit exceeded");
    });

    it("returns helpful hint for valid problem", async () => {
      vi.mocked(rateLimit).mockResolvedValue({ success: true } as any);
      vi.mocked(generateText).mockResolvedValue({
        content: "Consider using a Set to filter unique elements.",
      } as any);

      const res = await getBobChallengeHint("Array Intersection", "let x = 1;", "javascript");
      expect(res.markdown).toBe("Consider using a Set to filter unique elements.");
    });
  });

  describe("submitChallenge", () => {
    it("returns rate limit message if exceeded", async () => {
      vi.mocked(rateLimit).mockResolvedValue({ success: false, message: "Queue full" } as any);
      const res = await submitChallenge("Array Intersection", "code", "javascript", "output");
      expect(res.success).toBe(false);
      expect(res.feedback).toContain("Queue full");
    });

    it("evaluates submission and returns challenge result", async () => {
      vi.mocked(rateLimit).mockResolvedValue({ success: true } as any);
      vi.mocked(createClient).mockReturnValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-123" } } }),
        },
      } as any);
      vi.mocked(createAdminClient).mockReturnValue({} as any);

      vi.mocked(challengeService.submitChallenge).mockResolvedValue({
        success: true,
        score: 100,
        efficiency: "O(n)",
        feedback: "Excellent solution!",
      });

      const res = await submitChallenge("Array Intersection", "code", "javascript", "[2]");
      expect(res.success).toBe(true);
      expect(res.score).toBe(100);
      expect(res.efficiency).toBe("O(n)");
    });
  });

  describe("getServerDailyStats", () => {
    it("returns default stats when user is not logged in", async () => {
      vi.mocked(createClient).mockReturnValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
        },
      } as any);

      const stats = await getServerDailyStats();
      expect(stats.streak).toBe(0);
      expect(stats.solvedToday).toBe(false);
    });

    it("fetches server stats for authenticated user", async () => {
      vi.mocked(createClient).mockReturnValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u-1" } } }),
        },
      } as any);
      vi.mocked(createAdminClient).mockReturnValue({} as any);

      vi.mocked(challengeService.getServerDailyStats).mockResolvedValue({
        streak: 5,
        points: 250,
        solvedToday: true,
        xp: 250,
        level: 3,
        elo: 1100,
        streakMultiplier: 1.5,
      });

      const stats = await getServerDailyStats();
      expect(stats.streak).toBe(5);
      expect(stats.solvedToday).toBe(true);
      expect(stats.streakMultiplier).toBe(1.5);
    });
  });
});
