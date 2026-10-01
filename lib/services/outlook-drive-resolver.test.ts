import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  normalizeCompanyName,
  resolveCompany,
  getActiveAcademicYearId,
  resolveDrive,
  resolvePlacementEvent,
  handleRemovedOutlookMessage,
  ingestPlacementEmailNotice,
} from "./outlook-drive-resolver";
import { ExtractedPlacementNotice } from "./outlook-extractor";

describe("Outlook Drive & Event Identity Resolver", () => {
  let mockDb: any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("normalizeCompanyName", () => {
    it("strips special characters and lowercases", () => {
      expect(normalizeCompanyName("Deloitte USI")).toBe("deloitteusi");
      expect(normalizeCompanyName("L&T Technology Services")).toBe("lttechnologyservices");
      expect(normalizeCompanyName("Amazon - AWS")).toBe("amazonaws");
    });
  });

  describe("resolveCompany", () => {
    it("returns existing company ID if found", async () => {
      mockDb = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({ data: { id: "comp-123" } }),
            }),
          }),
        }),
      };

      const id = await resolveCompany(mockDb, "Google");
      expect(id).toBe("comp-123");
    });

    it("inserts and returns new company if not found", async () => {
      mockDb = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({ data: null }),
            }),
          }),
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { id: "comp-new-999" }, error: null }),
            }),
          }),
        }),
      };

      const id = await resolveCompany(mockDb, "Stripe Inc");
      expect(id).toBe("comp-new-999");
    });
  });

  describe("resolveDrive", () => {
    const mockNotice: ExtractedPlacementNotice = {
      companyName: "Deloitte",
      roleTitle: "Analyst",
      packageText: "7.6 LPA",
      minLpa: 7.6,
      maxLpa: 7.6,
      eligibleBranches: ["CSE", "IT"],
      minCgpa: 7.0,
      confidence: 0.9,
      evidence: { company: "Deloitte" },
      isRescheduling: false,
      isCancellation: false,
      reschedulingDetails: null,
      events: [],
      rawSourceText: "Deloitte drive notice",
    };

    it("reuses existing active drive and does not duplicate", async () => {
      mockDb = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnThis(),
            in: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue({
              data: [{ id: "drive-existing-1", package_min_lpa: 7.6 }],
            }),
          }),
        }),
      };

      const res = await resolveDrive(mockDb, {
        companyId: "comp-123",
        academicYearId: "ay-2025-26",
        notice: mockNotice,
      });

      expect(res.driveId).toBe("drive-existing-1");
      expect(res.isNewDrive).toBe(false);
    });

    it("marks active drive as cancelled when notice indicates cancellation", async () => {
      const updateFn = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });
      mockDb = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnThis(),
            in: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue({
              data: [{ id: "drive-to-cancel", package_min_lpa: 7.6 }],
            }),
          }),
          update: updateFn,
        }),
      };

      const cancelNotice: ExtractedPlacementNotice = {
        ...mockNotice,
        isCancellation: true,
        reschedulingDetails: "Drive stands cancelled due to unforeseen circumstances",
      };

      const res = await resolveDrive(mockDb, {
        companyId: "comp-123",
        academicYearId: "ay-2025-26",
        notice: cancelNotice,
      });

      expect(res.driveId).toBe("drive-to-cancel");
      expect(updateFn).toHaveBeenCalledWith(
        expect.objectContaining({
          drive_status: "cancelled",
        })
      );
    });

    it("creates a new drive if no active drive exists", async () => {
      const insertFn = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: "drive-brand-new" }, error: null }),
        }),
      });

      mockDb = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnThis(),
            in: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue({ data: [] }),
          }),
          insert: insertFn,
        }),
      };

      const res = await resolveDrive(mockDb, {
        companyId: "comp-123",
        academicYearId: "ay-2025-26",
        notice: mockNotice,
      });

      expect(res.driveId).toBe("drive-brand-new");
      expect(res.isNewDrive).toBe(true);
      expect(insertFn).toHaveBeenCalledWith(
        expect.objectContaining({
          company_id: "comp-123",
          drive_name: "Deloitte Campus Drive",
          package_min_lpa: 7.6,
          source_type: "outlook_email",
        })
      );
    });
  });

  describe("resolvePlacementEvent — Strict 3-Tier Identity Hierarchy", () => {
    it("Tier 1: Matches and updates existing event by external outlook_event_id", async () => {
      const updateFn = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });

      mockDb = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                limit: vi.fn().mockReturnValue({
                  maybeSingle: vi.fn().mockResolvedValue({
                    data: { id: "event-ms-123" },
                  }),
                }),
              }),
            }),
          }),
          update: updateFn,
        }),
      };

      const res = await resolvePlacementEvent(mockDb, {
        driveId: "drive-1",
        candidate: {
          outlookEventId: "graph-evt-99",
          icalUid: "ical-99",
          title: "Technical Interview - Slot 1 (Updated Room)",
          eventType: "TECHNICAL_INTERVIEW",
          startTime: "2026-09-18T10:00:00.000Z",
          endTime: "2026-09-18T11:00:00.000Z",
          venue: "Room 402",
          meetingUrl: null,
          description: "Updated room",
          isCancelled: false,
          sourceVerified: true,
          dataVerified: true,
        },
      });

      expect(res.action).toBe("updated");
      expect(res.eventId).toBe("event-ms-123");
      expect(updateFn).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Technical Interview - Slot 1 (Updated Room)",
          venue: "Room 402",
        })
      );
    });

    it("Tier 2: Matches and updates existing event by explicit rescheduling evidence", async () => {
      const updateFn = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });

      mockDb = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: { id: "event-oa-old", title: "Aptitude Assessment", start_time: "2026-09-18T04:00:00.000Z" },
              }),
            }),
          }),
          update: updateFn,
        }),
      };

      const res = await resolvePlacementEvent(mockDb, {
        driveId: "drive-1",
        candidate: {
          eventType: "APTITUDE_TEST",
          title: "Aptitude Assessment (Rescheduled to Afternoon)",
          startTime: "2026-09-18T08:30:00.000Z",
          endTime: "2026-09-18T10:00:00.000Z",
          venue: "Online Lab 3",
          meetingUrl: null,
          confidence: 0.95,
        },
        isRescheduling: true,
      });

      expect(res.action).toBe("updated");
      expect(res.eventId).toBe("event-oa-old");
      expect(updateFn).toHaveBeenCalledWith(
        expect.objectContaining({
          start_time: "2026-09-18T08:30:00.000Z",
          venue: "Online Lab 3",
        })
      );
    });

    it("Tier 3: Creates separate new stage when no ID and no rescheduling (preserves Morning & Afternoon batches)", async () => {
      const insertFn = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: "event-afternoon-batch" }, error: null }),
        }),
      });

      mockDb = {
        from: vi.fn().mockReturnValue({
          insert: insertFn,
        }),
      };

      const res = await resolvePlacementEvent(mockDb, {
        driveId: "drive-1",
        candidate: {
          eventType: "TECHNICAL_INTERVIEW",
          title: "Technical Interview - Afternoon Batch (Slot 2)",
          startTime: "2026-09-18T08:30:00.000Z",
          endTime: "2026-09-18T12:00:00.000Z",
          venue: "LH-02",
          meetingUrl: null,
          confidence: 0.85,
        },
        isRescheduling: false, // NOT rescheduling; separate batch
      });

      expect(res.action).toBe("created");
      expect(res.eventId).toBe("event-afternoon-batch");
      expect(insertFn).toHaveBeenCalledWith(
        expect.objectContaining({
          drive_id: "drive-1",
          title: "Technical Interview - Afternoon Batch (Slot 2)",
          event_type: "TECHNICAL_INTERVIEW",
          venue: "LH-02",
        })
      );
    });
  });

  describe("handleRemovedOutlookMessage — Zero Deletion Safety", () => {
    it("never deletes drives or events when an Outlook message is removed", async () => {
      const updateFn = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });
      const deleteFn = vi.fn();

      mockDb = {
        from: vi.fn().mockReturnValue({
          update: updateFn,
          delete: deleteFn,
        }),
      };

      const res = await handleRemovedOutlookMessage(mockDb, "msg-deleted-123", "deleted");

      expect(res.acknowledged).toBe(true);
      expect(res.preserved).toBe(true);
      expect(updateFn).toHaveBeenCalledWith(
        expect.objectContaining({
          importance: "archived",
        })
      );
      // Explicit guarantee: delete was never called on any table!
      expect(deleteFn).not.toHaveBeenCalled();
    });
  });

  describe("ingestPlacementEmailNotice", () => {
    it("orchestrates company, drive, announcement, and event resolution with correct verification flags", async () => {
      // Setup mock queries
      const mockAcademicYear = { data: { id: "ay-1" } };
      const mockCompany = { data: { id: "comp-tcs" } };
      const mockDrive = { data: [{ id: "drive-tcs-1" }] };
      const mockAnnouncement = { data: null }; // Not yet created

      const insertAnnouncementFn = vi.fn().mockResolvedValue({ error: null });

      mockDb = {
        from: vi.fn((table: string) => {
          if (table === "placement_academic_years") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  order: vi.fn().mockReturnValue({
                    limit: vi.fn().mockReturnValue({
                      maybeSingle: vi.fn().mockResolvedValue(mockAcademicYear),
                    }),
                  }),
                }),
              }),
            };
          }
          if (table === "placement_companies") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  maybeSingle: vi.fn().mockResolvedValue(mockCompany),
                }),
              }),
            };
          }
          if (table === "placement_drives") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    in: vi.fn().mockReturnValue({
                      order: vi.fn().mockReturnValue({
                        limit: vi.fn().mockResolvedValue(mockDrive),
                      }),
                    }),
                  }),
                }),
              }),
              update: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ error: null }),
              }),
            };
          }
          if (table === "placement_announcements") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  maybeSingle: vi.fn().mockResolvedValue(mockAnnouncement),
                }),
              }),
              insert: insertAnnouncementFn,
            };
          }
          if (table === "placement_events") {
            return {
              insert: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: { id: "ev-ppt-1" }, error: null }),
                }),
              }),
            };
          }
          return {};
        }),
      };

      const notice: ExtractedPlacementNotice = {
        companyName: "TCS",
        roleTitle: "Ninja / Digital",
        packageText: "3.6 - 7.0 LPA",
        minLpa: 3.6,
        maxLpa: 7.0,
        eligibleBranches: ["CSE", "ECE", "IT"],
        minCgpa: 6.5,
        confidence: 0.92,
        evidence: { company: "TCS", package: "3.6 - 7.0 LPA" },
        isRescheduling: false,
        isCancellation: false,
        reschedulingDetails: null,
        events: [
          {
            eventType: "PRE_PLACEMENT_TALK",
            title: "TCS PPT Session",
            startTime: "2026-09-20T09:30:00.000Z",
            endTime: "2026-09-20T11:00:00.000Z",
            venue: "New SAC Auditorium",
            meetingUrl: null,
            confidence: 0.95,
          },
        ],
        rawSourceText: "TCS announcement email body",
      };

      const result = await ingestPlacementEmailNotice(mockDb, notice, {
        messageId: "msg-outlook-tcs-1",
        subject: "TCS Campus Recruitment 2026",
        receivedDateTime: "2026-09-17T08:00:00.000Z",
      });

      expect(result.companyId).toBe("comp-tcs");
      expect(result.driveId).toBe("drive-tcs-1");
      expect(result.eventResults).toHaveLength(1);
      expect(result.eventResults[0].action).toBe("created");
      expect(insertAnnouncementFn).toHaveBeenCalledWith(
        expect.objectContaining({
          drive_id: "drive-tcs-1",
          source: "outlook",
          content_hash: "outlook_msg_msg-outlook-tcs-1",
          verified: true, // confidence >= 0.85
        })
      );
    });
  });
});
