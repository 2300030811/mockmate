import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  evaluateJobTactically,
  buildFallbackEvaluation,
  tacticalEvaluationSchema,
} from "./evaluator";
import { aiOrchestrator } from "@/lib/services/ai-orchestrator";

vi.mock("@/lib/services/ai-orchestrator", () => ({
  aiOrchestrator: {
    generateStructured: vi.fn(),
  },
}));

vi.mock("@/lib/services/salary-service", () => ({
  fetchSalaryEstimate: vi.fn(() => ({
    min: 800000,
    max: 1500000,
    median: 1100000,
    currency: "INR",
    period: "YEAR",
  })),
  formatSalaryRange: vi.fn(() => "₹8,00,000 - ₹15,00,000 PA"),
}));

const mockGenerateStructured = vi.mocked(aiOrchestrator.generateStructured);

describe("career-ops tactical evaluator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("produces valid fallback evaluation conforming to schema", () => {
    const fallback = buildFallbackEvaluation("Software Engineer", "Acme Corp", 80);
    const parsed = tacticalEvaluationSchema.safeParse(fallback);
    expect(parsed.success).toBe(true);
    expect(fallback.interviewPrep.starStories[0].reflection).toBeTruthy();
  });

  it("evaluates role successfully with AI structured output and applies salary formatting", async () => {
    const mockData = buildFallbackEvaluation("Software Engineer", "Acme Corp", 85);
    mockGenerateStructured.mockResolvedValueOnce({
      success: true,
      data: mockData,
    });

    const result = await evaluateJobTactically({
      jobTitle: "Software Engineer",
      company: "Acme Corp",
      jobDescription: "Build modern web services in Next.js",
      candidateResumeText: "Experienced in Next.js and TypeScript",
      yearsOfExperience: 2,
    });

    expect(result.jobTitle).toBe("Software Engineer");
    expect(result.company).toBe("Acme Corp");
    expect(result.matchScore).toBe(85);
    expect(result.isCapped).toBe(false);
    expect(result.salaryFormatted).toBe("₹8,00,000 - ₹15,00,000 PA");
    expect(result.data.interviewPrep.starStories.length).toBeGreaterThan(0);
  });

  it("caps match score deterministically if job title is senior (Job Radar rule)", async () => {
    const mockData = buildFallbackEvaluation("Principal Architect", "CloudCorp", 95);
    mockGenerateStructured.mockResolvedValueOnce({
      success: true,
      data: mockData,
    });

    const result = await evaluateJobTactically({
      jobTitle: "Principal Architect",
      company: "CloudCorp",
      jobDescription: "Lead global architecture",
      candidateResumeText: "2 years experience in junior engineering",
      yearsOfExperience: 2,
    });

    expect(result.isCapped).toBe(true);
    expect(result.matchScore).toBe(30); // capped at 30%
    expect(result.gateReason).toContain("senior role title");
  });

  it("falls back gracefully when AI gateway throws", async () => {
    mockGenerateStructured.mockRejectedValueOnce(new Error("API rate limited"));

    const result = await evaluateJobTactically({
      jobTitle: "Frontend Developer",
      company: "Startup Co",
      jobDescription: "React UI development",
      candidateResumeText: "React, Tailwind",
    });

    expect(result.jobTitle).toBe("Frontend Developer");
    expect(result.data.cvMatch.rawScore).toBe(70);
    expect(result.matchScore).toBe(70);
    expect(result.data.interviewPrep.starStories.length).toBe(1);
  });
});
