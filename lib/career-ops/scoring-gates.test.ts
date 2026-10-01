import { describe, it, expect } from "vitest";
import {
  isSeniorRole,
  isIrrelevantRole,
  applyScoringGates,
  SENIORITY_SCORE_CAP,
  RELEVANCE_SCORE_CAP,
} from "./scoring-gates";

describe("scoring-gates", () => {
  describe("isSeniorRole", () => {
    it("flags senior, staff, lead, principal, and architect titles", () => {
      expect(isSeniorRole("Senior Software Engineer")).toBe(true);
      expect(isSeniorRole("Staff Backend Engineer")).toBe(true);
      expect(isSeniorRole("Principal Cloud Architect")).toBe(true);
      expect(isSeniorRole("Engineering Lead")).toBe(true);
      expect(isSeniorRole("VP of Technology")).toBe(true);
      expect(isSeniorRole("Head of AI")).toBe(true);
    });

    it("respects junior markers overriding senior terms", () => {
      expect(isSeniorRole("Senior Engineer Intern")).toBe(false);
      expect(isSeniorRole("Junior Developer")).toBe(false);
      expect(isSeniorRole("Associate Software Engineer")).toBe(false);
      expect(isSeniorRole("Graduate Trainee")).toBe(false);
    });

    it("keeps executive director titles senior even with associate marker", () => {
      expect(isSeniorRole("Associate Director")).toBe(true);
      expect(isSeniorRole("Associate VP of Engineering")).toBe(true);
    });

    it("does not flag mid-level or unqualified titles", () => {
      expect(isSeniorRole("Frontend Engineer")).toBe(false);
      expect(isSeniorRole("Fullstack Developer")).toBe(false);
      expect(isSeniorRole("Python Developer")).toBe(false);
    });
  });

  describe("isIrrelevantRole", () => {
    it("flags when both skills and domain are below 60%", () => {
      expect(isIrrelevantRole(40, 50)).toBe(true);
      expect(isIrrelevantRole(20, 30)).toBe(true);
    });

    it("passes when either skills or domain is at or above floor", () => {
      expect(isIrrelevantRole(85, 30)).toBe(false);
      expect(isIrrelevantRole(40, 75)).toBe(false);
      expect(isIrrelevantRole(80, 80)).toBe(false);
    });

    it("does not flag missing or null data", () => {
      expect(isIrrelevantRole(null, null)).toBe(false);
      expect(isIrrelevantRole(0, 0)).toBe(false);
    });
  });

  describe("applyScoringGates", () => {
    it("caps high scores for senior roles", () => {
      const result = applyScoringGates(85, "Staff Platform Engineer");
      expect(result.score).toBe(SENIORITY_SCORE_CAP);
      expect(result.isCapped).toBe(true);
      expect(result.cappedBy).toBe("seniority");
      expect(result.reason).toContain("senior role title");
    });

    it("does not cap senior roles if raw score is already below cap", () => {
      const result = applyScoringGates(25, "Staff Platform Engineer");
      expect(result.score).toBe(25);
      expect(result.isCapped).toBe(false);
    });

    it("caps roles weak in both skills and domain", () => {
      const result = applyScoringGates(80, "Fullstack Developer", {
        skillsScore: 45,
        domainScore: 50,
      });
      expect(result.score).toBe(RELEVANCE_SCORE_CAP);
      expect(result.isCapped).toBe(true);
      expect(result.cappedBy).toBe("relevance");
      expect(result.reason).toContain("weak skills & domain fit");
    });

    it("leaves strong matching junior/mid roles intact", () => {
      const result = applyScoringGates(90, "Software Engineer", {
        skillsScore: 90,
        domainScore: 85,
        existingReason: "Great React & Node experience",
      });
      expect(result.score).toBe(90);
      expect(result.isCapped).toBe(false);
      expect(result.reason).toBe("Great React & Node experience");
    });
  });
});
