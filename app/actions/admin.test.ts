import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAdminStats, getAllQuizResults, deleteResult } from "./admin";
import { createClient } from "@/utils/supabase/server";
import { requireAdmin } from "@/lib/auth-utils";
import { profileRepository } from "@/lib/db/profile-repository";
import { quizRepository } from "@/lib/db/quiz-repository";

// Mocks
vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/auth-utils", () => ({
  requireAdmin: vi.fn(),
}));

vi.mock("@/lib/db/profile-repository", () => ({
  profileRepository: {
    countProfiles: vi.fn(),
  },
}));

vi.mock("@/lib/db/quiz-repository", () => ({
  quizRepository: {
    getAllQuizResults: vi.fn(),
    deleteResult: vi.fn(),
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("admin actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAdminStats", () => {
    it("returns unauthorized when caller is not admin", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(false);
      const res = await getAdminStats();
      expect(res.success).toBe(false);
      expect(res.error).toBe("Unauthorized");
    });

    it("aggregates metrics correctly for admin", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(true);
      vi.mocked(profileRepository.countProfiles).mockResolvedValue(42);

      const mockSupabase = {
        from: vi.fn((table: string) => {
          if (table === "quiz_results") {
            return {
              select: vi.fn().mockResolvedValue({
                data: [
                  { score: 8, total_questions: 10, category: "aws", quiz_mode: "standard" },
                  { score: 4, total_questions: 10, category: "aws", quiz_mode: "arena" },
                  { score: 9, total_questions: 10, category: "python", quiz_mode: "daily-challenge" },
                ],
                count: 3,
              }),
            };
          }
          if (table === "interview_sessions") {
            return {
              select: vi.fn().mockResolvedValue({ count: 5 }),
            };
          }
          return { select: vi.fn().mockResolvedValue({ data: [], count: 0 }) };
        }),
      };

      vi.mocked(createClient).mockReturnValue(mockSupabase as any);
      vi.mocked(quizRepository.getAllQuizResults).mockResolvedValue([
        {
          id: "res-1",
          nickname: "Alice",
          category: "aws",
          score: 8,
          total_questions: 10,
          completed_at: "2026-09-27T08:00:00Z",
          quiz_mode: "standard",
        },
      ] as any);

      const res = await getAdminStats();
      expect(res.success).toBe(true);
      expect(res.data).toBeDefined();
      expect(res.data?.totalUsers).toBe(42);
      expect(res.data?.totalQuizzes).toBe(3);
      // Average score: (80 + 40 + 90) / 3 = 70%
      expect(res.data?.avgScore).toBe(70);
      // Pass rate: 2 out of 3 scored >= 70% => 67%
      expect(res.data?.passRate).toBe(67);
      expect(res.data?.modeBreakdown).toEqual({
        standard: 1,
        arena: 1,
        dailyChallenge: 1,
      });
      expect(res.data?.topCategories[0]).toEqual({ category: "aws", count: 2 });
    });
  });

  describe("getAllQuizResults", () => {
    it("returns unauthorized when caller is not admin", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(false);
      const res = await getAllQuizResults(10);
      expect(res.success).toBe(false);
      expect(res.error).toBe("Unauthorized");
    });

    it("returns quiz results for authorized admin", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(true);
      vi.mocked(createClient).mockReturnValue({} as any);
      vi.mocked(quizRepository.getAllQuizResults).mockResolvedValue([
        { id: "1", nickname: "Bob" },
      ] as any);

      const res = await getAllQuizResults(10);
      expect(res.success).toBe(true);
      expect(res.data).toHaveLength(1);
    });
  });

  describe("deleteResult", () => {
    it("returns unauthorized when caller is not admin", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(false);
      const res = await deleteResult("res-1");
      expect(res.success).toBe(false);
      expect(res.error).toBe("Unauthorized");
    });

    it("deletes result for authorized admin", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(true);
      vi.mocked(createClient).mockReturnValue({} as any);
      vi.mocked(quizRepository.deleteResult).mockResolvedValue(undefined as any);

      const res = await deleteResult("res-1");
      expect(res.success).toBe(true);
      expect(quizRepository.deleteResult).toHaveBeenCalledWith(expect.anything(), "res-1");
    });
  });
});
