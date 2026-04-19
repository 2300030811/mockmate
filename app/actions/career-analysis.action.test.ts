import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { analyzeCareerPath } from "./career-analysis";

const extractTextMock = vi.hoisted(() => vi.fn());
const sanitizePromptInputMock = vi.hoisted(() => vi.fn());
const normalizeTextForATSMock = vi.hoisted(() => vi.fn());
const getNextKeyMock = vi.hoisted(() => vi.fn());
const getNumKeysMock = vi.hoisted(() => vi.fn());
const fetchSalaryEstimateMock = vi.hoisted(() => vi.fn());
const formatSalaryRangeMock = vi.hoisted(() => vi.fn());
const estimateExperienceYearsMock = vi.hoisted(() => vi.fn());
const promptBuilderMock = vi.hoisted(() => vi.fn());
const groqCreateMock = vi.hoisted(() => vi.fn());
const geminiGenerateContentMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/services/ocr", () => ({
  OCRService: {
    extractText: extractTextMock,
  },
}));

vi.mock("@/utils/sanitize", () => ({
  sanitizePromptInput: sanitizePromptInputMock,
  normalizeTextForATS: normalizeTextForATSMock,
}));

vi.mock("@/utils/keyManager", () => ({
  getNextKey: getNextKeyMock,
  getNumKeys: getNumKeysMock,
}));

vi.mock("@/lib/services/salary-service", () => ({
  fetchSalaryEstimate: fetchSalaryEstimateMock,
  formatSalaryRange: formatSalaryRangeMock,
}));

vi.mock("@/lib/career-utils", () => ({
  estimateExperienceYears: estimateExperienceYearsMock,
}));

vi.mock("@/lib/prompts", () => ({
  CAREER_ANALYSIS_SYSTEM_PROMPT: promptBuilderMock,
}));

vi.mock("@/lib/env", () => ({
  env: {},
}));

vi.mock("groq-sdk", () => ({
  default: vi.fn(function MockGroq() {
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

function buildFormData(): FormData {
  const file = new File(["resume"], "resume.pdf", { type: "application/pdf" });
  Object.defineProperty(file, "arrayBuffer", {
    value: async () => new TextEncoder().encode("resume").buffer,
  });

  return {
    get: (key: string) => (key === "file" ? file : null),
  } as unknown as FormData;
}

describe("analyzeCareerPath", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env = { ...originalEnv };
    const mutableEnv = process.env as Record<string, string | undefined>;
    mutableEnv.GOOGLE_API_KEY = "gemini-key";

    extractTextMock.mockResolvedValue({
      text: "Software engineer with 7 years experience building cloud systems and mentoring teams.",
      source: "local",
    });
    normalizeTextForATSMock.mockImplementation((value: string) => value);
    sanitizePromptInputMock.mockImplementation((value: string) => value);
    getNumKeysMock.mockReturnValue(1);
    getNextKeyMock.mockReturnValue("groq-key");
    fetchSalaryEstimateMock.mockReturnValue(null);
    formatSalaryRangeMock.mockReturnValue("");
    estimateExperienceYearsMock.mockReturnValue(7);
    promptBuilderMock.mockReturnValue("SYSTEM PROMPT");
    groqCreateMock.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({ matchScore: 84 }) } }],
    });
    geminiGenerateContentMock.mockResolvedValue({
      response: {
        text: () => JSON.stringify({ matchScore: 77 }),
      },
    });
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("throws wrapped error when no valid file is provided", async () => {
    await expect(analyzeCareerPath(new FormData(), "Backend Engineer", "Acme")).rejects.toThrow(
      "Failed to analyze career path: No valid file uploaded"
    );
  });

  it("returns lenient fallback payload when strict schema validation fails", async () => {
    groqCreateMock.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({ matchScore: "bad", extractedSkills: "oops" }) } }],
    });

    const result = await analyzeCareerPath(buildFormData(), "Backend Engineer", "Acme");

    expect(result.matchScore).toBe(0);
    expect(result.extractedSkills).toEqual([]);
    expect(result.missingSkills).toEqual([]);
    expect(result.roadmap).toEqual([]);
    expect(result.jobRole).toBe("Backend Engineer");
  });

  it("rejects invalid role sentinel response from provider", async () => {
    groqCreateMock.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              matchScore: 0,
              competitiveEdge: "INVALID ROLE DETECTED: unknown profession",
            }),
          },
        },
      ],
    });

    await expect(analyzeCareerPath(buildFormData(), "NotARole", "Acme")).rejects.toThrow(
      "INVALID_ROLE"
    );
  });

  it("falls back to Gemini when all Groq attempts fail", async () => {
    groqCreateMock.mockRejectedValue(new Error("rate limited"));
    geminiGenerateContentMock.mockResolvedValue({
      response: {
        text: () => "```json\n{\"matchScore\": 77}\n```",
      },
    });

    const result = await analyzeCareerPath(buildFormData(), "Platform Engineer", "Beta");

    expect(result.matchScore).toBe(77);
    expect(result.jobRole).toBe("Platform Engineer");
    expect(promptBuilderMock).toHaveBeenCalledWith("Platform Engineer", "Beta", "", "");
  });

  it("overrides model salary range/confidence with trusted local salary data", async () => {
    fetchSalaryEstimateMock.mockReturnValue({
      min: 1200000,
      max: 2400000,
      median: 1800000,
      currency: "INR",
      period: "YEAR",
      source: "Industry Aggregated Data",
      publishers: ["source-a"],
      confidence: "high",
      matchType: "exact",
    });
    formatSalaryRangeMock.mockReturnValue("₹12,00,000 - ₹24,00,000 PA");
    groqCreateMock.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              matchScore: 88,
              marketInsights: {
                demand: "medium",
                salaryRange: "AI-generated salary",
                outlook: "Stable growth",
                confidence: "low",
              },
            }),
          },
        },
      ],
    });

    const result = await analyzeCareerPath(buildFormData(), "Backend Engineer", "Acme");

    expect(result.marketInsights?.salaryRange).toBe("₹12,00,000 - ₹24,00,000 PA");
    expect(result.marketInsights?.confidence).toBe("high");
    expect(promptBuilderMock).toHaveBeenCalledWith(
      "Backend Engineer",
      "Acme",
      expect.stringContaining("REAL SALARY DATA"),
      ""
    );
  });

  it("keeps AI-estimated salary when role is not in local salary dataset", async () => {
    fetchSalaryEstimateMock.mockReturnValue(null);
    formatSalaryRangeMock.mockReturnValue("");
    groqCreateMock.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              matchScore: 63,
              marketInsights: {
                demand: "high",
                salaryRange: "₹9L - ₹14L PA",
                outlook: "Growing demand",
                confidence: "low",
              },
            }),
          },
        },
      ],
    });

    const result = await analyzeCareerPath(buildFormData(), "Niche Systems Strategist", "Acme");

    expect(result.marketInsights?.salaryRange).toBe("₹9L - ₹14L PA");
    expect(result.marketInsights?.confidence).toBe("low");
  });

  it("builds market insights from local salary when model omits marketInsights", async () => {
    fetchSalaryEstimateMock.mockReturnValue({
      min: 1000000,
      max: 1800000,
      median: 1400000,
      currency: "INR",
      period: "YEAR",
      source: "Industry Aggregated Data",
      publishers: ["source-a"],
      confidence: "medium",
      matchType: "exact",
    });
    formatSalaryRangeMock.mockReturnValue("₹10,00,000 - ₹18,00,000 PA");
    groqCreateMock.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({ matchScore: 91 }) } }],
    });

    const result = await analyzeCareerPath(buildFormData(), "Software Engineer", "Acme");

    expect(result.marketInsights?.salaryRange).toBe("₹10,00,000 - ₹18,00,000 PA");
    expect(result.marketInsights?.confidence).toBe("medium");
    expect(result.marketInsights?.demand).toBe("medium");
  });
});