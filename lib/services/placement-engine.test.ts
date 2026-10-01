import { describe, it, expect } from "vitest";
import {
  getISTDateString,
  getISTDayDifference,
  classifyEventTiming,
  classifyDeadlineUrgency,
  partitionTimelineByStatus,
  groupEventsByDrive,
  calculateEventProgress,
} from "./placement-engine";
import { PlacementTimelineItem } from "@/types/placements";

describe("Placement Engine Domain Service", () => {
  // Fixed simulated current instant: 17 September 2026 at 11:00:00 AM IST (05:30:00 UTC)
  const now = new Date("2026-09-17T05:30:00.000Z");

  describe("Timezone & Calendar Day Partitioning", () => {
    it("converts instants to Asia/Kolkata date strings reliably", () => {
      expect(getISTDateString(now)).toBe("2026-09-17");

      // 00:00:00 UTC is 05:30:00 IST on Sept 17
      const utcMidnight = new Date("2026-09-17T00:00:00.000Z");
      expect(getISTDateString(utcMidnight)).toBe("2026-09-17");

      // 18:29:59 UTC on Sept 16 is 23:59:59 IST on Sept 16
      const sept16Night = new Date("2026-09-16T18:29:59.000Z");
      expect(getISTDateString(sept16Night)).toBe("2026-09-16");

      // 18:30:00 UTC on Sept 16 is 00:00:00 IST on Sept 17
      const sept17Morning = new Date("2026-09-16T18:30:00.000Z");
      expect(getISTDateString(sept17Morning)).toBe("2026-09-17");
    });

    it("classifies 23:59:59.999 IST as today", () => {
      const todayLastMillisecond = "2026-09-17T23:59:59.999+05:30";
      const result = classifyEventTiming(todayLastMillisecond, now);
      expect(result.timing).toBe("today");
      expect(result.isPastToday).toBe(false);
    });

    it("classifies 00:00:00.000 IST next day as upcoming, never today", () => {
      const tomorrowMidnight = "2026-09-18T00:00:00.000+05:30";
      const result = classifyEventTiming(tomorrowMidnight, now);
      expect(result.timing).toBe("upcoming");
      expect(result.isPastToday).toBe(false);
    });

    it("identifies events that took place earlier today", () => {
      const earlierToday = "2026-09-17T09:00:00.000+05:30";
      const result = classifyEventTiming(earlierToday, now);
      expect(result.timing).toBe("today");
      expect(result.isPastToday).toBe(true);
    });

    it("classifies yesterday as past", () => {
      const yesterday = "2026-09-16T15:00:00.000+05:30";
      const result = classifyEventTiming(yesterday, now);
      expect(result.timing).toBe("past");
      expect(result.isPastToday).toBe(true);
    });
  });

  describe("Deadline Urgency Classifier", () => {
    it("flags past deadlines as closed", () => {
      const pastDeadline = "2026-09-17T08:00:00.000+05:30"; // earlier today
      const result = classifyDeadlineUrgency(pastDeadline, now);
      expect(result.status).toBe("past");
      expect(result.label).toBe("Closed");
    });

    it("flags deadlines closing later today with exact hours and minutes", () => {
      // 11:00 AM now -> deadline at 04:42 PM (16:42) today = 5h 42m left
      const todayDeadline = "2026-09-17T16:42:00.000+05:30";
      const result = classifyDeadlineUrgency(todayDeadline, now);
      expect(result.status).toBe("due_today");
      expect(result.hoursRemaining).toBe(5);
      expect(result.minutesRemaining).toBe(42);
      expect(result.label).toBe("5h 42m left");
    });

    it("flags deadline at 23:59:59.999 IST as due_today", () => {
      const midnightDeadline = "2026-09-17T23:59:59.999+05:30";
      const result = classifyDeadlineUrgency(midnightDeadline, now);
      expect(result.status).toBe("due_today");
      expect(result.hoursRemaining).toBe(12);
      expect(result.label).toContain("left");
    });

    it("flags tomorrow's deadline as '1 day left'", () => {
      const tomorrowDeadline = "2026-09-18T14:00:00.000+05:30";
      const result = classifyDeadlineUrgency(tomorrowDeadline, now);
      expect(result.status).toBe("due_soon");
      expect(result.daysRemaining).toBe(1);
      expect(result.label).toBe("1 day left");
    });

    it("flags deadlines within +7 calendar days as due_soon", () => {
      // 17 Sep + 7 days = 24 Sep
      const day7Deadline = "2026-09-24T18:00:00.000+05:30";
      const result = classifyDeadlineUrgency(day7Deadline, now);
      expect(result.status).toBe("due_soon");
      expect(result.daysRemaining).toBe(7);
      expect(result.label).toBe("7 days left");
    });

    it("flags deadlines beyond 7 calendar days as future", () => {
      // 17 Sep + 8 days = 25 Sep
      const day8Deadline = "2026-09-25T10:00:00.000+05:30";
      const result = classifyDeadlineUrgency(day8Deadline, now);
      expect(result.status).toBe("future");
      expect(result.daysRemaining).toBe(8);
      expect(result.label).toBe("8 days left");
    });
  });

  describe("Status-Aware Partitioning & Cancellation", () => {
    const mockCompany = { id: "c1", name: "Deloitte" };
    const baseEvent = {
      id: "e1",
      drive_id: "d1",
      event_type: "CODING_ASSESSMENT" as const,
      title: "Online Assessment",
      start_time: "2026-09-17T14:00:00.000+05:30",
      venue: "Lab 3",
      description: null,
    };

    it("partitions items by status without deleting cancelled items", () => {
      const items: PlacementTimelineItem[] = [
        {
          event: { ...baseEvent, id: "e1" },
          drive: { id: "d1", drive_name: "Active Drive", drive_status: "ongoing" },
          company: mockCompany,
        },
        {
          event: { ...baseEvent, id: "e2" },
          drive: { id: "d2", drive_name: "Cancelled Drive", drive_status: "cancelled" },
          company: mockCompany,
        },
        {
          event: { ...baseEvent, id: "e3" },
          drive: { id: "d3", drive_name: "Past Drive", drive_status: "completed" },
          company: mockCompany,
        },
      ];

      const { active, cancelled, completed } = partitionTimelineByStatus(items);

      expect(active.length).toBe(1);
      expect(active[0].drive.id).toBe("d1");

      expect(cancelled.length).toBe(1);
      expect(cancelled[0].drive.id).toBe("d2");

      expect(completed.length).toBe(1);
      expect(completed[0].drive.id).toBe("d3");
    });
  });

  describe("Multi-Stage Grouping & Ordering", () => {
    const mockCompany = { id: "c1", name: "TCS" };
    const drive = {
      id: "drive-tcs",
      drive_name: "TCS Digital",
      drive_status: "ongoing" as const,
      package_max_lpa: 9,
    };

    it("groups multiple stages for the same drive and sorts them chronologically", () => {
      // Provide events intentionally OUT OF ORDER
      const items: PlacementTimelineItem[] = [
        {
          event: {
            id: "evt-3",
            drive_id: "drive-tcs",
            event_type: "TECHNICAL_INTERVIEW",
            title: "Technical Interview",
            start_time: "2026-09-17T17:00:00.000+05:30",
            end_time: "2026-09-17T18:00:00.000+05:30",
            venue: "Interview Cabin 4",
            description: null,
          },
          drive,
          company: mockCompany,
        },
        {
          event: {
            id: "evt-1",
            drive_id: "drive-tcs",
            event_type: "PRE_PLACEMENT_TALK",
            title: "Pre-Placement Talk",
            start_time: "2026-09-17T09:30:00.000+05:30",
            end_time: "2026-09-17T10:30:00.000+05:30",
            venue: "Auditorium",
            description: null,
          },
          drive,
          company: mockCompany,
        },
        {
          event: {
            id: "evt-2",
            drive_id: "drive-tcs",
            event_type: "CODING_ASSESSMENT",
            title: "Coding Assessment",
            start_time: "2026-09-17T14:00:00.000+05:30",
            end_time: "2026-09-17T16:00:00.000+05:30",
            venue: "CS Labs",
            description: null,
          },
          drive,
          company: mockCompany,
        },
      ];

      const groups = groupEventsByDrive(items, now);

      expect(groups.length).toBe(1);
      const group = groups[0];
      expect(group.companyName).toBe("TCS");
      expect(group.stages.length).toBe(3);

      // Verify chronological ordering
      expect(group.stages[0].title).toBe("Pre-Placement Talk");
      expect(group.stages[1].title).toBe("Coding Assessment");
      expect(group.stages[2].title).toBe("Technical Interview");

      // Verify stage statuses relative to now (11:00 AM):
      // 09:30-10:30 PPT should be completed
      expect(group.stages[0].isCompleted).toBe(true);
      // 14:00 Coding test should not be completed
      expect(group.stages[1].isCompleted).toBe(false);
    });

    it("flags cancelled drives in the grouped schedule", () => {
      const items: PlacementTimelineItem[] = [
        {
          event: {
            id: "evt-c1",
            drive_id: "drive-cancelled",
            event_type: "APTITUDE_TEST",
            title: "Aptitude Test",
            start_time: "2026-09-17T14:00:00.000+05:30",
            venue: "Online",
            description: null,
          },
          drive: { ...drive, id: "drive-cancelled", drive_status: "cancelled" },
          company: mockCompany,
        },
      ];

      const groups = groupEventsByDrive(items, now);
      expect(groups[0].isCancelled).toBe(true);
    });
  });

  describe("Bad Data Resilience", () => {
    const mockCompany = { id: "c1", name: "Acme Corp" };
    const drive = { id: "d-bad", drive_name: "Acme Drive", drive_status: "ongoing" as const };

    it("gracefully handles end_time < start_time without crashing", () => {
      const items: PlacementTimelineItem[] = [
        {
          event: {
            id: "evt-inverted",
            drive_id: "d-bad",
            event_type: "CODING_ASSESSMENT",
            title: "Corrupted End Time Event",
            start_time: "2026-09-17T14:00:00.000+05:30",
            end_time: "2026-09-17T12:00:00.000+05:30", // earlier than start!
            venue: "Room 101",
            description: null,
          },
          drive,
          company: mockCompany,
        },
      ];

      expect(() => groupEventsByDrive(items, now)).not.toThrow();
      const groups = groupEventsByDrive(items, now);
      expect(groups[0].stages[0].endTime).toBeNull();
    });

    it("deduplicates identical event IDs gracefully", () => {
      const duplicateItem: PlacementTimelineItem = {
        event: {
          id: "duplicate-id-1",
          drive_id: "d-bad",
          event_type: "APTITUDE_TEST",
          title: "Test 1",
          start_time: "2026-09-17T15:00:00.000+05:30",
          venue: null,
          description: null,
        },
        drive,
        company: mockCompany,
      };

      const items = [duplicateItem, duplicateItem];
      const groups = groupEventsByDrive(items, now);
      expect(groups[0].stages.length).toBe(1);
    });

    it("performs stable tie-breaking when two events share the exact same start time", () => {
      const items: PlacementTimelineItem[] = [
        {
          event: {
            id: "evt-z",
            drive_id: "d-bad",
            event_type: "TECHNICAL_INTERVIEW",
            title: "Zulu Interview",
            start_time: "2026-09-17T15:00:00.000+05:30",
            venue: null,
            description: null,
          },
          drive,
          company: mockCompany,
        },
        {
          event: {
            id: "evt-a",
            drive_id: "d-bad",
            event_type: "CODING_ASSESSMENT",
            title: "Alpha Coding",
            start_time: "2026-09-17T15:00:00.000+05:30",
            venue: null,
            description: null,
          },
          drive,
          company: mockCompany,
        },
      ];

      const groups = groupEventsByDrive(items, now);
      expect(groups[0].stages[0].title).toBe("Alpha Coding");
      expect(groups[0].stages[1].title).toBe("Zulu Interview");
    });

    it("deduplicates identical cross-channel events with different IDs (Outlook + Telegram)", () => {
      // Same drive, same event_type, same start_time, same title, but different synthetic IDs from two sources
      const outlookEvent: PlacementTimelineItem = {
        event: {
          id: "evt-outlook-101",
          drive_id: "d-bad",
          event_type: "PRE_PLACEMENT_TALK",
          title: "Pre-Placement Talk",
          start_time: "2026-09-17T10:00:00.000+05:30",
          venue: "Auditorium",
          description: "Outlook announcement",
        },
        drive,
        company: mockCompany,
      };

      const telegramEvent: PlacementTimelineItem = {
        event: {
          id: "evt-telegram-999",
          drive_id: "d-bad",
          event_type: "PRE_PLACEMENT_TALK",
          title: "  pre-placement talk  ", // whitespace & casing variation
          start_time: "2026-09-17T10:00:00.000+05:30",
          venue: "Auditorium",
          description: "Telegram broadcast",
        },
        drive,
        company: mockCompany,
      };

      const groups = groupEventsByDrive([outlookEvent, telegramEvent], now);
      expect(groups[0].stages.length).toBe(1);
      expect(groups[0].stages[0].id).toBe("evt-outlook-101");
    });
  });

  describe("Event Lifecycle Progress Semantics", () => {
    // Current simulated instant: 17 September 2026 at 11:00:00 AM IST
    const simNow = new Date("2026-09-17T05:30:00.000Z");

    it("marks events starting in the future as scheduled (○)", () => {
      const futureStart = "2026-09-17T14:00:00.000+05:30";
      const futureEnd = "2026-09-17T16:00:00.000+05:30";

      const res = calculateEventProgress(futureStart, futureEnd, simNow);
      expect(res.progressStatus).toBe("scheduled");
      expect(res.isCompleted).toBe(false);
      expect(res.isCurrent).toBe(false);
    });

    it("marks currently running events within start and end time as in_progress (•)", () => {
      // 10:30 AM to 11:30 AM (simNow is 11:00 AM)
      const runningStart = "2026-09-17T10:30:00.000+05:30";
      const runningEnd = "2026-09-17T11:30:00.000+05:30";

      const res = calculateEventProgress(runningStart, runningEnd, simNow);
      expect(res.progressStatus).toBe("in_progress");
      expect(res.isCompleted).toBe(false);
      expect(res.isCurrent).toBe(true);
    });

    it("marks events with valid elapsed end times as completed (✓)", () => {
      // 09:00 AM to 10:30 AM (simNow is 11:00 AM)
      const pastStart = "2026-09-17T09:00:00.000+05:30";
      const pastEnd = "2026-09-17T10:30:00.000+05:30";

      const res = calculateEventProgress(pastStart, pastEnd, simNow);
      expect(res.progressStatus).toBe("completed");
      expect(res.isCompleted).toBe(true);
      expect(res.isCurrent).toBe(false);
    });

    it("keeps event in_progress when end_time is missing and event has started", () => {
      // Started at 10:00 AM, simNow is 11:00 AM, NO end_time supplied
      const startedNoEnd = "2026-09-17T10:00:00.000+05:30";

      const res = calculateEventProgress(startedNoEnd, null, simNow);
      // Per rule: once started without end time, stays in_progress; never prematurely completed
      expect(res.progressStatus).toBe("in_progress");
      expect(res.isCompleted).toBe(false);
      expect(res.isCurrent).toBe(true);
    });

    it("keeps event in_progress when end_time is corrupted (end < start)", () => {
      const corruptedStart = "2026-09-17T10:00:00.000+05:30";
      const corruptedEnd = "2026-09-17T08:00:00.000+05:30";

      const res = calculateEventProgress(corruptedStart, corruptedEnd, simNow);
      expect(res.progressStatus).toBe("in_progress");
      expect(res.isCompleted).toBe(false);
      expect(res.isCurrent).toBe(true);
    });
  });

  describe("Historical Drive Categorization (Completed vs Active vs Cancelled)", () => {
    it("preserves completed drives as historical rather than discarding them", () => {
      const mockCompany = { id: "c1", name: "Google" };
      const items: PlacementTimelineItem[] = [
        {
          event: {
            id: "e-active",
            drive_id: "d-active",
            event_type: "CODING_ASSESSMENT",
            title: "Coding Round",
            start_time: "2026-09-17T14:00:00.000+05:30",
            venue: null,
            description: null,
          },
          drive: { id: "d-active", drive_name: "Google 2026", drive_status: "ongoing" },
          company: mockCompany,
        },
        {
          event: {
            id: "e-hist",
            drive_id: "d-hist",
            event_type: "OFFER_RELEASE",
            title: "Offers Announced",
            start_time: "2026-09-10T17:00:00.000+05:30",
            venue: null,
            description: null,
          },
          drive: { id: "d-hist", drive_name: "Google 2025", drive_status: "completed" },
          company: mockCompany,
        },
        {
          event: {
            id: "e-canc",
            drive_id: "d-canc",
            event_type: "APTITUDE_TEST",
            title: "Aptitude Round",
            start_time: "2026-09-17T16:00:00.000+05:30",
            venue: null,
            description: null,
          },
          drive: { id: "d-canc", drive_name: "Cancelled Drive", drive_status: "cancelled" },
          company: mockCompany,
        },
      ];

      const { active, cancelled, historical, completed } = partitionTimelineByStatus(items);

      expect(active.length).toBe(1);
      expect(active[0].drive.id).toBe("d-active");

      expect(cancelled.length).toBe(1);
      expect(cancelled[0].drive.id).toBe("d-canc");

      expect(historical.length).toBe(1);
      expect(historical[0].drive.id).toBe("d-hist");
      // backward compatibility check
      expect(completed).toEqual(historical);
    });
  });

  describe("Multi-Stage Full Recruitment Funnel", () => {
    it("correctly models a complete 5-stage recruitment funnel", () => {
      const drive = {
        id: "drive-funnel",
        drive_name: "Microsoft SWE",
        drive_status: "ongoing" as const,
      };
      const company = { id: "c-ms", name: "Microsoft" };

      // PPT (09:00 - 10:00) -> completed
      // Aptitude (10:30 - 11:30) -> in_progress (now is 11:00)
      // Coding (14:00 - 16:00) -> scheduled
      // Technical (16:30 - 17:30) -> scheduled
      // HR (18:00 - 18:30) -> scheduled
      const items: PlacementTimelineItem[] = [
        {
          event: {
            id: "s5",
            drive_id: "drive-funnel",
            event_type: "HR_INTERVIEW",
            title: "HR Interview",
            start_time: "2026-09-17T18:00:00.000+05:30",
            end_time: "2026-09-17T18:30:00.000+05:30",
            venue: null,
            description: null,
          },
          drive,
          company,
        },
        {
          event: {
            id: "s1",
            drive_id: "drive-funnel",
            event_type: "PRE_PLACEMENT_TALK",
            title: "Pre-Placement Talk",
            start_time: "2026-09-17T09:00:00.000+05:30",
            end_time: "2026-09-17T10:00:00.000+05:30",
            venue: "Auditorium",
            description: null,
          },
          drive,
          company,
        },
        {
          event: {
            id: "s3",
            drive_id: "drive-funnel",
            event_type: "CODING_ASSESSMENT",
            title: "Coding Assessment",
            start_time: "2026-09-17T14:00:00.000+05:30",
            end_time: "2026-09-17T16:00:00.000+05:30",
            venue: "Lab 2",
            description: null,
          },
          drive,
          company,
        },
        {
          event: {
            id: "s2",
            drive_id: "drive-funnel",
            event_type: "APTITUDE_TEST",
            title: "Aptitude Test",
            start_time: "2026-09-17T10:30:00.000+05:30",
            end_time: "2026-09-17T11:30:00.000+05:30",
            venue: "Online",
            description: null,
          },
          drive,
          company,
        },
        {
          event: {
            id: "s4",
            drive_id: "drive-funnel",
            event_type: "TECHNICAL_INTERVIEW",
            title: "Technical Interview",
            start_time: "2026-09-17T16:30:00.000+05:30",
            end_time: "2026-09-17T17:30:00.000+05:30",
            venue: "Cabin 3",
            description: null,
          },
          drive,
          company,
        },
      ];

      const groups = groupEventsByDrive(items, now);
      expect(groups.length).toBe(1);
      const stages = groups[0].stages;
      expect(stages.length).toBe(5);

      // Verify strict chronological ordering:
      expect(stages[0].eventType).toBe("PRE_PLACEMENT_TALK");
      expect(stages[1].eventType).toBe("APTITUDE_TEST");
      expect(stages[2].eventType).toBe("CODING_ASSESSMENT");
      expect(stages[3].eventType).toBe("TECHNICAL_INTERVIEW");
      expect(stages[4].eventType).toBe("HR_INTERVIEW");

      // Verify lifecycle statuses relative to now (11:00 AM IST):
      expect(stages[0].progressStatus).toBe("completed");
      expect(stages[1].progressStatus).toBe("in_progress");
      expect(stages[2].progressStatus).toBe("scheduled");
      expect(stages[3].progressStatus).toBe("scheduled");
      expect(stages[4].progressStatus).toBe("scheduled");
    });
  });
});
