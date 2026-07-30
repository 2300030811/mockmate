import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { quizService } from "./quiz-service";
import { validateNickname } from "@/utils/moderation";
import { getRawQuestions } from "@/app/actions/quiz";
import { checkAnswer } from "@/utils/quiz-helpers";
import { profileRepository } from "@/lib/db/profile-repository";
import { quizRepository } from "@/lib/db/quiz-repository";
import { profileService } from "./profile-service";
import { Redis } from "@upstash/redis";

// Hoisted Mocks
const getRawQuestionsMock = vi.hoisted(() => vi.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]));
const checkAnswerMock = vi.hoisted(() => vi.fn((q, ans) => ans === "A"));
const validateNicknameMock = vi.hoisted(() => vi.fn((nick) => {
  if (nick.includes("@") || nick.length < 2) {
    return { success: false, error: "Nickname contains invalid characters." };
  }
  return { success: true };
}));
const syncStatsMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/retry", () => ({
  withRetry: vi.fn(async (operation) => operation()),
}));

vi.mock("@/app/actions/quiz", () => ({
  getRawQuestions: getRawQuestionsMock,
}));

vi.mock("@/utils/quiz-helpers", () => ({
  checkAnswer: checkAnswerMock,
}));

vi.mock("@/utils/moderation", () => ({
  validateNickname: validateNicknameMock,
}));

vi.mock("@/lib/db/profile-repository", () => ({
  profileRepository: {
    getProfileFields: vi.fn(),
  },
}));

vi.mock("@/lib/db/quiz-repository", () => ({
  quizRepository: {
    findDuplicateResult: vi.fn(),
    saveResult: vi.fn(),
    updateNickname: vi.fn(),
    getResultById: vi.fn(),
    deleteResult: vi.fn(),
  },
}));

vi.mock("./profile-service", () => ({
  profileService: {
    syncStats: syncStatsMock,
  },
}));

const mockRedisDel = vi.fn().mockResolvedValue(1);
vi.mock("@upstash/redis", () => ({
  Redis: {
    fromEnv: vi.fn(() => ({
      del: mockRedisDel,
    })),
  },
}));

const originalEnv = process.env;

describe("quizService", () => {
  let mockSupabase: any;
  let mockAdminDb: any;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    const mutableEnv = process.env as Record<string, string | undefined>;
    mutableEnv.UPSTASH_REDIS_REST_URL = "https://mock-redis.upstash.io";
    mutableEnv.UPSTASH_REDIS_REST_TOKEN = "mock-token";

    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-1" } },
        }),
      },
    };

    mockAdminDb = {};
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("saveQuizResult", () => {
    it("fails when nickname validation fails", async () => {
      const res = await quizService.saveQuizResult(mockSupabase, mockAdminDb, {
        sessionId: "sess-1",
        category: "aws",
        userAnswers: { "1": "A" },
        totalQuestions: 1,
        nickname: "@invalid",
      });

      expect(res.success).toBe(false);
      expect(res.error).toBe("Nickname contains invalid characters.");
      expect(quizRepository.saveResult).not.toHaveBeenCalled();
    });

    it("resolves nickname using profile repository if user is logged in and nickname is empty", async () => {
      vi.mocked(profileRepository.getProfileFields).mockResolvedValue({ nickname: "DBNickname" });
      vi.mocked(quizRepository.findDuplicateResult).mockResolvedValue(null);

      const res = await quizService.saveQuizResult(mockSupabase, mockAdminDb, {
        sessionId: "sess-1",
        category: "aws",
        userAnswers: { "1": "A" },
        totalQuestions: 1,
      });

      expect(res.success).toBe(true);
      expect(profileRepository.getProfileFields).toHaveBeenCalledWith(mockAdminDb, "user-1", "nickname");
      expect(quizRepository.saveResult).toHaveBeenCalledWith(
        mockAdminDb,
        expect.objectContaining({
          nickname: "DBNickname",
        })
      );
    });

    it("falls back to Guest when no nickname is provided and user is not logged in", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });
      vi.mocked(quizRepository.findDuplicateResult).mockResolvedValue(null);

      const res = await quizService.saveQuizResult(mockSupabase, mockAdminDb, {
        sessionId: "sess-1",
        category: "aws",
        userAnswers: { "1": "A" },
        totalQuestions: 1,
      });

      expect(res.success).toBe(true);
      expect(quizRepository.saveResult).toHaveBeenCalledWith(
        mockAdminDb,
        expect.objectContaining({
          nickname: "Guest",
        })
      );
    });

    it("uses generatedQuiz for AI Generated quizzes as source of truth", async () => {
      vi.mocked(quizRepository.findDuplicateResult).mockResolvedValue(null);

      const res = await quizService.saveQuizResult(mockSupabase, mockAdminDb, {
        sessionId: "sess-1",
        category: "AI Generated",
        userAnswers: { "99": "A" },
        totalQuestions: 1,
        generatedQuiz: [
          { id: 99, question: "AI Q", options: ["A"], answer: "A", category: "AI Generated", explanation: "" } as any
        ],
      });

      expect(res.success).toBe(true);
      expect(getRawQuestionsMock).not.toHaveBeenCalled();
      expect(quizRepository.saveResult).toHaveBeenCalledWith(
        mockAdminDb,
        expect.objectContaining({
          score: 1,
          total_questions: 1,
        })
      );
    });

    it("updates existing duplicate result instead of inserting a new row", async () => {
      vi.mocked(quizRepository.findDuplicateResult).mockResolvedValue({ id: "dup-1" });

      const res = await quizService.saveQuizResult(mockSupabase, mockAdminDb, {
        sessionId: "sess-1",
        category: "aws",
        userAnswers: { "1": "A" },
        totalQuestions: 1,
        nickname: "NewNick",
      });

      expect(res).toEqual({ success: true, updated: true });
      expect(quizRepository.updateNickname).toHaveBeenCalledWith(mockAdminDb, "dup-1", "NewNick");
      expect(quizRepository.saveResult).not.toHaveBeenCalled();
    });

    it("syncs profile stats on successful insertion", async () => {
      vi.mocked(quizRepository.findDuplicateResult).mockResolvedValue(null);

      const res = await quizService.saveQuizResult(mockSupabase, mockAdminDb, {
        sessionId: "sess-1",
        category: "aws",
        userAnswers: { "1": "A" },
        totalQuestions: 1,
      });

      expect(res.success).toBe(true);
      expect(syncStatsMock).toHaveBeenCalledWith("user-1", "quiz", 1, 1, null, undefined, undefined, undefined);
    });

    it("normalizes legacy arena category to base category and saves with arena mode/metadata", async () => {
      vi.mocked(quizRepository.findDuplicateResult).mockResolvedValue(null);

      const res = await quizService.saveQuizResult(mockSupabase, mockAdminDb, {
        sessionId: "sess-arena",
        category: "arena_aws:win:",
        userAnswers: { "1": "A" },
        totalQuestions: 1,
        arenaStatus: "win",
        arenaUserScore: 100,
        arenaOpponentScore: 50,
      });

      expect(res.success).toBe(true);
      expect(quizRepository.saveResult).toHaveBeenCalledWith(
        mockAdminDb,
        expect.objectContaining({
          category: "aws",
          quiz_mode: "arena",
          arena_status: "win",
          arena_user_score: 100,
          arena_opponent_score: 50,
        })
      );
      expect(syncStatsMock).toHaveBeenCalledWith(
        "user-1",
        "arena",
        1,
        1,
        "win",
        undefined,
        100,
        50
      );
    });
  });

  describe("updateNickname", () => {
    it("validates nickname and updates the database", async () => {
      vi.mocked(quizRepository.getResultById).mockResolvedValue({ category: "aws" });

      const res = await quizService.updateNickname(mockAdminDb, "res-1", "ValidNick");

      expect(res.success).toBe(true);
      expect(quizRepository.updateNickname).toHaveBeenCalledWith(mockAdminDb, "res-1", "ValidNick");
    });
  });

  describe("deleteQuizResult", () => {
    it("allows deletion if user is admin", async () => {
      vi.mocked(profileRepository.getProfileFields).mockResolvedValue({ role: "admin" });

      const res = await quizService.deleteQuizResult(mockSupabase, "user-1", "res-1");

      expect(res.success).toBe(true);
      expect(quizRepository.deleteResult).toHaveBeenCalledWith(mockSupabase, "res-1");
    });

    it("throws forbidden error if user is not admin", async () => {
      vi.mocked(profileRepository.getProfileFields).mockResolvedValue({ role: "member" });

      await expect(
        quizService.deleteQuizResult(mockSupabase, "user-1", "res-1")
      ).rejects.toThrow("Forbidden: Admin access required");
    });
  });
});
