/**
 * Outlook Drive & Event Identity Resolver.
 * Connects ingested email notices and calendar appointments into normalized MockMate placement entities.
 *
 * Implements strict event identity hierarchy:
 * 1. Match by external ID (outlook_event_id or ical_uid) -> Update stage
 * 2. Match by explicit rescheduling evidence -> Update candidate stage
 * 3. No match -> Create new stage (preserves separate morning/afternoon batches)
 *
 * Adheres to safety rules:
 * - Decouples source_verified (official mailbox) from data_verified (LLM / parser confidence).
 * - Deleting an Outlook message (@removed) NEVER deletes normalized placement records.
 */

import { SupabaseClient } from "@supabase/supabase-js";
import {
  ExtractedPlacementNotice,
  ExtractedPlacementEvent,
} from "./outlook-extractor";
import { NormalizedCalendarEvent } from "./outlook-calendar-sync";
import { PlacementDriveStatus } from "@/types/placements";

export interface DriveResolverResult {
  companyId: string;
  driveId: string;
  isNewDrive: boolean;
  eventResults: Array<{
    eventId: string;
    action: "created" | "updated";
    title: string;
  }>;
}

/**
 * Normalizes company name for deduplication.
 * ponytail: lowercase + non-alphanumeric strip.
 */
export function normalizeCompanyName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Resolves or creates a company row in placement_companies.
 */
export async function resolveCompany(
  db: SupabaseClient,
  companyName: string
): Promise<string> {
  const normalized = normalizeCompanyName(companyName);

  const existing = await db
    .from("placement_companies")
    .select("id")
    .eq("normalized_name", normalized)
    .maybeSingle();

  if (existing.data?.id) {
    return existing.data.id as string;
  }

  const inserted = await db
    .from("placement_companies")
    .insert({
      name: companyName.trim(),
      normalized_name: normalized,
    })
    .select("id")
    .single();

  if (inserted.error) {
    // If concurrent insert occurred, retry fetch
    const retry = await db
      .from("placement_companies")
      .select("id")
      .eq("normalized_name", normalized)
      .maybeSingle();
    if (retry.data?.id) return retry.data.id as string;
    throw inserted.error;
  }

  return inserted.data.id as string;
}

/**
 * Retrieves the currently active academic year ID.
 */
export async function getActiveAcademicYearId(
  db: SupabaseClient
): Promise<string> {
  const current = await db
    .from("placement_academic_years")
    .select("id")
    .eq("is_current", true)
    .order("year_label", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (current.data?.id) {
    return current.data.id as string;
  }

  // Fallback to any academic year
  const anyYear = await db
    .from("placement_academic_years")
    .select("id")
    .order("year_label", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (anyYear.data?.id) {
    return anyYear.data.id as string;
  }

  // Insert default 2025-26 if table is completely empty
  const created = await db
    .from("placement_academic_years")
    .insert({
      year_label: "2025-26",
      is_current: true,
    })
    .select("id")
    .single();

  if (created.error) throw created.error;
  return created.data.id as string;
}

/**
 * Resolves an existing active drive or creates a new one.
 */
export async function resolveDrive(
  db: SupabaseClient,
  params: {
    companyId: string;
    academicYearId: string;
    notice: ExtractedPlacementNotice;
  }
): Promise<{ driveId: string; isNewDrive: boolean }> {
  const { companyId, academicYearId, notice } = params;

  // Check for active drive for this company in this academic year
  const activeDrives = await db
    .from("placement_drives")
    .select("id, drive_status, package_min_lpa, package_max_lpa")
    .eq("company_id", companyId)
    .eq("academic_year_id", academicYearId)
    .in("drive_status", ["announced", "registration_open", "ongoing"])
    .order("created_at", { ascending: false })
    .limit(1);

  const existing = activeDrives.data?.[0];

  if (existing) {
    // If notice indicates cancellation, mark the drive cancelled
    if (notice.isCancellation) {
      await db
        .from("placement_drives")
        .update({
          drive_status: "cancelled",
          notes: notice.reschedulingDetails
            ? `Cancellation note: ${notice.reschedulingDetails}`
            : "Cancelled via official notice.",
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else if (notice.minLpa && !existing.package_min_lpa) {
      // Enrich with newly extracted compensation if previously missing
      await db
        .from("placement_drives")
        .update({
          package_min_lpa: notice.minLpa,
          package_max_lpa: notice.maxLpa,
          raw_package_text: notice.packageText,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    }
    return { driveId: existing.id as string, isNewDrive: false };
  }

  // Create new drive
  const driveStatus: PlacementDriveStatus = notice.isCancellation
    ? "cancelled"
    : "announced";

  const packageValues: number[] = [];
  if (notice.minLpa) packageValues.push(notice.minLpa);
  if (notice.maxLpa && notice.maxLpa !== notice.minLpa) {
    packageValues.push(notice.maxLpa);
  }

  const driveInsert = await db
    .from("placement_drives")
    .insert({
      company_id: companyId,
      academic_year_id: academicYearId,
      drive_name: `${notice.companyName} Campus Drive`,
      role_title: notice.roleTitle,
      drive_status: driveStatus,
      package_min_lpa: notice.minLpa,
      package_max_lpa: notice.maxLpa,
      package_values: packageValues,
      raw_package_text: notice.packageText,
      eligible_branches: notice.eligibleBranches,
      min_cgpa: notice.minCgpa ?? 6.0,
      source_type: "outlook_email",
      notes: notice.evidence.company
        ? `Sourced from official email: ${notice.evidence.company}`
        : null,
    })
    .select("id")
    .single();

  if (driveInsert.error) throw driveInsert.error;
  return { driveId: driveInsert.data.id as string, isNewDrive: true };
}

/**
 * Resolves a placement event according to the strict 3-tier hierarchy:
 * Tier 1: Match by external ID (outlook_event_id or ical_uid) -> Update stage
 * Tier 2: Match by explicit rescheduling evidence -> Update candidate stage
 * Tier 3: No match -> Create new stage (preserves distinct morning/afternoon batches)
 */
export async function resolvePlacementEvent(
  db: SupabaseClient,
  params: {
    driveId: string;
    candidate:
      | NormalizedCalendarEvent
      | (ExtractedPlacementEvent & {
          outlookEventId?: string | null;
          icalUid?: string | null;
          sourceVerified?: boolean;
          dataVerified?: boolean;
        });
    isRescheduling?: boolean;
  }
): Promise<{ eventId: string; action: "created" | "updated" }> {
  const { driveId, candidate, isRescheduling } = params;

  const outlookEventId =
    "outlookEventId" in candidate ? candidate.outlookEventId : null;
  const icalUid = "icalUid" in candidate ? candidate.icalUid : null;
  const sourceVerified = candidate.sourceVerified ?? true;
  const dataVerified = candidate.dataVerified ?? false;

  // ── Tier 1: Match by External ID ──
  if (outlookEventId || icalUid) {
    let matchedId: string | null = null;

    if (outlookEventId) {
      const res = await db
        .from("placement_events")
        .select("id")
        .eq("drive_id", driveId)
        .eq("outlook_event_id", outlookEventId)
        .limit(1)
        .maybeSingle();
      if (res.data?.id) {
        matchedId = res.data.id as string;
      }
    }

    if (!matchedId && icalUid) {
      const res = await db
        .from("placement_events")
        .select("id")
        .eq("drive_id", driveId)
        .eq("ical_uid", icalUid)
        .limit(1)
        .maybeSingle();
      if (res.data?.id) {
        matchedId = res.data.id as string;
      }
    }

    if (matchedId) {
      await db
        .from("placement_events")
        .update({
          title: candidate.title,
          start_time: candidate.startTime,
          end_time: candidate.endTime,
          venue: candidate.venue,
          meeting_url: candidate.meetingUrl,
          description: "description" in candidate ? candidate.description : null,
          source_verified: sourceVerified,
          data_verified: dataVerified,
        })
        .eq("id", matchedId);

      return { eventId: matchedId, action: "updated" };
    }
  }

  // ── Tier 2: Match by Explicit Rescheduling Evidence ──
  if (isRescheduling) {
    const candidateType = candidate.eventType;
    const existingSameType = await db
      .from("placement_events")
      .select("id, title, start_time")
      .eq("drive_id", driveId)
      .eq("event_type", candidateType)
      .order("start_time", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (existingSameType.data?.id) {
      const targetId = existingSameType.data.id as string;
      await db
        .from("placement_events")
        .update({
          start_time: candidate.startTime,
          end_time: candidate.endTime,
          venue: candidate.venue,
          meeting_url: candidate.meetingUrl,
          title: candidate.title,
          source_verified: sourceVerified,
          data_verified: dataVerified,
        })
        .eq("id", targetId);

      return { eventId: targetId, action: "updated" };
    }
  }

  // ── Tier 3: No Match -> Create New Stage ──
  // This ensures separate batches/slots (e.g. morning slot 9:30 vs afternoon slot 14:00)
  // are never collapsed into one.
  const inserted = await db
    .from("placement_events")
    .insert({
      drive_id: driveId,
      event_type: candidate.eventType,
      title: candidate.title,
      start_time: candidate.startTime,
      end_time: candidate.endTime,
      venue: candidate.venue,
      meeting_url: candidate.meetingUrl,
      description: "description" in candidate ? candidate.description : null,
      outlook_event_id: outlookEventId,
      ical_uid: icalUid,
      source_verified: sourceVerified,
      data_verified: dataVerified,
    })
    .select("id")
    .single();

  if (inserted.error) throw inserted.error;
  return { eventId: inserted.data.id as string, action: "created" };
}

/**
 * Handles @removed entries from Microsoft Graph delta sync.
 * Core Rule: Deleting an Outlook message NEVER deletes normalized placement records.
 * Records sync event/audit and preserves drives and events intact.
 */
export async function handleRemovedOutlookMessage(
  db: SupabaseClient,
  messageId: string,
  reason: string = "deleted"
): Promise<{ acknowledged: boolean; preserved: boolean }> {
  // Update any announcement associated with this message to mark source as archived/removed
  // but DO NOT DELETE the row or any linked drives.
  await db
    .from("placement_announcements")
    .update({
      importance: "archived",
      // ponytail: keeping raw_body intact for audit provenance
    })
    .eq("content_hash", `outlook_msg_${messageId}`);

  return { acknowledged: true, preserved: true };
}

/**
 * Orchestrates complete ingestion of an extracted placement email into
 * companies, drives, announcements, and events.
 */
export async function ingestPlacementEmailNotice(
  db: SupabaseClient,
  notice: ExtractedPlacementNotice,
  emailMeta: {
    messageId: string;
    subject: string;
    receivedDateTime: string;
    importance?: string;
  }
): Promise<DriveResolverResult> {
  const academicYearId = await getActiveAcademicYearId(db);
  const companyId = await resolveCompany(db, notice.companyName);

  const { driveId, isNewDrive } = await resolveDrive(db, {
    companyId,
    academicYearId,
    notice,
  });

  // Persist announcement with hash dedup
  const contentHash = `outlook_msg_${emailMeta.messageId}`;
  const existingAnnouncement = await db
    .from("placement_announcements")
    .select("id")
    .eq("content_hash", contentHash)
    .maybeSingle();

  if (!existingAnnouncement.data) {
    await db.from("placement_announcements").insert({
      drive_id: driveId,
      source: "outlook",
      subject: emailMeta.subject,
      raw_body: notice.rawSourceText,
      content_hash: contentHash,
      importance: emailMeta.importance || "normal",
      received_at: emailMeta.receivedDateTime,
      verified: notice.confidence >= 0.85,
    });
  }

  // Resolve associated events
  const eventResults: DriveResolverResult["eventResults"] = [];

  for (const ev of notice.events) {
    const res = await resolvePlacementEvent(db, {
      driveId,
      candidate: {
        ...ev,
        sourceVerified: true, // Came from official Outlook
        dataVerified: ev.confidence >= 0.9,
      },
      isRescheduling: notice.isRescheduling,
    });
    eventResults.push({
      eventId: res.eventId,
      action: res.action,
      title: ev.title,
    });
  }

  return {
    companyId,
    driveId,
    isNewDrive,
    eventResults,
  };
}
