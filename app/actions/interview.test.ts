import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGroqCreate = vi.fn();
const mockSendMessage = vi.fn();

// Mock dependencies
vi.mock("@/utils/keyManager", () => ({
  getNextKey: vi.fn(() => "test-key"),
}));

vi.mock("@/utils/sanitize", () => ({
  sanitizePromptInput: vi.fn((input: string) => input),
}));

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn(() => ({ success: true, message: "" })),
}));

vi.mock("groq-sdk", () => ({
  Groq: vi.fn(function () {
    return {
      chat: {
        completions: {
          create: mockGroqCreate,
        },
      },
    };
  }),
}));

vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: vi.fn(function () {
    return {
      getGenerativeModel: vi.fn(() => ({
        startChat: vi.fn(() => ({
          sendMessage: mockSendMessage,
        })),
      })),
    };
  }),
}));

describe("chatWithAI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: Groq succeeds
    mockGroqCreate.mockResolvedValue({
      choices: [{ message: { content: "Hello, let's begin the interview." } }],
    });
    mockSendMessage.mockResolvedValue({
      response: { text: () => "Gemini fallback response" },
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
    // Should succeed (type falls back to "behavioral")
    expect(result.response).toBeTruthy();

    // Verify system prompt uses "behavioral" not the injected type
    const systemPrompt = mockGroqCreate.mock.calls[0][0].messages[0].content;
    expect(systemPrompt).toContain("behavioral");
    expect(systemPrompt).not.toContain("<script>");
  });

  it("should fall back to Gemini when Groq fails", async () => {
    mockGroqCreate.mockRejectedValue(new Error("Groq API error"));

    const { chatWithAI } = await import("@/app/actions/interview");
    const result = await chatWithAI(
      [{ role: "user", content: "Hi" }],
      "technical"
    );
    expect(result.response).toBe("Gemini fallback response");
    expect(mockSendMessage).toHaveBeenCalled();
  });

  it("should return error when both providers fail", async () => {
    mockGroqCreate.mockRejectedValue(new Error("Groq down"));
    mockSendMessage.mockRejectedValue(new Error("Gemini down"));

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

    const systemPrompt = mockGroqCreate.mock.calls[0][0].messages[0].content;
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

    const systemPrompt = mockGroqCreate.mock.calls[0][0].messages[0].content;
    expect(systemPrompt).toContain("mid");
  });
});

describe("chatWithAI message trimming", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGroqCreate.mockResolvedValue({
      choices: [{ message: { content: "Response" } }],
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

    // System prompt + 30 trimmed messages = 31 messages total sent to Groq
    const sentMessages = mockGroqCreate.mock.calls[0][0].messages;
    expect(sentMessages.length).toBe(31); // 1 system + 30 user/assistant
  });
});
