import { beforeEach, describe, expect, it, vi } from "vitest";
import { AIGateway, type ChatMessage } from "@/lib/ai/chat-gateway";
import { generateText, generateStructuredOutput } from "@/lib/ai/gateway";
import { z } from "zod";

const getNextKeyMock = vi.hoisted(() => vi.fn());
const getNumKeysMock = vi.hoisted(() => vi.fn(() => 1));
const reportKeySuccessMock = vi.hoisted(() => vi.fn());
const reportKeyFailureMock = vi.hoisted(() => vi.fn());

const groqCreateMock = vi.hoisted(() => vi.fn());
const geminiGenerateContentStreamMock = vi.hoisted(() => vi.fn());
const geminiGenerateContentMock = vi.hoisted(() => vi.fn());

vi.mock("@/utils/keyManager", () => ({
  getNextKey: getNextKeyMock,
  getNumKeys: getNumKeysMock,
  reportKeySuccess: reportKeySuccessMock,
  reportKeyFailure: reportKeyFailureMock,
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
  default: vi.fn(function MockGroqDefault() {
    return {
      chat: {
        completions: {
          create: groqCreateMock,
        },
      },
    };
  })
}));

vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: vi.fn(function MockGoogleGenerativeAI() {
    return {
      getGenerativeModel: vi.fn(() => ({
        generateContentStream: geminiGenerateContentStreamMock,
        generateContent: geminiGenerateContentMock,
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
    expect(reportKeySuccessMock).toHaveBeenCalledWith("groq-key");
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
    expect(reportKeyFailureMock).toHaveBeenCalledWith("groq-key");
    expect(reportKeySuccessMock).toHaveBeenCalledWith("gemini-key");
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
    expect(reportKeyFailureMock).toHaveBeenCalledWith("groq-key");
    expect(reportKeySuccessMock).toHaveBeenCalledWith("gemini-key");
  });
});

describe("generateText", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls Groq by default and returns raw text", async () => {
    getNextKeyMock.mockImplementation((key: string) => {
      if (key === "GROQ_API_KEY") return "groq-key";
      return undefined;
    });

    groqCreateMock.mockResolvedValue({
      choices: [{ message: { content: "Groq text response" } }]
    });

    const result = await generateText("hello", "system prompt");
    expect(result.content).toBe("Groq text response");
    expect(result.provider).toBe("groq");
    expect(reportKeySuccessMock).toHaveBeenCalledWith("groq-key");
  });

  it("falls back to Gemini if Groq fails", async () => {
    getNextKeyMock.mockImplementation((key: string) => {
      if (key === "GROQ_API_KEY") return "groq-key";
      if (key === "GOOGLE_API_KEY") return "gemini-key";
      return undefined;
    });

    groqCreateMock.mockRejectedValue(new Error("Groq error"));
    geminiGenerateContentMock.mockResolvedValue({
      response: { text: () => "Gemini text response" }
    });

    const result = await generateText("hello", "system prompt", "auto");
    expect(result.content).toBe("Gemini text response");
    expect(result.provider).toBe("gemini");
    expect(reportKeyFailureMock).toHaveBeenCalledWith("groq-key");
    expect(reportKeySuccessMock).toHaveBeenCalledWith("gemini-key");
  });

  it("passes custom model parameter to Groq", async () => {
    getNextKeyMock.mockImplementation((key: string) => {
      if (key === "GROQ_API_KEY") return "groq-key";
      return undefined;
    });

    groqCreateMock.mockResolvedValue({
      choices: [{ message: { content: "Groq response" } }]
    });

    await generateText("hello", "system prompt", "groq", {
      model: "custom-model"
    });

    expect(groqCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "custom-model"
      })
    );
  });

  it("passes responseFormat parameter to Groq", async () => {
    getNextKeyMock.mockImplementation((key: string) => {
      if (key === "GROQ_API_KEY") return "groq-key";
      return undefined;
    });

    groqCreateMock.mockResolvedValue({
      choices: [{ message: { content: "{}" } }]
    });

    await generateText("hello", "system prompt", "groq", {
      responseFormat: { type: "json_object" }
    });

    expect(groqCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        response_format: { type: "json_object" }
      })
    );
  });

  it("ignores responseFormat when falling back to Gemini", async () => {
    getNextKeyMock.mockImplementation((key: string) => {
      if (key === "GROQ_API_KEY") return "groq-key";
      if (key === "GOOGLE_API_KEY") return "gemini-key";
      return undefined;
    });

    groqCreateMock.mockRejectedValue(new Error("Groq error"));
    geminiGenerateContentMock.mockResolvedValue({
      response: { text: () => "Gemini response" }
    });

    await generateText("hello", "system prompt", "auto", {
      responseFormat: { type: "json_object" }
    });

    expect(geminiGenerateContentMock).toHaveBeenCalled();
    const geminiArgs = geminiGenerateContentMock.mock.calls[0][0];
    expect(geminiArgs.response_format).toBeUndefined();
    expect(geminiArgs.responseFormat).toBeUndefined();
  });
});


describe("generateStructuredOutput", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("cleans markdown fences and parses valid JSON according to schema", async () => {
    getNextKeyMock.mockImplementation((key: string) => {
      if (key === "GROQ_API_KEY") return "groq-key";
      return undefined;
    });

    groqCreateMock.mockResolvedValue({
      choices: [{ message: { content: "```json\n{\n  \"score\": 85,\n  \"name\": \"Test\"\n}\n```" } }]
    });

    const schema = z.object({
      score: z.number(),
      name: z.string()
    });

    const result = await generateStructuredOutput("hello", "system prompt", schema);
    expect(result).toEqual({ score: 85, name: "Test" });
  });

  it("throws validation error if JSON doesn't match schema", async () => {
    getNextKeyMock.mockImplementation((key: string) => {
      if (key === "GROQ_API_KEY") return "groq-key";
      return undefined;
    });

    groqCreateMock.mockResolvedValue({
      choices: [{ message: { content: "{\n  \"score\": \"eighty-five\",\n  \"name\": \"Test\"\n}" } }]
    });

    const schema = z.object({
      score: z.number(),
      name: z.string()
    });

    await expect(generateStructuredOutput("hello", "system prompt", schema)).rejects.toThrow();
  });
});
