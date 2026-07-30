import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { roastResumeAction, parseResumeAction } from "./resume";

const rateLimitMock = vi.hoisted(() => vi.fn());
const extractTextMock = vi.hoisted(() => vi.fn());
const generateStructuredMock = vi.hoisted(() => vi.fn());
const extractAndMatchKeywordsMock = vi.hoisted(() => vi.fn());
const detectSectionsMock = vi.hoisted(() => vi.fn());
const detectQuantifiedAchievementsMock = vi.hoisted(() => vi.fn());

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

vi.mock("@/utils/ats-keywords", () => ({
  extractAndMatchKeywords: extractAndMatchKeywordsMock,
  detectSections: detectSectionsMock,
  detectQuantifiedAchievements: detectQuantifiedAchievementsMock,
}));

const originalEnv = process.env;

function buildRoastResponseJson(input?: {
  professionalScore?: number;
  atsScore?: number;
}): string {
  return JSON.stringify({
    brutalRoast: "The resume needs stronger measurable outcomes.",
    professionalScore: input?.professionalScore ?? 67,
    skillBreakdown: {
      clarity: 60,
      impact: 58,
      technical: 72,
      layout: 64,
    },
    criticalFlaws: ["Missing quantified impact in recent role."],
    winningPoints: ["Clear technology stack naming."],
    atsAnalysis: {
      atsScore: input?.atsScore ?? 12,
      formatScore: 50,
      contentScore: 45,
      keywordScore: 35,
      missingHardSkills: ["kubernetes"],
      missingSoftSkills: ["stakeholder management"],
      presentKeywords: ["react", "typescript"],
      contentIssues: ["Bullets are too generic."],
      atsTips: ["Add metrics to each experience bullet."],
    },
    suggestions: ["Rewrite top three bullets with business outcomes."],
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

describe("roastResumeAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env = { ...originalEnv };
    const mutableEnv = process.env as Record<string, string | undefined>;
    mutableEnv.GOOGLE_API_KEY = "gemini-key";
    mutableEnv.GROQ_API_KEY = "groq-key";

    rateLimitMock.mockResolvedValue({ success: true, message: "" });
    extractTextMock.mockResolvedValue({
      text: "summary experience education skills projects contact increased revenue by 20 percent and reduced latency by 30 percent through optimization",
      source: "local",
    });

    extractAndMatchKeywordsMock.mockReturnValue({
      jdKeywords: ["react", "typescript"],
      matched: ["react"],
      missing: ["typescript"],
      matchPercent: 70,
      matchedBigrams: [],
      sections: {
        present: ["summary", "experience", "education", "skills", "projects", "contact"],
        missing: [],
      },
      metrics: {
        metricSignals: 3,
        hasMetrics: true,
        summary: "Quantified achievement signals: 3/9. Impact: Moderate.",
      },
      summary: "Analysis: 1/2 keywords (70%).",
    });

    detectSectionsMock.mockReturnValue({
      present: ["summary", "experience", "education", "skills", "projects", "contact"],
      missing: [],
    });
    detectQuantifiedAchievementsMock.mockReturnValue({
      metricSignals: 3,
      hasMetrics: true,
      summary: "Quantified achievement signals: 3/9. Impact: Moderate.",
    });

    generateStructuredMock.mockResolvedValue({
      success: true,
      data: JSON.parse(buildRoastResponseJson({ atsScore: 12 })),
      raw: buildRoastResponseJson({ atsScore: 12 }),
      provider: "groq"
    });
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("returns rate limit message when blocked", async () => {
    rateLimitMock.mockResolvedValue({ success: false, message: "Too many requests" });

    const result = await roastResumeAction(buildFormData(), "JD", "Brutal");

    expect(result.data).toBeNull();
    expect(result.error).toBe("Too many requests");
  });

  it("uses deterministic ATS scoring and canonical match rating", async () => {
    const result = await roastResumeAction(
      buildFormData(),
      "Need React, TypeScript, system design, and measurable impact in shipping.",
      "Constructive"
    );

    expect(result.error).toBeUndefined();
    expect(result.data).not.toBeNull();
    expect(result.data?.atsAnalysis.atsScore).toBe(76);
    expect(result.data?.atsAnalysis.formatScore).toBe(100);
    expect(result.data?.atsAnalysis.contentScore).toBe(66);
    expect(result.data?.atsAnalysis.keywordScore).toBe(70);
    expect(result.data?.atsAnalysis.matchRating).toBe("High");
    expect(result.data?.atsAnalysis.jobDescriptionProvided).toBe(true);
  });

  it("successfully parses content using fallback provider (Gemini)", async () => {
    generateStructuredMock.mockResolvedValue({
      success: true,
      data: JSON.parse(buildRoastResponseJson({ professionalScore: 74, atsScore: 44 })),
      raw: buildRoastResponseJson({ professionalScore: 74, atsScore: 44 }),
      provider: "gemini"
    });

    const result = await roastResumeAction(
      buildFormData(),
      "Need backend ownership and measurable reliability wins.",
      "Sarcastic"
    );

    expect(result.error).toBeUndefined();
    expect(result.data).not.toBeNull();
    expect(result.data?.professionalScore).toBe(74);
  });

  it("returns parse error when model output is not valid JSON", async () => {
    generateStructuredMock.mockResolvedValue({
      success: false,
      error: "JSON parsing failed",
      raw: "not-json"
    });

    const result = await roastResumeAction(
      buildFormData(),
      "Need strong ATS alignment and quantified achievements.",
      "Brutal"
    );

    expect(result.data).toBeNull();
    expect(result.error).toBe("Analysis failed to parse. Please try again.");
  });

  it("returns provider-exhausted error when all gateway providers fail", async () => {
    generateStructuredMock.mockResolvedValue({
      success: false,
      error: "AI services unavailable",
    });

    const result = await roastResumeAction(
      buildFormData(),
      "Need platform engineering experience and SRE depth.",
      "Brutal"
    );

    expect(result.data).toBeNull();
    expect(result.error).toContain("Analysis failed to parse. Please try again.");
  });

  // --- MALFORMED RESPONSE / EXPLANATION TEXT TESTS ---
  it("successfully parses JSON even with markdown JSON blocks and extra explanation prefix/suffix text", async () => {
    generateStructuredMock.mockResolvedValue({
      success: true,
      data: JSON.parse(buildRoastResponseJson({ professionalScore: 88 })),
      raw: buildRoastResponseJson({ professionalScore: 88 }),
      provider: "groq"
    });

    const result = await roastResumeAction(
      buildFormData(),
      "Need React experience.",
      "Brutal"
    );

    expect(result.error).toBeUndefined();
    expect(result.data).not.toBeNull();
    expect(result.data?.professionalScore).toBe(88);
  });

  // --- CHARACTERIZATION TESTS ---
  it("roastResumeAction fails when resume content is too short (< 100 characters)", async () => {
    extractTextMock.mockResolvedValueOnce({
      text: "too short",
      source: "local",
    });

    const result = await roastResumeAction(buildFormData(), "JD", "Brutal");
    expect(result.data).toBeNull();
    expect(result.error).toBe("Resume content too short or unreadable.");
  });

  it("parseResumeAction parses PDF files and calls OCRService", async () => {
    generateStructuredMock.mockResolvedValueOnce({
      success: true,
      data: { name: "Alice" },
      provider: "groq"
    });

    const result = await parseResumeAction(buildFormData());
    expect(result.error).toBeUndefined();
    expect(result.data?.name).toBe("Alice");
    expect(extractTextMock).toHaveBeenCalled();
  });

  it("parseResumeAction parses text files directly", async () => {
    generateStructuredMock.mockResolvedValueOnce({
      success: true,
      data: { name: "Bob" },
      provider: "groq"
    });

    const textFile = new File(["long text summary experience education skills projects contact"], "resume.txt", { type: "text/plain" });
    Object.defineProperty(textFile, "text", {
      value: async () => "long text summary experience education skills projects contact",
    });

    const formData = {
      get: (key: string) => (key === "file" ? textFile : null),
    } as unknown as FormData;

    const result = await parseResumeAction(formData);
    expect(result.error).toBeUndefined();
    expect(result.data?.name).toBe("Bob");
  });

  it("parseResumeAction fails when resume content is too short (< 50 characters)", async () => {
    const textFile = new File(["too short"], "resume.txt", { type: "text/plain" });
    Object.defineProperty(textFile, "text", {
      value: async () => "too short",
    });

    const formData = {
      get: (key: string) => (key === "file" ? textFile : null),
    } as unknown as FormData;

    const result = await parseResumeAction(formData);
    expect(result.data).toBeNull();
    expect(result.error).toBe("Resume content too short or unreadable.");
  });
});
