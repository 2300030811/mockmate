import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

const createClientMock = vi.hoisted(() => vi.fn());
const createAdminClientMock = vi.hoisted(() => vi.fn());
const revalidatePathMock = vi.hoisted(() => vi.fn());
const withRetryMock = vi.hoisted(() => vi.fn(async (operation: () => Promise<unknown>) => operation()));

// Service Mocks
const saveQuizResultMock = vi.hoisted(() => vi.fn());
const updateNicknameMock = vi.hoisted(() => vi.fn());
const deleteQuizResultMock = vi.hoisted(() => vi.fn());
const getLeaderboardMock = vi.hoisted(() => vi.fn());

vi.mock("@/utils/supabase/server", () => ({
  createClient: createClientMock,
}));

vi.mock("@/utils/supabase/admin", () => ({
  createAdminClient: createAdminClientMock,
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

vi.mock("@/lib/retry", () => ({
  withRetry: withRetryMock,
}));

vi.mock("@/lib/services/quiz-service", () => ({
  quizService: {
    saveQuizResult: saveQuizResultMock,
    updateNickname: updateNicknameMock,
    deleteQuizResult: deleteQuizResultMock,
  },
}));

vi.mock("@/lib/services/leaderboard-service", () => ({
  leaderboardService: {
    getLeaderboard: getLeaderboardMock,
  },
}));

vi.mock("@upstash/redis", () => ({
  Redis: {
    fromEnv: vi.fn(() => ({})),
  },
}));

// Mock repositories to prevent any unintentional database queries
vi.mock("@/lib/db/quiz-repository", () => ({
  quizRepository: {
    getRecentResults: vi.fn(),
  },
}));

const originalEnv = process.env;

async function loadSaveQuizResult() {
  const resultsModule = await import("./results");
  return resultsModule.saveQuizResult;
}

describe("saveQuizResult", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    process.env = { ...originalEnv };
    const mutableEnv = process.env as Record<string, string | undefined>;
    delete mutableEnv.UPSTASH_REDIS_REST_URL;
    delete mutableEnv.UPSTASH_REDIS_REST_TOKEN;

    createClientMock.mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: "user-1",
            },
          },
        }),
      },
    });

    createAdminClientMock.mockReturnValue({});
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("updates nickname on existing recent duplicate result", async () => {
    saveQuizResultMock.mockResolvedValue({ success: true, updated: true });

    const saveQuizResult = await loadSaveQuizResult();
    const result = await saveQuizResult({
      sessionId: "session-1",
      category: "aws",
      userAnswers: {
        "1": "correct",
      },
      totalQuestions: 1,
    });

    expect(result).toEqual({ success: true, updated: true });
    expect(saveQuizResultMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({
        sessionId: "session-1",
        category: "aws",
        totalQuestions: 1,
      })
    );
  });

  it("saves a new result even when profile sync fails", async () => {
    saveQuizResultMock.mockResolvedValue({ success: true });

    const saveQuizResult = await loadSaveQuizResult();
    const result = await saveQuizResult({
      sessionId: "session-2",
      category: "aws",
      userAnswers: {
        "1": "correct",
        "2": "wrong",
      },
      totalQuestions: 2,
    });

    expect(result).toEqual({ success: true });
    expect(saveQuizResultMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({
        sessionId: "session-2",
        category: "aws",
        totalQuestions: 2,
      })
    );
    expect(revalidatePathMock).toHaveBeenCalledWith("/");
    expect(revalidatePathMock).toHaveBeenCalledWith("/dashboard");
  });

  it("returns an error result when save fails", async () => {
    saveQuizResultMock.mockRejectedValue(new Error("insert failed"));

    const saveQuizResult = await loadSaveQuizResult();
    const result = await saveQuizResult({
      sessionId: "session-3",
      category: "aws",
      userAnswers: {
        "1": "correct",
      },
      totalQuestions: 1,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("insert failed");
  });
});