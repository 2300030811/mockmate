import { describe, expect, it, vi, beforeEach } from "vitest";
import { aiOrchestrator } from "./ai-orchestrator";
import { generateText } from "@/lib/ai/gateway";
import { cleanJsonMarkdown, extractJsonObject, safeParseStructured } from "@/lib/ai/response-parser";
import { z } from "zod";

vi.mock("@/lib/ai/gateway", () => ({
  generateText: vi.fn(),
  AI_MODELS: {
    DEFAULT: "llama-3.3-70b-versatile",
  },
}));

const generateTextMock = vi.mocked(generateText);

describe("AI Response Parser Helpers", () => {
  it("cleanJsonMarkdown strips json code fences", () => {
    const raw = "```json\n{\"test\": 123}\n```";
    expect(cleanJsonMarkdown(raw)).toBe("{\"test\": 123}");
  });

  it("extractJsonObject finds outermost JSON object", () => {
    const raw = "Here is the result:\n```json\n{\n  \"score\": 90\n}\n```\nHope it helps.";
    expect(extractJsonObject(raw)).toBe("{\n  \"score\": 90\n}");
  });

  it("extractJsonObject finds outermost JSON array", () => {
    const raw = "Some text [\"a\", \"b\"] more text";
    expect(extractJsonObject(raw)).toBe("[\"a\", \"b\"]");
  });

  it("safeParseStructured validates correct schema", () => {
    const schema = z.object({ value: z.number() });
    const text = "```json\n{\"value\": 42}\n```";
    const res = safeParseStructured(text, schema);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data).toEqual({ value: 42 });
    }
  });

  it("safeParseStructured returns error for invalid validation", () => {
    const schema = z.object({ value: z.number() });
    const text = "{\"value\": \"forty-two\"}";
    const res = safeParseStructured(text, schema);
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error).toContain("JSON validation failed");
    }
  });

  it("safeParseStructured returns error for broken JSON", () => {
    const schema = z.object({ value: z.number() });
    const text = "{\"value\": 42,}";
    const res = safeParseStructured(text, schema);
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error).toContain("JSON parsing failed");
    }
  });
});

describe("aiOrchestrator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("generateText calls AI Gateway generateText directly", async () => {
    generateTextMock.mockResolvedValue({ content: "hello world", provider: "groq" });
    const res = await aiOrchestrator.generateText("hi", "system");
    expect(generateTextMock).toHaveBeenCalledWith("hi", "system", "auto", undefined);
    expect(res).toEqual({ content: "hello world", provider: "groq" });
  });

  it("generateStructured handles successful generation and parsing", async () => {
    const schema = z.object({ score: z.number() });
    generateTextMock.mockResolvedValue({ content: "```json\n{\"score\": 85}\n```", provider: "groq" });

    const res = await aiOrchestrator.generateStructured("evaluate this", "system", schema);
    expect(generateTextMock).toHaveBeenCalledWith(
      "evaluate this",
      "system",
      "auto",
      expect.objectContaining({ responseFormat: { type: "json_object" } })
    );
    expect(res.success).toBe(true);
    expect(res.data).toEqual({ score: 85 });
    expect(res.provider).toBe("groq");
  });

  it("generateStructured returns failure when validation fails", async () => {
    const schema = z.object({ score: z.number() });
    generateTextMock.mockResolvedValue({ content: "{\"score\": \"invalid\"}", provider: "gemini" });

    const res = await aiOrchestrator.generateStructured("evaluate this", "system", schema, "gemini");
    expect(res.success).toBe(false);
    expect(res.error).toContain("JSON validation failed");
    expect(res.provider).toBe("gemini");
  });
});
