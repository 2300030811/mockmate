import { logger } from "@/lib/logger";
import { calculateCadenceNextFollowUpDate } from "@/lib/career-ops/cadence";
import {
  CareerOpsApplicationStatus,
  coerceIsoDate,
  normalizeCareerOpsStatus,
  todayIsoDate,
} from "@/lib/career-ops/status";

export const ACTIVE_CAREER_OPS_STATUSES: CareerOpsApplicationStatus[] = [
  "evaluated",
  "applied",
  "responded",
  "interview",
];

const DEFAULT_RECOMPUTE_LIMIT = 200;
const MIN_RECOMPUTE_LIMIT = 1;
const MAX_RECOMPUTE_LIMIT = 400;

export interface CareerOpsCadenceApplicationRow {
  id: string;
  user_id: string;
  status: string;
  next_follow_up_date: string | null;
  applied_on: string | null;
}

export interface CareerOpsCadenceFollowUpRow {
  application_id: string;
  followed_up_on: string;
}

export interface CareerOpsCadenceUpdateRow {
  applicationId: string;
  userId: string;
  currentDate: string | null;
  targetDate: string | null;
}

export interface CareerOpsCadenceRecomputeData {
  updatedCount: number;
  skippedCount: number;
  failedCount: number;
  processedCount: number;
}

export interface CareerOpsCadenceRecomputeResult {
  success: boolean;
  data?: CareerOpsCadenceRecomputeData;
  error?: string;
  missingTable?: boolean;
}

interface SupabaseLike {
  from: (table: string) => any;
}

function normalizeLimit(limit?: number): number {
  if (typeof limit !== "number" || Number.isNaN(limit)) {
    return DEFAULT_RECOMPUTE_LIMIT;
  }

  return Math.max(MIN_RECOMPUTE_LIMIT, Math.min(MAX_RECOMPUTE_LIMIT, Math.floor(limit)));
}

export function isMissingCareerOpsTableError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const maybeError = error as { code?: string; message?: string };
  const code = maybeError.code ?? "";
  const message = (maybeError.message ?? "").toLowerCase();

  return (
    code === "42P01" ||
    (message.includes("career_ops") &&
      (message.includes("does not exist") || message.includes("relation")))
  );
}

function buildFollowUpMetaMap(
  followUps: CareerOpsCadenceFollowUpRow[]
): Map<string, { count: number; lastFollowedUpOn: string | null }> {
  const meta = new Map<string, { count: number; lastFollowedUpOn: string | null }>();

  for (const followUp of followUps) {
    const current = meta.get(followUp.application_id) ?? { count: 0, lastFollowedUpOn: null };
    current.count += 1;

    if (!current.lastFollowedUpOn || followUp.followed_up_on > current.lastFollowedUpOn) {
      current.lastFollowedUpOn = followUp.followed_up_on;
    }

    meta.set(followUp.application_id, current);
  }

  return meta;
}

export function buildCadenceUpdateRows(
  applications: CareerOpsCadenceApplicationRow[],
  followUps: CareerOpsCadenceFollowUpRow[],
  referenceDate?: Date
): CareerOpsCadenceUpdateRow[] {
  const followUpMeta = buildFollowUpMetaMap(followUps);
  const fallbackReferenceIsoDate = todayIsoDate(referenceDate);

  return applications.map((application) => {
    const status = normalizeCareerOpsStatus(application.status);
    const meta = followUpMeta.get(application.id);
    const referenceIsoDate =
      meta?.lastFollowedUpOn ??
      coerceIsoDate(application.applied_on) ??
      fallbackReferenceIsoDate;

    const targetDate = calculateCadenceNextFollowUpDate({
      status,
      followUpCount: meta?.count ?? 0,
      referenceIsoDate,
    });

    return {
      applicationId: application.id,
      userId: application.user_id,
      currentDate: application.next_follow_up_date,
      targetDate,
    };
  });
}

function selectCadenceRowsToUpdate(rows: CareerOpsCadenceUpdateRow[]): CareerOpsCadenceUpdateRow[] {
  return rows.filter((row) => row.currentDate !== row.targetDate);
}

export async function recomputeCadenceForUser(params: {
  db: SupabaseLike;
  userId: string;
  limit?: number;
}): Promise<CareerOpsCadenceRecomputeResult> {
  const normalizedLimit = normalizeLimit(params.limit);

  const { data: applicationData, error: applicationsError } = await params.db
    .from("career_ops_applications")
    .select("id, user_id, status, next_follow_up_date, applied_on")
    .eq("user_id", params.userId)
    .in("status", ACTIVE_CAREER_OPS_STATUSES)
    .order("updated_at", { ascending: false })
    .limit(normalizedLimit);

  if (applicationsError) {
    return {
      success: false,
      missingTable: isMissingCareerOpsTableError(applicationsError),
      error: applicationsError.message,
    };
  }

  const applications = (applicationData as CareerOpsCadenceApplicationRow[] | null) ?? [];
  if (applications.length === 0) {
    return {
      success: true,
      data: {
        updatedCount: 0,
        skippedCount: 0,
        failedCount: 0,
        processedCount: 0,
      },
    };
  }

  const applicationIds = applications.map((row) => row.id);
  const { data: followUpData, error: followUpsError } = await params.db
    .from("career_ops_follow_ups")
    .select("application_id, followed_up_on")
    .eq("user_id", params.userId)
    .in("application_id", applicationIds)
    .order("followed_up_on", { ascending: false });

  if (followUpsError) {
    if (isMissingCareerOpsTableError(followUpsError)) {
      return {
        success: false,
        missingTable: true,
        error: followUpsError.message,
      };
    }

    logger.warn(
      "[CareerOps] Failed to fetch follow-ups during cadence recompute.",
      followUpsError.message
    );
  }

  const followUps = (followUpData as CareerOpsCadenceFollowUpRow[] | null) ?? [];
  const cadenceRows = buildCadenceUpdateRows(applications, followUps);
  const rowsToUpdate = selectCadenceRowsToUpdate(cadenceRows);
  const skippedCount = applications.length - rowsToUpdate.length;

  if (rowsToUpdate.length === 0) {
    return {
      success: true,
      data: {
        updatedCount: 0,
        skippedCount,
        failedCount: 0,
        processedCount: applications.length,
      },
    };
  }

  const settled = await Promise.allSettled(
    rowsToUpdate.map((row) =>
      params.db
        .from("career_ops_applications")
        .update({ next_follow_up_date: row.targetDate })
        .eq("id", row.applicationId)
        .eq("user_id", row.userId)
    )
  );

  let updatedCount = 0;
  let failedCount = 0;

  for (const result of settled) {
    if (result.status === "rejected") {
      failedCount += 1;
      continue;
    }

    if (result.value.error) {
      failedCount += 1;
      continue;
    }

    updatedCount += 1;
  }

  return {
    success: true,
    data: {
      updatedCount,
      skippedCount,
      failedCount,
      processedCount: applications.length,
    },
  };
}
