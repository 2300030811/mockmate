import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { analyzeAtsScoreAction } from "./ats-score";

const rateLimitMock = vi.hoisted(() => vi.fn());
const extractTextMock = vi.hoisted(() => vi.fn());
const getNextKeyMock = vi.hoisted(() => vi.fn());
const getNumKeysMock = vi.hoisted(() => vi.fn());
const groqCreateMock = vi.hoisted(() => vi.fn());
const geminiGenerateContentMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: rateLimitMock,
}));

vi.mock("@/lib/services/ocr", () => ({
  OCRService: {
    extractText: extractTextMock,
  },
}));

vi.mock("@/utils/keyManager", () => ({
  getNextKey: getNextKeyMock,
  getNumKeys: getNumKeysMock,
}));

vi.mock("@/utils/sanitize", () => ({
  sanitizePromptInput: vi.fn((value: string) => value),
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
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
  GoogleGenerativeAI: vi.fn(function MockGemini() {
    return {
      getGenerativeModel: vi.fn(() => ({
        generateContent: geminiGenerateContentMock,
      })),
    };
  }),
}));

const originalEnv = process.env;

function buildAtsResponseJson(input?: {
  atsScore?: number;
  formatScore?: number;
  contentScore?: number;
  keywordScore?: number;
}): string {
  const formatScore = input?.formatScore ?? 80;
  const contentScore = input?.contentScore ?? 81;
  const keywordScore = input?.keywordScore ?? 85;

  return JSON.stringify({
    atsScore: input?.atsScore ?? 82,
    formatScore,
    contentScore,
    keywordScore,
    presentKeywords: ["react", "typescript"],
    missingKeywords: ["graphql"],
    sectionAnalysis: {
      summary: true,
      experience: true,
      education: true,
      skills: true,
      projects: false,
      contact: true,
    },
    structureIssues: ["no projects section"],
    fixSuggestions: [
      {
        category: "Content",
        priority: "Medium",
        suggestion: "Add measurable impact in bullets.",
      },
    ],
    overallFeedback: "Solid structure with room to improve keyword coverage.",
  });
}

function buildFormData(): FormData {
  const file = new File(["resume data"], "resume.pdf", { type: "application/pdf" });
  Object.defineProperty(file, "arrayBuffer", {
    value: async () => new TextEncoder().encode("resume data").buffer,
  });

  return {
    get: (key: string) => (key === "file" ? file : null),
  } as unknown as FormData;
}

describe("analyzeAtsScoreAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env = { ...originalEnv };
    const mutableEnv = process.env as Record<string, string | undefined>;
    mutableEnv.GOOGLE_API_KEY = "gemini-key";

    rateLimitMock.mockResolvedValue({ success: true, message: "" });
    getNumKeysMock.mockReturnValue(1);
    getNextKeyMock.mockReturnValue("groq-key");
    extractTextMock.mockResolvedValue({
      text: Array.from({ length: 40 }, (_, i) => `word${i}`).join(" "),
      source: "local",
    });
    groqCreateMock.mockResolvedValue({
      choices: [
        {
          message: {
            content: buildAtsResponseJson({
              atsScore: 82,
              formatScore: 80,
              contentScore: 81,
              keywordScore: 85,
            }),
          },
        },
      ],
    });
    geminiGenerateContentMock.mockResolvedValue({
      response: {
        text: () => buildAtsResponseJson({ atsScore: 72, formatScore: 72, contentScore: 72, keywordScore: 72 }),
      },
    });
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("returns rate limit message when blocked", async () => {
    rateLimitMock.mockResolvedValue({ success: false, message: "Too many requests" });

    const result = await analyzeAtsScoreAction(buildFormData(), "Frontend Engineer");

    expect(result.data).toBeNull();
    expect(result.error).toBe("Too many requests");
  });

  it("returns parsed ATS result from Groq with derived rating", async () => {
    const result = await analyzeAtsScoreAction(buildFormData(), "Frontend Engineer", "Acme");

    expect(result.error).toBeUndefined();
    expect(result.data).not.toBeNull();
    expect(result.data?.atsScore).toBe(82);
    expect(result.data?.matchRating).toBe("High");
    expect(result.data?.presentKeywords).toContain("react");
  });

  it("falls back to Gemini when Groq fails", async () => {
    groqCreateMock.mockRejectedValue(new Error("groq unavailable"));
    geminiGenerateContentMock.mockResolvedValue({
      response: {
        text: () =>
          `\`\`\`json\n${buildAtsResponseJson({ atsScore: 60, formatScore: 60, contentScore: 60, keywordScore: 60 })}\n\`\`\``,
      },
    });

    const result = await analyzeAtsScoreAction(buildFormData(), "Backend Engineer", "Beta");

    expect(result.error).toBeUndefined();
    expect(result.data?.atsScore).toBe(60);
    expect(result.data?.matchRating).toBe("Medium");
  });

  it("recomputes ATS score when provider score does not match weighted formula", async () => {
    groqCreateMock.mockResolvedValue({
      choices: [
        {
          message: {
            content: buildAtsResponseJson({
              atsScore: 60,
              formatScore: 80,
              contentScore: 81,
              keywordScore: 85,
            }),
          },
        },
      ],
    });

    const result = await analyzeAtsScoreAction(buildFormData(), "Frontend Engineer", "Acme");

    expect(result.error).toBeUndefined();
    expect(result.data?.atsScore).toBe(82);
    expect(result.data?.matchRating).toBe("High");
  });

  it("returns parse error when model output is not valid JSON", async () => {
    groqCreateMock.mockResolvedValue({
      choices: [{ message: { content: "this-is-not-json" } }],
    });

    const result = await analyzeAtsScoreAction(buildFormData(), "Data Engineer", "Gamma");

    expect(result.data).toBeNull();
    expect(result.error).toBe("Failed to parse analysis results.");
  });
});