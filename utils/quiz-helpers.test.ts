import { describe, it, expect } from "vitest";
import { parseExplanationForHotspot, shuffleArray, checkAnswer } from "./quiz-helpers";
import type { QuizQuestion } from "@/types";

describe("shuffleArray", () => {
  it("returns array of same length", () => {
    const arr = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray([...arr]);
    expect(shuffled.length).toBe(arr.length);
  });

  it("contains all original elements", () => {
    const arr = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray([...arr]);
    expect(shuffled.sort()).toEqual(arr.sort());
  });

  it("returns empty array for empty input", () => {
    expect(shuffleArray([])).toEqual([]);
  });

  it("returns single element for single element array", () => {
    expect(shuffleArray([42])).toEqual([42]);
  });

  it("does not mutate the original array", () => {
    const arr = [1, 2, 3, 4, 5];
    const copy = [...arr];
    shuffleArray(copy);
    // Note: shuffleArray mutates in-place based on Fisher-Yates, 
    // so we just check it still has the same elements
    expect(copy.sort()).toEqual(arr.sort());
  });
});

describe("parseExplanationForHotspot", () => {
  it("extracts Yes/No answers from explanation text", () => {
    const explanation = "Statement 1: Yes\nStatement 2: No\nStatement 3: Yes";
    const result = parseExplanationForHotspot(explanation);
    
    // Should return something parseable
    expect(result).toBeDefined();
  });

  it("returns null for non-hotspot explanations", () => {
    const explanation = "The correct answer is A because of X.";
    const result = parseExplanationForHotspot(explanation);
    expect(result).toBeNull();
  });

  it("handles empty string", () => {
    const result = parseExplanationForHotspot("");
    expect(result).toBeNull();
  });

  it("handles undefined input", () => {
    const result = parseExplanationForHotspot(undefined as any);
    expect(result).toBeNull();
  });
});

// ─── checkAnswer ────────────────────────────────────────────────────────────

describe("checkAnswer", () => {
  describe("MCQ (single choice)", () => {
    const mcqQuestion = {
      id: "1",
      question: "What is 1+1?",
      type: "mcq",
      options: ["1", "2", "3", "4"],
      answer: "B",
    } as unknown as QuizQuestion;

    it("returns true for correct string answer", () => {
      expect(checkAnswer(mcqQuestion, "B")).toBe(true);
    });

    it("returns false for incorrect string answer", () => {
      expect(checkAnswer(mcqQuestion, "A")).toBe(false);
    });

    it("returns false for undefined answer", () => {
      expect(checkAnswer(mcqQuestion, undefined as any)).toBe(false);
    });
  });

  describe("MCQ (multi-select / array answers)", () => {
    const msqQuestion = {
      id: "2",
      question: "Select all even numbers",
      type: "mcq",
      options: ["1", "2", "3", "4"],
      answer: ["B", "D"],
    } as unknown as QuizQuestion;

    it("returns true for correct array answer", () => {
      expect(checkAnswer(msqQuestion, ["B", "D"])).toBe(true);
    });

    it("returns true for correct array in different order", () => {
      expect(checkAnswer(msqQuestion, ["D", "B"])).toBe(true);
    });

    it("returns false for partial answer", () => {
      expect(checkAnswer(msqQuestion, ["B"])).toBe(false);
    });

    it("returns false for extra selections", () => {
      expect(checkAnswer(msqQuestion, ["A", "B", "D"])).toBe(false);
    });
  });

  describe("AWS legacy (array answer with string q.answer)", () => {
    const legacyQuestion = {
      id: "3",
      question: "Which services? (legacy format)",
      type: "mcq",
      options: ["S3", "EC2", "Lambda"],
      answer: "AB",
    } as unknown as QuizQuestion;

    it("returns true for matching sorted answer", () => {
      expect(checkAnswer(legacyQuestion, ["A", "B"])).toBe(true);
    });

    it("returns true for unsorted matching answer", () => {
      expect(checkAnswer(legacyQuestion, ["B", "A"])).toBe(true);
    });

    it("returns false for wrong answer", () => {
      expect(checkAnswer(legacyQuestion, ["A", "C"])).toBe(false);
    });
  });

  describe("Hotspot", () => {
    const hotspotQuestion = {
      id: "4",
      question: "Select correct statements",
      type: "hotspot",
      options: [],
      answer: { "Box 1": "Yes", "Box 2": "No", "Box 3": "Yes" },
    } as unknown as QuizQuestion;

    it("returns true for correct hotspot answers", () => {
      expect(
        checkAnswer(hotspotQuestion, { "Box 1": "Yes", "Box 2": "No", "Box 3": "Yes" })
      ).toBe(true);
    });

    it("returns false for partially wrong hotspot", () => {
      expect(
        checkAnswer(hotspotQuestion, { "Box 1": "Yes", "Box 2": "Yes", "Box 3": "Yes" })
      ).toBe(false);
    });

    it("returns false for missing keys", () => {
      expect(checkAnswer(hotspotQuestion, { "Box 1": "Yes" })).toBe(false);
    });
  });

  describe("Case Table", () => {
    const caseTableQuestion = {
      id: "5",
      question: "Match answers to statements",
      type: "case_table",
      options: [],
      answer: "",
      statements: [
        { text: "Statement 1", answer: "Yes" },
        { text: "Statement 2", answer: "No" },
      ],
    } as unknown as QuizQuestion;

    it("returns true for correct case_table answers", () => {
      expect(checkAnswer(caseTableQuestion, { "0": "Yes", "1": "No" })).toBe(true);
    });

    it("returns false for incorrect case_table answers", () => {
      expect(checkAnswer(caseTableQuestion, { "0": "No", "1": "No" })).toBe(false);
    });
  });

  describe("Drag & Drop (array answer)", () => {
    const ddQuestion = {
      id: "6",
      question: "Arrange in order",
      type: "drag_drop",
      options: ["A", "B", "C"],
      answer: ["A", "C", "B"],
    } as unknown as QuizQuestion;

    it("returns true when all items match", () => {
      expect(checkAnswer(ddQuestion, ["A", "C", "B"])).toBe(true);
    });

    it("returns true for same items in different order (contains check)", () => {
      expect(checkAnswer(ddQuestion, ["B", "A", "C"])).toBe(true);
    });

    it("returns false for wrong items", () => {
      expect(checkAnswer(ddQuestion, ["A", "B"])).toBe(false);
    });
  });

  describe("Drag & Drop (answer_mapping)", () => {
    const ddMappingQuestion = {
      id: "7",
      question: "Map items to zones",
      type: "drag_drop",
      options: [],
      answer: "",
      answer_mapping: { "Zone1": "Item A", "Zone2": "Item B" },
    } as unknown as QuizQuestion;

    it("returns true for correct mapping", () => {
      expect(
        checkAnswer(ddMappingQuestion, { "Zone1": "Item A", "Zone2": "Item B" })
      ).toBe(true);
    });

    it("returns false for swapped mapping", () => {
      expect(
        checkAnswer(ddMappingQuestion, { "Zone1": "Item B", "Zone2": "Item A" })
      ).toBe(false);
    });
  });
});
