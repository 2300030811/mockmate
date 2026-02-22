import { describe, it, expect, beforeEach } from "vitest";
import {
  getCachedQuestions,
  setCachedQuestions,
  clearQuizCache,
  getQuizCacheStats,
} from "./quiz-cache";

// Minimal mock question
const mockQuestions = [
  { id: "1", question: "What is AWS?", options: ["A", "B", "C", "D"], answer: "A", type: "mcq" as const },
  { id: "2", question: "What is S3?", options: ["A", "B", "C", "D"], answer: "B", type: "mcq" as const },
];

describe("quiz-cache", () => {
  beforeEach(() => {
    clearQuizCache();
  });

  it("returns null for uncached categories", () => {
    expect(getCachedQuestions("aws")).toBeNull();
  });

  it("caches and retrieves questions", () => {
    setCachedQuestions("aws", mockQuestions as any);
    const cached = getCachedQuestions("aws");
    expect(cached).toHaveLength(2);
    expect(cached![0].question).toBe("What is AWS?");
  });

  it("is case-insensitive for category names", () => {
    setCachedQuestions("AWS", mockQuestions as any);
    expect(getCachedQuestions("aws")).toHaveLength(2);
    expect(getCachedQuestions("Aws")).toHaveLength(2);
  });

  it("does not cache empty arrays", () => {
    setCachedQuestions("aws", []);
    expect(getCachedQuestions("aws")).toBeNull();
  });

  it("clearQuizCache removes all entries", () => {
    setCachedQuestions("aws", mockQuestions as any);
    setCachedQuestions("azure", mockQuestions as any);
    expect(getQuizCacheStats().size).toBe(2);

    clearQuizCache();
    expect(getQuizCacheStats().size).toBe(0);
    expect(getCachedQuestions("aws")).toBeNull();
  });

  it("getQuizCacheStats returns correct categories", () => {
    setCachedQuestions("aws", mockQuestions as any);
    setCachedQuestions("oracle", mockQuestions as any);

    const stats = getQuizCacheStats();
    expect(stats.size).toBe(2);
    expect(stats.categories).toContain("aws");
    expect(stats.categories).toContain("oracle");
  });
});
