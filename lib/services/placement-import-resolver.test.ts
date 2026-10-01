import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  classifySemanticConflict,
  analyzeImportDraft,
  confirmAndPersistImport,
  computeContentHash,
} from "./placement-import-resolver";

// Mock extractor
vi.mock("./placement-import-extractor", () => ({
  extractPlacementImport: vi.fn(),
}));

// Mock outlook drive resolver helpers
vi.mock("./outlook-drive-resolver", () => ({
  normalizeCompanyName: vi.fn((name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, "")),
  resolveCompany: vi.fn().mockResolvedValue("comp-mock-1"),
  getActiveAcademicYearId: vi.fn().mockResolvedValue("ay-mock-1"),
  resolvePlacementEvent: vi.fn().mockResolvedValue({ eventId: "ev-mock-1", action: "created" }),
}));

import { extractPlacementImport } from "./placement-import-extractor";

describe("Placement Import Resolver", () => {
  let mockDb: any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("classifySemanticConflict", () => {
    it("classifies direct package contradiction as CONFLICT", () => {
      const res = classifySemanticConflict(
        {
          packageMinLpa: 7.6,
          packageMaxLpa: 7.6,
          minCgpa: 7.0,
          eligibleBranches: ["CSE"],
        },
        {
          minLpa: 12.0,
          maxLpa: 12.0,
          stipendText: null,
          minCgpa: 7.0,
          eligibleBranches: ["CSE"],
        }
      );

      expect(res.conflictType).toBe("CONFLICT");
      expect(res.description).toContain("Official package is 7.6 LPA, while student submission proposes 12 LPA");
    });

    it("classifies single tier within official range as MORE_SPECIFIC", () => {
      const res = classifySemanticConflict(
        {
          packageMinLpa: 6.25,
          packageMaxLpa: 21.0,
          packageValues: [6.25, 21.0],
          minCgpa: 7.0,
          eligibleBranches: ["CSE"],
        },
        {
          minLpa: 21.0,
          maxLpa: 21.0,
          stipendText: null,
          minCgpa: 7.0,
          eligibleBranches: ["CSE"],
        }
      );

      expect(res.conflictType).toBe("MORE_SPECIFIC");
      expect(res.description).toContain("specifies tier (21 LPA) within official range");
    });

    it("classifies stipend vs full-time package as POSSIBLE_CONFLICT", () => {
      const res = classifySemanticConflict(
        {
          packageMinLpa: 10.0,
          packageMaxLpa: 10.0,
          minCgpa: 7.0,
          eligibleBranches: ["CSE"],
        },
        {
          minLpa: null,
          maxLpa: null,
          stipendText: "50,000/month",
          minCgpa: 7.0,
          eligibleBranches: ["CSE"],
        }
      );

      expect(res.conflictType).toBe("POSSIBLE_CONFLICT");
    });

    it("classifies new branches as ADDITIONAL_INFORMATION", () => {
      const res = classifySemanticConflict(
        {
          packageMinLpa: 7.6,
          packageMaxLpa: 7.6,
          minCgpa: 7.0,
          eligibleBranches: ["CSE"],
        },
        {
          minLpa: 7.6,
          maxLpa: 7.6,
          stipendText: null,
          minCgpa: 7.0,
          eligibleBranches: ["CSE", "ECE", "IT"],
        }
      );

      expect(res.conflictType).toBe("ADDITIONAL_INFORMATION");
    });
  });

  describe("analyzeImportDraft — Zero Writes to Production Tables", () => {
    it("creates exactly one private submission row and zero writes to production placement tables", async () => {
      const insertSubmissionFn = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: "sub-test-123" }, error: null }),
        }),
      });

      const writeMockCompanies = vi.fn();
      const writeMockDrives = vi.fn();
      const writeMockEvents = vi.fn();
      const writeMockAnnouncements = vi.fn();

      mockDb = {
        from: vi.fn((table: string) => {
          if (table === "placement_import_submissions") {
            return {
              insert: insertSubmissionFn,
            };
          }
          if (table === "placement_companies") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  maybeSingle: vi.fn().mockResolvedValue({ data: { id: "comp-deloitte", name: "Deloitte" } }),
                }),
              }),
              insert: writeMockCompanies,
              update: writeMockCompanies,
            };
          }
          if (table === "placement_drives") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  order: vi.fn().mockResolvedValue({
                    data: [
                      {
                        id: "drive-deloitte-official",
                        drive_name: "Deloitte Campus Drive",
                        role_title: "Analyst",
                        package_min_lpa: 7.6,
                        package_max_lpa: 7.6,
                        source_type: "pdf_report",
                        source_verified: true,
                        min_cgpa: 7.0,
                        eligible_branches: ["CSE", "IT"],
                      },
                    ],
                  }),
                }),
              }),
              insert: writeMockDrives,
              update: writeMockDrives,
            };
          }
          if (table === "placement_events") {
            return {
              insert: writeMockEvents,
              update: writeMockEvents,
            };
          }
          if (table === "placement_announcements") {
            return {
              insert: writeMockAnnouncements,
              update: writeMockAnnouncements,
            };
          }
          return {};
        }),
      };

      vi.mocked(extractPlacementImport).mockResolvedValue({
        items: [
          {
            tempId: "t1",
            noticeType: "NEW_DRIVE",
            companyName: "Deloitte",
            roleTitle: "Analyst",
            packageText: "8.0 LPA",
            minLpa: 8.0,
            maxLpa: 8.0,
            stipendText: null,
            eligibleBranches: ["CSE", "IT"],
            minCgpa: 7.0,
            targetBatch: "2026",
            deadlineIso: "2026-09-24",
            deadlinePrecision: "day",
            deadlineInferred: false,
            eventDateIso: null,
            eventLocation: null,
            registrationUrl: null,
            confidence: 0.9,
            rawSnippet: "Deloitte Analyst 8.0 LPA",
          },
        ],
        extractedTableCount: 1,
        extractedProseCount: 0,
      });

      const draft = await analyzeImportDraft(mockDb, "user-student-1", "Deloitte Analyst 8.0 LPA");

      // 1. Private submission row created
      expect(insertSubmissionFn).toHaveBeenCalledTimes(1);
      expect(draft.submissionId).toBe("sub-test-123");

      // 2. Production tables had ZERO writes!
      expect(writeMockCompanies).not.toHaveBeenCalled();
      expect(writeMockDrives).not.toHaveBeenCalled();
      expect(writeMockEvents).not.toHaveBeenCalled();
      expect(writeMockAnnouncements).not.toHaveBeenCalled();

      // 3. Conflict detected with official drive
      expect(draft.items[0].matchOutcome).toBe("conflict_with_official");
      expect(draft.items[0].conflictType).toBe("CONFLICT");
      expect(draft.items[0].existingOfficialValue?.packageText).toBeUndefined();
    });
  });

  describe("confirmAndPersistImport — Idempotency, Provenance & Sanitization", () => {
    it("never downgrades existing official drive provenance when confirmed", async () => {
      const updateDriveFn = vi.fn();
      const updateSubmissionFn = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      mockDb = {
        from: vi.fn((table: string) => {
          if (table === "placement_import_submissions") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    maybeSingle: vi.fn().mockResolvedValue({
                      data: { id: "sub-1", user_id: "user-1", status: "analyzed" },
                    }),
                  }),
                }),
              }),
              update: updateSubmissionFn,
            };
          }
          if (table === "placement_drives") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: {
                      id: "drive-official-1",
                      source_type: "pdf_report",
                      source_verified: true, // Official record!
                      package_min_lpa: 7.6,
                      package_max_lpa: 7.6,
                    },
                  }),
                }),
              }),
              update: updateDriveFn,
            };
          }
          if (table === "placement_announcements") {
            return { insert: vi.fn().mockResolvedValue({ error: null }) };
          }
          return {};
        }),
      };

      const res = await confirmAndPersistImport(mockDb, "user-1", "sub-1", [
        {
          tempId: "t1",
          noticeType: "NEW_DRIVE",
          companyName: "Deloitte",
          roleTitle: "Analyst",
          packageText: "8.0 LPA",
          minLpa: 8.0,
          maxLpa: 8.0,
          eligibleBranches: ["CSE"],
          minCgpa: 7.0,
          deadlineIso: "2026-09-24",
          eventDateIso: null,
          eventLocation: null,
          registrationUrl: null,
          selectedDriveId: "drive-official-1", // Matched official drive
        },
      ]);

      expect(res.success).toBe(true);
      // Guarantee: updateDriveFn was NOT called to overwrite official package or change source_type
      expect(updateDriveFn).not.toHaveBeenCalled();
      expect(updateSubmissionFn).toHaveBeenCalledWith(
        expect.objectContaining({ status: "confirmed" })
      );
    });

    it("prevents duplicate creation on double confirmation", async () => {
      mockDb = {
        from: vi.fn((table: string) => {
          if (table === "placement_import_submissions") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    maybeSingle: vi.fn().mockResolvedValue({
                      data: { id: "sub-1", user_id: "user-1", status: "confirmed" }, // Already confirmed!
                    }),
                  }),
                }),
              }),
            };
          }
          return {};
        }),
      };

      const res = await confirmAndPersistImport(mockDb, "user-1", "sub-1", []);
      expect(res.success).toBe(true);
      expect(res.createdDrivesCount).toBe(0);
      expect(res.warnings).toContain("This import has already been confirmed.");
    });

    it("creates sanitized public announcement without raw PII for RESULT notice", async () => {
      const insertAnnounceFn = vi.fn().mockResolvedValue({ error: null });

      mockDb = {
        from: vi.fn((table: string) => {
          if (table === "placement_import_submissions") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    maybeSingle: vi.fn().mockResolvedValue({
                      data: { id: "sub-1", user_id: "user-1", status: "analyzed" },
                    }),
                  }),
                }),
              }),
              update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
            };
          }
          if (table === "placement_announcements") {
            return { insert: insertAnnounceFn };
          }
          return {};
        }),
      };

      await confirmAndPersistImport(mockDb, "user-1", "sub-1", [
        {
          tempId: "t-res-1",
          noticeType: "RESULT",
          companyName: "Infosys",
          roleTitle: "Specialist Programmer",
          packageText: "9.5 LPA",
          minLpa: 9.5,
          maxLpa: 9.5,
          eligibleBranches: ["CSE"],
          minCgpa: 7.0,
          deadlineIso: null,
          eventDateIso: null,
          eventLocation: null,
          registrationUrl: null,
          sanitizedAnnouncementText: "Infosys announced final selects for Specialist Programmer.",
        },
      ]);

      expect(insertAnnounceFn).toHaveBeenCalledWith(
        expect.objectContaining({
          source: "student_submission",
          subject: "Infosys - Selection Results",
          raw_body: "Infosys announced final selects for Specialist Programmer.",
          verified: false,
        })
      );
    });
  });
});
