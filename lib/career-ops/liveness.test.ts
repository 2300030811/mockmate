import { describe, expect, it } from "vitest";
import { classifyLiveness } from "@/lib/career-ops/liveness";

describe("career-ops liveness classifier", () => {
  it("marks 404/410 responses as expired", () => {
    expect(classifyLiveness({ status: 404 }).result).toBe("expired");
    expect(classifyLiveness({ status: 410 }).result).toBe("expired");
  });

  it("marks known expired redirects and body patterns as expired", () => {
    const redirectResult = classifyLiveness({
      status: 200,
      finalUrl: "https://jobs.example.com/role?error=true",
    });
    const bodyPatternResult = classifyLiveness({
      status: 200,
      finalUrl: "https://jobs.example.com/role",
      bodyText: "This position has been filled. Thanks for your interest.",
    });

    expect(redirectResult.result).toBe("expired");
    expect(bodyPatternResult.result).toBe("expired");
  });

  it("marks pages with visible apply controls as active", () => {
    const result = classifyLiveness({
      status: 200,
      finalUrl: "https://jobs.example.com/role",
      bodyText: "Detailed role description".repeat(40),
      applyControls: ["Apply Now"],
    });

    expect(result.result).toBe("active");
  });

  it("marks short-content pages as expired and rich pages without apply as uncertain", () => {
    const shortContent = classifyLiveness({
      status: 200,
      finalUrl: "https://jobs.example.com/role",
      bodyText: "Welcome",
      applyControls: [],
    });
    const uncertain = classifyLiveness({
      status: 200,
      finalUrl: "https://jobs.example.com/role",
      bodyText: "Career opportunity details and role scope. ".repeat(20),
      applyControls: ["Learn more"],
    });

    expect(shortContent.result).toBe("expired");
    expect(uncertain.result).toBe("uncertain");
  });
});