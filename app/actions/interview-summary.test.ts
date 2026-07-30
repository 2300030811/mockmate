import { describe, it, expect, vi, beforeEach } from "vitest";

const generateTextMock = vi.fn();

// Mock dependencies before importing the module
vi.mock("@/utils/sanitize", () => ({
  sanitizePromptInput: vi.fn((input: string) => input),
}));

vi.mock("@/lib/logger", () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

vi.mock("@/lib/ai/gateway", () => ({
  generateText: generateTextMock,
  AI_MODELS: {
    DEFAULT: "llama-3.3-70b-versatile",
    FAST: "openai/gpt-oss-20b",
    STRUCTURED: "llama-3.3-70b-versatile",
  },
}));

describe("summarizeInterviewAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return markdown summary from gateway", async () => {
    generateTextMock.mockResolvedValue({
      content: "## Interview Summary\nScore: 85/100",
      provider: "groq",
    });

    const { summarizeInterviewAction } = await import(
      "@/app/actions/interview-summary"
    );

    const result = await summarizeInterviewAction(
      [
        { role: "assistant", content: "Tell me about yourself." },
        { role: "user", content: "I am a software engineer with 5 years of experience." },
      ],
      "technical"
    );

    expect(result.markdown).toContain("Interview Summary");
    expect(generateTextMock).toHaveBeenCalledOnce();
    // Should use the DEFAULT model
    expect(generateTextMock).toHaveBeenCalledWith(
      expect.any(Array),
      expect.any(String),
      "auto",
      expect.objectContaining({ model: "llama-3.3-70b-versatile" })
    );
  });

  it("should sanitize type parameter", async () => {
    generateTextMock.mockResolvedValue({
      content: "Summary result",
      provider: "groq",
    });

    const { summarizeInterviewAction } = await import(
      "@/app/actions/interview-summary"
    );

    await summarizeInterviewAction(
      [{ role: "user", content: "test" }],
      "malicious-type"
    );

    // The prompt should not contain the malicious type
    const calledPrompt = generateTextMock.mock.calls[0][0][0].content;
    expect(calledPrompt).not.toContain("malicious-type");
  });

  it("should return fallback message on gateway failure", async () => {
    generateTextMock.mockRejectedValue(new Error("API Error"));

    const { summarizeInterviewAction } = await import(
      "@/app/actions/interview-summary"
    );

    const result = await summarizeInterviewAction(
      [{ role: "user", content: "test" }],
      "behavioral"
    );

    expect(result.markdown).toContain("couldn't generate a detailed summary");
  });
});
