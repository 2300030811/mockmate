import { describe, expect, it } from "vitest";
import { hydrateRoastData } from "./hydrateRoastData";

describe("hydrateRoastData", () => {
  it("returns normalized roast data for minimal persisted payload", () => {
    const serialized = JSON.stringify({
      professionalScore: 72,
      brutalRoast: "Strong base, weak metrics.",
      skillBreakdown: {
        clarity: 70,
        impact: 60,
        technical: 75,
        layout: 65,
      },
      criticalFlaws: ["No quantified impact in latest role."],
      winningPoints: ["Clear summary section."],
      atsAnalysis: {
        atsScore: 82,
      },
      suggestions: ["Add metrics to top three bullets."],
    });

    const hydrated = hydrateRoastData(serialized);

    expect(hydrated).not.toBeNull();
    expect(hydrated?.atsAnalysis.atsScore).toBe(82);
    expect(hydrated?.atsAnalysis.matchRating).toBe("High");
    expect(hydrated?.atsAnalysis.jobDescriptionProvided).toBe(false);
    expect(hydrated?.atsAnalysis.presentKeywords).toEqual([]);
  });

  it("returns null for invalid JSON", () => {
    expect(hydrateRoastData("{not-json")).toBeNull();
  });

  it("returns null for schema-invalid payload", () => {
    const invalidSerialized = JSON.stringify({
      professionalScore: "82",
      atsAnalysis: { atsScore: 60 },
    });

    expect(hydrateRoastData(invalidSerialized)).toBeNull();
  });
});
