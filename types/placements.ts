// ──────────────────────────────────────────────────────────────────
// Placement Hub — TypeScript types
// ──────────────────────────────────────────────────────────────────
// Database row types (snake_case) and frontend-facing types (camelCase).
// Follows the convention of types/career-ops.ts.
// ──────────────────────────────────────────────────────────────────

// ── Enums / union types ──

export type PlacementDriveStatus =
  | "announced"
  | "registration_open"
  | "ongoing"
  | "completed"
  | "cancelled";

export type PlacementEventType =
  | "REGISTRATION_DEADLINE"
  | "PRE_PLACEMENT_TALK"
  | "APTITUDE_TEST"
  | "CODING_ASSESSMENT"
  | "TECHNICAL_INTERVIEW"
  | "HR_INTERVIEW"
  | "OFFER_RELEASE"
  | "OTHER";

export type PlacementApplicationStatus =
  | "eligible"
  | "applied"
  | "test_scheduled"
  | "interview_scheduled"
  | "offered"
  | "rejected"
  | "withdrawn";

export type PlacementSourceType =
  | "pdf_report"
  | "outlook_email"
  | "telegram"
  | "manual"
  | "student_submission";

export type PlacementAnnouncementSource =
  | "outlook"
  | "telegram"
  | "portal"
  | "manual"
  | "student_submission";

// ── Database row types (match Supabase columns) ──

export interface PlacementCompanyRow {
  id: string;
  name: string;
  normalized_name: string;
  industry: string | null;
  website: string | null;
  logo_url: string | null;
  created_at: string;
}

export interface PlacementDriveRow {
  id: string;
  company_id: string;
  academic_year_id: string;
  drive_name: string;
  role_title: string | null;
  date_of_visit: string | null;
  package_min_lpa: number | null;
  package_max_lpa: number | null;
  package_values: number[];
  raw_package_text: string | null;
  drive_status: PlacementDriveStatus;
  eligible_branches: string[];
  min_cgpa: number;
  source_type: PlacementSourceType;
  source_reference: string | null;
  source_page: number | null;
  notes: string | null;
  source_verified?: boolean;
  data_verified?: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlacementEventRow {
  id: string;
  drive_id: string;
  event_type: PlacementEventType;
  title: string;
  start_time: string;
  end_time: string | null;
  venue: string | null;
  meeting_url: string | null;
  description: string | null;
  created_at: string;
  outlook_event_id?: string | null;
  ical_uid?: string | null;
  source_verified?: boolean;
  data_verified?: boolean;
}

export interface PlacementAnnouncementRow {
  id: string;
  drive_id: string | null;
  source: PlacementAnnouncementSource;
  subject: string;
  raw_body: string; // admin-only; never returned by public repository queries
  content_hash: string | null;
  importance: string;
  received_at: string;
  verified: boolean;
  created_at: string;
}

export interface PlacementApplicationRow {
  id: string;
  user_id: string;
  drive_id: string;
  status: PlacementApplicationStatus;
  applied_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ── Frontend-facing types (camelCase, joined/enriched) ──

export interface PlacementCompany {
  id: string;
  name: string;
  normalizedName: string;
  industry: string | null;
  website: string | null;
  logoUrl: string | null;
}

export interface PlacementDrive {
  id: string;
  companyId: string;
  companyName: string;
  driveName: string;
  roleTitle: string | null;
  dateOfVisit: string | null;
  packageMinLpa: number | null;
  packageMaxLpa: number | null;
  packageValues: number[];
  rawPackageText: string | null;
  driveStatus: PlacementDriveStatus;
  eligibleBranches: string[];
  minCgpa: number;
  sourceType: PlacementSourceType;
  sourceReference: string | null;
  sourcePage: number | null;
  notes: string | null;
  sourceVerified?: boolean;
  dataVerified?: boolean;
}

export interface PlacementEvent {
  id: string;
  drive_id: string;
  event_type: PlacementEventType;
  title: string;
  start_time: string;
  end_time?: string | null;
  venue: string | null;
  meeting_url?: string | null;
  description: string | null;
  driveId?: string;
  eventType?: PlacementEventType;
  startTime?: string;
  endTime?: string | null;
  meetingUrl?: string | null;
  outlook_event_id?: string | null;
  ical_uid?: string | null;
  source_verified?: boolean;
  data_verified?: boolean;
  outlookEventId?: string | null;
  icalUid?: string | null;
  sourceVerified?: boolean;
  dataVerified?: boolean;
}

/** Enriched timeline item with event, drive, and company */
export interface PlacementTimelineItem {
  event: PlacementEvent;
  drive: {
    id: string;
    drive_name?: string;
    driveName?: string;
    role_title?: string | null;
    roleTitle?: string | null;
    drive_status?: PlacementDriveStatus;
    driveStatus?: PlacementDriveStatus;
    package_min_lpa?: number | null;
    package_max_lpa?: number | null;
    packageMinLpa?: number | null;
    packageMaxLpa?: number | null;
    raw_package_text?: string | null;
    rawPackageText?: string | null;
  };
  company: {
    id: string;
    name: string;
    normalized_name?: string;
    normalizedName?: string;
    logo_url?: string | null;
    logoUrl?: string | null;
  };
}

export type TodayTimelineItem = PlacementTimelineItem;

/** Public-safe announcement (no raw_body) */
export interface PlacementAnnouncementPublic {
  id: string;
  driveId: string | null;
  source: PlacementAnnouncementSource;
  subject: string;
  importance: string;
  receivedAt: string;
  verified: boolean;
}

export interface AcademicYear {
  id: string;
  year_label: string;
  is_current: boolean;
  created_at: string;
}

export type PlacementAnnouncement = PlacementAnnouncementRow;

export interface PlacementDriveWithCompany {
  id: string;
  drive_name: string;
  role_title: string | null;
  date_of_visit: string | null;
  package_min_lpa: number | null;
  package_max_lpa: number | null;
  package_values: number[];
  raw_package_text: string | null;
  drive_status: PlacementDriveStatus;
  source_type: PlacementSourceType;
  source_reference?: string | null;
  source_page?: number | null;
  notes?: string | null;
  created_at: string;
  placement_companies: {
    id: string;
    name: string;
    normalized_name?: string;
    logo_url: string | null;
  };
  placement_academic_years?: {
    year_label: string;
  };
}

export interface PlacementApplication {
  id: string;
  driveId: string;
  driveName: string;
  companyName: string;
  roleTitle: string | null;
  status: PlacementApplicationStatus;
  appliedAt: string | null;
}

// ── Milestone 7: Assisted Placement Import Types ──

export type ImportNoticeType =
  | "NEW_DRIVE"
  | "REGISTRATION_DEADLINE"
  | "ASSESSMENT"
  | "INTERVIEW"
  | "RESULT"
  | "TRAINING"
  | "GENERAL_ANNOUNCEMENT";

export type SemanticConflictType =
  | "CONFLICT"
  | "ADDITIONAL_INFORMATION"
  | "MORE_SPECIFIC"
  | "POSSIBLE_CONFLICT"
  | "NO_CONFLICT";

export interface ExtractedImportItem {
  tempId: string;
  noticeType: ImportNoticeType;
  companyName: string;
  roleTitle: string | null;
  packageText: string | null;
  minLpa: number | null;
  maxLpa: number | null;
  stipendText: string | null;
  eligibleBranches: string[];
  minCgpa: number | null;
  targetBatch: string | null;
  deadlineIso: string | null;
  deadlinePrecision: "day" | "minute";
  deadlineInferred: boolean;
  eventDateIso: string | null;
  eventLocation: string | null;
  registrationUrl: string | null;
  confidence: number;
  rawSnippet: string;
}

export interface AnalyzedImportItem extends ExtractedImportItem {
  matchedCompanyId: string | null;
  matchedDriveId: string | null;
  matchOutcome:
    | "created_new_drive"
    | "updated_student_drive"
    | "matched_official_drive"
    | "conflict_with_official"
    | "ambiguous_match";
  conflictType: SemanticConflictType;
  conflictDescription?: string;
  existingOfficialValue?: {
    packageText?: string | null;
    roleTitle?: string | null;
    minCgpa?: number | null;
    eligibleBranches?: string[];
  };
  ambiguousCandidates?: Array<{
    id: string;
    driveName: string;
    roleTitle: string | null;
    dateOfVisit: string | null;
  }>;
}

export interface AnalyzedImportDraft {
  submissionId: string;
  items: AnalyzedImportItem[];
  extractedTableCount: number;
  extractedProseCount: number;
}

export interface ConfirmedImportItem {
  tempId: string;
  noticeType: ImportNoticeType;
  companyName: string;
  roleTitle: string | null;
  packageText: string | null;
  minLpa: number | null;
  maxLpa: number | null;
  eligibleBranches: string[];
  minCgpa: number | null;
  deadlineIso: string | null;
  deadlinePrecision?: "day" | "minute";
  deadlineInferred?: boolean;
  eventDateIso: string | null;
  eventLocation: string | null;
  registrationUrl: string | null;
  selectedDriveId?: string | null;
  linkToExistingOfficial?: boolean;
  sanitizedAnnouncementText?: string | null;
}

export interface ConfirmedImportDraft {
  submissionId: string;
  items: ConfirmedImportItem[];
}

export interface ImportConfirmationSummary {
  success: boolean;
  submissionId: string;
  createdDrivesCount: number;
  updatedDrivesCount: number;
  createdEventsCount: number;
  publishedAnnouncementsCount: number;
  warnings: string[];
}

// ── Milestone 8 Historical Placement Types (2016-2026 Reference Dataset) ──

export type PlacementDepartment = "ECE" | "CSE";

export type PlacementDataQualityStatus =
  | "clean"
  | "date_outside_labeled_academic_year"
  | "grouped_multi_company_row"
  | "btech_mtech_total_mismatch"
  | "category_breakdown_not_reported"
  | "zero_offers_nonzero_ctc"
  | "skipped_serial_number";

export type PlacementQualityCategory =
  | "clean"
  | "source_discrepancy"
  | "structural_source_format"
  | "grouped_company_record"
  | "missing_source_field";

export interface PlacementHistoryRecord {
  id: string;
  company_name: string;
  normalized_company_name: string | null;
  company_id: string | null;
  department: PlacementDepartment;
  academic_year: string;
  visit_date: string | null;
  students_placed: number | null;
  package_lpa: string[] | null;
  offers_count: number | null;
  btech_offers: number | null;
  mtech_offers: number | null;
  ctc_lpa: string | null;
  source_name: string;
  source_url: string;
  source_type: string;
  page_number: number | null;
  source_row_serial_no: string;
  source_notes: string | null;
  data_quality_status: PlacementDataQualityStatus[];
  source_dataset: string;
  import_batch: string;
  created_at: string;
}

export interface PlacementHistoryFilter {
  department?: PlacementDepartment;
  academicYear?: string;
  companyName?: string;
  companyId?: string;
  qualityStatus?: PlacementDataQualityStatus;
  limit?: number;
  offset?: number;
}

export interface PlacementHistorySummary {
  totalRecords: number;
  recordsByDepartment: {
    ECE: number;
    CSE: number;
  };
  academicYears: string[];
  totalUniqueCompanies: number;
  qualityIssuesCount: number;
}

/**
 * Distinguishes UI labels and badges according to source quality rules:
 * - Source Discrepancy: Mathematical or logical contradiction in published source
 * - Structural Source Format: Normal Indian campus placement timing / numbering idiosyncrasy
 * - Grouped Company Record: Multi-company pooled count row (must remain unlinked)
 * - Missing Source Field: Unreported category breakdown
 */
export function getPlacementQualityCategory(status: PlacementDataQualityStatus): {
  category: PlacementQualityCategory;
  label: string;
  description: string;
  badgeVariant: "clean" | "warning" | "info" | "neutral";
} {
  switch (status) {
    case "clean":
      return {
        category: "clean",
        label: "Verified Clean",
        description: "Exact match with published department statistics.",
        badgeVariant: "clean",
      };
    case "btech_mtech_total_mismatch":
      return {
        category: "source_discrepancy",
        label: "Source Discrepancy: Offers Mismatch",
        description: "Published Total Offers does not equal reported B.Tech + M.Tech count.",
        badgeVariant: "warning",
      };
    case "zero_offers_nonzero_ctc":
      return {
        category: "source_discrepancy",
        label: "Source Discrepancy: 0 Offers with CTC",
        description: "Source published Total Offers as 0 while listing a compensation figure.",
        badgeVariant: "warning",
      };
    case "date_outside_labeled_academic_year":
      return {
        category: "structural_source_format",
        label: "Structural Format: Drive Timing",
        description: "Visit date precedes or extends beyond nominal academic year window.",
        badgeVariant: "info",
      };
    case "skipped_serial_number":
      return {
        category: "structural_source_format",
        label: "Structural Format: Skipped S.No",
        description: "Serial number sequence in source table skipped an index.",
        badgeVariant: "info",
      };
    case "grouped_multi_company_row":
      return {
        category: "grouped_company_record",
        label: "Grouped Company Record (+)",
        description: "Source combined multiple recruiters with a shared placement count.",
        badgeVariant: "neutral",
      };
    case "category_breakdown_not_reported":
      return {
        category: "missing_source_field",
        label: "Missing Source Field: No Breakdown",
        description: "Total offers reported without B.Tech/M.Tech category breakdown.",
        badgeVariant: "neutral",
      };
    default:
      return {
        category: "clean",
        label: "Clean",
        description: "Standard source record.",
        badgeVariant: "clean",
      };
  }
}

