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

const syncProfileStatsMock = vi.hoisted(() => vi.fn());
const getRawQuestionsMock = vi.hoisted(() => vi.fn().mockResolvedValue([
  { id: 1 },
  { id: 2 }
]));
const checkAnswerMock = vi.hoisted(() => vi.fn((q, ans) => ans === "A"));

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

vi.mock("@/lib/profile-sync", () => ({
  syncProfileStats: syncProfileStatsMock,
}));

vi.mock("@/app/actions/quiz", () => ({
  getRawQuestions: getRawQuestionsMock,
}));

vi.mock("@/utils/quiz-helpers", () => ({
  checkAnswer: checkAnswerMock,
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

function buildAdminDb(params?: {
  existingResultId?: string | null;
  insertError?: Error | null;
  updateError?: Error | null;
}) {
  const spies = {
    quizInsert: vi.fn(),
    quizUpdate: vi.fn(),
    quizUpdateEq: vi.fn(),
    quizSelect: vi.fn(),
  };

  const db = {
    from: vi.fn((table: string) => {
      const chain: any = {};
      
      const methods = ["select", "eq", "gt", "order", "limit", "update", "insert", "single"];
      methods.forEach(method => {
        chain[method] = vi.fn((...args: any[]) => {
          if (method === "insert") spies.quizInsert(...args);
          if (method === "update") spies.quizUpdate(...args);
          if (method === "eq" && args[0] === "id") spies.quizUpdateEq(...args);
          if (method === "select") spies.quizSelect(...args);
          return chain;
        });
      });

      chain.then = (onfulfilled: any) => {
        let result: any = { data: null, error: null };
        if (table === "quiz_results") {
          if (spies.quizInsert.mock.calls.length > 0) {
            result = { error: params?.insertError ?? null };
          } else if (spies.quizUpdate.mock.calls.length > 0) {
            result = { error: params?.updateError ?? null };
          } else {
            result = {
              data: params?.existingResultId ? [{ id: params.existingResultId }] : [],
              error: null,
            };
          }
        } else if (table === "profiles") {
          result = {
            data: { nickname: "ServerNickname" },
            error: null,
          };
        }
        return Promise.resolve(result).then(onfulfilled);
      };

      return chain;
    }),
  };

  return { db, spies };
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
    const { db, spies } = buildAdminDb({ existingResultId: "existing-1" });
    const mockAdminClient = Object.assign(db, { db });
    createAdminClientMock.mockReturnValue(mockAdminClient as never);

    const saveQuizResult = await loadSaveQuizResult();
    const result = await saveQuizResult({
      sessionId: "session-1",
      category: "aws",
      userAnswers: {
        "1": "A",
      },
      totalQuestions: 1,
    });

    expect(result).toEqual({ success: true, updated: true });
    expect(spies.quizUpdate).toHaveBeenCalledWith({ nickname: "ServerNickname" });
    expect(spies.quizUpdateEq).toHaveBeenCalledWith("id", "existing-1");
    expect(spies.quizInsert).not.toHaveBeenCalled();
    expect(syncProfileStatsMock).not.toHaveBeenCalled();
  });

  it("saves a new result even when profile sync fails", async () => {
    const { db, spies } = buildAdminDb();
    const mockAdminClient = Object.assign(db, { db });
    createAdminClientMock.mockReturnValue(mockAdminClient as never);
    syncProfileStatsMock.mockRejectedValue(new Error("sync failed"));

    const saveQuizResult = await loadSaveQuizResult();
    const result = await saveQuizResult({
      sessionId: "session-2",
      category: "aws",
      userAnswers: {
        "1": "A",
        "2": "B",
      },
      totalQuestions: 2,
    });

    expect(result).toEqual({ success: true });
    expect(spies.quizInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        score: 1,
        total_questions: 2,
        category: "aws",
      })
    );
    expect(syncProfileStatsMock).toHaveBeenCalledTimes(1);
    expect(revalidatePathMock).toHaveBeenCalledWith("/");
    expect(revalidatePathMock).toHaveBeenCalledWith("/dashboard");
  });

  it("returns an error result when save fails", async () => {
    const { db } = buildAdminDb({
      insertError: new Error("insert failed"),
    });
    const mockAdminClient = Object.assign(db, { db });
    createAdminClientMock.mockReturnValue(mockAdminClient as never);

    const saveQuizResult = await loadSaveQuizResult();
    const result = await saveQuizResult({
      sessionId: "session-3",
      category: "aws",
      userAnswers: {
        "1": "A",
      },
      totalQuestions: 1,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("insert failed");
  });
});