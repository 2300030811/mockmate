"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { logger } from "@/lib/logger";
import {
  CareerOpsApplicationStatus,
  normalizeCareerOpsStatus,
} from "@/lib/career-ops/status";
import {
  isMissingCareerOpsTableError,
} from "@/lib/career-ops/recompute";
import {
  buildCareerOpsTrackerSummary,
  CareerOpsApplicationSnapshot,
  emptyCareerOpsTrackerSummary,
} from "@/lib/career-ops/summary";
import {
  CareerOpsRecentActivityItem,
  CareerOpsTrackerSummary,
  CareerOpsApplicationItem,
} from "@/types/career-ops";
import { careerOpsRepository } from "@/lib/db/career-ops-repository";
import { careerOpsService } from "@/lib/services/career-ops-service";
import type { CareerOpsRoleArchetype, CareerOpsPrimaryBlocker } from "@/lib/career-ops/dimensions";
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
  company?: string;
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

export async function createCareerOpsApplication(
  input: CreateCareerOpsApplicationInput
): Promise<CareerOpsMutationResult<CareerOpsApplicationItem>> {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return { success: false, error: "Sign in to track applications." };
  }

  const supabase = createClient();
  const res = await careerOpsService.createApplication(supabase, userId, input as any);

  if (res.success && res.data) {
    revalidateCareerOpsSurfaces(userId);
    return {
      success: true,
      data: toApplicationItem(res.data as any),
    };
  }

  return { success: false, error: (res as any).error };
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

  const supabase = createClient();
  const res = await careerOpsService.addCareerPathToTracker(supabase, userId, input as any);

  if (res.success && res.data) {
    revalidateCareerOpsSurfaces(userId);
    return {
      success: true,
      data: toApplicationItem(res.data as any),
    };
  }

  return { success: false, error: (res as any).error };
}

export async function transitionCareerOpsStatus(
  input: TransitionCareerOpsStatusInput
): Promise<CareerOpsMutationResult<CareerOpsApplicationItem>> {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return { success: false, error: "Sign in to update tracker status." };
  }

  const supabase = createClient();
  const res = await careerOpsService.transitionStatus(supabase, userId, input);

  if (res.success && res.data) {
    revalidateCareerOpsSurfaces(userId);
    return {
      success: true,
      data: toApplicationItem(res.data as any),
    };
  }

  return { success: false, error: (res as any).error };
}

export async function logCareerOpsFollowUp(
  input: LogCareerOpsFollowUpInput
): Promise<CareerOpsMutationResult<{ applicationId: string }>> {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return { success: false, error: "Sign in to log follow-ups." };
  }

  const supabase = createClient();
  const res = await careerOpsService.logFollowUp(supabase, userId, input);

  if (res.success && res.data) {
    revalidateCareerOpsSurfaces(userId);
    return {
      success: true,
      data: res.data as { applicationId: string },
    };
  }

  return { success: false, error: (res as any).error };
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
  const recompute = await careerOpsService.recomputeCadence(supabase, userId, limit);

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
  try {
    const data = await careerOpsRepository.getTrackerData(supabase, userId, Math.max(1, Math.min(limit, 200)));

    const rows = (data as CareerOpsDbApplicationRow[] | null) ?? [];
    const summary = buildCareerOpsTrackerSummary(rows.map(toSummarySnapshot));

    return {
      summary,
      applications: rows.map(toApplicationItem),
    };
  } catch (error: any) {
    if (!isMissingCareerOpsTableError(error)) {
      logger.warn("[CareerOps] Failed to load tracker data.", error.message);
    }

    return {
      summary: emptyCareerOpsTrackerSummary(),
      applications: [],
    };
  }
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
  try {
    const data = await careerOpsRepository.getRecentFollowUps(supabase, userId, Math.max(1, Math.min(limit, 20)));

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
  } catch (error: any) {
    if (!isMissingCareerOpsTableError(error)) {
      logger.warn("[CareerOps] Failed to load follow-up activity.", error.message);
    }
    return [];
  }
}
