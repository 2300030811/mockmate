/**
 * Microsoft Graph Calendar Synchronization Service.
 * Queries calendarView using explicit Asia/Kolkata (+05:30) ISO offsets and Prefer timezone header.
 * Maps Exchange appointments to Placement Events with dual external identity (outlook_event_id + ical_uid).
 */

import { callGraphApi, GraphRequestOptions } from "./outlook-client";
import { PlacementEventType } from "@/types/placements";

export interface GraphDateTimeTimeZone {
  dateTime: string;
  timeZone: string;
}

export interface GraphCalendarEventItem {
  id: string;
  iCalUId?: string;
  subject?: string;
  bodyPreview?: string;
  start?: GraphDateTimeTimeZone;
  end?: GraphDateTimeTimeZone;
  location?: {
    displayName?: string;
  };
  onlineMeeting?: {
    joinUrl?: string;
  };
  isCancelled?: boolean;
}

export interface GraphCalendarViewResponse {
  value: GraphCalendarEventItem[];
  "@odata.nextLink"?: string;
}

export interface NormalizedCalendarEvent {
  outlookEventId: string;
  icalUid: string | null;
  title: string;
  eventType: PlacementEventType;
  startTime: string; // UTC ISO
  endTime: string | null; // UTC ISO
  venue: string | null;
  meetingUrl: string | null;
  description: string | null;
  isCancelled: boolean;
  sourceVerified: boolean;
  dataVerified: boolean;
}

/**
 * Infers PlacementEventType from calendar event title/subject.
 */
export function inferEventTypeFromTitle(title: string): PlacementEventType {
  const t = title.toLowerCase();
  if (t.includes("deadline") || t.includes("last date") || t.includes("registration close")) {
    return "REGISTRATION_DEADLINE";
  }
  if (t.includes("pre-placement") || t.includes("pre placement") || t.includes("ppt")) {
    return "PRE_PLACEMENT_TALK";
  }
  if (t.includes("coding") || t.includes("hackerrank") || t.includes("hackerearth")) {
    return "CODING_ASSESSMENT";
  }
  if (t.includes("aptitude") || t.includes("online test") || t.includes("oa round")) {
    return "APTITUDE_TEST";
  }
  if (t.includes("technical") || t.includes("tech interview") || t.includes("coding interview")) {
    return "TECHNICAL_INTERVIEW";
  }
  if (t.includes("hr") || t.includes("managerial") || t.includes("behavioral")) {
    return "HR_INTERVIEW";
  }
  if (t.includes("offer") || t.includes("results announced")) {
    return "OFFER_RELEASE";
  }
  return "OTHER";
}

/**
 * Converts Graph dateTime string to standardized UTC ISO string.
 */
export function normalizeGraphDateToUtc(
  dateTimeStr?: string,
  timeZoneStr?: string
): string | null {
  if (!dateTimeStr) return null;

  // Only treat a timestamp as offset-aware when the time portion
  // contains an explicit UTC designator or +/-HH:mm offset.
  const hasExplicitOffset = /(?:Z|[+-]\d{2}:\d{2})$/i.test(dateTimeStr);

  if (hasExplicitOffset) {
    const date = new Date(dateTimeStr);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  if (timeZoneStr === "India Standard Time") {
    const date = new Date(`${dateTimeStr}+05:30`);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  const date = new Date(dateTimeStr);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/**
 * Fetches placement calendar appointments within an explicit IST date range.
 */
export async function fetchPlacementCalendarEvents(params: {
  mailboxId: string;
  startIsoWithOffset: string; // e.g. "2026-09-17T00:00:00+05:30"
  endIsoWithOffset: string; // e.g. "2026-11-16T23:59:59+05:30"
  customOptions?: GraphRequestOptions;
}): Promise<NormalizedCalendarEvent[]> {
  const { mailboxId, startIsoWithOffset, endIsoWithOffset, customOptions } = params;

  const endpoint = `/users/${encodeURIComponent(
    mailboxId
  )}/calendarView?startDateTime=${encodeURIComponent(
    startIsoWithOffset
  )}&endDateTime=${encodeURIComponent(endIsoWithOffset)}&$top=100`;

  const response = await callGraphApi<GraphCalendarViewResponse>(endpoint, {
    ...customOptions,
    headers: {
      Prefer: 'outlook.timezone="India Standard Time"',
      ...(customOptions?.headers || {}),
    },
  });

  const normalizedList: NormalizedCalendarEvent[] = [];

  for (const item of response.value || []) {
    const title = item.subject || "Placement Event";
    const eventType = inferEventTypeFromTitle(title);
    const startTime = normalizeGraphDateToUtc(item.start?.dateTime, item.start?.timeZone);

    if (!startTime) continue; // skip events without a valid start time

    const endTime = normalizeGraphDateToUtc(item.end?.dateTime, item.end?.timeZone);

    normalizedList.push({
      outlookEventId: item.id,
      icalUid: item.iCalUId ?? null,
      title,
      eventType,
      startTime,
      endTime,
      venue: item.location?.displayName ?? null,
      meetingUrl: item.onlineMeeting?.joinUrl ?? null,
      description: item.bodyPreview ?? null,
      isCancelled: Boolean(item.isCancelled),
      sourceVerified: true, // Official placement mailbox
      dataVerified: true, // Calendar schedules are coordinator-confirmed
    });
  }

  return normalizedList;
}
