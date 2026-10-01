/**
 * Pure domain service for Placement Hub timeline, deadline urgency, and multi-stage grouping.
 * Deterministic: zero side effects, no Date.now(), no database or network dependencies.
 * All functions accept an injectable `now: Date`.
 */

import { PlacementTimelineItem, PlacementEventType, PlacementDriveStatus } from "@/types/placements";

export const PLACEMENT_TIMEZONE = "Asia/Kolkata";

export type EventProgressStatus = "scheduled" | "in_progress" | "completed";

export interface DeadlineUrgency {
  status: "past" | "due_today" | "due_soon" | "future";
  hoursRemaining?: number;
  minutesRemaining?: number;
  daysRemaining?: number;
  label: string;
}

export interface EventStage {
  id: string;
  eventType: PlacementEventType;
  title: string;
  startTime: string;
  endTime: string | null;
  venue: string | null;
  isCompleted: boolean;
  isCurrent: boolean;
  progressStatus: EventProgressStatus;
  sourceVerified?: boolean;
  dataVerified?: boolean;
}

export interface GroupedDriveSchedule {
  driveId: string;
  driveName: string;
  companyId: string;
  companyName: string;
  companyLogoUrl: string | null;
  roleTitle: string | null;
  driveStatus: PlacementDriveStatus;
  isCancelled: boolean;
  packageText: string | null;
  sourceType?: string;
  sourceVerified?: boolean;
  dataVerified?: boolean;
  stages: EventStage[];
  earliestStartTime: string;
}

/**
 * Calculates event lifecycle progress based strictly on start_time, end_time, and now.
 *
 * Explicit rules:
 * - Before start_time -> 'scheduled'
 * - When end_time is valid:
 *   - start_time <= now <= end_time -> 'in_progress'
 *   - now > end_time -> 'completed'
 * - When end_time is missing or invalid (end_time < start_time):
 *   - at/after start_time -> 'in_progress' (stays in progress; never prematurely marked completed)
 */
export function calculateEventProgress(
  startTimeIso: string,
  endTimeIso: string | null | undefined,
  now: Date
): {
  progressStatus: EventProgressStatus;
  isCompleted: boolean;
  isCurrent: boolean;
} {
  const startMs = new Date(startTimeIso).getTime();
  const nowMs = now.getTime();

  if (isNaN(startMs)) {
    return { progressStatus: "scheduled", isCompleted: false, isCurrent: false };
  }

  if (nowMs < startMs) {
    return { progressStatus: "scheduled", isCompleted: false, isCurrent: false };
  }

  const endMs = endTimeIso ? new Date(endTimeIso).getTime() : NaN;
  const hasValidEndTime = !isNaN(endMs) && endMs >= startMs;

  if (!hasValidEndTime) {
    // Missing or invalid end time: once started, remains in_progress
    return { progressStatus: "in_progress", isCompleted: false, isCurrent: true };
  }

  if (nowMs <= endMs) {
    return { progressStatus: "in_progress", isCompleted: false, isCurrent: true };
  } else {
    return { progressStatus: "completed", isCompleted: true, isCurrent: false };
  }
}

/**
 * Formats a Date into YYYY-MM-DD strictly according to Asia/Kolkata timezone.
 */
export function getISTDateString(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: PLACEMENT_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/**
 * Calculates calendar day difference (dateStr1 - dateStr2) between two YYYY-MM-DD strings.
 */
export function getISTDayDifference(dateStr1: string, dateStr2: string): number {
  const [y1, m1, d1] = dateStr1.split("-").map(Number);
  const [y2, m2, d2] = dateStr2.split("-").map(Number);
  const utc1 = Date.UTC(y1, m1 - 1, d1);
  const utc2 = Date.UTC(y2, m2 - 1, d2);
  return Math.round((utc1 - utc2) / (1000 * 60 * 60 * 24));
}

/**
 * Classifies an event's timing relative to `now` using Asia/Kolkata calendar boundaries.
 */
export function classifyEventTiming(
  eventStartTime: string,
  now: Date
): { timing: "today" | "upcoming" | "past"; isPastToday: boolean } {
  const eventDate = new Date(eventStartTime);
  const eventDateIST = getISTDateString(eventDate);
  const todayDateIST = getISTDateString(now);

  if (eventDateIST === todayDateIST) {
    const isPastToday = eventDate.getTime() < now.getTime();
    return { timing: "today", isPastToday };
  } else if (eventDateIST > todayDateIST) {
    return { timing: "upcoming", isPastToday: false };
  } else {
    return { timing: "past", isPastToday: true };
  }
}

/**
 * Classifies deadline urgency based on calendar day difference and remaining time in IST.
 */
export function classifyDeadlineUrgency(
  deadlineTime: string,
  now: Date
): DeadlineUrgency {
  const deadlineDate = new Date(deadlineTime);
  const timeDiffMs = deadlineDate.getTime() - now.getTime();

  if (timeDiffMs < 0) {
    return { status: "past", label: "Closed" };
  }

  const deadlineDateIST = getISTDateString(deadlineDate);
  const todayDateIST = getISTDateString(now);

  if (deadlineDateIST === todayDateIST) {
    const totalMinutes = Math.floor(timeDiffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    const label =
      hours > 0 ? `${hours}h ${minutes}m left` : `${minutes}m left`;

    return {
      status: "due_today",
      hoursRemaining: hours,
      minutesRemaining: minutes,
      label,
    };
  }

  const daysDiff = getISTDayDifference(deadlineDateIST, todayDateIST);

  if (daysDiff === 1) {
    return {
      status: "due_soon",
      daysRemaining: 1,
      label: "1 day left",
    };
  } else if (daysDiff >= 2 && daysDiff <= 7) {
    return {
      status: "due_soon",
      daysRemaining: daysDiff,
      label: `${daysDiff} days left`,
    };
  } else if (daysDiff > 7) {
    return {
      status: "future",
      daysRemaining: daysDiff,
      label: `${daysDiff} days left`,
    };
  } else {
    return { status: "past", label: "Closed" };
  }
}

/**
 * Categorizes timeline items by drive status: active, cancelled, or historical (completed).
 * Does NOT delete cancelled events; separates them so UI can display CANCELLED badge.
 * Historical completed drives are preserved for company history, analytics, and timeline review.
 */
export function partitionTimelineByStatus(items: PlacementTimelineItem[]): {
  active: PlacementTimelineItem[];
  cancelled: PlacementTimelineItem[];
  historical: PlacementTimelineItem[];
  completed: PlacementTimelineItem[];
} {
  const active: PlacementTimelineItem[] = [];
  const cancelled: PlacementTimelineItem[] = [];
  const historical: PlacementTimelineItem[] = [];

  for (const item of items) {
    const status = item.drive.drive_status || item.drive.driveStatus || "announced";
    if (status === "cancelled") {
      cancelled.push(item);
    } else if (status === "completed") {
      historical.push(item);
    } else {
      active.push(item);
    }
  }

  return { active, cancelled, historical, completed: historical };
}

/**
 * Groups timeline items by drive, sorts stages chronologically,
 * and handles bad data (duplicate IDs, duplicate cross-channel events, inverted end times).
 */
export function groupEventsByDrive(
  items: PlacementTimelineItem[],
  now: Date
): GroupedDriveSchedule[] {
  // 1. Deduplicate by event id AND content fingerprint (driveId + eventType + startTime + title)
  const seenEventIds = new Set<string>();
  const seenContentKeys = new Set<string>();
  const dedupedItems: PlacementTimelineItem[] = [];

  for (const item of items) {
    if (item.event.id && seenEventIds.has(item.event.id)) {
      continue;
    }

    const driveId = item.drive.id || "unknown";
    const eventType = item.event.event_type || item.event.eventType || "";
    const startTime = item.event.start_time || item.event.startTime || "";
    const titleKey = (item.event.title || "").trim().toLowerCase();
    const contentKey = `${driveId}|${eventType}|${startTime}|${titleKey}`;

    if (seenContentKeys.has(contentKey)) {
      continue;
    }

    if (item.event.id) seenEventIds.add(item.event.id);
    seenContentKeys.add(contentKey);
    dedupedItems.push(item);
  }

  // 2. Group by drive id
  const groupsMap = new Map<string, PlacementTimelineItem[]>();
  for (const item of dedupedItems) {
    const driveId = item.drive.id || "unknown";
    if (!groupsMap.has(driveId)) {
      groupsMap.set(driveId, []);
    }
    groupsMap.get(driveId)!.push(item);
  }

  const result: GroupedDriveSchedule[] = [];

  for (const [driveId, driveItems] of groupsMap.entries()) {
    // Sort items chronologically by start_time (or startTime), breaking ties by title
    driveItems.sort((a, b) => {
      const timeA = new Date(a.event.start_time || a.event.startTime || 0).getTime();
      const timeB = new Date(b.event.start_time || b.event.startTime || 0).getTime();
      if (timeA !== timeB) return timeA - timeB;
      return (a.event.title || "").localeCompare(b.event.title || "");
    });

    const first = driveItems[0];
    const driveName = first.drive.drive_name || first.drive.driveName || "Placement Drive";
    const companyName = first.company.name || driveName;
    const companyId = first.company.id || "";
    const companyLogoUrl = first.company.logo_url ?? first.company.logoUrl ?? null;
    const roleTitle = first.drive.role_title ?? first.drive.roleTitle ?? null;
    const driveStatus = first.drive.drive_status || first.drive.driveStatus || "announced";
    const isCancelled = driveStatus === "cancelled";
    const packageText =
      first.drive.raw_package_text ??
      first.drive.rawPackageText ??
      (first.drive.package_max_lpa ? `${first.drive.package_max_lpa} LPA` : null);

    const stages: EventStage[] = driveItems.map((item) => {
      const startTime = item.event.start_time || item.event.startTime || "";
      let endTime = item.event.end_time ?? item.event.endTime ?? null;

      // Handle bad data: end_time < start_time
      if (endTime && startTime && new Date(endTime).getTime() < new Date(startTime).getTime()) {
        endTime = null; // Invalidate impossible end time gracefully without throwing
      }

      const { progressStatus, isCompleted, isCurrent } = calculateEventProgress(
        startTime,
        endTime,
        now
      );

      const sourceVerified = item.event.source_verified ?? item.event.sourceVerified ?? true;
      const dataVerified = item.event.data_verified ?? item.event.dataVerified ?? false;

      return {
        id: item.event.id,
        eventType: item.event.event_type || item.event.eventType,
        title: item.event.title,
        startTime,
        endTime,
        venue: item.event.venue,
        isCompleted,
        isCurrent,
        progressStatus,
        sourceVerified,
        dataVerified,
      };
    });

    const earliestStartTime = stages[0]?.startTime || "";
    const hasAnyVerifiedSource = stages.some((s) => s.sourceVerified);
    const allStagesDataVerified = stages.length > 0 && stages.every((s) => s.dataVerified);

    result.push({
      driveId,
      driveName,
      companyId,
      companyName,
      companyLogoUrl,
      roleTitle,
      driveStatus,
      isCancelled,
      packageText,
      sourceVerified: hasAnyVerifiedSource,
      dataVerified: allStagesDataVerified,
      stages,
      earliestStartTime,
    });
  }

  // Sort groups by earliest stage start time
  result.sort((a, b) => {
    return new Date(a.earliestStartTime).getTime() - new Date(b.earliestStartTime).getTime();
  });

  return result;
}
