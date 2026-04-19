import { describe, expect, it } from "vitest";
import { getRoleSuggestions } from "./role-suggestions";

describe("role suggestions", () => {
  it("returns default suggestions for empty input", () => {
    const suggestions = getRoleSuggestions("", 5);
    expect(suggestions).toHaveLength(5);
  });

  it("resolves abbreviation-style queries to known roles", () => {
    const suggestions = getRoleSuggestions("sde", 5).map((item) => item.value);
    expect(suggestions).toContain("software engineer");
  });

  it("prioritizes close prefix role matches", () => {
    const topSuggestion = getRoleSuggestions("front end", 1)[0];
    expect(topSuggestion?.value).toBe("frontend developer");
  });
});
