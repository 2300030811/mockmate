import { SupabaseClient } from "@supabase/supabase-js";
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
  extractBlockerTags,
  inferPrimaryBlocker,
  inferRoleArchetype,
  normalizePrimaryBlocker,
  normalizeRoleArchetype,
} from "@/lib/career-ops/dimensions";
import { careerOpsRepository } from "@/lib/db/career-ops-repository";
import type {
  CreateCareerOpsApplicationInput,
  TransitionCareerOpsStatusInput,
  LogCareerOpsFollowUpInput,
  CareerOpsDbApplicationRow,
  ServiceResult,
} from "@/types/career-ops";

function compactText(value: string | null | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function normalizeMatchScore(value: number | null | undefined): number | null {
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  return Math.min(100, Math.max(0, Math.round(value)));
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

export const careerOpsService = {
  async getFollowUpCountForApplication(
    supabase: SupabaseClient,
    userId: string,
    applicationId: string
  ): Promise<number> {
    try {
      return await careerOpsRepository.getFollowUpCount(supabase, userId, applicationId);
    } catch (error: any) {
      logger.warn("[CareerOps] Could not count follow-ups for application.", error.message);
      return 0;
    }
  },

  async insertStatusEvent(supabase: SupabaseClient, params: {
    userId: string;
    applicationId: string;
    fromStatus: CareerOpsApplicationStatus | null;
    toStatus: CareerOpsApplicationStatus;
    note?: string;
  }): Promise<void> {
    try {
      await careerOpsRepository.insertStatusEvent(supabase, {
        applicationId: params.applicationId,
        userId: params.userId,
        fromStatus: params.fromStatus,
        toStatus: params.toStatus,
        note: compactText(params.note) || null,
      });
    } catch (error: any) {
      logger.warn("[CareerOps] Failed to insert application event.", error.message);
    }
  },

  async createApplication(
    supabase: SupabaseClient,
    userId: string,
    input: CreateCareerOpsApplicationInput
  ): Promise<ServiceResult<CareerOpsDbApplicationRow>> {
    const jobRole = compactText(input.jobRole);
    const company = compactText(input.company);
    const sourceUrl = compactText(input.sourceUrl) || null;
    const notes = compactText(input.notes) || null;
    const status = normalizeCareerOpsStatus(input.status);
    const roleArchetype = normalizeRoleArchetype(
      input.roleArchetype,
      inferRoleArchetype(jobRole)
    );
    const targetLevel = (compactText(input.targetLevel) || null)?.toLowerCase();
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

    try {
      const row = await careerOpsRepository.createApplication(supabase, {
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
      }) as unknown as CareerOpsDbApplicationRow;

      await this.insertStatusEvent(supabase, {
        userId,
        applicationId: row.id,
        fromStatus: null,
        toStatus: normalizeCareerOpsStatus(row.status),
        note: notes ? `Created tracker entry. ${notes}` : "Created tracker entry.",
      });

      return {
        success: true,
        data: row,
      };
    } catch (error: any) {
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
  },

  async addCareerPathToTracker(
    supabase: SupabaseClient,
    userId: string,
    input: CreateCareerOpsApplicationInput & { company?: string }
  ): Promise<ServiceResult<CareerOpsDbApplicationRow>> {
    const jobRole = compactText(input.jobRole);
    const company = compactText(input.company) || "General";

    let duplicateCheckData: CareerOpsDbApplicationRow | null = null;
    try {
      duplicateCheckData = await careerOpsRepository.findDuplicate(supabase, userId, jobRole, company) as CareerOpsDbApplicationRow | null;
    } catch (error: any) {
      if (!isMissingCareerOpsTableError(error)) {
        logger.warn("[CareerOps] Failed duplicate-check query.", error.message);
      }
    }

    if (duplicateCheckData) {
      const latest = duplicateCheckData;
      const createdMs = latest.updated_at ? new Date(latest.updated_at).getTime() : NaN; // latest row returns updated_at
      // Let's also check created_at. In findDuplicate query it selects created_at, let's type it as:
      const latestWithCreated = latest as CareerOpsDbApplicationRow & { created_at?: string };
      const createdTimeStr = latestWithCreated.created_at || latestWithCreated.updated_at;
      const createdMsParsed = createdTimeStr ? new Date(createdTimeStr).getTime() : NaN;
      const oneDayMs = 24 * 60 * 60 * 1000;
      if (!Number.isNaN(createdMsParsed) && Date.now() - createdMsParsed < oneDayMs) {
        return {
          success: true,
          data: latest,
        };
      }
    }

    return this.createApplication(supabase, userId, {
      ...input,
      jobRole,
      company,
      status: "evaluated",
    });
  },

  async transitionStatus(
    supabase: SupabaseClient,
    userId: string,
    input: TransitionCareerOpsStatusInput
  ): Promise<ServiceResult<CareerOpsDbApplicationRow>> {
    const applicationId = compactText(input.applicationId);
    if (!applicationId) {
      return { success: false, error: "Application id is required." };
    }

    let current: { status: string; applied_on: string | null } | null = null;
    try {
      current = await careerOpsRepository.getApplicationFields(supabase, applicationId, userId, "id, user_id, status, applied_on") as unknown as { status: string; applied_on: string | null } | null;
    } catch (currentError: any) {
      if (isMissingCareerOpsTableError(currentError)) {
        return {
          success: false,
          error: "Career tracker setup is pending. Run the latest database migration first.",
        };
      }
      return { success: false, error: "Tracked application was not found." };
    }

    if (!current) {
      return { success: false, error: "Tracked application was not found." };
    }

    const fromStatus = normalizeCareerOpsStatus(current.status);
    const toStatus = normalizeCareerOpsStatus(input.toStatus, fromStatus);
    const currentAppliedOn = current.applied_on;
    const followUpCount = await this.getFollowUpCountForApplication(supabase, userId, applicationId);
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

    try {
      const updated = await careerOpsRepository.updateApplication(supabase, applicationId, userId, updatePayload) as CareerOpsDbApplicationRow;

      await this.insertStatusEvent(supabase, {
        userId,
        applicationId,
        fromStatus,
        toStatus,
        note: compactText(input.note) || undefined,
      });

      return {
        success: true,
        data: updated,
      };
    } catch (updateError: any) {
      logger.error("[CareerOps] Failed status transition.", updateError?.message ?? "Unknown");
      return { success: false, error: updateError?.message ?? "Could not update status." };
    }
  },

  async logFollowUp(
    supabase: SupabaseClient,
    userId: string,
    input: LogCareerOpsFollowUpInput
  ): Promise<ServiceResult<{ applicationId: string }>> {
    const applicationId = compactText(input.applicationId);
    if (!applicationId) {
      return { success: false, error: "Application id is required." };
    }

    let application: { status: string } | null = null;
    try {
      application = await careerOpsRepository.getApplicationFields(supabase, applicationId, userId, "id, status") as unknown as { status: string } | null;
    } catch (applicationError: any) {
      if (isMissingCareerOpsTableError(applicationError)) {
        return {
          success: false,
          error: "Career tracker setup is pending. Run the latest database migration first.",
        };
      }
      return { success: false, error: "Tracked application was not found." };
    }

    if (!application) {
      return { success: false, error: "Tracked application was not found." };
    }

    const followedUpOn = coerceIsoDate(input.followedUpOn) ?? todayIsoDate();
    const channel = normalizeChannel(input.channel);
    const previousFollowUpCount = await this.getFollowUpCountForApplication(
      supabase,
      userId,
      applicationId
    );

    try {
      await careerOpsRepository.insertFollowUp(supabase, {
        applicationId,
        userId,
        channel,
        contactName: compactText(input.contactName) || null,
        contactEmail: compactText(input.contactEmail) || null,
        followedUpOn,
        notes: compactText(input.notes) || null,
      });
    } catch (followUpError: any) {
      logger.error("[CareerOps] Failed to log follow-up.", followUpError.message);
      return { success: false, error: followUpError.message };
    }

    const currentStatus = normalizeCareerOpsStatus(application.status);
    const nextFollowUpDate =
      coerceIsoDate(input.nextFollowUpDate) ??
      calculateCadenceNextFollowUpDate({
        status: currentStatus,
        followUpCount: previousFollowUpCount + 1,
        referenceIsoDate: followedUpOn,
      });

    try {
      await careerOpsRepository.updateApplicationNextFollowUpDate(supabase, applicationId, userId, nextFollowUpDate);
    } catch (appUpdateError: any) {
      logger.warn("[CareerOps] Follow-up logged but next date update failed.", appUpdateError.message);
    }

    await this.insertStatusEvent(supabase, {
      userId,
      applicationId,
      fromStatus: currentStatus,
      toStatus: currentStatus,
      note: `Follow-up logged via ${channel}. ${compactText(input.notes)}`.trim(),
    });

    return {
      success: true,
      data: { applicationId },
    };
  },

  async recomputeCadence(
    supabase: SupabaseClient,
    userId: string,
    limit: number = 200
  ): Promise<ServiceResult<{ updatedCount: number; skippedCount: number; failedCount: number }>> {
    const res = await recomputeCadenceForUser({ db: supabase, userId, limit });
    if (res.success && res.data) {
      return {
        success: true,
        data: {
          updatedCount: res.data.updatedCount,
          skippedCount: res.data.skippedCount,
          failedCount: res.data.failedCount,
        },
      };
    }
    return {
      success: false,
      error: res.error ?? "Failed to recompute cadence.",
      missingTable: res.missingTable,
    };
  }
};
