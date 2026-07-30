import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { analyzeDeepEvalAction } from "./deep-eval";
import { deepEvalService } from "@/lib/services/deep-eval-service";

// Hoisted mocks
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

vi.mock("@/lib/github-fetch", () => ({
  extractGitHubUsername: vi.fn().mockReturnValue(null),
  fetchGitHubProfile: vi.fn(),
  formatGitHubDataForPrompt: vi.fn(),
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

const originalEnv = process.env;

function buildFormData(): FormData {
  const file = new File(["resume data"], "resume.pdf", { type: "application/pdf" });
  Object.defineProperty(file, "arrayBuffer", {
    value: async () => new TextEncoder().encode("resume data").buffer,
  });

  return {
    get: (key: string) => (key === "file" ? file : null),
  } as unknown as FormData;
}

function buildMockDeepEvalResponse() {
  return {
    scores: {
      open_source: { score: 10, max: 35, evidence: "Some GitHub repos" },
      self_projects: { score: 15, max: 30, evidence: "A few side projects" },
      production: { score: 20, max: 25, evidence: "Work history" },
      technical_skills: { score: 8, max: 10, evidence: "Python, JS" },
    },
    bonus_points: { total: 2, breakdown: "Hackathon win" },
    deductions: { total: 0, reasons: "None" },
    key_strengths: ["Clean code"],
    areas_for_improvement: ["Need open source"],
    is_invalid_role: false,
    missing_keywords: [],
  };
}

describe("analyzeDeepEvalAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env = { ...originalEnv };
    const mutableEnv = process.env as Record<string, string | undefined>;
    mutableEnv.GOOGLE_API_KEY = "gemini-key";
    mutableEnv.GROQ_API_KEY = "groq-key";

    rateLimitMock.mockResolvedValue({ success: true, message: "" });
    extractTextMock.mockResolvedValue({
      text: Array.from({ length: 40 }, (_, i) => `word${i}`).join(" "),
      source: "local",
    });
    generateStructuredMock.mockResolvedValue({
      success: true,
      data: buildMockDeepEvalResponse(),
    });
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("fails when resume content is too short (< 100 characters)", async () => {
    extractTextMock.mockResolvedValueOnce({
      text: "short text",
      source: "local",
    });

    const result = await analyzeDeepEvalAction(buildFormData(), "Frontend Engineer");

    expect(result.data).toBeNull();
    expect(result.error).toBe("Resume content too short or unreadable.");
  });

  it("fails when resume content has too few words (< 30 words)", async () => {
    extractTextMock.mockResolvedValueOnce({
      text: "word ".repeat(15) + "a".repeat(100),
      source: "local",
    });

    const result = await analyzeDeepEvalAction(buildFormData(), "Frontend Engineer");

    expect(result.data).toBeNull();
    expect(result.error).toBe("Extracted text has too few words. Ensure the PDF is not an image scan.");
  });

  it("succeeds with valid PDF file", async () => {
    const result = await analyzeDeepEvalAction(buildFormData(), "Frontend Engineer");

    expect(result.error).toBeUndefined();
    expect(result.data).not.toBeNull();
    expect(result.data?.scores?.technical_skills?.score).toBe(8);
  });
});

describe("deepEvalService", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env = { ...originalEnv };
    const mutableEnv = process.env as Record<string, string | undefined>;
    mutableEnv.GOOGLE_API_KEY = "gemini-key";
    mutableEnv.GROQ_API_KEY = "groq-key";

    extractTextMock.mockResolvedValue({
      text: Array.from({ length: 40 }, (_, i) => `word${i}`).join(" "),
      source: "local",
    });
    generateStructuredMock.mockResolvedValue({
      success: true,
      data: buildMockDeepEvalResponse(),
    });
  });

  it("returns parsed DeepEval result when service executes successfully", async () => {
    const formData = buildFormData();
    const file = formData.get("file");
    const result = await deepEvalService.analyzeDeepEval(file, "Frontend Engineer");

    expect(result.error).toBeUndefined();
    expect(result.data).not.toBeNull();
    expect(result.data?.scores?.technical_skills?.score).toBe(8);
    expect(result.data?.totalScore).toBe(55); // 10 + 15 + 20 + 8 + 2 - 0 = 55
  });
});
