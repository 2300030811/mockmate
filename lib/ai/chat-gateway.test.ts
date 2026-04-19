import { beforeEach, describe, expect, it, vi } from "vitest";
import { AIGateway, type ChatMessage } from "@/lib/ai/chat-gateway";

const getNextKeyMock = vi.hoisted(() => vi.fn());
const groqCreateMock = vi.hoisted(() => vi.fn());
const geminiGenerateContentStreamMock = vi.hoisted(() => vi.fn());

vi.mock("@/utils/keyManager", () => ({
  getNextKey: getNextKeyMock,
}));

vi.mock("groq-sdk", () => ({
  Groq: vi.fn(function MockGroq() {
    return {
      chat: {
        completions: {
          create: groqCreateMock,
        },
      },
    };
  }),
}));

vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: vi.fn(function MockGoogleGenerativeAI() {
    return {
      getGenerativeModel: vi.fn(() => ({
        generateContentStream: geminiGenerateContentStreamMock,
      })),
    };
  }),
}));

function toAsyncIterable<T>(items: T[], errorAfter?: Error): AsyncIterable<T> {
  return {
    [Symbol.asyncIterator]: async function* () {
      for (const item of items) {
        yield item;
      }

      if (errorAfter) {
        throw errorAfter;
      }
    },
  };
}

async function readDataStream(stream: ReadableStream): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let output = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    output += decoder.decode(value, { stream: true });
  }

  output += decoder.decode();
  return output;
}

const SAMPLE_MESSAGES: ChatMessage[] = [{ role: "user", content: "Hello Bob" }];

describe("AIGateway.streamChat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("streams Groq output when Groq is available", async () => {
    getNextKeyMock.mockImplementation((key: string) => {
      if (key === "GROQ_API_KEY") return "groq-key";
      if (key === "GOOGLE_API_KEY") return "gemini-key";
      return undefined;
    });

    groqCreateMock.mockResolvedValue(
      toAsyncIterable([
        { choices: [{ delta: { content: "Hello" } }] },
        { choices: [{ delta: { content: " world" } }] },
      ])
    );

    const stream = await AIGateway.streamChat(SAMPLE_MESSAGES, "system prompt");
    const output = await readDataStream(stream);

    expect(output).toContain('0:"Hello"');
    expect(output).toContain('0:" world"');
    expect(geminiGenerateContentStreamMock).not.toHaveBeenCalled();
  });

  it("falls back to Gemini when Groq setup fails", async () => {
    getNextKeyMock.mockImplementation((key: string) => {
      if (key === "GROQ_API_KEY") return "groq-key";
      if (key === "GOOGLE_API_KEY") return "gemini-key";
      return undefined;
    });

    groqCreateMock.mockRejectedValue(new Error("Groq unavailable"));
    geminiGenerateContentStreamMock.mockResolvedValue({
      stream: toAsyncIterable([{ text: () => "Gemini response" }]),
    });

    const stream = await AIGateway.streamChat(SAMPLE_MESSAGES, "system prompt");
    const output = await readDataStream(stream);

    expect(output).toContain("Gemini response");
  });

  it("continues with Gemini when Groq stream fails mid-response", async () => {
    getNextKeyMock.mockImplementation((key: string) => {
      if (key === "GROQ_API_KEY") return "groq-key";
      if (key === "GOOGLE_API_KEY") return "gemini-key";
      return undefined;
    });

    groqCreateMock.mockResolvedValue(
      toAsyncIterable([{ choices: [{ delta: { content: "Partial" } }] }], new Error("Groq stream broke"))
    );

    geminiGenerateContentStreamMock.mockResolvedValue({
      stream: toAsyncIterable([{ text: () => "Recovered" }]),
    });

    const stream = await AIGateway.streamChat(SAMPLE_MESSAGES, "system prompt");
    const output = await readDataStream(stream);

    expect(output).toContain("Partial");
    expect(output).toContain("Switching provider to continue");
    expect(output).toContain("Recovered");
  });
});
