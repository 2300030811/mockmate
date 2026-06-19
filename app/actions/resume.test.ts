import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { roastResumeAction } from "./resume";

const rateLimitMock = vi.hoisted(() => vi.fn());
const extractTextMock = vi.hoisted(() => vi.fn());
const generateTextMock = vi.hoisted(() => vi.fn());
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

vi.mock("@/lib/ai/gateway", () => ({
  generateText: generateTextMock,
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

    generateTextMock.mockResolvedValue({
      content: buildRoastResponseJson({ atsScore: 12 }),
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
    // In our implementation, the gateway handles fallback.
    // We mock the resolved value from the gateway with provider "gemini".
    generateTextMock.mockResolvedValue({
      content: buildRoastResponseJson({ professionalScore: 74, atsScore: 44 }),
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
    generateTextMock.mockResolvedValue({
      content: "not-json",
      provider: "groq"
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
    generateTextMock.mockRejectedValue(new Error("AI services unavailable"));

    const result = await roastResumeAction(
      buildFormData(),
      "Need platform engineering experience and SRE depth.",
      "Brutal"
    );

    expect(result.data).toBeNull();
    expect(result.error).toContain("Analysis failed. Providers are experiencing issues.");
  });

  // --- MALFORMED RESPONSE / EXPLANATION TEXT TESTS ---
  it("successfully parses JSON even with markdown JSON blocks and extra explanation prefix/suffix text", async () => {
    const rawContentWithFences = `Here is your JSON response:
\`\`\`json
${buildRoastResponseJson({ professionalScore: 88 })}
\`\`\`
I hope this feedback helps you build a better resume!`;

    generateTextMock.mockResolvedValue({
      content: rawContentWithFences,
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
});
