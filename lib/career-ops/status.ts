export const CAREER_OPS_STATUSES = [
  "evaluated",
  "applied",
  "responded",
  "interview",
  "offer",
  "rejected",
  "discarded",
  "skip",
] as const;

export type CareerOpsApplicationStatus = (typeof CAREER_OPS_STATUSES)[number];

const CAREER_OPS_STATUS_SET = new Set<string>(CAREER_OPS_STATUSES);
const TERMINAL_STATUSES = new Set<CareerOpsApplicationStatus>([
  "offer",
  "rejected",
  "discarded",
  "skip",
]);

const STATUS_ALIASES: Record<string, CareerOpsApplicationStatus> = {
  applied_now: "applied",
  application_sent: "applied",
  replied: "responded",
  response: "responded",
  interviewing: "interview",
  screening: "interview",
  phone_screen: "interview",
  onsite: "interview",
  final_round: "interview",
  accepted: "offer",
  hired: "offer",
  declined: "discarded",
  archived: "discarded",
  ignored: "skip",
  skipped: "skip",
};

export function isCareerOpsStatus(value: string): value is CareerOpsApplicationStatus {
  return CAREER_OPS_STATUS_SET.has(value);
}

function normalizeStatusKey(value: string): string {
  return value.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

export function normalizeCareerOpsStatus(
  value: string | null | undefined,
  fallback: CareerOpsApplicationStatus = "evaluated"
): CareerOpsApplicationStatus {
  if (!value) return fallback;

  const key = normalizeStatusKey(value);
  if (isCareerOpsStatus(key)) return key;

  return STATUS_ALIASES[key] ?? fallback;
}

export function isTerminalCareerOpsStatus(status: CareerOpsApplicationStatus): boolean {
  return TERMINAL_STATUSES.has(status);
}

function toIsoDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayIsoDate(referenceDate?: Date): string {
  const date = referenceDate ?? new Date();
  return toIsoDate(date);
}

export function addDaysIsoDate(isoDate: string, days: number): string {
  const parsed = new Date(`${isoDate}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  parsed.setUTCDate(parsed.getUTCDate() + days);
  return toIsoDate(parsed);
}

export function coerceIsoDate(value: string | null | undefined): string | null {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  // Keep already-valid YYYY-MM-DD values deterministic.
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;

  return toIsoDate(parsed);
}

export function defaultNextFollowUpDate(
  status: CareerOpsApplicationStatus,
  referenceDate?: Date
): string | null {
  if (isTerminalCareerOpsStatus(status)) return null;

  const today = todayIsoDate(referenceDate);
  const daysByStatus: Record<CareerOpsApplicationStatus, number> = {
    evaluated: 3,
    applied: 5,
    responded: 4,
    interview: 2,
    offer: 0,
    rejected: 0,
    discarded: 0,
    skip: 0,
  };

  return addDaysIsoDate(today, daysByStatus[status]);
}
