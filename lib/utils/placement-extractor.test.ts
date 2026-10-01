import { describe, it, expect } from "vitest";
import {
  cleanCompanyName,
  parsePlacementDate,
  parsePlacementPackage,
  normalizeCompanyName,
  processRawRow,
} from "./placement-extractor";
import {
  getTodayISTDate,
  getISTDayRange,
  getISTUpcomingRange,
  PLACEMENT_TIMEZONE,
} from "../db/placement-repository";

describe("Placement Extractor Utilities", () => {
  describe("cleanCompanyName", () => {
    it("cleans standard company names without modification", () => {
      const result = cleanCompanyName("Siemens");
      expect(result.cleanedCompany).toBe("Siemens");
      expect(result.driveName).toBe("Siemens");
      expect(result.roleTitle).toBeNull();
      expect(result.warnings.length).toBe(0);
    });

    it("strips institutional watermark prefixes like KLUS", () => {
      const result = cleanCompanyName("KLUS\nCTS");
      expect(result.cleanedCompany).toBe("CTS");
      expect(result.warnings).toContain('Filtered watermark line: "KLUS"');
    });

    it("strips batch markings like Y23 B and checkboxes", () => {
      const result = cleanCompanyName("Y23 B\nInfosys\n:unselected:");
      expect(result.cleanedCompany).toBe("Infosys");
    });

    it("strips Student watermark", () => {
      const result = cleanCompanyName("Student\nFacePerp");
      expect(result.cleanedCompany).toBe("FacePerp");
    });

    it("de-hyphenates line break words", () => {
      const result = cleanCompanyName("Infosys (Specialist Program- mer)");
      expect(result.cleanedCompany).toBe("Infosys");
      expect(result.driveName).toBe("Infosys (Specialist Programmer)");
      expect(result.roleTitle).toBe("Specialist Programmer");
    });

    it("handles Domicile Hiring and Women parentheticals correctly", () => {
      const women = cleanCompanyName("Infosys (Women)");
      expect(women.cleanedCompany).toBe("Infosys");
      expect(women.driveName).toBe("Infosys (Women)");
      expect(women.roleTitle).toBeNull();

      const domicile = cleanCompanyName("HCL Tech (Domicile Hiring)");
      expect(domicile.cleanedCompany).toBe("HCL Tech");
      expect(domicile.driveName).toBe("HCL Tech (Domicile Hiring)");
      expect(domicile.roleTitle).toBeNull();
    });

    it("cleans duplicate OCR leading phrases", () => {
      const result = cleanCompanyName(
        "India Pvt. Ltd.\nArshith Fresh India Pvt. Ltd.\n:unselected:"
      );
      expect(result.cleanedCompany).toBe("Arshith Fresh India Pvt. Ltd.");
    });
  });

  describe("parsePlacementDate", () => {
    it("parses valid DD-MM-YYYY into ISO YYYY-MM-DD", () => {
      const result = parsePlacementDate("21-10-2024");
      expect(result.isoDate).toBe("2024-10-21");
    });

    it("cleans Co and C0 watermark prefixes", () => {
      const co = parsePlacementDate("Co20-09-2025");
      expect(co.isoDate).toBe("2025-09-20");

      const c0 = parsePlacementDate("C009-01-2026");
      expect(c0.isoDate).toBe("2026-01-09");
    });

    it("cleans newline watermarks on dates", () => {
      const y = parsePlacementDate("21-08-2025\nY");
      expect(y.isoDate).toBe("2025-08-21");

      const batch = parsePlacementDate("2023-2027 30-10-2025");
      expect(batch.isoDate).toBe("2025-10-30");
    });

    it("returns null for invalid dates", () => {
      const invalid = parsePlacementDate("not-a-date");
      expect(invalid.isoDate).toBeNull();
    });
  });

  describe("parsePlacementPackage", () => {
    it("parses single package values", () => {
      const result = parsePlacementPackage("6.3 LPA");
      expect(result.min).toBe(6.3);
      expect(result.max).toBe(6.3);
      expect(result.values).toEqual([6.3]);
    });

    it("parses package ranges", () => {
      const result = parsePlacementPackage("4 to 6 LPA");
      expect(result.min).toBe(4);
      expect(result.max).toBe(6);
      expect(result.values).toEqual([4, 6]);
    });

    it("parses multiple package tiers", () => {
      const result = parsePlacementPackage(":unselected: 3.6, 6.25, 9.5 LPA");
      expect(result.min).toBe(3.6);
      expect(result.max).toBe(9.5);
      expect(result.values).toEqual([3.6, 6.25, 9.5]);
    });

    it("parses ampersand-separated packages like '3.6 & 5 LPA'", () => {
      const result = parsePlacementPackage("3.6 & 5 LPA");
      expect(result.min).toBe(3.6);
      expect(result.max).toBe(5);
      expect(result.values).toEqual([3.6, 5]);
    });

    it("strips trailing watermark digits after LPA", () => {
      // S.No 66 has "6.5 LPA\n7" where 7 was from batch watermark 2023-27
      const result = parsePlacementPackage("6.5 LPA\n7");
      expect(result.min).toBe(6.5);
      expect(result.max).toBe(6.5);
      expect(result.values).toEqual([6.5]);
    });
  });

  describe("normalizeCompanyName", () => {
    it("normalizes lowercase and removes special characters", () => {
      expect(normalizeCompanyName("MosChip Technologies")).toBe("moschiptechnologies");
      expect(normalizeCompanyName("Spring Works")).toBe("springworks");
      expect(normalizeCompanyName("AT&T")).toBe("att");
    });
  });

  describe("processRawRow", () => {
    it("produces a complete audit record with no review required for valid input", () => {
      const record = processRawRow(
        "1",
        "Blue Star",
        "21-10-2024",
        "6.3 LPA",
        1,
        1
      );
      expect(record.sno).toBe(1);
      expect(record.source_page).toBe(1);
      expect(record.source_row).toBe(1);
      expect(record.cleaned_company).toBe("Blue Star");
      expect(record.date_of_visit).toBe("2024-10-21");
      expect(record.package_min_lpa).toBe(6.3);
      expect(record.package_max_lpa).toBe(6.3);
      expect(record.requires_review).toBe(false);
    });
  });

  describe("Timezone (Asia/Kolkata) Helpers", () => {
    it("confirms PLACEMENT_TIMEZONE is Asia/Kolkata", () => {
      expect(PLACEMENT_TIMEZONE).toBe("Asia/Kolkata");
    });

    it("computes exact UTC ISO boundaries for IST day", () => {
      // For 2026-09-17 in IST (UTC+05:30):
      // Start is 2026-09-17 00:00:00+05:30 = 2026-09-16T18:30:00.000Z
      // End is 2026-09-17 23:59:59.999+05:30 = 2026-09-17T18:29:59.999Z
      const range = getISTDayRange("2026-09-17");
      expect(range.startIso).toBe("2026-09-16T18:30:00.000Z");
      expect(range.endIso).toBe("2026-09-17T18:29:59.999Z");
    });

    it("computes exact UTC ISO boundaries for upcoming period", () => {
      const upcoming = getISTUpcomingRange("2026-09-17", 7);
      expect(upcoming.startIso).toBe("2026-09-17T18:29:59.999Z");
      // 7 days after 2026-09-17 is 2026-09-24 23:59:59.999+05:30 = 2026-09-24T18:29:59.999Z
      expect(upcoming.endIso).toBe("2026-09-24T18:29:59.999Z");
    });

    it("formats today in YYYY-MM-DD format for given timestamp", () => {
      // 2026-09-16 19:00:00Z is 2026-09-17 00:30:00 IST
      const date = new Date("2026-09-16T19:00:00.000Z");
      expect(getTodayISTDate(date)).toBe("2026-09-17");
    });

    it("correctly classifies 00:15 IST as belonging to the current day, not previous day", () => {
      // 2026-09-17 00:15:00 IST is 2026-09-16 18:45:00 UTC
      const eventTime = new Date("2026-09-17T00:15:00+05:30").toISOString();
      const sept16Range = getISTDayRange("2026-09-16");
      const sept17Range = getISTDayRange("2026-09-17");

      // Must NOT be in September 16
      expect(eventTime >= sept16Range.startIso && eventTime <= sept16Range.endIso).toBe(false);
      // Must BE in September 17
      expect(eventTime >= sept17Range.startIso && eventTime <= sept17Range.endIso).toBe(true);

      // getTodayISTDate at 00:15 IST must return 2026-09-17
      expect(getTodayISTDate(new Date("2026-09-17T00:15:00+05:30"))).toBe("2026-09-17");
    });

    it("correctly classifies 23:59:59 IST as belonging to the same day, not next day", () => {
      // 2026-09-16 23:59:59 IST is 2026-09-16 18:29:59 UTC
      const sept16Night = new Date("2026-09-16T23:59:59+05:30").toISOString();
      const sept16Range = getISTDayRange("2026-09-16");
      const sept17Range = getISTDayRange("2026-09-17");

      expect(sept16Night >= sept16Range.startIso && sept16Night <= sept16Range.endIso).toBe(true);
      expect(sept16Night >= sept17Range.startIso && sept16Night <= sept17Range.endIso).toBe(false);

      // 2026-09-17 23:59:59 IST
      const sept17Night = new Date("2026-09-17T23:59:59+05:30").toISOString();
      const sept18Range = getISTDayRange("2026-09-18");

      expect(sept17Night >= sept17Range.startIso && sept17Night <= sept17Range.endIso).toBe(true);
      expect(sept17Night >= sept18Range.startIso && sept17Night <= sept18Range.endIso).toBe(false);
    });

    it("preserves exact millisecond boundaries around midnight IST", () => {
      // 1 millisecond before midnight IST: 2026-09-16 23:59:59.999+05:30
      const preMidnight = new Date("2026-09-16T23:59:59.999+05:30").toISOString();
      // Exactly midnight IST: 2026-09-17 00:00:00.000+05:30
      const exactMidnight = new Date("2026-09-17T00:00:00.000+05:30").toISOString();

      const sept17Range = getISTDayRange("2026-09-17");
      expect(preMidnight < sept17Range.startIso).toBe(true);
      expect(exactMidnight >= sept17Range.startIso).toBe(true);
    });
  });
});
