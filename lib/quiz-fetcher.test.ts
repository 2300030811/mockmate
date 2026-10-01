import { beforeEach, describe, expect, it, vi } from "vitest";
import { QuizFetcher } from "./quiz-fetcher";
import { quizRepository } from "@/lib/db/quiz-repository";

vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(() => ({})),
}));

vi.mock("@/lib/db/quiz-repository", () => ({
  quizRepository: {
    fetchQuestions: vi.fn(),
  },
}));

describe("QuizFetcher", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns questions array when repository returns valid record", async () => {
    const mockQuestions = [{ id: "q1", question: "What is React?" }];
    vi.mocked(quizRepository.fetchQuestions).mockResolvedValue({
      questions: mockQuestions,
    } as any);

    const result = await QuizFetcher.fetchQuestionsFromDB("react");
    expect(result).toEqual(mockQuestions);
  });

  it("returns null when repository returns null", async () => {
    vi.mocked(quizRepository.fetchQuestions).mockResolvedValue(null as any);

    const result = await QuizFetcher.fetchQuestionsFromDB("unknown");
    expect(result).toBeNull();
  });

  it("handles errors gracefully and returns null", async () => {
    vi.mocked(quizRepository.fetchQuestions).mockRejectedValue(new Error("DB timeout"));

    const result = await QuizFetcher.fetchQuestionsFromDB("error-case");
    expect(result).toBeNull();
  });
});
