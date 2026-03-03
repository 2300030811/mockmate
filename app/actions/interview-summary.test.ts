import { describe, it, expect, vi, beforeEach } from "vitest";

const mockCreate = vi.fn();

// Mock dependencies before importing the module
vi.mock("@/utils/keyManager", () => ({
  getNextKey: vi.fn(() => "test-groq-key"),
}));

vi.mock("@/utils/sanitize", () => ({
  sanitizePromptInput: vi.fn((input: string) => input),
}));

vi.mock("@/lib/logger", () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

vi.mock("groq-sdk", () => ({
  Groq: vi.fn(function () {
    return {
      chat: {
        completions: {
          create: mockCreate,
        },
      },
    };
  }),
}));

describe("summarizeInterviewAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return markdown summary from Groq", async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: "## Interview Summary\nScore: 85/100" } }],
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
    expect(mockCreate).toHaveBeenCalledOnce();
    // Should use the 70b versatile model
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ model: "llama-3.3-70b-versatile" })
    );
  });

  it("should sanitize type parameter", async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: "Summary result" } }],
    });

    const { summarizeInterviewAction } = await import(
      "@/app/actions/interview-summary"
    );

    await summarizeInterviewAction(
      [{ role: "user", content: "test" }],
      "malicious-type"
    );

    // The prompt should not contain the malicious type
    const calledPrompt = mockCreate.mock.calls[0][0].messages[0].content;
    expect(calledPrompt).not.toContain("malicious-type");
  });

  it("should return fallback message on Groq failure", async () => {
    mockCreate.mockRejectedValue(new Error("API Error"));

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
