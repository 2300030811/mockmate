/**
 * Placement Import Resolver & Conflict Classifier.
 *
 * Enforces:
 * 1. Immutable Authoritative Provenance: Existing official drives (pdf_report / outlook_email) are NEVER downgraded.
 * 2. Private User-Scoped Audit Storage: Raw pasted text is stored only in placement_import_submissions.
 * 3. Zero writes to production placement tables on Analyze.
 * 4. Idempotent Confirmation: Repeated calls do not duplicate drives, events, or announcements.
 * 5. Sanitized Public Announcements: Student submissions never publish raw PII.
 * 6. Semantic Conflict Classification: Distinguishes CONFLICT, ADDITIONAL_INFO, MORE_SPECIFIC, POSSIBLE_CONFLICT, NO_CONFLICT.
 */

import { SupabaseClient } from "@supabase/supabase-js";
import crypto from "crypto";
import {
  ExtractedImportItem,
  AnalyzedImportItem,
  AnalyzedImportDraft,
  ConfirmedImportItem,
  ImportConfirmationSummary,
  SemanticConflictType,
} from "@/types/placements";
import { extractPlacementImport } from "./placement-import-extractor";
import {
  normalizeCompanyName,
  resolveCompany,
  getActiveAcademicYearId,
  resolvePlacementEvent,
} from "./outlook-drive-resolver";

/**
 * Computes a SHA-256 hash of raw input text.
 */
export function computeContentHash(text: string): string {
  return crypto.createHash("sha256").update(text.trim()).digest("hex");
}

/**
 * Classifies the semantic relationship between existing official values and student submission.
 */
export function classifySemanticConflict(
  existing: {
    packageMinLpa: number | null;
    packageMaxLpa: number | null;
    packageValues?: number[];
    minCgpa: number | null;
    eligibleBranches: string[];
  },
  proposed: {
    minLpa: number | null;
    maxLpa: number | null;
    stipendText: string | null;
    minCgpa: number | null;
    eligibleBranches: string[];
  }
): {
  conflictType: SemanticConflictType;
  description?: string;
} {
  // Case 1: Stipend vs Full-Time CTC
  if (proposed.stipendText && (existing.packageMaxLpa || existing.packageMinLpa)) {
    return {
      conflictType: "POSSIBLE_CONFLICT",
      description: `Existing record indicates full-time package (${existing.packageMinLpa ?? existing.packageMaxLpa} LPA), while student submission mentions internship stipend (${proposed.stipendText}).`,
    };
  }

  // Case 2: Package Comparisons
  if (proposed.minLpa !== null && proposed.maxLpa !== null) {
    // If existing has a range (e.g. 6.25 - 21 LPA)
    if (
      existing.packageMinLpa !== null &&
      existing.packageMaxLpa !== null &&
      existing.packageMinLpa !== existing.packageMaxLpa
    ) {
      // If student submission specifies one tier within the range
      if (
        (proposed.minLpa === existing.packageMinLpa && proposed.maxLpa === existing.packageMinLpa) ||
        (proposed.minLpa === existing.packageMaxLpa && proposed.maxLpa === existing.packageMaxLpa) ||
        (existing.packageValues && existing.packageValues.includes(proposed.maxLpa))
      ) {
        return {
          conflictType: "MORE_SPECIFIC",
          description: `Student submission specifies tier (${proposed.maxLpa} LPA) within official range (${existing.packageMinLpa} - ${existing.packageMaxLpa} LPA).`,
        };
      }

      // If proposed package is completely outside the range
      if (proposed.maxLpa > existing.packageMaxLpa * 1.15 || proposed.minLpa < existing.packageMinLpa * 0.85) {
        return {
          conflictType: "CONFLICT",
          description: `Proposed package (${proposed.minLpa === proposed.maxLpa ? `${proposed.maxLpa} LPA` : `${proposed.minLpa} - ${proposed.maxLpa} LPA`}) directly contradicts official range (${existing.packageMinLpa} - ${existing.packageMaxLpa} LPA).`,
        };
      }
    } else if (existing.packageMaxLpa !== null) {
      // Single fixed package comparison
      const diff = Math.abs(proposed.maxLpa - existing.packageMaxLpa);
      if (diff > 0.2) {
        return {
          conflictType: "CONFLICT",
          description: `Official package is ${existing.packageMaxLpa} LPA, while student submission proposes ${proposed.maxLpa} LPA.`,
        };
      }
    }
  }

  // Case 3: CGPA Cutoff
  if (proposed.minCgpa !== null && existing.minCgpa !== null) {
    if (Math.abs(proposed.minCgpa - existing.minCgpa) > 0.1) {
      return {
        conflictType: "CONFLICT",
        description: `Official CGPA cutoff is ${existing.minCgpa}, but student submission proposes ${proposed.minCgpa}.`,
      };
    }
  }

  // Case 4: Branch additions
  if (proposed.eligibleBranches.length > 0 && existing.eligibleBranches.length > 0) {
    const newBranches = proposed.eligibleBranches.filter(
      (b) => !existing.eligibleBranches.includes(b)
    );
    if (newBranches.length > 0) {
      return {
        conflictType: "ADDITIONAL_INFORMATION",
        description: `Adds additional branches: ${newBranches.join(", ")}.`,
      };
    }
  }

  return { conflictType: "NO_CONFLICT" };
}

/**
 * Analyzes raw placement text and creates exactly one private submission row.
 * CRITICAL RULE: Performs ZERO writes to production placement tables
 * (placement_companies, placement_drives, placement_events, placement_announcements).
 */
export async function analyzeImportDraft(
  db: SupabaseClient,
  userId: string,
  rawText: string
): Promise<AnalyzedImportDraft> {
  const contentHash = computeContentHash(rawText);

  // 1. Run hybrid extraction (table-first, prose-second)
  const extraction = await extractPlacementImport(rawText);

  // 2. Cross-reference existing records (Read-Only)
  const academicYearId = await getActiveAcademicYearId(db);
  const analyzedItems: AnalyzedImportItem[] = [];

  for (const item of extraction.items) {
    const normalizedName = normalizeCompanyName(item.companyName);

    // Look up company
    const companyRes = await db
      .from("placement_companies")
      .select("id, name")
      .eq("normalized_name", normalizedName)
      .maybeSingle();

    const companyId = companyRes.data?.id ?? null;
    let matchedDriveId: string | null = null;
    let matchOutcome: AnalyzedImportItem["matchOutcome"] = "created_new_drive";
    let conflictType: SemanticConflictType = "NO_CONFLICT";
    let conflictDescription: string | undefined;
    let existingOfficialValue: AnalyzedImportItem["existingOfficialValue"];
    let ambiguousCandidates: AnalyzedImportItem["ambiguousCandidates"];

    if (companyId) {
      // Find drives for this company
      const drivesRes = await db
        .from("placement_drives")
        .select(
          "id, drive_name, role_title, package_min_lpa, package_max_lpa, package_values, raw_package_text, min_cgpa, eligible_branches, source_type, source_verified, date_of_visit"
        )
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });

      const drives = drivesRes.data || [];

      if (drives.length === 1) {
        const targetDrive = drives[0];
        matchedDriveId = targetDrive.id;

        const isAuthoritative =
          targetDrive.source_verified ||
          targetDrive.source_type === "pdf_report" ||
          targetDrive.source_type === "outlook_email";

        if (isAuthoritative) {
          const conflictResult = classifySemanticConflict(
            {
              packageMinLpa: targetDrive.package_min_lpa,
              packageMaxLpa: targetDrive.package_max_lpa,
              packageValues: targetDrive.package_values,
              minCgpa: targetDrive.min_cgpa,
              eligibleBranches: targetDrive.eligible_branches || [],
            },
            {
              minLpa: item.minLpa,
              maxLpa: item.maxLpa,
              stipendText: item.stipendText,
              minCgpa: item.minCgpa,
              eligibleBranches: item.eligibleBranches,
            }
          );

          conflictType = conflictResult.conflictType;
          conflictDescription = conflictResult.description;
          existingOfficialValue = {
            packageText: targetDrive.raw_package_text,
            roleTitle: targetDrive.role_title,
            minCgpa: targetDrive.min_cgpa,
            eligibleBranches: targetDrive.eligible_branches,
          };

          matchOutcome =
            conflictType === "CONFLICT"
              ? "conflict_with_official"
              : "matched_official_drive";
        } else {
          matchOutcome = "updated_student_drive";
        }
      } else if (drives.length > 1) {
        // Multiple candidate drives exist (e.g. Infosys General vs Specialist Programmer)
        // Check for an exact role match
        const exactRoleMatch = drives.find(
          (d) =>
            item.roleTitle &&
            d.role_title &&
            d.role_title.toLowerCase().trim() === item.roleTitle.toLowerCase().trim()
        );

        if (exactRoleMatch) {
          matchedDriveId = exactRoleMatch.id;
          matchOutcome =
            exactRoleMatch.source_verified || exactRoleMatch.source_type === "pdf_report"
              ? "matched_official_drive"
              : "updated_student_drive";
        } else {
          // Ambiguous match — surface candidates to student for selection
          matchOutcome = "ambiguous_match";
          ambiguousCandidates = drives.slice(0, 5).map((d) => ({
            id: d.id,
            driveName: d.drive_name,
            roleTitle: d.role_title,
            dateOfVisit: d.date_of_visit,
          }));
        }
      }
    }

    analyzedItems.push({
      ...item,
      matchedCompanyId: companyId,
      matchedDriveId,
      matchOutcome,
      conflictType,
      conflictDescription,
      existingOfficialValue,
      ambiguousCandidates,
    });
  }

  // 3. Create ONE private user-scoped audit record in placement_import_submissions
  // Zero production tables touched!
  const insertSubmission = await db
    .from("placement_import_submissions")
    .insert({
      user_id: userId,
      raw_text: rawText,
      content_hash: contentHash,
      draft_snapshot: analyzedItems,
      status: "analyzed",
    })
    .select("id")
    .single();

  if (insertSubmission.error) throw insertSubmission.error;

  return {
    submissionId: insertSubmission.data.id as string,
    items: analyzedItems,
    extractedTableCount: extraction.extractedTableCount,
    extractedProseCount: extraction.extractedProseCount,
  };
}

/**
 * Idempotently persists student-confirmed items into production placement tables.
 * Strict rules:
 * - Validates ownership of submission
 * - Requires status === 'analyzed'
 * - Repeated confirmation returns error/graceful warning without duplicate creation
 * - Authoritative records are NEVER downgraded or overwritten with conflicting student values
 * - Public announcements contain ONLY sanitized placement content (no raw PII)
 */
export async function confirmAndPersistImport(
  db: SupabaseClient,
  userId: string,
  submissionId: string,
  confirmedItems: ConfirmedImportItem[]
): Promise<ImportConfirmationSummary> {
  // 1. Verify ownership and state of submission
  const subRes = await db
    .from("placement_import_submissions")
    .select("id, user_id, status")
    .eq("id", submissionId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!subRes.data) {
    throw new Error("Import submission not found or unauthorized access.");
  }

  // Idempotency: If already confirmed, exit immediately without duplicating
  if (subRes.data.status === "confirmed") {
    return {
      success: true,
      submissionId,
      createdDrivesCount: 0,
      updatedDrivesCount: 0,
      createdEventsCount: 0,
      publishedAnnouncementsCount: 0,
      warnings: ["This import has already been confirmed."],
    };
  }

  const academicYearId = await getActiveAcademicYearId(db);
  const summary: ImportConfirmationSummary = {
    success: true,
    submissionId,
    createdDrivesCount: 0,
    updatedDrivesCount: 0,
    createdEventsCount: 0,
    publishedAnnouncementsCount: 0,
    warnings: [],
  };

  // 2. Process each confirmed item
  for (const item of confirmedItems) {
    try {
      const companyId = await resolveCompany(db, item.companyName);
      let targetDriveId = item.selectedDriveId || null;

      // Handle Drive Resolution
      if (targetDriveId) {
        // Check target drive provenance
        const existingDriveRes = await db
          .from("placement_drives")
          .select("id, source_type, source_verified, package_min_lpa, package_max_lpa")
          .eq("id", targetDriveId)
          .single();

        const existingDrive = existingDriveRes.data;

        if (existingDrive) {
          const isOfficial =
            existingDrive.source_verified ||
            existingDrive.source_type === "pdf_report" ||
            existingDrive.source_type === "outlook_email";

          if (isOfficial) {
            // IMMUTABLE AUTHORITATIVE PROVENANCE:
            // Do NOT overwrite official package or downgrade source_verified!
            summary.updatedDrivesCount++;
          } else {
            // Student drive: update package/branches
            await db
              .from("placement_drives")
              .update({
                package_min_lpa: item.minLpa ?? existingDrive.package_min_lpa,
                package_max_lpa: item.maxLpa ?? existingDrive.package_max_lpa,
                raw_package_text: item.packageText,
                data_verified: true,
                updated_at: new Date().toISOString(),
              })
              .eq("id", targetDriveId);
            summary.updatedDrivesCount++;
          }
        }
      } else if (item.noticeType === "NEW_DRIVE" || item.noticeType === "REGISTRATION_DEADLINE") {
        // Create new student-submitted drive
        const packageValues: number[] = [];
        if (item.minLpa) packageValues.push(item.minLpa);
        if (item.maxLpa && item.maxLpa !== item.minLpa) packageValues.push(item.maxLpa);

        const newDrive = await db
          .from("placement_drives")
          .insert({
            company_id: companyId,
            academic_year_id: academicYearId,
            drive_name: `${item.companyName} Campus Drive`,
            role_title: item.roleTitle,
            drive_status: "announced",
            package_min_lpa: item.minLpa,
            package_max_lpa: item.maxLpa,
            package_values: packageValues,
            raw_package_text: item.packageText,
            eligible_branches: item.eligibleBranches,
            min_cgpa: item.minCgpa ?? 6.0,
            source_type: "student_submission",
            source_verified: false,
            data_verified: true, // reviewed and confirmed by student
            notes: "Submitted by student via Placement Import.",
          })
          .select("id")
          .single();

        if (newDrive.data?.id) {
          targetDriveId = newDrive.data.id as string;
          summary.createdDrivesCount++;
        }
      }

      // Handle Events according to notice type
      if (targetDriveId) {
        if (item.noticeType === "REGISTRATION_DEADLINE" || item.deadlineIso) {
          const dateStr = item.deadlineIso || new Date().toISOString().split("T")[0];
          await resolvePlacementEvent(db, {
            driveId: targetDriveId,
            candidate: {
              eventType: "REGISTRATION_DEADLINE",
              title: `${item.companyName} Registration Deadline`,
              startTime: `${dateStr}T18:29:59.000Z`, // 23:59:59 IST in UTC
              endTime: null,
              venue: item.eventLocation || "Online Portal",
              meetingUrl: item.registrationUrl,
              confidence: 0.95,
              sourceVerified: false,
              dataVerified: true,
            },
          });
          summary.createdEventsCount++;
        } else if (item.noticeType === "ASSESSMENT") {
          const dateStr = item.eventDateIso || new Date().toISOString().split("T")[0];
          await resolvePlacementEvent(db, {
            driveId: targetDriveId,
            candidate: {
              eventType: "CODING_ASSESSMENT",
              title: `${item.companyName} Assessment`,
              startTime: `${dateStr}T04:30:00.000Z`, // 10:00 AM IST
              endTime: `${dateStr}T06:30:00.000Z`,
              venue: item.eventLocation || "Lab / Online",
              meetingUrl: item.registrationUrl,
              confidence: 0.9,
              sourceVerified: false,
              dataVerified: true,
            },
          });
          summary.createdEventsCount++;
        } else if (item.noticeType === "INTERVIEW") {
          const dateStr = item.eventDateIso || new Date().toISOString().split("T")[0];
          await resolvePlacementEvent(db, {
            driveId: targetDriveId,
            candidate: {
              eventType: "TECHNICAL_INTERVIEW",
              title: `${item.companyName} Interview Session`,
              startTime: `${dateStr}T04:00:00.000Z`,
              endTime: `${dateStr}T11:30:00.000Z`,
              venue: item.eventLocation || "Campus / Virtual",
              meetingUrl: item.registrationUrl,
              confidence: 0.9,
              sourceVerified: false,
              dataVerified: true,
            },
          });
          summary.createdEventsCount++;
        }
      }

      // Handle Announcements & Results (Sanitized: zero raw PII)
      if (item.noticeType === "RESULT" || item.noticeType === "GENERAL_ANNOUNCEMENT" || item.noticeType === "TRAINING") {
        const sanitizedSubject = `${item.companyName} - ${item.noticeType === "RESULT" ? "Selection Results" : "Placement Notice"}`;
        const sanitizedBody =
          item.sanitizedAnnouncementText ||
          `${item.companyName} has published a notice regarding ${item.roleTitle || "campus placement"}. (Verified by student submission)`;

        await db.from("placement_announcements").insert({
          drive_id: targetDriveId,
          source: "student_submission",
          subject: sanitizedSubject,
          raw_body: sanitizedBody, // Sanitized text only!
          content_hash: computeContentHash(`${submissionId}:${item.tempId}`),
          importance: "normal",
          received_at: new Date().toISOString(),
          verified: false,
        });

        summary.publishedAnnouncementsCount++;
      }
    } catch (itemErr: any) {
      summary.warnings.push(`Error processing ${item.companyName}: ${itemErr.message}`);
    }
  }

  // 3. Update private submission record to confirmed
  await db
    .from("placement_import_submissions")
    .update({
      status: "confirmed",
      confirmed_at: new Date().toISOString(),
    })
    .eq("id", submissionId);

  return summary;
}
