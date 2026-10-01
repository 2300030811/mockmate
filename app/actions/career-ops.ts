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
  CreateCareerOpsApplicationInput,
  TransitionCareerOpsStatusInput,
  LogCareerOpsFollowUpInput,
  CareerOpsDbApplicationRow,
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
  const res = await careerOpsService.createApplication(supabase, userId, input);

  if (res.success && res.data) {
    revalidateCareerOpsSurfaces(userId);
    return {
      success: true,
      data: toApplicationItem(res.data),
    };
  }

  return { success: false, error: res.success === false ? res.error : undefined };
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
  const res = await careerOpsService.addCareerPathToTracker(supabase, userId, input);

  if (res.success && res.data) {
    revalidateCareerOpsSurfaces(userId);
    return {
      success: true,
      data: toApplicationItem(res.data),
    };
  }

  return { success: false, error: res.success === false ? res.error : undefined };
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
      data: toApplicationItem(res.data),
    };
  }

  return { success: false, error: res.success === false ? res.error : undefined };
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
      data: res.data,
    };
  }

  return { success: false, error: res.success === false ? res.error : undefined };
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

  const payload = recompute.data;

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

export async function runTacticalJobEvaluation(input: {
  jobTitle: string;
  company: string;
  jobDescription?: string;
  candidateResumeText?: string;
  yearsOfExperience?: number;
}): Promise<CareerOpsMutationResult<any>> {
  try {
    const { evaluateJobTactically } = await import("@/lib/career-ops/evaluator");
    const result = await evaluateJobTactically(input);
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("[CareerOps] Failed to run tactical job evaluation", error.message);
    return { success: false, error: error.message || "Failed to evaluate job" };
  }
}

export async function getDiscoveredJobRadarPostings(limit: number = 20) {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from("career_ops_job_postings")
      .select("id, company, title, location, source, external_url, posting_status, metadata, last_seen_at")
      .eq("posting_status", "active")
      .order("last_seen_at", { ascending: false })
      .limit(limit);

    if (error) {
      if (!isMissingCareerOpsTableError(error)) {
        logger.warn("[CareerOps] Failed to load job radar postings", error.message);
      }
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      company: row.company,
      title: row.title,
      location: row.location || "Remote / Unspecified",
      source: row.source,
      url: row.external_url,
      postingStatus: row.posting_status,
      gateNotes: row.gate_notes ?? row.metadata?.gate_reason ?? null,
      isSenior: row.metadata?.is_senior ?? false,
      description: row.metadata?.description || "",
      lastSeenAt: row.last_seen_at,
    }));
  } catch (error: any) {
    logger.warn("[CareerOps] Unexpected error loading radar postings", error.message);
    return [];
  }
}

export async function triggerManualRadarScan(): Promise<CareerOpsMutationResult<{ found: number; newJobs: number }>> {
  try {
    const { createAdminClient } = await import("@/utils/supabase/admin");
    const { scanCompany, dedupeScannedJobs } = await import("@/lib/services/scanner");
    const adminDb = createAdminClient();

    const targets = (await careerOpsRepository.loadScanTargets(adminDb)) as Array<{
      name: string;
      api_type: any;
      api_url: string;
    }>;

    if (!targets || targets.length === 0) {
      return { success: true, data: { found: 0, newJobs: 0 } };
    }

    const scanStartTime = new Date().toISOString();
    const discoveredJobs: any[] = [];
    const successfulCompanies: string[] = [];

    const scanChunk = targets.slice(0, 5);
    const results = await Promise.allSettled(
      scanChunk.map((t) =>
        scanCompany({
          name: t.name,
          apiType: t.api_type,
          apiUrl: t.api_url,
        })
      )
    );

    results.forEach((res, idx) => {
      if (res.status === "fulfilled") {
        discoveredJobs.push(...res.value);
        if (scanChunk[idx]?.name) {
          successfulCompanies.push(scanChunk[idx].name);
        }
      }
    });

    const deduped = dedupeScannedJobs(discoveredJobs);
    const urls = [...new Set(deduped.map((j) => j.url))];
    const fingerprints = [...new Set(deduped.map((j) => j.fingerprint))];

    const { urls: existingUrls, fingerprints: existingFingerprints } =
      await careerOpsRepository.fetchExistingPostings(adminDb, urls, fingerprints);

    const existingUrlSet = new Set(existingUrls.map((u) => u.external_url));
    const existingFingerprintSet = new Set(existingFingerprints.map((f) => f.job_fingerprint));

    const freshJobs = deduped.filter(
      (job) => !existingUrlSet.has(job.url) && !existingFingerprintSet.has(job.fingerprint)
    );

    if (freshJobs.length > 0) {
      const rows = freshJobs.map((job) => ({
        external_url: job.url,
        source: job.source,
        source_job_id: job.sourceJobId,
        company: job.company,
        title: job.title,
        location: job.location || null,
        normalized_company: job.normalizedCompany,
        normalized_title: job.normalizedTitle,
        job_fingerprint: job.fingerprint,
        posting_status: "active",
        last_seen_at: new Date().toISOString(),
        metadata: {
          is_senior: job.isSenior ?? false,
          gate_reason: job.gateReason ?? null,
          description: job.description || null,
          posted_at: job.postedAt || null,
        },
      }));
      await careerOpsRepository.upsertJobPostings(adminDb, rows);
    }

    if (successfulCompanies.length > 0) {
      try {
        await careerOpsRepository.markStaleCompanyPostingsExpired(
          adminDb,
          successfulCompanies,
          scanStartTime
        );
      } catch (err: any) {
        logger.warn("[CareerOps] Failed to mark stale company postings expired", err.message);
      }
    }

    revalidatePath("/dashboard");
    return { success: true, data: { found: discoveredJobs.length, newJobs: freshJobs.length } };
  } catch (error: any) {
    logger.error("[CareerOps] Failed to run manual radar scan", error.message);
    return { success: false, error: error.message || "Manual scan failed" };
  }
}

