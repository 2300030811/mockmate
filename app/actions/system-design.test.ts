import { describe, it, expect, vi, beforeEach } from "vitest";
import { reviewSystemDesignAction } from "./system-design";
import { generateText } from "@/lib/ai/gateway";
import { rateLimit } from "@/lib/rate-limit";

// Mock the dependencies
vi.mock("@/lib/ai/gateway", () => ({
  generateText: vi.fn(),
  AI_MODELS: { DEFAULT: "test-model" }
}));

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn()
}));

vi.mock("@/lib/logger", () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() }
}));

describe("System Design AI Review Parser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (rateLimit as any).mockResolvedValue({ success: true });
  });

  it("should extract the JSON score block correctly when present", async () => {
    const mockResponse = `
# Great Architecture!
It looks very robust.
<!-- SCORE:{"overall":85,"reliability":70,"scalability":80,"security":90,"seniority":"Senior"} -->
    `;
    
    (generateText as any).mockResolvedValue({ content: mockResponse });

    const result = await reviewSystemDesignAction([], []);

    expect(result.error).toBeUndefined();
    expect(result.score).toEqual({
      overall: 85,
      reliability: 70,
      scalability: 80,
      security: 90,
      seniority: "Senior"
    });
    expect(result.markdown).toContain("# Great Architecture!");
    expect(result.markdown).not.toContain("<!-- SCORE:");
  });

  it("should return the markdown without score if the score block is malformed or missing", async () => {
    const mockResponse = `
# Good effort
Missing the score format.
<!-- SCORE: { invalid json } -->
    `;
    
    (generateText as any).mockResolvedValue({ content: mockResponse });

    const result = await reviewSystemDesignAction([], []);

    expect(result.error).toBeUndefined();
    expect(result.score).toBeUndefined();
    expect(result.markdown).toContain("# Good effort");
  });

  it("should handle gateway failures gracefully", async () => {
    (generateText as any).mockRejectedValue(new Error("API Error"));

    const result = await reviewSystemDesignAction([], []);

    expect(result.error).toBe("Failed to review system design.");
    expect(result.markdown).toBe("");
  });

  it("should block if rate limited", async () => {
    (rateLimit as any).mockResolvedValue({ success: false, message: "Too many requests" });

    const result = await reviewSystemDesignAction([], []);

    expect(result.error).toBe("Too many requests");
    expect(generateText).not.toHaveBeenCalled();
  });
});
