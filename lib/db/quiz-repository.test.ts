import { describe, expect, it, vi } from "vitest";
import { quizRepository } from "./quiz-repository";

describe("quizRepository", () => {
  it("fetchQuestions queries quizzes table correctly", async () => {
    const mockSingle = vi.fn().mockResolvedValue({ data: { questions: [] }, error: null });
    const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    const mockDb = {
      from: vi.fn().mockReturnValue({ select: mockSelect }),
    } as any;

    const res = await quizRepository.fetchQuestions(mockDb, "aws");
    expect(mockDb.from).toHaveBeenCalledWith("quizzes");
    expect(mockSelect).toHaveBeenCalledWith("questions");
    expect(mockEq).toHaveBeenCalledWith("category", "aws");
    expect(res).toEqual({ questions: [] });
  });

  it("saveResult inserts result correctly", async () => {
    const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });
    const mockDb = {
      from: vi.fn().mockReturnValue({ insert: mockInsert }),
    } as any;

    const payload = {
      session_id: "sess-1",
      user_id: "user-1",
      category: "aws",
      score: 5,
      total_questions: 10,
      nickname: "Bob",
      completed_at: "2026-06-19",
    };

    await quizRepository.saveResult(mockDb, payload);
    expect(mockDb.from).toHaveBeenCalledWith("quiz_results");
    expect(mockInsert).toHaveBeenCalledWith(payload);
  });
});
