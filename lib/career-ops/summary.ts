import {
  CAREER_OPS_STATUSES,
  CareerOpsApplicationStatus,
  isTerminalCareerOpsStatus,
  normalizeCareerOpsStatus,
  todayIsoDate,
} from "@/lib/career-ops/status";
import type { FollowUpUrgencyLevel } from "@/lib/career-ops/cadence";

export interface CareerOpsApplicationSnapshot {
  id: string;
  job_role: string;
  company: string;
  status: string;
  match_score: number | null;
  ats_score: number | null;
  next_follow_up_date: string | null;
  updated_at: string;
  applied_on: string | null;
  role_archetype?: string | null;
  target_level?: string | null;
  primary_blocker?: string | null;
  blocker_tags?: string[] | null;
}

export type CareerOpsStatusCounts = Record<CareerOpsApplicationStatus, number>;

export interface CareerOpsDueItem {
  id: string;
  jobRole: string;
  company: string;
  status: CareerOpsApplicationStatus;
  nextFollowUpDate: string;
  daysLate: number;
}

export interface CareerOpsRecentItem {
  id: string;
  jobRole: string;
  company: string;
  status: CareerOpsApplicationStatus;
  updatedAt: string;
  matchScore: number | null;
}

export interface CareerOpsTrackerSummary {
  totalApplications: number;
  activePipelineCount: number;
  avgMatchScore: number | null;
  avgAtsScore: number | null;
  dueTodayCount: number;
  overdueCount: number;
  upcomingCount: number;
  funnel: {
    responseRate: number | null;
    interviewRate: number | null;
    offerRate: number | null;
  };
  urgencyLevel: FollowUpUrgencyLevel;
  statusCounts: CareerOpsStatusCounts;
  dueItems: CareerOpsDueItem[];
  recentItems: CareerOpsRecentItem[];
}

function createStatusCounts(): CareerOpsStatusCounts {
  return CAREER_OPS_STATUSES.reduce((acc, status) => {
    acc[status] = 0;
    return acc;
  }, {} as CareerOpsStatusCounts);
}

function differenceInDays(fromIsoDate: string, toIsoDateValue: string): number {
  const fromDate = new Date(`${fromIsoDate}T00:00:00.000Z`);
  const toDate = new Date(`${toIsoDateValue}T00:00:00.000Z`);

  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
    return 0;
  }

  const diffMs = fromDate.getTime() - toDate.getTime();
  return Math.floor(diffMs / (24 * 60 * 60 * 1000));
}

function toPercent(numerator: number, denominator: number): number | null {
  if (denominator <= 0) return null;
  return Math.round((numerator / denominator) * 100);
}

export function emptyCareerOpsTrackerSummary(): CareerOpsTrackerSummary {
  return {
    totalApplications: 0,
    activePipelineCount: 0,
    avgMatchScore: null,
    avgAtsScore: null,
    dueTodayCount: 0,
    overdueCount: 0,
    upcomingCount: 0,
    funnel: {
      responseRate: null,
      interviewRate: null,
      offerRate: null,
    },
    urgencyLevel: "calm",
    statusCounts: createStatusCounts(),
    dueItems: [],
    recentItems: [],
  };
}

export function buildCareerOpsTrackerSummary(
  applications: CareerOpsApplicationSnapshot[],
  referenceDate?: Date
): CareerOpsTrackerSummary {
  if (applications.length === 0) {
    return emptyCareerOpsTrackerSummary();
  }

  const today = todayIsoDate(referenceDate);
  const upcomingWindowEnd = new Date(`${today}T00:00:00.000Z`);
  upcomingWindowEnd.setUTCDate(upcomingWindowEnd.getUTCDate() + 7);
  const upcomingWindowEndIso = todayIsoDate(upcomingWindowEnd);

  const statusCounts = createStatusCounts();
  const dueItems: CareerOpsDueItem[] = [];
  const recentItems: CareerOpsRecentItem[] = [];

  let activePipelineCount = 0;
  let dueTodayCount = 0;
  let overdueCount = 0;
  let upcomingCount = 0;
  let scoreSum = 0;
  let scoreCount = 0;
  let atsSum = 0;
  let atsCount = 0;

  for (const application of applications) {
    const status = normalizeCareerOpsStatus(application.status);
    statusCounts[status] += 1;

    const isTerminal = isTerminalCareerOpsStatus(status);
    if (!isTerminal) {
      activePipelineCount += 1;
    }

    if (typeof application.match_score === "number") {
      scoreSum += application.match_score;
      scoreCount += 1;
    }

    if (typeof application.ats_score === "number") {
      atsSum += application.ats_score;
      atsCount += 1;
    }

    if (!isTerminal && application.next_follow_up_date) {
      if (application.next_follow_up_date <= today) {
        dueTodayCount += 1;
        if (application.next_follow_up_date < today) {
          overdueCount += 1;
        }

        dueItems.push({
          id: application.id,
          jobRole: application.job_role,
          company: application.company,
          status,
          nextFollowUpDate: application.next_follow_up_date,
          daysLate: Math.max(0, differenceInDays(today, application.next_follow_up_date)),
        });
      } else if (application.next_follow_up_date <= upcomingWindowEndIso) {
        upcomingCount += 1;
      }
    }

    recentItems.push({
      id: application.id,
      jobRole: application.job_role,
      company: application.company,
      status,
      updatedAt: application.updated_at,
      matchScore: application.match_score,
    });
  }

  dueItems.sort((a, b) => a.nextFollowUpDate.localeCompare(b.nextFollowUpDate));
  recentItems.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  const applicationsInFunnel =
    statusCounts.applied +
    statusCounts.responded +
    statusCounts.interview +
    statusCounts.offer +
    statusCounts.rejected +
    statusCounts.discarded;

  const responseSignals =
    statusCounts.responded +
    statusCounts.interview +
    statusCounts.offer +
    statusCounts.rejected +
    statusCounts.discarded;

  const interviewSignals = statusCounts.interview + statusCounts.offer;
  const offerSignals = statusCounts.offer;

  const urgencyLevel: FollowUpUrgencyLevel =
    overdueCount > 0
      ? "critical"
      : dueTodayCount > 0
        ? "attention"
        : upcomingCount > 0
          ? "upcoming"
          : "calm";

  return {
    totalApplications: applications.length,
    activePipelineCount,
    avgMatchScore: scoreCount > 0 ? Math.round(scoreSum / scoreCount) : null,
    avgAtsScore: atsCount > 0 ? Math.round(atsSum / atsCount) : null,
    dueTodayCount,
    overdueCount,
    upcomingCount,
    funnel: {
      responseRate: toPercent(responseSignals, applicationsInFunnel),
      interviewRate: toPercent(interviewSignals, applicationsInFunnel),
      offerRate: toPercent(offerSignals, applicationsInFunnel),
    },
    urgencyLevel,
    statusCounts,
    dueItems: dueItems.slice(0, 5),
    recentItems: recentItems.slice(0, 5),
  };
}
