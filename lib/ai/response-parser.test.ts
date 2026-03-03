import { describe, it, expect } from "vitest";
import { parseQuizResponse, formatProviderError } from "./response-parser";

describe("parseQuizResponse", () => {
  it("parses a clean JSON array of quiz questions", () => {
    const raw = JSON.stringify([
      { question: "Q1", options: ["A", "B"], answer: "A", explanation: "E1" },
    ]);
    const result = parseQuizResponse(raw);
    expect(result).toHaveLength(1);
    expect(result![0].question).toBe("Q1");
  });

  it("handles markdown code fences around JSON", () => {
    const raw = '```json\n[{"question":"Q","options":["A","B"],"answer":"A","explanation":"E"}]\n```';
    const result = parseQuizResponse(raw);
    expect(result).toHaveLength(1);
  });

  it("unwraps { questions: [...] } wrapper objects", () => {
    const raw = JSON.stringify({
      questions: [
        { question: "Q", options: ["A", "B"], answer: "A", explanation: "E" },
      ],
    });
    const result = parseQuizResponse(raw);
    expect(result).toHaveLength(1);
  });

  it("unwraps { flashcards: [...] } wrapper objects", () => {
    const raw = JSON.stringify({
      flashcards: [
        { question: "Term", options: ["Def"], answer: "Def", explanation: "Ctx" },
      ],
    });
    const result = parseQuizResponse(raw);
    expect(result).toHaveLength(1);
  });

  it("handles extra text before JSON", () => {
    const raw = 'Here are your questions:\n[{"question":"Q","options":["A"],"answer":"A","explanation":"E"}]';
    const result = parseQuizResponse(raw);
    expect(result).toHaveLength(1);
  });

  it("returns null for garbage text", () => {
    expect(parseQuizResponse("this is not json at all")).toBeNull();
  });

  it("returns null for valid JSON that does not match the schema", () => {
    const raw = JSON.stringify([{ foo: "bar" }]);
    expect(parseQuizResponse(raw)).toBeNull();
  });

  it("returns null for an empty string", () => {
    expect(parseQuizResponse("")).toBeNull();
  });
});

describe("formatProviderError", () => {
  it("formats a standard Error", () => {
    const msg = formatProviderError("Gemini", new Error("rate limit"));
    expect(msg).toBe("Gemini: rate limit");
  });

  it("formats an AbortError as a timeout message", () => {
    const err = new DOMException("signal is aborted", "AbortError");
    const msg = formatProviderError("OpenAI", err);
    expect(msg).toContain("timed out");
    expect(msg).toContain("OpenAI");
  });

  it("formats a plain string error", () => {
    const msg = formatProviderError("Groq", "something broke");
    expect(msg).toBe("Groq: something broke");
  });
});
