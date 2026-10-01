import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  fetchPlacementCalendarEvents,
  inferEventTypeFromTitle,
  normalizeGraphDateToUtc,
} from "./outlook-calendar-sync";
import * as clientModule from "./outlook-client";

describe("Outlook Calendar Synchronization", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("Event Type Inference", () => {
    it("infers event types accurately from title keywords", () => {
      expect(inferEventTypeFromTitle("Infosys PPT & Corporate Intro")).toBe("PRE_PLACEMENT_TALK");
      expect(inferEventTypeFromTitle("Amazon Online Aptitude Test")).toBe("APTITUDE_TEST");
      expect(inferEventTypeFromTitle("Goldman Sachs Coding Assessment")).toBe("CODING_ASSESSMENT");
      expect(inferEventTypeFromTitle("Google Technical Interview Round 1")).toBe("TECHNICAL_INTERVIEW");
      expect(inferEventTypeFromTitle("Deloitte HR & Managerial Interview")).toBe("HR_INTERVIEW");
      expect(inferEventTypeFromTitle("Registration Deadline - Microsoft SWE")).toBe("REGISTRATION_DEADLINE");
      expect(inferEventTypeFromTitle("General Briefing")).toBe("OTHER");
    });
  });

  describe("Timezone Normalization", () => {
    it("converts India Standard Time dateTime to exact UTC ISO", () => {
      // 10:00 AM IST = 04:30 AM UTC
      const utcIso = normalizeGraphDateToUtc(
        "2026-09-17T10:00:00",
        "India Standard Time"
      );
      expect(utcIso).toBe("2026-09-17T04:30:00.000Z");
    });

    it("preserves explicit ISO offsets if already provided in string", () => {
      const utcIso = normalizeGraphDateToUtc("2026-09-17T14:30:00+05:30");
      expect(utcIso).toBe("2026-09-17T09:00:00.000Z");
    });
  });

  describe("CalendarView Fetching & Mapping", () => {
    it("queries calendarView with explicit offset and maps dual IDs", async () => {
      const mockCalendarResponse = {
        value: [
          {
            id: "outlook-evt-001",
            iCalUId: "ical-uid-global-999",
            subject: "Siemens Technical Interview",
            start: {
              dateTime: "2026-09-18T10:00:00",
              timeZone: "India Standard Time",
            },
            end: {
              dateTime: "2026-09-18T11:00:00",
              timeZone: "India Standard Time",
            },
            location: { displayName: "Cabin 4" },
            onlineMeeting: { joinUrl: "https://teams.microsoft.com/meet/123" },
            bodyPreview: "Shortlisted candidates interview",
            isCancelled: false,
          },
        ],
      };

      const callSpy = vi
        .spyOn(clientModule, "callGraphApi")
        .mockResolvedValue(mockCalendarResponse);

      const events = await fetchPlacementCalendarEvents({
        mailboxId: "placement@klu.ac.in",
        startIsoWithOffset: "2026-09-17T00:00:00+05:30",
        endIsoWithOffset: "2026-10-17T23:59:59+05:30",
      });

      expect(callSpy).toHaveBeenCalledWith(
        expect.stringContaining("/calendarView?startDateTime=2026-09-17T00%3A00%3A00%2B05%3A30"),
        expect.objectContaining({
          headers: expect.objectContaining({
            Prefer: 'outlook.timezone="India Standard Time"',
          }),
        })
      );

      expect(events.length).toBe(1);
      const evt = events[0];
      expect(evt.outlookEventId).toBe("outlook-evt-001");
      expect(evt.icalUid).toBe("ical-uid-global-999");
      expect(evt.eventType).toBe("TECHNICAL_INTERVIEW");
      expect(evt.startTime).toBe("2026-09-18T04:30:00.000Z");
      expect(evt.endTime).toBe("2026-09-18T05:30:00.000Z");
      expect(evt.venue).toBe("Cabin 4");
      expect(evt.meetingUrl).toBe("https://teams.microsoft.com/meet/123");
      expect(evt.sourceVerified).toBe(true);
      expect(evt.dataVerified).toBe(true);
    });
  });
});
