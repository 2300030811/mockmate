import { describe, it, expect } from "vitest";
import { PromptBuilder } from "./prompt-builder";

describe("PromptBuilder", () => {
  describe("getSystemPrompt", () => {
    it("returns a non-empty system prompt string", () => {
      const prompt = PromptBuilder.getSystemPrompt();
      expect(prompt).toBeTruthy();
      expect(typeof prompt).toBe("string");
    });
  });

  describe("buildUserPrompt", () => {
    it("includes the content in the quiz prompt", () => {
      const prompt = PromptBuilder.buildUserPrompt("Photosynthesis converts light to energy", 10, "medium", "quiz");
      expect(prompt).toContain("Photosynthesis converts light to energy");
    });

    it("includes difficulty in the quiz prompt", () => {
      const prompt = PromptBuilder.buildUserPrompt("content", 10, "hard", "quiz");
      expect(prompt).toContain("HARD");
    });

    it("includes the count in the prompt", () => {
      const prompt = PromptBuilder.buildUserPrompt("content", 25, "medium", "quiz");
      expect(prompt).toContain("25");
    });

    it("returns flashcard-specific prompt when mode is flashcard", () => {
      const prompt = PromptBuilder.buildUserPrompt("content", 10, "medium", "flashcard");
      expect(prompt).toContain("flashcards");
      expect(prompt).toContain("Front (question)");
    });

    it("returns quiz-specific prompt when mode is quiz", () => {
      const prompt = PromptBuilder.buildUserPrompt("content", 10, "medium", "quiz");
      expect(prompt).toContain("multiple-choice questions");
      expect(prompt).toContain("4 options");
    });

    it("enforces minimum count of 15", () => {
      const prompt = PromptBuilder.buildUserPrompt("content", 5, "easy", "quiz");
      expect(prompt).toContain("15");
    });

    it("uses exact count when above 15", () => {
      const prompt = PromptBuilder.buildUserPrompt("content", 30, "easy", "quiz");
      expect(prompt).toContain("30");
    });
  });

  describe("buildVisionPrompt", () => {
    it("returns a quiz vision prompt with difficulty", () => {
      const prompt = PromptBuilder.buildVisionPrompt(20, "hard", "quiz");
      expect(prompt).toContain("HARD");
      expect(prompt).toContain("PDF");
    });

    it("returns a flashcard vision prompt", () => {
      const prompt = PromptBuilder.buildVisionPrompt(10, "medium", "flashcard");
      expect(prompt).toContain("flashcards");
      expect(prompt).toContain("PDF");
    });

    it("does not include user content (vision prompts rely on inline PDF data)", () => {
      const prompt = PromptBuilder.buildVisionPrompt(10, "medium", "quiz");
      // Vision prompts should NOT have a TEXT CONTENT section
      expect(prompt).not.toContain("TEXT:");
    });
  });
});
