"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { logger } from "@/lib/logger";
import {
  CareerOpsApplicationStatus,
  coerceIsoDate,
  normalizeCareerOpsStatus,
  todayIsoDate,
} from "@/lib/career-ops/status";
import { calculateCadenceNextFollowUpDate } from "@/lib/career-ops/cadence";
import {
  isMissingCareerOpsTableError,
  recomputeCadenceForUser,
} from "@/lib/career-ops/recompute";
import {
  buildCareerOpsTrackerSummary,
  CareerOpsApplicationSnapshot,
  emptyCareerOpsTrackerSummary,
} from "@/lib/career-ops/summary";
import {
  extractBlockerTags,
  inferPrimaryBlocker,
  inferRoleArchetype,
  normalizePrimaryBlocker,
  normalizeRoleArchetype,
  type CareerOpsPrimaryBlocker,
  type CareerOpsRoleArchetype,
} from "@/lib/career-ops/dimensions";
import type {
  CareerOpsApplicationItem,
  CareerOpsRecentActivityItem,
  CareerOpsTrackerSummary,
} from "@/types/career-ops";
import type { SkillGap } from "@/types/career";

interface CareerOpsMutationResult<T = undefined> {
  success: boolean;
  error?: string;
  data?: T;
}

interface CareerOpsDbApplicationRow {
  id: string;
  user_id: string;
  job_role: string;
  company: string;
  status: string;
  match_score: number | null;
  ats_score: number | null;
  next_follow_up_date: string | null;
  updated_at: string;
  applied_on: string | null;
  notes: string | null;
  role_archetype?: CareerOpsRoleArchetype | null;
  target_level?: string | null;
  primary_blocker?: CareerOpsPrimaryBlocker | null;
  blocker_tags?: string[] | null;
}

interface CareerOpsDbFollowUpRow {
  id: string;
  application_id: string;
  followed_up_on: string;
  channel: string;
  career_ops_applications:
    | {
        job_role: string;
        company: string;
        status: string;
      }
    | Array<{
        job_role: string;
        company: string;
        status: string;
      }>
    | null;
}

export interface CreateCareerOpsApplicationInput {
  jobRole: string;
  company: string;
  sourceUrl?: string;
  status?: string;
  matchScore?: number | null;
  atsScore?: number | null;
  notes?: string;
  nextFollowUpDate?: string | null;
  jobPostingId?: string | null;
  roleArchetype?: CareerOpsRoleArchetype | null;
  targetLevel?: string | null;
  primaryBlocker?: CareerOpsPrimaryBlocker | null;
  blockerTags?: string[];
  missingSkills?: SkillGap[];
}

export interface TransitionCareerOpsStatusInput {
  applicationId: string;
  toStatus: string;
  note?: string;
  nextFollowUpDate?: string | null;
}

export interface LogCareerOpsFollowUpInput {
  applicationId: string;
  channel?: string;
  contactName?: string;
  contactEmail?: string;
  notes?: string;
  followedUpOn?: string;
  nextFollowUpDate?: string | null;
}

function compactText(value: string | null | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function toApplicationItem(row: CareerOpsDbApplicationRow): CareerOpsApplicationItem {
  return {
    id: row.id,
    jobRole: row.job_role,
    company: row.company,
    status: normalizeCareerOpsStatus(row.status),
    matchScore: row.match_score,
    atsScore: row.ats_score ?? null,
    nextFollowUpDate: row.next_follow_up_date,
    updatedAt: row.updated_at,
    appliedOn: row.applied_on,
    roleArchetype: row.role_archetype ?? null,
    targetLevel: row.target_level ?? null,
    primaryBlocker: row.primary_blocker ?? null,
    blockerTags: row.blocker_tags ?? [],
  };
}

function toSummarySnapshot(row: CareerOpsDbApplicationRow): CareerOpsApplicationSnapshot {
  return {
    id: row.id,
    job_role: row.job_role,
    company: row.company,
    status: row.status,
    match_score: row.match_score,
    ats_score: row.ats_score ?? null,
    next_follow_up_date: row.next_follow_up_date,
    updated_at: row.updated_at,
    applied_on: row.applied_on,
    role_archetype: row.role_archetype ?? null,
    target_level: row.target_level ?? null,
    primary_blocker: row.primary_blocker ?? null,
    blocker_tags: row.blocker_tags ?? [],
  };
}

function normalizeMatchScore(value: number | null | undefined): number | null {
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  const clamped = Math.min(100, Math.max(0, Math.round(value)));
  return clamped;
}

function normalizeChannel(value: string | undefined): string {
  const channel = compactText(value).toLowerCase();
  return channel || "email";
}

function normalizeBlockerTags(tags: string[] | null | undefined): string[] {
  if (!Array.isArray(tags) || tags.length === 0) return [];

  const normalized = new Set<string>();
  for (const tag of tags) {
    const value = compactText(tag)
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

    if (!value) continue;
    normalized.add(value);
    if (normalized.size >= 12) break;
  }

  return Array.from(normalized);
}

async function getAuthenticatedUserId() {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user.id;
}

function revalidateCareerOpsSurfaces(userId: string) {
  revalidateTag(`dashboard-${userId}`);
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/career-path");
}

async function getFollowUpCountForApplication(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  applicationId: string
): Promise<number> {
  const { count, error } = await supabase
    .from("career_ops_follow_ups")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("application_id", applicationId);

  if (error) {
    logger.warn("[CareerOps] Could not count follow-ups for application.", error.message);
    return 0;
  }

  return count ?? 0;
}

async function insertStatusEvent(params: {
  userId: string;
  applicationId: string;
  fromStatus: CareerOpsApplicationStatus | null;
  toStatus: CareerOpsApplicationStatus;
  note?: string;
}) {
  const supabase = createClient();
  const { error } = await supabase.from("career_ops_application_events").insert({
    application_id: params.applicationId,
    user_id: params.userId,
    from_status: params.fromStatus,
    to_status: params.toStatus,
    note: compactText(params.note) || null,
  });

  if (error) {
    logger.warn("[CareerOps] Failed to insert application event.", error.message);
  }
}

export async function createCareerOpsApplication(
  input: CreateCareerOpsApplicationInput
): Promise<CareerOpsMutationResult<CareerOpsApplicationItem>> {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return { success: false, error: "Sign in to track applications." };
  }

  const jobRole = compactText(input.jobRole);
  const company = compactText(input.company);
  const sourceUrl = compactText(input.sourceUrl) || null;
  const notes = compactText(input.notes) || null;
  const status = normalizeCareerOpsStatus(input.status);
  const roleArchetype = normalizeRoleArchetype(
    input.roleArchetype,
    inferRoleArchetype(jobRole)
  );
  const targetLevel = compactText(input.targetLevel) || null;
  const primaryBlocker = normalizePrimaryBlocker(
    input.primaryBlocker,
    inferPrimaryBlocker({
      missingSkills: input.missingSkills,
      targetLevel,
    })
  );
  const blockerTags = normalizeBlockerTags(
    input.blockerTags && input.blockerTags.length > 0
      ? input.blockerTags
      : extractBlockerTags(input.missingSkills)
  );

  if (!jobRole || !company) {
    return { success: false, error: "Job role and company are required." };
  }

  const requestedDate = coerceIsoDate(input.nextFollowUpDate);
  const nextFollowUpDate =
    requestedDate ??
    calculateCadenceNextFollowUpDate({
      status,
      followUpCount: 0,
    });

  const supabase = createClient();
  const { data, error } = await supabase
    .from("career_ops_applications")
    .insert({
      user_id: userId,
      job_posting_id: input.jobPostingId ?? null,
      job_role: jobRole,
      company,
      source_url: sourceUrl,
      status,
      match_score: normalizeMatchScore(input.matchScore),
      ats_score: normalizeMatchScore(input.atsScore),
      notes,
      role_archetype: roleArchetype,
      target_level: targetLevel,
      primary_blocker: primaryBlocker,
      blocker_tags: blockerTags,
      next_follow_up_date: nextFollowUpDate,
      applied_on: status === "applied" ? todayIsoDate() : null,
    })
    .select(
      "id, user_id, job_role, company, status, match_score, next_follow_up_date, updated_at, applied_on, notes, role_archetype, target_level, primary_blocker, blocker_tags"
    )
    .single();

  if (error) {
    if (isMissingCareerOpsTableError(error)) {
      return {
        success: false,
        error: "Career tracker setup is pending. Run the latest database migration first.",
      };
    }

    if (error.code === "23505") {
      return {
        success: false,
        error: "This posting is already tracked for your account.",
      };
    }

    logger.error("[CareerOps] Failed to create application.", error.message);
    return { success: false, error: error.message };
  }

  const row = data as CareerOpsDbApplicationRow;
  await insertStatusEvent({
    userId,
    applicationId: row.id,
    fromStatus: null,
    toStatus: normalizeCareerOpsStatus(row.status),
    note: notes ? `Created tracker entry. ${notes}` : "Created tracker entry.",
  });

  revalidateCareerOpsSurfaces(userId);

  return {
    success: true,
    data: toApplicationItem(row),
  };
}

export async function addCareerPathToTracker(input: {
  jobRole: string;
  company?: string;
  matchScore?: number | null;
  atsScore?: number | null;
  sourceUrl?: string;
  notes?: string;
  roleArchetype?: CareerOpsRoleArchetype | null;
  targetLevel?: string | null;
  primaryBlocker?: CareerOpsPrimaryBlocker | null;
  blockerTags?: string[];
  missingSkills?: SkillGap[];
}): Promise<CareerOpsMutationResult<CareerOpsApplicationItem>> {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return { success: false, error: "Sign in to save this role in your tracker." };
  }

  const jobRole = compactText(input.jobRole);
  const company = compactText(input.company) || "General";

  const supabase = createClient();
  const duplicateCheck = await supabase
    .from("career_ops_applications")
    .select(
      "id, user_id, job_role, company, status, match_score, next_follow_up_date, updated_at, applied_on, notes, role_archetype, target_level, primary_blocker, blocker_tags, created_at"
    )
    .eq("user_id", userId)
    .eq("job_role", jobRole)
    .eq("company", company)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (duplicateCheck.error && !isMissingCareerOpsTableError(duplicateCheck.error)) {
    logger.warn("[CareerOps] Failed duplicate-check query.", duplicateCheck.error.message);
  }

  if (duplicateCheck.data) {
    const latest = duplicateCheck.data as CareerOpsDbApplicationRow & { created_at: string };
    const createdMs = new Date(latest.created_at).getTime();
    const oneDayMs = 24 * 60 * 60 * 1000;
    if (!Number.isNaN(createdMs) && Date.now() - createdMs < oneDayMs) {
      return {
        success: true,
        data: toApplicationItem(latest),
      };
    }
  }

  return createCareerOpsApplication({
    jobRole,
    company,
    sourceUrl: input.sourceUrl,
    matchScore: input.matchScore,
    atsScore: input.atsScore,
    notes: input.notes,
    roleArchetype: input.roleArchetype,
    targetLevel: input.targetLevel,
    primaryBlocker: input.primaryBlocker,
    blockerTags: input.blockerTags,
    missingSkills: input.missingSkills,
    status: "evaluated",
  });
}

export async function transitionCareerOpsStatus(
  input: TransitionCareerOpsStatusInput
): Promise<CareerOpsMutationResult<CareerOpsApplicationItem>> {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return { success: false, error: "Sign in to update tracker status." };
  }

  const applicationId = compactText(input.applicationId);
  if (!applicationId) {
    return { success: false, error: "Application id is required." };
  }

  const supabase = createClient();
  const { data: current, error: currentError } = await supabase
    .from("career_ops_applications")
    .select("id, user_id, status, applied_on")
    .eq("id", applicationId)
    .eq("user_id", userId)
    .single();

  if (currentError || !current) {
    if (isMissingCareerOpsTableError(currentError)) {
      return {
        success: false,
        error: "Career tracker setup is pending. Run the latest database migration first.",
      };
    }

    return { success: false, error: "Tracked application was not found." };
  }

  const fromStatus = normalizeCareerOpsStatus((current as { status: string }).status);
  const toStatus = normalizeCareerOpsStatus(input.toStatus, fromStatus);
  const currentAppliedOn = (current as { applied_on: string | null }).applied_on;
  const followUpCount = await getFollowUpCountForApplication(supabase, userId, applicationId);
  const requestedDate = coerceIsoDate(input.nextFollowUpDate);
  const nextFollowUpDate =
    requestedDate ??
    calculateCadenceNextFollowUpDate({
      status: toStatus,
      followUpCount,
      referenceIsoDate: currentAppliedOn,
    });

  const updatePayload: {
    status: CareerOpsApplicationStatus;
    next_follow_up_date: string | null;
    applied_on?: string;
  } = {
    status: toStatus,
    next_follow_up_date: nextFollowUpDate,
  };

  if (toStatus === "applied" && !currentAppliedOn) {
    updatePayload.applied_on = todayIsoDate();
  }

  const { data: updated, error: updateError } = await supabase
    .from("career_ops_applications")
    .update(updatePayload)
    .eq("id", applicationId)
    .eq("user_id", userId)
    .select(
      "id, user_id, job_role, company, status, match_score, ats_score, next_follow_up_date, updated_at, applied_on, notes, role_archetype, target_level, primary_blocker, blocker_tags"
    )
    .single();

  if (updateError || !updated) {
    logger.error("[CareerOps] Failed status transition.", updateError?.message ?? "Unknown");
    return { success: false, error: updateError?.message ?? "Could not update status." };
  }

  await insertStatusEvent({
    userId,
    applicationId,
    fromStatus,
    toStatus,
    note: compactText(input.note) || undefined,
  });

  revalidateCareerOpsSurfaces(userId);

  return {
    success: true,
    data: toApplicationItem(updated as CareerOpsDbApplicationRow),
  };
}

export async function logCareerOpsFollowUp(
  input: LogCareerOpsFollowUpInput
): Promise<CareerOpsMutationResult<{ applicationId: string }>> {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return { success: false, error: "Sign in to log follow-ups." };
  }

  const applicationId = compactText(input.applicationId);
  if (!applicationId) {
    return { success: false, error: "Application id is required." };
  }

  const supabase = createClient();
  const { data: application, error: applicationError } = await supabase
    .from("career_ops_applications")
    .select("id, status")
    .eq("id", applicationId)
    .eq("user_id", userId)
    .single();

  if (applicationError || !application) {
    if (isMissingCareerOpsTableError(applicationError)) {
      return {
        success: false,
        error: "Career tracker setup is pending. Run the latest database migration first.",
      };
    }

    return { success: false, error: "Tracked application was not found." };
  }

  const followedUpOn = coerceIsoDate(input.followedUpOn) ?? todayIsoDate();
  const channel = normalizeChannel(input.channel);
  const previousFollowUpCount = await getFollowUpCountForApplication(
    supabase,
    userId,
    applicationId
  );

  const { error: followUpError } = await supabase.from("career_ops_follow_ups").insert({
    application_id: applicationId,
    user_id: userId,
    channel,
    contact_name: compactText(input.contactName) || null,
    contact_email: compactText(input.contactEmail) || null,
    followed_up_on: followedUpOn,
    notes: compactText(input.notes) || null,
  });

  if (followUpError) {
    logger.error("[CareerOps] Failed to log follow-up.", followUpError.message);
    return { success: false, error: followUpError.message };
  }

  const currentStatus = normalizeCareerOpsStatus((application as { status: string }).status);
  const nextFollowUpDate =
    coerceIsoDate(input.nextFollowUpDate) ??
    calculateCadenceNextFollowUpDate({
      status: currentStatus,
      followUpCount: previousFollowUpCount + 1,
      referenceIsoDate: followedUpOn,
    });

  const { error: appUpdateError } = await supabase
    .from("career_ops_applications")
    .update({ next_follow_up_date: nextFollowUpDate })
    .eq("id", applicationId)
    .eq("user_id", userId);

  if (appUpdateError) {
    logger.warn("[CareerOps] Follow-up logged but next date update failed.", appUpdateError.message);
  }

  await insertStatusEvent({
    userId,
    applicationId,
    fromStatus: currentStatus,
    toStatus: currentStatus,
    note: `Follow-up logged via ${channel}. ${compactText(input.notes)}`.trim(),
  });

  revalidateCareerOpsSurfaces(userId);

  return {
    success: true,
    data: { applicationId },
  };
}

export async function recomputeCareerOpsCadence(
  limit: number = 200
): Promise<
  CareerOpsMutationResult<{ updatedCount: number; skippedCount: number; failedCount: number }>
> {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return { success: false, error: "Sign in to recompute cadence." };
  }

  const supabase = createClient();
  const recompute = await recomputeCadenceForUser({ db: supabase, userId, limit });

  if (!recompute.success) {
    if (recompute.missingTable) {
      return {
        success: false,
        error: "Career tracker setup is pending. Run the latest database migration first.",
      };
    }

    return { success: false, error: recompute.error ?? "Could not recompute cadence." };
  }

  const payload = recompute.data ?? {
    updatedCount: 0,
    skippedCount: 0,
    failedCount: 0,
    processedCount: 0,
  };

  if (payload.updatedCount > 0) {
    revalidateCareerOpsSurfaces(userId);
  }

  return {
    success: true,
    data: {
      updatedCount: payload.updatedCount,
      skippedCount: payload.skippedCount,
      failedCount: payload.failedCount,
    },
  };
}

export async function getCareerOpsTrackerData(limit: number = 30): Promise<{
  summary: CareerOpsTrackerSummary;
  applications: CareerOpsApplicationItem[];
}> {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return {
      summary: emptyCareerOpsTrackerSummary(),
      applications: [],
    };
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("career_ops_applications")
    .select(
      "id, user_id, job_role, company, status, match_score, ats_score, next_follow_up_date, updated_at, applied_on, notes, role_archetype, target_level, primary_blocker, blocker_tags"
    )
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(Math.max(1, Math.min(limit, 200)));

  if (error) {
    if (!isMissingCareerOpsTableError(error)) {
      logger.warn("[CareerOps] Failed to load tracker data.", error.message);
    }

    return {
      summary: emptyCareerOpsTrackerSummary(),
      applications: [],
    };
  }

  const rows = (data as CareerOpsDbApplicationRow[] | null) ?? [];
  const summary = buildCareerOpsTrackerSummary(rows.map(toSummarySnapshot));

  return {
    summary,
    applications: rows.map(toApplicationItem),
  };
}

export async function getRecentCareerOpsApplications(
  limit: number = 5
): Promise<CareerOpsApplicationItem[]> {
  const { applications } = await getCareerOpsTrackerData(limit);
  return applications;
}

export async function getRecentCareerOpsFollowUps(
  limit: number = 5
): Promise<CareerOpsRecentActivityItem[]> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return [];

  const supabase = createClient();
  const { data, error } = await supabase
    .from("career_ops_follow_ups")
    .select(
      "id, application_id, followed_up_on, channel, career_ops_applications!inner(job_role, company, status)"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(Math.max(1, Math.min(limit, 20)));

  if (error) {
    if (!isMissingCareerOpsTableError(error)) {
      logger.warn("[CareerOps] Failed to load follow-up activity.", error.message);
    }
    return [];
  }

  const rows = (data as CareerOpsDbFollowUpRow[] | null) ?? [];
  return rows
    .map((row) => {
      const application = Array.isArray(row.career_ops_applications)
        ? row.career_ops_applications[0] ?? null
        : row.career_ops_applications;

      return {
        id: row.id,
        applicationId: row.application_id,
        jobRole: application?.job_role ?? "Unknown Role",
        company: application?.company ?? "Unknown Company",
        status: normalizeCareerOpsStatus(application?.status ?? "evaluated"),
        followedUpOn: row.followed_up_on,
        channel: row.channel,
      };
    });
}
