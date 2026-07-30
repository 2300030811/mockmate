import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import {
  saveQuizResult,
  getRecentResults,
  updateQuizResultNickname,
  getLeaderboard,
  deleteQuizResult,
} from "./results";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";
import { quizService } from "@/lib/services/quiz-service";
import { leaderboardService } from "@/lib/services/leaderboard-service";
import { quizRepository } from "@/lib/db/quiz-repository";
import { rateLimit } from "@/lib/rate-limit";

// Mocks
const createClientMock = vi.hoisted(() => vi.fn());
const createAdminClientMock = vi.hoisted(() => vi.fn());
const revalidatePathMock = vi.hoisted(() => vi.fn());
const rateLimitMock = vi.hoisted(() => vi.fn());

vi.mock("@/utils/supabase/server", () => ({
  createClient: createClientMock,
}));

vi.mock("@/utils/supabase/admin", () => ({
  createAdminClient: createAdminClientMock,
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: rateLimitMock,
}));

vi.mock("@/lib/services/quiz-service", () => ({
  quizService: {
    saveQuizResult: vi.fn(),
    updateNickname: vi.fn(),
    deleteQuizResult: vi.fn(),
  },
}));

vi.mock("@/lib/services/leaderboard-service", () => ({
  leaderboardService: {
    getLeaderboard: vi.fn(),
  },
}));

vi.mock("@/lib/db/quiz-repository", () => ({
  quizRepository: {
    getRecentResults: vi.fn(),
  },
}));

vi.mock("@/lib/retry", () => ({
  withRetry: vi.fn(async (operation) => operation()),
}));

describe("results action controller", () => {
  let mockSupabase: any;
  let mockAdminDb: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-1" } },
        }),
      },
    };
    createClientMock.mockReturnValue(mockSupabase);

    mockAdminDb = {};
    createAdminClientMock.mockReturnValue(mockAdminDb);
  });

  describe("saveQuizResult", () => {
    it("delegates to quizService and triggers cache invalidation", async () => {
      const payload = {
        sessionId: "sess-1",
        category: "aws",
        userAnswers: { "1": "A" },
        totalQuestions: 1,
      };

      vi.mocked(quizService.saveQuizResult).mockResolvedValue({ success: true });

      const result = await saveQuizResult(payload);

      expect(quizService.saveQuizResult).toHaveBeenCalledWith(mockSupabase, mockAdminDb, payload);
      expect(revalidatePathMock).toHaveBeenCalledWith("/");
      expect(revalidatePathMock).toHaveBeenCalledWith("/dashboard");
      expect(result).toEqual({ success: true });
    });

    it("returns formatted error if service throws", async () => {
      vi.mocked(quizService.saveQuizResult).mockRejectedValue(new Error("Database offline"));

      const result = await saveQuizResult({
        sessionId: "sess-1",
        category: "aws",
        userAnswers: {},
        totalQuestions: 0,
      });

      expect(result).toEqual({ success: false, error: "Database offline" });
    });
  });

  describe("updateQuizResultNickname", () => {
    it("delegates to quizService and triggers cache invalidation", async () => {
      vi.mocked(quizService.updateNickname).mockResolvedValue({ success: true });

      const result = await updateQuizResultNickname("res-1", "NewNick");

      expect(quizService.updateNickname).toHaveBeenCalledWith(mockAdminDb, "res-1", "NewNick");
      expect(revalidatePathMock).toHaveBeenCalledWith("/");
      expect(result).toEqual({ success: true });
    });
  });

  describe("getRecentResults", () => {
    it("fetches results using logged-in user ID", async () => {
      vi.mocked(quizRepository.getRecentResults).mockResolvedValue([{ id: "res-1" }] as any);

      const results = await getRecentResults("sess-1");

      expect(quizRepository.getRecentResults).toHaveBeenCalledWith(mockSupabase, "user-1", null, 10);
      expect(results).toEqual([{ id: "res-1" }]);
    });

    it("fetches results using session ID when user is not logged in", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });
      vi.mocked(quizRepository.getRecentResults).mockResolvedValue([{ id: "res-2" }] as any);

      const results = await getRecentResults("sess-2");

      expect(quizRepository.getRecentResults).toHaveBeenCalledWith(mockSupabase, null, "sess-2", 10);
      expect(results).toEqual([{ id: "res-2" }]);
    });
  });

  describe("getLeaderboard", () => {
    it("delegates to leaderboardService", async () => {
      vi.mocked(leaderboardService.getLeaderboard).mockResolvedValue([]);

      const result = await getLeaderboard("aws", "weekly");

      expect(leaderboardService.getLeaderboard).toHaveBeenCalledWith(mockSupabase, "aws", "weekly");
      expect(result).toEqual([]);
    });
  });

  describe("deleteQuizResult", () => {
    it("checks rate limiting and permissions, then delegates", async () => {
      rateLimitMock.mockResolvedValue({ success: true });
      vi.mocked(quizService.deleteQuizResult).mockResolvedValue({ success: true });

      const result = await deleteQuizResult("res-1");

      expect(rateLimitMock).toHaveBeenCalledWith("default");
      expect(quizService.deleteQuizResult).toHaveBeenCalledWith(mockSupabase, "user-1", "res-1");
      expect(revalidatePathMock).toHaveBeenCalledWith("/");
      expect(result).toEqual({ success: true });
    });

    it("returns error if user is unauthorized", async () => {
      rateLimitMock.mockResolvedValue({ success: true });
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      const result = await deleteQuizResult("res-1");

      expect(result).toEqual({ success: false, error: "Unauthorized" });
      expect(quizService.deleteQuizResult).not.toHaveBeenCalled();
    });

    it("returns error if rate limited", async () => {
      rateLimitMock.mockResolvedValue({ success: false, message: "Too many requests" });

      const result = await deleteQuizResult("res-1");

      expect(result).toEqual({ success: false, error: "Too many requests" });
    });
  });
});