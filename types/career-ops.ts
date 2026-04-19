import type { CareerOpsApplicationStatus } from "@/lib/career-ops/status";
import type {
  CareerOpsPrimaryBlocker,
  CareerOpsRoleArchetype,
} from "@/lib/career-ops/dimensions";
import type { CareerOpsTrackerSummary } from "@/lib/career-ops/summary";
import type { CareerOpsPatternInsights } from "@/lib/career-ops/patterns";

export type { CareerOpsApplicationStatus, CareerOpsTrackerSummary, CareerOpsPatternInsights };

export interface CareerOpsApplicationItem {
  id: string;
  jobRole: string;
  company: string;
  status: CareerOpsApplicationStatus;
  matchScore: number | null;
  atsScore: number | null;
  nextFollowUpDate: string | null;
  updatedAt: string;
  appliedOn: string | null;
  roleArchetype?: CareerOpsRoleArchetype | null;
  targetLevel?: string | null;
  primaryBlocker?: CareerOpsPrimaryBlocker | null;
  blockerTags?: string[];
}

export interface CareerOpsRecentActivityItem {
  id: string;
  applicationId: string;
  jobRole: string;
  company: string;
  status: CareerOpsApplicationStatus;
  followedUpOn: string;
  channel: string;
}
