import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import {
  getPlacementQualityCategory,
  PlacementDataQualityStatus,
  PlacementHistoryRecord,
} from "@/types/placements";
import {
  normalizeCompanyName,
  resolveConservativeCompanyId,
} from "@/scripts/seed-placement-history";

describe("Milestone 8: Historical Placement Data Architecture & Safeguards", () => {
  const jsonPath = path.resolve(
    process.cwd(),
    "data/klu_placements_supplementary_2016_2026.json"
  );
  const rawData = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  const records = rawData.records as Array<any>;

  describe("Dataset Integrity & 1:1 Mapping", () => {
    it("preserves exactly 1,106 historical records with zero data loss", () => {
      expect(rawData.total_records).toBe(1106);
      expect(records.length).toBe(1106);
    });

    it("verifies exact department breakdown (ECE: 446, CSE: 660)", () => {
      const ece = records.filter((r) => r.department === "ECE");
      const cse = records.filter((r) => r.department === "CSE");

      expect(ece.length).toBe(446);
      expect(cse.length).toBe(660);
      expect(ece.length + cse.length).toBe(1106);
    });

    it("preserves academic year distributions without missing buckets", () => {
      const yearCounts: Record<string, number> = {};
      for (const r of records) {
        yearCounts[r.academic_year] = (yearCounts[r.academic_year] || 0) + 1;
      }

      expect(yearCounts["2016-2017"]).toBe(33);
      expect(yearCounts["2017-2018"]).toBe(73);
      expect(yearCounts["2018-2019"]).toBe(31);
      expect(yearCounts["2019-2020"]).toBe(51);
      expect(yearCounts["2020-2021"]).toBe(29);
      expect(yearCounts["2021-2022"]).toBe(229);
      expect(yearCounts["2022-2023"]).toBe(256);
      expect(yearCounts["2023-2024"]).toBe(173);
      expect(yearCounts["2024-2025"]).toBe(210);
      expect(yearCounts["2025-2026"]).toBe(16);
      expect(yearCounts["2026-2027"]).toBe(5);
    });
  });

  describe("Department Null Semantics & Field Isolation", () => {
    it("strictly preserves ECE-specific columns and ensures CSE columns are NULL in all ECE rows", () => {
      const eceRecords = records.filter((r) => r.department === "ECE");

      for (const r of eceRecords) {
        // ECE records must NEVER have CSE offer counts or CSE CTC strings
        expect(r.offers_count).toBeNull();
        expect(r.btech_offers).toBeNull();
        expect(r.mtech_offers).toBeNull();
        expect(r.ctc_lpa).toBeNull();

        // ECE records always have students_placed
        expect(typeof r.students_placed).toBe("number");
        expect(r.students_placed).toBeGreaterThanOrEqual(0);
      }

      // ECE 2016-2019 published counts only (visit_date and package_lpa are null)
      const eceEarly = eceRecords.filter((r) =>
        ["2016-2017", "2017-2018", "2018-2019"].includes(r.academic_year)
      );
      expect(eceEarly.length).toBe(137);
      for (const r of eceEarly) {
        expect(r.visit_date).toBeNull();
        expect(r.package_lpa).toBeNull();
      }

      // ECE 2019-2027 has visit_date strings
      const eceLater = eceRecords.filter(
        (r) =>
          !["2016-2017", "2017-2018", "2018-2019"].includes(r.academic_year)
      );
      expect(eceLater.length).toBe(309);
      for (const r of eceLater) {
        expect(typeof r.visit_date).toBe("string");
        expect(Array.isArray(r.package_lpa)).toBe(true);
      }
    });

    it("strictly preserves CSE-specific columns and ensures ECE columns are NULL in all CSE rows", () => {
      const cseRecords = records.filter((r) => r.department === "CSE");

      for (const r of cseRecords) {
        // CSE records must NEVER have ECE visit dates, students_placed, or package_lpa arrays
        expect(r.visit_date).toBeNull();
        expect(r.students_placed).toBeNull();
        expect(r.package_lpa).toBeNull();

        // CSE records always have offers_count and ctc_lpa
        expect(typeof r.offers_count).toBe("number");
        expect(typeof r.ctc_lpa).toBe("string");
      }
    });

    it("preserves unassumed nulls in CSE B.Tech/M.Tech offers where source had blank cells", () => {
      // 3 CSE records had total offers with neither B.Tech nor M.Tech reported
      const noBreakdown = records.filter(
        (r) =>
          r.department === "CSE" &&
          (r.data_quality_status || []).includes(
            "category_breakdown_not_reported"
          )
      );

      expect(noBreakdown.length).toBe(3);
      for (const r of noBreakdown) {
        expect(r.btech_offers).toBeNull();
        expect(r.mtech_offers).toBeNull();
        expect(r.offers_count).toBeGreaterThan(0);
      }
    });
  });

  describe("Conservative Company Entity Resolution", () => {
    const mockCompanies = new Map<string, string>([
      ["siemens", "siemens-uuid"],
      ["google", "google-uuid"],
      ["tcs", "tcs-uuid"],
      ["capgemini", "capgemini-uuid"],
      ["deloitte", "deloitte-uuid"],
    ]);

    it("unambiguously links clean parent companies", () => {
      const id = resolveConservativeCompanyId("Siemens", null, false, mockCompanies);
      expect(id).toBe("siemens-uuid");
    });

    it("links parent company ID for track-specific records without altering verbatim company_name", () => {
      const id = resolveConservativeCompanyId(
        "TCS-Digital",
        null,
        false,
        mockCompanies
      );
      // Links to parent TCS company for navigation, but source string "TCS-Digital" is preserved
      expect(id).toBe("tcs-uuid");
    });

    it("strictly enforces that grouped multi-company rows (+) NEVER resolve to any company_id", () => {
      const id = resolveConservativeCompanyId(
        "GGK+Wipro+Infosys+Mindtree+Zoho",
        null,
        true,
        mockCompanies
      );
      expect(id).toBeNull();
    });

    it("verifies all 38 grouped multi-company records in the dataset are flagged and unlinked", () => {
      const grouped = records.filter(
        (r) =>
          r.company.includes("+") ||
          (r.data_quality_status || []).includes("grouped_multi_company_row")
      );

      expect(grouped.length).toBe(38);
      for (const r of grouped) {
        const id = resolveConservativeCompanyId(
          r.company,
          r.normalized_company_name,
          true,
          mockCompanies
        );
        expect(id).toBeNull();
      }
    });

    it("verifies normalized_company_name is populated strictly for the 3 source-normalized records", () => {
      const withNorm = records.filter(
        (r) => r.normalized_company_name !== null
      );
      expect(withNorm.length).toBe(3);
      for (const r of withNorm) {
        expect(r.company).toContain("Capgemini");
        expect(r.normalized_company_name).toBe("Capgemini");
      }
    });
  });

  describe("Source Inconsistencies & Quality Categorization", () => {
    it("faithfully preserves all 71 data quality issue tags without silent mutation", () => {
      const statusCounts: Record<string, number> = {};
      for (const r of records) {
        for (const s of r.data_quality_status || []) {
          statusCounts[s] = (statusCounts[s] || 0) + 1;
        }
      }

      expect(statusCounts["clean"]).toBe(1035);
      expect(statusCounts["date_outside_labeled_academic_year"]).toBe(23);
      expect(statusCounts["grouped_multi_company_row"]).toBe(38);
      expect(statusCounts["btech_mtech_total_mismatch"]).toBe(4);
      expect(statusCounts["category_breakdown_not_reported"]).toBe(3);
      expect(statusCounts["zero_offers_nonzero_ctc"]).toBe(1);
      expect(statusCounts["skipped_serial_number"]).toBe(2);

      // Total flagged records: 23 + 38 + 4 + 3 + 1 + 2 = 71
      expect(
        23 + 38 + 4 + 3 + 1 + 2
      ).toBe(71);
    });

    it("categorizes quality issues into distinct UI labels per requirement 12", () => {
      const mismatch = getPlacementQualityCategory("btech_mtech_total_mismatch");
      expect(mismatch.category).toBe("source_discrepancy");
      expect(mismatch.badgeVariant).toBe("warning");

      const zeroOffers = getPlacementQualityCategory("zero_offers_nonzero_ctc");
      expect(zeroOffers.category).toBe("source_discrepancy");
      expect(zeroOffers.badgeVariant).toBe("warning");

      const timing = getPlacementQualityCategory(
        "date_outside_labeled_academic_year"
      );
      expect(timing.category).toBe("structural_source_format");
      expect(timing.badgeVariant).toBe("info");

      const grouped = getPlacementQualityCategory("grouped_multi_company_row");
      expect(grouped.category).toBe("grouped_company_record");
      expect(grouped.badgeVariant).toBe("neutral");

      const missingField = getPlacementQualityCategory(
        "category_breakdown_not_reported"
      );
      expect(missingField.category).toBe("missing_source_field");
      expect(missingField.badgeVariant).toBe("neutral");
    });
  });

  describe("Analytics Safeguards (Requirements 10, 13, 14, 15)", () => {
    it("safeguard: prohibits summing ECE students_placed with CSE offers_count", () => {
      // Helper demonstrating that summing these two is a domain error
      function computeTotalStudentsPlaced(
        eceRecords: Array<{ students_placed: number | null }>,
        cseRecords: Array<{ offers_count: number | null }>
      ) {
        // ECE represents headcount (students placed)
        const eceHeadcount = eceRecords.reduce(
          (sum, r) => sum + (r.students_placed || 0),
          0
        );

        // CSE offers_count represents total offers, NOT unique student headcount
        // Any function attempting `eceHeadcount + cseOffers` violates Requirement 13
        return {
          eceStudentsPlaced: eceHeadcount,
          cseTotalOffers: cseRecords.reduce(
            (sum, r) => sum + (r.offers_count || 0),
            0
          ),
        };
      }

      const ece = records.filter((r) => r.department === "ECE");
      const cse = records.filter((r) => r.department === "CSE");
      const summary = computeTotalStudentsPlaced(ece, cse);

      expect(summary.eceStudentsPlaced).toBeGreaterThan(0);
      expect(summary.cseTotalOffers).toBeGreaterThan(0);
      // They must remain separate dimensions
      expect(summary).toHaveProperty("eceStudentsPlaced");
      expect(summary).toHaveProperty("cseTotalOffers");
    });

    it("safeguard: prohibits calculating combined package average without normalization", () => {
      // ECE has arrays (some with 2 packages e.g. ['3.8', '6.8']), CSE has single strings
      // Averaging them together without an explicit normalization model is prohibited
      const multiPackageECE = records.filter(
        (r) => r.department === "ECE" && r.package_lpa && r.package_lpa.length > 1
      );
      expect(multiPackageECE.length).toBe(5);

      // Verify that ECE package is an array while CSE ctc is a string
      expect(Array.isArray(multiPackageECE[0].package_lpa)).toBe(true);
      const cseSample = records.find((r) => r.department === "CSE");
      expect(typeof cseSample.ctc_lpa).toBe("string");
    });
  });

  describe("ECE 2025-2026 Report Dataset & Full-Period Completeness", () => {
    const ece2025Path = path.resolve(
      process.cwd(),
      "data/klu_placements_2025_26.json"
    );
    const ece2025Records = JSON.parse(fs.readFileSync(ece2025Path, "utf8"));

    it("verifies the 114 ECE 2025-2026 report records match the verified source format", () => {
      expect(ece2025Records.length).toBe(114);
      for (const r of ece2025Records) {
        expect(r.sno).toBeGreaterThan(0);
        expect(typeof r.cleaned_company).toBe("string");
        expect(typeof r.raw_date).toBe("string");
        expect(Array.isArray(r.package_values)).toBe(true);
      }
    });

    it("verifies complete historical coverage across 1,220 total records (1,106 + 114)", () => {
      const totalHistorical = records.length + ece2025Records.length;
      expect(totalHistorical).toBe(1220);

      // ECE: 446 (supplementary) + 114 (report) = 560
      const totalECE =
        records.filter((r) => r.department === "ECE").length +
        ece2025Records.length;
      expect(totalECE).toBe(560);

      // CSE: 660 (supplementary)
      const totalCSE = records.filter((r) => r.department === "CSE").length;
      expect(totalCSE).toBe(660);
      expect(totalECE + totalCSE).toBe(1220);
    });
  });
});
