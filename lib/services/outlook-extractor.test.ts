import { describe, it, expect } from "vitest";
import {
  parsePlacementNotice,
  extractDeterministicPackage,
  extractDeterministicBranches,
  extractDeterministicCgpa,
  detectReschedulingOrCancellation,
} from "./outlook-extractor";

describe("Outlook Hybrid Extraction Engine", () => {
  describe("Deterministic Package Parsing", () => {
    it("extracts single CTC and range CTC accurately with evidence snippet", () => {
      const res1 = extractDeterministicPackage(
        "Siemens EDA is offering a compensation of 14.5 LPA for shortlisted candidates."
      );
      expect(res1.rawPackageText).toContain("14.5 LPA");
      expect(res1.minLpa).toBe(14.5);
      expect(res1.maxLpa).toBe(14.5);
      expect(res1.evidence).toBe("14.5 LPA");

      const res2 = extractDeterministicPackage(
        "Package details: ₹ 6.5 - 8.5 Lakhs per annum depending on performance."
      );
      expect(res2.minLpa).toBe(6.5);
      expect(res2.maxLpa).toBe(8.5);
    });

    it("returns null when no package pattern is present", () => {
      const res = extractDeterministicPackage("Pre-placement talk will be held in auditorium.");
      expect(res.rawPackageText).toBeNull();
      expect(res.minLpa).toBeNull();
    });
  });

  describe("Branch & CGPA Extraction", () => {
    it("identifies engineering branches", () => {
      const branches = extractDeterministicBranches(
        "Eligible candidates from CSE, ECE, and IT branches may register."
      );
      expect(branches).toContain("CSE");
      expect(branches).toContain("ECE");
      expect(branches).toContain("IT");
      expect(branches).not.toContain("CIVIL");
    });

    it("extracts minimum CGPA cutoff with evidence", () => {
      const res = extractDeterministicCgpa("Eligibility criteria: Minimum CGPA >= 7.5 throughout.");
      expect(res.minCgpa).toBe(7.5);
      expect(res.evidence).toContain("CGPA >= 7.5");
    });
  });

  describe("Rescheduling & Cancellation Detection", () => {
    it("detects rescheduling announcements and extracts snippet", () => {
      const notice =
        "Important Update: Deloitte Technical Interview rescheduled to 2:00 PM today due to interviewer travel.";
      const res = detectReschedulingOrCancellation(notice);
      expect(res.isRescheduling).toBe(true);
      expect(res.isCancellation).toBe(false);
      expect(res.details).toContain("rescheduled to 2:00 PM");
    });

    it("detects drive cancellations", () => {
      const notice = "Notice: The upcoming campus recruitment drive stands cancelled by the company.";
      const res = detectReschedulingOrCancellation(notice);
      expect(res.isCancellation).toBe(true);
      expect(res.isRescheduling).toBe(false);
    });
  });

  describe("Full Notice Parsing & Confidence Scoring", () => {
    it("extracts company, package, eligibility, and computes confidence score", () => {
      const subject = "Deloitte USI - Campus Recruitment 2026 Batch";
      const body = `
        Dear Students,
        Deloitte USI is visiting campus for Associate Analyst role.
        Compensation: 7.6 LPA
        Eligible branches: CSE, IT, ECE
        Minimum CGPA: 6.5
        Last date to apply: 20-09-2026
      `;

      const notice = parsePlacementNotice(subject, body);
      expect(notice.companyName).toBe("Deloitte USI");
      expect(notice.minLpa).toBe(7.6);
      expect(notice.maxLpa).toBe(7.6);
      expect(notice.eligibleBranches).toEqual(expect.arrayContaining(["CSE", "IT", "ECE"]));
      expect(notice.minCgpa).toBe(6.5);
      expect(notice.confidence).toBeGreaterThanOrEqual(0.9);
      expect(notice.evidence.company).toBeDefined();
      expect(notice.evidence.package).toBeDefined();
    });
  });
});
