import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

const createClientMock = vi.hoisted(() => vi.fn());
const createAdminClientMock = vi.hoisted(() => vi.fn());
const revalidatePathMock = vi.hoisted(() => vi.fn());
const validateNicknameMock = vi.hoisted(() => vi.fn(() => ({ success: true })));
const withRetryMock = vi.hoisted(() => vi.fn(async (operation: () => Promise<unknown>) => operation()));
const getRawQuestionsMock = vi.hoisted(() => vi.fn());
const checkAnswerMock = vi.hoisted(() => vi.fn());
const syncProfileStatsMock = vi.hoisted(() => vi.fn());
const parseArenaBaseCategoryMock = vi.hoisted(() => vi.fn((category: string) => category));
const parseArenaStatusMock = vi.hoisted(() => vi.fn(() => null));
const rateLimitMock = vi.hoisted(() => vi.fn(async () => ({ success: true, message: "" })));

vi.mock("@/utils/supabase/server", () => ({
  createClient: createClientMock,
}));

vi.mock("@/utils/supabase/admin", () => ({
  createAdminClient: createAdminClientMock,
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

vi.mock("@/utils/moderation", () => ({
  validateNickname: validateNicknameMock,
}));

vi.mock("@/lib/retry", () => ({
  withRetry: withRetryMock,
}));

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: rateLimitMock,
}));

vi.mock("@/app/actions/quiz", () => ({
  getRawQuestions: getRawQuestionsMock,
}));

vi.mock("@/utils/quiz-helpers", () => ({
  checkAnswer: checkAnswerMock,
}));

vi.mock("@/lib/profile-sync", () => ({
  syncProfileStats: syncProfileStatsMock,
}));

vi.mock("@/lib/arena-category", () => ({
  parseArenaBaseCategory: parseArenaBaseCategoryMock,
  parseArenaStatus: parseArenaStatusMock,
}));

vi.mock("@upstash/redis", () => ({
  Redis: {
    fromEnv: vi.fn(() => ({})),
  },
}));

const originalEnv = process.env;

function buildAdminDb(params?: {
  existingResultId?: string | null;
  insertError?: Error | null;
}) {
  const profileSingle = vi.fn().mockResolvedValue({
    data: { nickname: "ServerNickname" },
    error: null,
  });
  const profileEq = vi.fn().mockReturnValue({ single: profileSingle });
  const profileSelect = vi.fn().mockReturnValue({ eq: profileEq });

  const quizMaybeSingle = vi.fn().mockResolvedValue({
    data: params?.existingResultId ? { id: params.existingResultId } : null,
    error: null,
  });
  const quizEq = vi.fn().mockReturnThis();
  const quizGt = vi.fn().mockReturnThis();
  const quizOrder = vi.fn().mockReturnThis();
  const quizLimit = vi.fn().mockResolvedValue({
    data: params?.existingResultId ? [{ id: params.existingResultId }] : [],
    error: null,
  });
  const quizSelect = vi.fn().mockReturnValue({
    eq: quizEq,
    gt: quizGt,
    order: quizOrder,
    limit: quizLimit,
    maybeSingle: quizMaybeSingle,
  });

  const quizUpdateEq = vi.fn().mockResolvedValue({ error: null });
  const quizUpdate = vi.fn().mockReturnValue({ eq: quizUpdateEq });

  const quizInsert = vi.fn().mockResolvedValue({
    error: params?.insertError ?? null,
  });

  const db = {
    from: vi.fn((table: string) => {
      if (table === "profiles") {
        return {
          select: profileSelect,
        };
      }

      if (table === "quiz_results") {
        return {
          select: quizSelect,
          update: quizUpdate,
          insert: quizInsert,
        };
      }

      throw new Error(`Unexpected table ${table}`);
    }),
  };

  return {
    db,
    spies: {
      quizInsert,
      quizUpdate,
      quizUpdateEq,
    },
  };
}

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

    getRawQuestionsMock.mockResolvedValue([
      { id: 1, question: "Q1" },
      { id: 2, question: "Q2" },
    ]);

    checkAnswerMock.mockImplementation((question: { id: number }, answer: string) => {
      if (question.id === 1) return answer === "correct";
      return false;
    });

    syncProfileStatsMock.mockResolvedValue(undefined);
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("updates nickname on existing recent duplicate result", async () => {
    const { db, spies } = buildAdminDb({ existingResultId: "existing-1" });
    createAdminClientMock.mockReturnValue(db as never);

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
    expect(spies.quizUpdate).toHaveBeenCalledWith({ nickname: "ServerNickname" });
    expect(spies.quizUpdateEq).toHaveBeenCalledWith("id", "existing-1");
    expect(spies.quizInsert).not.toHaveBeenCalled();
    expect(syncProfileStatsMock).not.toHaveBeenCalled();
  });

  it("saves a new result even when profile sync fails", async () => {
    const { db, spies } = buildAdminDb();
    createAdminClientMock.mockReturnValue(db as never);
    syncProfileStatsMock.mockRejectedValue(new Error("sync failed"));

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

  it("returns an error result when insert fails", async () => {
    const { db } = buildAdminDb({
      insertError: new Error("insert failed"),
    });
    createAdminClientMock.mockReturnValue(db as never);

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