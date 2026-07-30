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

import type { SkillGap } from "@/types/career";

export interface CareerOpsDbApplicationRow {
  id: string;
  user_id: string;
  job_role: string;
  company: string;
  status: string;
  match_score: number | null;
  ats_score?: number | null;
  next_follow_up_date: string | null;
  updated_at: string;
  applied_on: string | null;
  role_archetype?: CareerOpsRoleArchetype | null;
  target_level?: string | null;
  primary_blocker?: CareerOpsPrimaryBlocker | null;
  blocker_tags?: string[] | null;
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

export type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; missingTable?: boolean };


