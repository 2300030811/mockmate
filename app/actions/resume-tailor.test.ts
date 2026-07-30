import { beforeEach, describe, expect, it, vi } from "vitest";
import { tailorResumeAction } from "./resume-tailor";

const rateLimitMock = vi.hoisted(() => vi.fn());
const generateTextMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: rateLimitMock,
}));

vi.mock("@/lib/ai/gateway", () => ({
  generateText: generateTextMock,
  AI_MODELS: {
    DEFAULT: "llama-3.3-70b-versatile",
    FAST: "openai/gpt-oss-20b",
    STRUCTURED: "llama-3.3-70b-versatile",
  },
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

const SAMPLE_BASE_RESUME = {
  name: "John Doe",
  email: "john@example.com",
  phone: "123-456-7890",
  summary: "Old Summary",
  skills: ["React", "TypeScript"],
  technologies: ["Node.js"],
  experience: [
    { company: "Acme Corp", role: "Developer", period: "2020-2024", highlights: ["Built products"] }
  ],
  projects: [],
  education: [
    { program: "B.S. CS", institution: "University", period: "2016-2020", details: "" }
  ]
};

describe("tailorResumeAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    rateLimitMock.mockResolvedValue({ success: true, message: "" });
  });

  it("returns rate limit message when blocked", async () => {
    rateLimitMock.mockResolvedValue({ success: false, message: "Rate limit exceeded" });

    const result = await tailorResumeAction(JSON.stringify(SAMPLE_BASE_RESUME), "Need a React Expert");

    expect(result.data).toBeNull();
    expect(result.error).toBe("Rate limit exceeded");
  });

  it("returns error on invalid base resume JSON", async () => {
    const result = await tailorResumeAction("invalid-json", "Need a Developer");
    expect(result.data).toBeNull();
    expect(result.error).toBe("Invalid resume data.");
  });

  it("returns tailored resume when gateway succeeds", async () => {
    const aiResponse = {
      summary: "Tailored Summary focusing on React.",
      skills: ["React", "TypeScript"],
      technologies: ["Node.js"],
      experience: [
        { company: "Acme Corp", role: "Developer", period: "2020-2024", highlights: ["Built React products"] }
      ],
      projects: []
    };

    generateTextMock.mockResolvedValue({
      content: JSON.stringify(aiResponse),
      provider: "groq"
    });

    const result = await tailorResumeAction(
      JSON.stringify(SAMPLE_BASE_RESUME),
      "Need a Senior React Developer with TypeScript expertise."
    );

    expect(result.error).toBeUndefined();
    expect(result.data).not.toBeNull();
    expect(result.data.summary).toBe("Tailored Summary focusing on React.");
    expect(result.data.name).toBe("John Doe"); // Name preserved
    expect(result.data.education[0].program).toBe("B.S. CS"); // Education preserved
  });

  it("filters out fabricated skills and technologies not present in base resume", async () => {
    const aiResponseWithFabrications = {
      summary: "Tailored Summary",
      skills: ["React", "TypeScript", "AWS", "Kubernetes"], // AWS/Kubernetes are fabricated
      technologies: ["Node.js", "Docker"], // Docker is fabricated
      experience: [
        { company: "Acme Corp", role: "Developer", period: "2020-2024", highlights: ["Built products"] },
        { company: "Fake Company Inc", role: "Senior Developer", period: "2024", highlights: ["Lied on resume"] } // Fabricated company
      ],
      projects: []
    };

    generateTextMock.mockResolvedValue({
      content: JSON.stringify(aiResponseWithFabrications),
      provider: "groq"
    });

    const result = await tailorResumeAction(
      JSON.stringify(SAMPLE_BASE_RESUME),
      "Need a Developer"
    );

    expect(result.error).toBeUndefined();
    expect(result.data).not.toBeNull();
    expect(result.data.skills).toEqual(["React", "TypeScript"]); // AWS/Kubernetes filtered out
    expect(result.data.technologies).toEqual(["Node.js"]); // Docker filtered out
    expect(result.data.experience.length).toBe(1); // Fake Company Inc filtered out
    expect(result.data.experience[0].company).toBe("Acme Corp");
  });

  it("returns error when gateway fails", async () => {
    generateTextMock.mockRejectedValue(new Error("AI Gateway down"));

    const result = await tailorResumeAction(
      JSON.stringify(SAMPLE_BASE_RESUME),
      "Need a Developer"
    );

    expect(result.data).toBeNull();
    expect(result.error).toBe("AI service is temporarily unavailable. Please try again in a moment.");
  });
});
