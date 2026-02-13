import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useQuizEngine } from "./useQuizEngine";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });

const mockQuestions = [
  { id: "q1", question: "What is 1+1?", type: "mcq", options: ["1", "2", "3", "4"], answer: "2" },
  { id: "q2", question: "What is 2+2?", type: "mcq", options: ["3", "4", "5", "6"], answer: "4" },
  { id: "q3", question: "What is 3+3?", type: "mcq", options: ["5", "6", "7", "8"], answer: "6" },
] as any;

describe("useQuizEngine", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it("initializes with correct defaults", () => {
    const { result } = renderHook(() =>
      useQuizEngine({ questions: mockQuestions, mode: "practice", category: "test" })
    );

    expect(result.current.currentQuestionIndex).toBe(0);
    expect(result.current.isSubmitted).toBe(false);
    expect(result.current.userAnswers).toEqual({});
    expect(result.current.markedQuestions).toEqual([]); // Array, not Set
  });

  it("generates unique persistence keys based on first question ID and category", () => {
    const quizA = [{ id: "aws-q1", question: "Q", type: "mcq", options: [], answer: "" }] as any;
    const quizB = [{ id: "azure-q1", question: "Q", type: "mcq", options: [], answer: "" }] as any;

    renderHook(() => useQuizEngine({ questions: quizA, mode: "practice", category: "aws" }));
    renderHook(() => useQuizEngine({ questions: quizB, mode: "practice", category: "azure" }));

    // Verify that localStorage.getItem was called with different keys
    const getCalled = localStorageMock.getItem.mock.calls.map((c: string[]) => c[0]);
    expect(getCalled).toContain("quiz_progress_aws_practice_aws-q1");
    expect(getCalled).toContain("quiz_progress_azure_practice_azure-q1");
  });

  it("navigates forward and backward within bounds", () => {
    const { result } = renderHook(() =>
      useQuizEngine({ questions: mockQuestions, mode: "practice", category: "test" })
    );

    expect(result.current.currentQuestionIndex).toBe(0);

    act(() => result.current.nextQuestion());
    expect(result.current.currentQuestionIndex).toBe(1);

    act(() => result.current.nextQuestion());
    expect(result.current.currentQuestionIndex).toBe(2);

    // Should not go past last question
    act(() => result.current.nextQuestion());
    expect(result.current.currentQuestionIndex).toBe(2);

    act(() => result.current.prevQuestion());
    expect(result.current.currentQuestionIndex).toBe(1);

    act(() => result.current.prevQuestion());
    expect(result.current.currentQuestionIndex).toBe(0);

    // Should not go before first question
    act(() => result.current.prevQuestion());
    expect(result.current.currentQuestionIndex).toBe(0);
  });

  it("handles answers correctly", () => {
    const { result } = renderHook(() =>
      useQuizEngine({ questions: mockQuestions, mode: "practice", category: "test" })
    );

    act(() => result.current.handleAnswer("q1", "2"));
    expect(result.current.userAnswers).toEqual({ q1: "2" });

    act(() => result.current.handleAnswer("q2", "4"));
    expect(result.current.userAnswers).toEqual({ q1: "2", q2: "4" });

    // Overwrite existing answer
    act(() => result.current.handleAnswer("q1", "3"));
    expect(result.current.userAnswers).toEqual({ q1: "3", q2: "4" });
  });

  it("toggles marked questions", () => {
    const { result } = renderHook(() =>
      useQuizEngine({ questions: mockQuestions, mode: "practice", category: "test" })
    );

    act(() => result.current.toggleMark("q1"));
    expect(result.current.markedQuestions).toContain("q1");

    act(() => result.current.toggleMark("q1"));
    expect(result.current.markedQuestions).not.toContain("q1");
  });

  it("handles submission", () => {
    const { result } = renderHook(() =>
      useQuizEngine({ questions: mockQuestions, mode: "exam", category: "test", initialTimeRemaining: 60 })
    );

    act(() => result.current.handleAnswer("q1", "2"));
    act(() => result.current.handleSubmit());

    expect(result.current.isSubmitted).toBe(true);
  });

  it("blocks answer changes in exam mode after submission", () => {
    const { result } = renderHook(() =>
      useQuizEngine({ questions: mockQuestions, mode: "exam", category: "test", initialTimeRemaining: 60 })
    );

    act(() => result.current.handleAnswer("q1", "2"));
    act(() => result.current.handleSubmit());

    // Try to change answer after submission in exam mode
    act(() => result.current.handleAnswer("q1", "3"));
    expect(result.current.userAnswers["q1"]).toBe("2"); // Should not change
  });

  it("clears progress from localStorage", () => {
    const { result } = renderHook(() =>
      useQuizEngine({ questions: mockQuestions, mode: "practice", category: "test" })
    );

    act(() => result.current.handleAnswer("q1", "2"));
    act(() => result.current.clearProgress());

    expect(result.current.currentQuestionIndex).toBe(0);
    expect(result.current.userAnswers).toEqual({});
    expect(result.current.isSubmitted).toBe(false);
    expect(localStorageMock.removeItem).toHaveBeenCalled();
  });
});
