import {
  addDaysIsoDate,
  CareerOpsApplicationStatus,
  coerceIsoDate,
  isTerminalCareerOpsStatus,
  todayIsoDate,
} from "@/lib/career-ops/status";

export type FollowUpUrgencyLevel = "calm" | "upcoming" | "attention" | "critical";

const BASE_CADENCE_DAYS: Record<CareerOpsApplicationStatus, number> = {
  evaluated: 3,
  applied: 5,
  responded: 4,
  interview: 2,
  offer: 0,
  rejected: 0,
  discarded: 0,
  skip: 0,
};

function clampFollowUpCount(value: number | null | undefined): number {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  if (value < 0) return 0;
  return Math.floor(value);
}

function cadenceOffsetFromFollowUpCount(followUpCount: number): number {
  if (followUpCount <= 0) return 0;
  if (followUpCount === 1) return 1;
  if (followUpCount === 2) return 2;
  return 4;
}

export function cadenceDaysForStatus(
  status: CareerOpsApplicationStatus,
  followUpCount?: number | null
): number | null {
  if (isTerminalCareerOpsStatus(status)) return null;

  const baseDays = BASE_CADENCE_DAYS[status];
  const count = clampFollowUpCount(followUpCount);
  return baseDays + cadenceOffsetFromFollowUpCount(count);
}

export function calculateCadenceNextFollowUpDate(params: {
  status: CareerOpsApplicationStatus;
  followUpCount?: number | null;
  referenceIsoDate?: string | null;
  referenceDate?: Date;
}): string | null {
  const cadenceDays = cadenceDaysForStatus(params.status, params.followUpCount);
  if (cadenceDays == null) return null;

  const coercedReference = coerceIsoDate(params.referenceIsoDate);
  const referenceIso = coercedReference ?? todayIsoDate(params.referenceDate);
  return addDaysIsoDate(referenceIso, cadenceDays);
}

export function followUpUrgencyFromDate(
  nextFollowUpDate: string | null,
  referenceDate?: Date
): FollowUpUrgencyLevel {
  if (!nextFollowUpDate) return "calm";

  const dueDate = coerceIsoDate(nextFollowUpDate);
  if (!dueDate) return "calm";

  const today = todayIsoDate(referenceDate);
  if (dueDate < today) return "critical";
  if (dueDate === today) return "attention";

  const upcomingBoundary = addDaysIsoDate(today, 7);
  if (dueDate <= upcomingBoundary) return "upcoming";

  return "calm";
}
