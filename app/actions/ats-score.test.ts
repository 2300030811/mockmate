import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { analyzeAtsScoreAction } from "./ats-score";
import { atsScoreService } from "@/lib/services/ats-score-service";

const rateLimitMock = vi.hoisted(() => vi.fn());
const extractTextMock = vi.hoisted(() => vi.fn());
const generateStructuredMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: rateLimitMock,
}));

vi.mock("@/lib/services/ocr", () => ({
  OCRService: {
    extractText: extractTextMock,
  },
}));

vi.mock("@/lib/services/ai-orchestrator", () => ({
  aiOrchestrator: {
    generateStructured: generateStructuredMock,
  },
}));

vi.mock("@/utils/sanitize", () => ({
  sanitizePromptInput: vi.fn((value: string) => value),
  normalizeTextForATS: vi.fn((value: string) => value),
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
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
    extractTextMock.mockResolvedValue({
      text: Array.from({ length: 40 }, (_, i) => `word${i}`).join(" "),
      source: "local",
    });
    generateStructuredMock.mockResolvedValue({
      success: true,
      data: JSON.parse(buildAtsResponseJson({
        atsScore: 82,
        formatScore: 80,
        contentScore: 81,
        keywordScore: 85,
      })),
      provider: "groq",
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

  it("returns parsed ATS result when Gateway succeeds", async () => {
    const result = await analyzeAtsScoreAction(buildFormData(), "Frontend Engineer", "Acme");

    expect(result.error).toBeUndefined();
    expect(result.data).not.toBeNull();
    expect(result.data?.atsScore).toBe(82);
    expect(result.data?.matchRating).toBe("High");
    expect(result.data?.presentKeywords).toContain("react");
  });

  it("returns error when Gateway fails", async () => {
    generateStructuredMock.mockResolvedValue({
      success: false,
      error: "AI Gateway failed",
    });

    const result = await analyzeAtsScoreAction(buildFormData(), "Backend Engineer", "Beta");

    expect(result.data).toBeNull();
    expect(result.error).toBe("Analysis failed. Providers are experiencing issues. Please try again later.");
  });

  it("recomputes ATS score when provider score does not match weighted formula", async () => {
    generateStructuredMock.mockResolvedValue({
      success: true,
      data: JSON.parse(buildAtsResponseJson({
        atsScore: 60,
        formatScore: 80,
        contentScore: 81,
        keywordScore: 85,
      })),
      provider: "groq",
    });

    const result = await analyzeAtsScoreAction(buildFormData(), "Frontend Engineer", "Acme");

    expect(result.error).toBeUndefined();
    expect(result.data?.atsScore).toBe(82);
    expect(result.data?.matchRating).toBe("High");
  });

  it("returns parse error when model output is not valid JSON", async () => {
    generateStructuredMock.mockResolvedValue({
      success: false,
      error: "JSON parsing failed",
    });

    const result = await analyzeAtsScoreAction(buildFormData(), "Data Engineer", "Gamma");

    expect(result.data).toBeNull();
    expect(result.error).toBe("Analysis failed. Providers are experiencing issues. Please try again later.");
  });

  it("handles and cleans fenced JSON blocks successfully", async () => {
    generateStructuredMock.mockResolvedValue({
      success: true,
      data: JSON.parse(buildAtsResponseJson({
        atsScore: 82,
        formatScore: 80,
        contentScore: 81,
        keywordScore: 85,
      })),
      provider: "gemini",
    });

    const result = await analyzeAtsScoreAction(buildFormData(), "Frontend Engineer", "Acme");

    expect(result.error).toBeUndefined();
    expect(result.data).not.toBeNull();
    expect(result.data?.atsScore).toBe(82);
    expect(result.data?.matchRating).toBe("High");
    expect(result.data?.presentKeywords).toContain("react");
  });

  it("fails when resume content is too short (< 100 characters)", async () => {
    extractTextMock.mockResolvedValueOnce({
      text: "short text",
      source: "local",
    });

    const result = await analyzeAtsScoreAction(buildFormData(), "Frontend Engineer");

    expect(result.data).toBeNull();
    expect(result.error).toBe("Resume content too short or unreadable.");
  });

  it("fails when resume content has too few words (< 30 words)", async () => {
    // 100+ chars but only 15 words
    extractTextMock.mockResolvedValueOnce({
      text: "word ".repeat(15) + "a".repeat(100),
      source: "local",
    });

    const result = await analyzeAtsScoreAction(buildFormData(), "Frontend Engineer");

    expect(result.data).toBeNull();
    expect(result.error).toBe("Extracted text has too few words. Ensure the PDF is not an image scan without standard text.");
  });
});

describe("atsScoreService", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env = { ...originalEnv };
    const mutableEnv = process.env as Record<string, string | undefined>;
    mutableEnv.GOOGLE_API_KEY = "gemini-key";

    rateLimitMock.mockResolvedValue({ success: true, message: "" });
    extractTextMock.mockResolvedValue({
      text: Array.from({ length: 40 }, (_, i) => `word${i}`).join(" "),
      source: "local",
    });
    generateStructuredMock.mockResolvedValue({
      success: true,
      data: JSON.parse(buildAtsResponseJson({
        atsScore: 82,
        formatScore: 80,
        contentScore: 81,
        keywordScore: 85,
      })),
      provider: "groq",
    });
  });

  it("returns parsed ATS result when service executes successfully", async () => {
    const formData = buildFormData();
    const file = formData.get("file");
    const result = await atsScoreService.analyzeAtsScore(file, "Frontend Engineer", "Acme");

    expect(result.error).toBeUndefined();
    expect(result.data).not.toBeNull();
    expect(result.data?.atsScore).toBe(82);
    expect(result.data?.matchRating).toBe("High");
    expect(result.data?.presentKeywords).toContain("react");
  });
});