import { describe, it, expect, vi, beforeEach } from "vitest";

const rateLimitMock = vi.hoisted(() => vi.fn());
const generateTextMock = vi.hoisted(() => vi.fn());

vi.mock("@/utils/sanitize", () => ({
  sanitizePromptInput: vi.fn((input: string) => input),
}));

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: rateLimitMock,
}));

vi.mock("@/lib/ai/gateway", () => ({
  generateText: generateTextMock,
  AI_MODELS: {
    DEFAULT: "llama-3.3-70b-versatile",
    FAST: "llama-3.1-8b-instant",
    STRUCTURED: "llama-3.3-70b-versatile",
  },
}));

describe("chatWithAI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    rateLimitMock.mockResolvedValue({ success: true, message: "" });
    generateTextMock.mockResolvedValue({
      content: "Hello, let's begin the interview.",
      provider: "groq",
    });
  });

  it("should return error for invalid messages", async () => {
    const { chatWithAI } = await import("@/app/actions/interview");
    const result = await chatWithAI(
      [{ role: "invalid" as any, content: "" }],
      "behavioral"
    );
    expect(result.error).toBe("Invalid message format");
  });

  it("should return AI response for valid input", async () => {
    const { chatWithAI } = await import("@/app/actions/interview");
    const result = await chatWithAI(
      [{ role: "user", content: "Hi, I'm ready for the interview." }],
      "behavioral"
    );
    expect(result.response).toBe("Hello, let's begin the interview.");
    expect(result.error).toBeUndefined();
  });

  it("should sanitize type to behavioral for invalid values", async () => {
    const { chatWithAI } = await import("@/app/actions/interview");
    const result = await chatWithAI(
      [{ role: "user", content: "Hi" }],
      '<script>alert("xss")</script>'
    );
    expect(result.response).toBeTruthy();

    // Verify system prompt uses "behavioral" and doesn't contain injected type
    const systemPrompt = generateTextMock.mock.calls[0][1];
    expect(systemPrompt).toContain("behavioral");
    expect(systemPrompt).not.toContain("<script>");
  });

  it("should return error when gateway fails", async () => {
    generateTextMock.mockRejectedValue(new Error("Gateway error"));

    const { chatWithAI } = await import("@/app/actions/interview");
    const result = await chatWithAI(
      [{ role: "user", content: "Hi" }],
      "technical"
    );
    expect(result.error).toBe("AI Service Unavailable");
    expect(result.response).toBe("");
  });

  it("should accept valid difficulty and topic parameters", async () => {
    const { chatWithAI } = await import("@/app/actions/interview");
    const result = await chatWithAI(
      [{ role: "user", content: "Hi" }],
      "technical",
      "senior",
      "React"
    );
    expect(result.response).toBeTruthy();

    const systemPrompt = generateTextMock.mock.calls[0][1];
    expect(systemPrompt).toContain("senior");
    expect(systemPrompt).toContain("React");
  });

  it("should default difficulty to mid for invalid values", async () => {
    const { chatWithAI } = await import("@/app/actions/interview");
    await chatWithAI(
      [{ role: "user", content: "Hi" }],
      "behavioral",
      "expert" // invalid
    );

    const systemPrompt = generateTextMock.mock.calls[0][1];
    expect(systemPrompt).toContain("mid");
  });

  it("should pass custom model, temperature, and maxTokens to gateway", async () => {
    const { chatWithAI } = await import("@/app/actions/interview");
    await chatWithAI(
      [{ role: "user", content: "Hi" }],
      "behavioral"
    );
    expect(generateTextMock).toHaveBeenCalledWith(
      expect.any(Array),
      expect.any(String),
      "auto",
      expect.objectContaining({
        model: "llama-3.1-8b-instant",
        temperature: 0.7,
        maxTokens: 150
      })
    );
  });

  it("should pass the full conversation history (ChatMessage[]) to the gateway", async () => {
    const { chatWithAI } = await import("@/app/actions/interview");
    const messages = [
      { role: "user" as const, content: "Hello" },
      { role: "assistant" as const, content: "Hi there" },
      { role: "user" as const, content: "How are you?" }
    ];
    await chatWithAI(messages, "behavioral");
    expect(generateTextMock).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ role: "user", content: "Hello" }),
        expect.objectContaining({ role: "assistant", content: "Hi there" }),
        expect.objectContaining({ role: "user", content: "How are you?" })
      ]),
      expect.any(String),
      "auto",
      expect.any(Object)
    );
  });
});

describe("chatWithAI message trimming", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    rateLimitMock.mockResolvedValue({ success: true, message: "" });
    generateTextMock.mockResolvedValue({
      content: "Response",
      provider: "groq",
    });
  });

  it("should accept up to 50 messages per schema", async () => {
    const { chatWithAI } = await import("@/app/actions/interview");
    const messages = Array.from({ length: 50 }, (_, i) => ({
      role: i % 2 === 0 ? ("user" as const) : ("assistant" as const),
      content: `Message ${i}`,
    }));
    const result = await chatWithAI(messages, "behavioral");
    expect(result.response).toBeTruthy();
  });

  it("should reject more than 50 messages", async () => {
    const { chatWithAI } = await import("@/app/actions/interview");
    const messages = Array.from({ length: 51 }, (_, i) => ({
      role: i % 2 === 0 ? ("user" as const) : ("assistant" as const),
      content: `Message ${i}`,
    }));
    const result = await chatWithAI(messages, "behavioral");
    expect(result.error).toBe("Invalid message format");
  });

  it("should trim messages to 30 for LLM when over limit", async () => {
    const { chatWithAI } = await import("@/app/actions/interview");
    const messages = Array.from({ length: 40 }, (_, i) => ({
      role: i % 2 === 0 ? ("user" as const) : ("assistant" as const),
      content: `Message ${i}`,
    }));
    await chatWithAI(messages, "behavioral");

    // 30 trimmed messages passed to generateText
    const sentMessages = generateTextMock.mock.calls[0][0];
    expect(sentMessages.length).toBe(30);
  });
});
