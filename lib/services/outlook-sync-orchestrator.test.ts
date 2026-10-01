import { describe, it, expect, vi, beforeEach } from "vitest";
import { runOutlookPlacementSync } from "./outlook-sync-orchestrator";

// Mock dependencies
vi.mock("./outlook-email-sync", () => ({
  syncPlacementEmailsDelta: vi.fn(),
}));

vi.mock("./outlook-calendar-sync", () => ({
  fetchPlacementCalendarEvents: vi.fn(),
}));

vi.mock("./outlook-extractor", () => ({
  parsePlacementNotice: vi.fn(),
  extractAttachmentPdfText: vi.fn(),
}));

vi.mock("./outlook-drive-resolver", () => ({
  ingestPlacementEmailNotice: vi.fn(),
  resolvePlacementEvent: vi.fn(),
  handleRemovedOutlookMessage: vi.fn(),
  resolveCompany: vi.fn(),
  resolveDrive: vi.fn(),
  getActiveAcademicYearId: vi.fn(),
}));

vi.mock("./outlook-sync-state", () => ({
  outlookSyncStateRepository: {
    getSyncState: vi.fn(),
    recordSyncSuccess: vi.fn(),
    recordSyncFailure: vi.fn(),
    invalidateDeltaLink: vi.fn(),
  },
}));

vi.mock("./outlook-client", () => ({
  callGraphApi: vi.fn(),
}));

import { syncPlacementEmailsDelta } from "./outlook-email-sync";
import { fetchPlacementCalendarEvents } from "./outlook-calendar-sync";
import { parsePlacementNotice } from "./outlook-extractor";
import {
  ingestPlacementEmailNotice,
  handleRemovedOutlookMessage,
  resolveCompany,
  resolveDrive,
  resolvePlacementEvent,
  getActiveAcademicYearId,
} from "./outlook-drive-resolver";
import { outlookSyncStateRepository } from "./outlook-sync-state";

describe("Outlook Placement Sync Orchestrator", () => {
  let mockDb: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDb = {};

    vi.mocked(outlookSyncStateRepository.getSyncState).mockResolvedValue({
      id: "state-1",
      source: "outlook_email",
      mailbox_id: "placement@klu.ac.in",
      delta_link: "https://graph.microsoft.com/v1.0/delta-old",
      retry_count: 0,
      consecutive_failure_count: 0,
    } as any);

    vi.mocked(getActiveAcademicYearId).mockResolvedValue("ay-1");
    vi.mocked(resolveCompany).mockResolvedValue("comp-1");
    vi.mocked(resolveDrive).mockResolvedValue({ driveId: "drive-1", isNewDrive: false });
    vi.mocked(resolvePlacementEvent).mockResolvedValue({ eventId: "evt-1", action: "created" });
  });

  it("processes new messages and removed items cleanly", async () => {
    vi.mocked(syncPlacementEmailsDelta).mockResolvedValue({
      newOrUpdatedMessages: [
        {
          id: "msg-1",
          subject: "Amazon Drive Announcement",
          bodyPreview: "Amazon is visiting campus for SDE role",
          receivedDateTime: "2026-09-17T08:00:00Z",
          hasAttachments: false,
        },
      ],
      removedMessageIds: ["msg-old-cancelled"],
      newDeltaLink: "https://graph.microsoft.com/v1.0/delta-new",
      resyncRequired: false,
    });

    vi.mocked(parsePlacementNotice).mockReturnValue({
      companyName: "Amazon",
      roleTitle: "SDE-1",
      packageText: "28 LPA",
      minLpa: 28,
      maxLpa: 28,
      eligibleBranches: ["CSE"],
      minCgpa: 8.0,
      confidence: 0.95,
      evidence: { company: "Amazon" },
      isRescheduling: false,
      isCancellation: false,
      reschedulingDetails: null,
      events: [],
      rawSourceText: "Notice",
    });

    vi.mocked(fetchPlacementCalendarEvents).mockResolvedValue([]);

    const result = await runOutlookPlacementSync(mockDb, {
      mailboxId: "placement@klu.ac.in",
    });

    expect(result.success).toBe(true);
    expect(result.processedEmails).toBe(1);
    expect(result.removedEmails).toBe(1);
    expect(ingestPlacementEmailNotice).toHaveBeenCalledTimes(1);
    expect(handleRemovedOutlookMessage).toHaveBeenCalledWith(
      mockDb,
      "msg-old-cancelled",
      "deleted"
    );
    expect(outlookSyncStateRepository.recordSyncSuccess).toHaveBeenCalledWith(
      mockDb,
      expect.objectContaining({
        source: "outlook_email",
        deltaLink: "https://graph.microsoft.com/v1.0/delta-new",
        lastProcessedMessageId: "msg-1",
      })
    );
  });

  it("recovers from 410 Gone / expired delta link by invalidating and doing fresh sync", async () => {
    vi.mocked(syncPlacementEmailsDelta)
      .mockResolvedValueOnce({
        newOrUpdatedMessages: [],
        removedMessageIds: [],
        newDeltaLink: null,
        resyncRequired: true, // 410 Gone detected!
      })
      .mockResolvedValueOnce({
        newOrUpdatedMessages: [
          {
            id: "msg-fresh-1",
            subject: "Fresh Drive",
            hasAttachments: false,
          },
        ],
        removedMessageIds: [],
        newDeltaLink: "https://graph.microsoft.com/v1.0/delta-fresh",
        resyncRequired: false,
      });

    vi.mocked(parsePlacementNotice).mockReturnValue({
      companyName: "Infosys",
      roleTitle: "Specialist Programmer",
      packageText: "9.5 LPA",
      minLpa: 9.5,
      maxLpa: 9.5,
      eligibleBranches: ["CSE"],
      minCgpa: 7.0,
      confidence: 0.9,
      evidence: {},
      isRescheduling: false,
      isCancellation: false,
      reschedulingDetails: null,
      events: [],
      rawSourceText: "Fresh notice",
    });

    vi.mocked(fetchPlacementCalendarEvents).mockResolvedValue([]);

    const result = await runOutlookPlacementSync(mockDb, {
      mailboxId: "placement@klu.ac.in",
    });

    expect(result.success).toBe(true);
    expect(result.processedEmails).toBe(1);
    expect(outlookSyncStateRepository.invalidateDeltaLink).toHaveBeenCalledWith(
      mockDb,
      "outlook_email"
    );
    expect(syncPlacementEmailsDelta).toHaveBeenCalledTimes(2);
  });

  it("syncs calendar appointments into placement events", async () => {
    vi.mocked(syncPlacementEmailsDelta).mockResolvedValue({
      newOrUpdatedMessages: [],
      removedMessageIds: [],
      newDeltaLink: "delta-link",
      resyncRequired: false,
    });

    vi.mocked(fetchPlacementCalendarEvents).mockResolvedValue([
      {
        outlookEventId: "cal-evt-1",
        icalUid: "ical-1",
        title: "Microsoft - Technical Round 1",
        eventType: "TECHNICAL_INTERVIEW",
        startTime: "2026-09-18T04:30:00Z",
        endTime: "2026-09-18T05:30:00Z",
        venue: "Lab 2",
        meetingUrl: null,
        description: "Technical Round",
        isCancelled: false,
        sourceVerified: true,
        dataVerified: true,
      },
    ]);

    const result = await runOutlookPlacementSync(mockDb, {
      mailboxId: "placement@klu.ac.in",
    });

    expect(result.success).toBe(true);
    expect(result.syncedCalendarEvents).toBe(1);
    expect(resolvePlacementEvent).toHaveBeenCalledWith(
      mockDb,
      expect.objectContaining({
        driveId: "drive-1",
        candidate: expect.objectContaining({
          outlookEventId: "cal-evt-1",
          eventType: "TECHNICAL_INTERVIEW",
        }),
      })
    );
    expect(outlookSyncStateRepository.recordSyncSuccess).toHaveBeenCalledWith(
      mockDb,
      expect.objectContaining({
        source: "outlook_calendar",
        lastProcessedEventId: "cal-evt-1",
      })
    );
  });
});
