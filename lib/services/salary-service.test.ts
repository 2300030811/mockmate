import { describe, expect, it } from "vitest";
import { fetchSalaryEstimate, formatSalaryRange } from "./salary-service";

describe("salary-service", () => {
  it("maps abbreviation aliases to known salary roles", () => {
    const result = fetchSalaryEstimate("SDE 2", 5);

    expect(result).not.toBeNull();
    expect(result?.matchType).toBe("exact");
    expect(result?.confidence).toBe("medium");
    expect(result?.currency).toBe("INR");
  });

  it("handles seniority and engineer-developer normalization", () => {
    const result = fetchSalaryEstimate("Senior Backend Engineer", 7);

    expect(result).not.toBeNull();
    expect(result?.matchType).toBe("exact");
    expect(["high", "medium"]).toContain(result?.confidence);
  });

  it("returns null for unknown or gibberish roles", () => {
    const result = fetchSalaryEstimate("asdf qwer", 4);
    expect(result).toBeNull();
  });

  it("returns null when role is not represented in salary json", () => {
    const result = fetchSalaryEstimate("quantum platform evangelist", 6);
    expect(result).toBeNull();
  });

  it("formats salary ranges for display", () => {
    const formatted = formatSalaryRange({
      min: 1000000,
      max: 2000000,
      median: 1500000,
      currency: "INR",
      period: "YEAR",
      source: "test",
      publishers: ["test"],
    });

    expect(formatted).toContain("\u20b9");
    expect(formatted).toContain("PA");
  });
});
