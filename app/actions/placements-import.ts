"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import {
  analyzeImportDraft,
  confirmAndPersistImport,
  computeContentHash,
} from "@/lib/services/placement-import-resolver";
import {
  AnalyzedImportDraft,
  ConfirmedImportItem,
  ImportConfirmationSummary,
} from "@/types/placements";
import { requireAdmin } from "@/lib/auth-utils";
import { ADMIN_EMAIL, PLACEMENTS_NOTIFICATION_EMAIL } from "@/lib/constants";
import { Resend } from "resend";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

export interface AnalyzeActionResult {
  success: boolean;
  draft?: AnalyzedImportDraft;
  error?: string;
}

export interface ConfirmActionResult {
  success: boolean;
  summary?: ImportConfirmationSummary;
  error?: string;
}

export interface SubmitReviewResult {
  success: boolean;
  submissionId?: string;
  adminEmail?: string;
  recipientEmail?: string;
  emailDispatched?: boolean;
  message?: string;
  mailtoUrl?: string;
  error?: string;
}

export interface AdminStatusResult {
  isAdmin: boolean;
  adminEmail?: string;
  notificationEmail?: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function sendNoticeEmailToReviewer(payload: {
  submissionId: string;
  senderEmail: string;
  recipientEmail: string;
  rawText: string;
  extractedSummary?: string;
}): Promise<{ dispatched: boolean; error?: string }> {
  const apiKey = env.RESEND_API_KEY || process.env.RESEND_API_KEY;
  if (!apiKey) {
    logger.warn("RESEND_API_KEY not configured; skipping Resend email dispatch.");
    return { dispatched: false, error: "Email service API key not configured" };
  }

  try {
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from: "MockMate Placements <onboarding@resend.dev>",
      to: payload.recipientEmail,
      subject: `[Placement Hub Circular Review] Submission from ${payload.senderEmail}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px; color: #1e1e2a; background-color: #f9f9fb; border-radius: 12px; border: 1px solid #e2e2ec;">
          <div style="border-bottom: 2px solid #5e6ad2; padding-bottom: 12px; margin-bottom: 16px;">
            <h2 style="color: #14141e; margin: 0; font-size: 20px;">Campus Placement Notice Review</h2>
            <p style="color: #6c6c80; font-size: 13px; margin: 4px 0 0 0;">New circular submitted via MockMate Placement Hub</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 13px;">
            <tr>
              <td style="padding: 6px 0; color: #6c6c80; width: 140px;"><strong>Submitted By:</strong></td>
              <td style="padding: 6px 0; color: #14141e;">${escapeHtml(payload.senderEmail)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6c6c80;"><strong>Submission ID:</strong></td>
              <td style="padding: 6px 0; font-family: monospace; color: #5e6ad2;">${escapeHtml(payload.submissionId)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6c6c80;"><strong>Recipient Desk:</strong></td>
              <td style="padding: 6px 0; color: #14141e; font-family: monospace;">${escapeHtml(payload.recipientEmail)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6c6c80;"><strong>Submission Date:</strong></td>
              <td style="padding: 6px 0; color: #14141e;">${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6c6c80;"><strong>Review Status:</strong></td>
              <td style="padding: 6px 0;"><span style="background-color: #fef3c7; color: #b45309; padding: 2px 8px; border-radius: 4px; font-weight: 600; font-size: 12px;">Pending Admin Verification</span></td>
            </tr>
          </table>

          ${payload.extractedSummary ? `
            <div style="background-color: #ffffff; padding: 14px 16px; border-radius: 8px; border: 1px solid #e2e2ec; margin-bottom: 16px;">
              <h4 style="margin: 0 0 8px 0; color: #5e6ad2; font-size: 14px;">Parsed Notice Summary</h4>
              <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #333344; white-space: pre-wrap;">${escapeHtml(payload.extractedSummary)}</p>
            </div>
          ` : ""}

          <div style="background-color: #ffffff; padding: 14px 16px; border-radius: 8px; border: 1px solid #e2e2ec; margin-bottom: 20px;">
            <h4 style="margin: 0 0 8px 0; color: #14141e; font-size: 14px;">Raw Notice Text</h4>
            <pre style="margin: 0; font-family: monospace; font-size: 12px; line-height: 1.45; background-color: #f4f4f7; padding: 12px; border-radius: 6px; overflow-x: auto; white-space: pre-wrap; max-height: 300px; color: #222233;">${escapeHtml(payload.rawText.slice(0, 4000))}</pre>
          </div>

          <div style="border-top: 1px solid #e2e2ec; padding-top: 12px; font-size: 12px; color: #8b8b9e; text-align: center;">
            MockMate Placement Security Protocol &bull; Dispatched to ${escapeHtml(payload.recipientEmail)} &bull; Only authorized administrator (${escapeHtml(ADMIN_EMAIL)}) has direct permission to add or modify live radar drives.
          </div>
        </div>
      `,
    });

    if (result.error) {
      logger.warn("Resend email delivery returned error:", result.error);
      return { dispatched: false, error: result.error.message };
    }

    logger.info(`Notice review submission successfully emailed to ${payload.recipientEmail} via Resend. ID: ${result.data?.id}`);
    return { dispatched: true };
  } catch (error: any) {
    logger.error("Failed to send notice review email via Resend:", error);
    return { dispatched: false, error: error.message || "Failed to dispatch email" };
  }
}

/**
 * Checks whether the current session has placement administrator direct write permissions.
 */
export async function getPlacementAdminStatusAction(): Promise<AdminStatusResult> {
  const isAdmin = await requireAdmin();
  return {
    isAdmin,
  };
}

/**
 * Server action to analyze pasted placement text.
 * Strictly derives authenticated user from session.
 * Enforces a 30,000 character maximum.
 * Performs ZERO writes to production placement tables.
 */
export async function analyzePlacementTextAction(
  rawText: string
): Promise<AnalyzeActionResult> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "Please sign in to analyze placement notices.",
      };
    }

    if (!rawText || typeof rawText !== "string" || rawText.trim().length < 10) {
      return {
        success: false,
        error: "Please paste a placement notice, table, or message (minimum 10 characters).",
      };
    }

    if (rawText.length > 30000) {
      return {
        success: false,
        error: "Pasted text exceeds the 30,000 character limit.",
      };
    }

    const draft = await analyzeImportDraft(supabase, user.id, rawText);

    return {
      success: true,
      draft,
    };
  } catch (err: any) {
    logger.error("Error in analyzePlacementTextAction:", err);
    return {
      success: false,
      error: err.message || "Failed to analyze placement notice.",
    };
  }
}

/**
 * Server action for non-admin students to submit pasted notices for administrator verification.
 * Dispatches to 2300030811@kluniversity.in and registers as pending_admin_review.
 */
export async function submitNoticeForAdminReviewAction(
  rawText: string,
  extractedSummary?: string
): Promise<SubmitReviewResult> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "Please sign in to submit circulars for administrator review.",
      };
    }

    const senderEmail = user.email || "Student / Campus Contributor";
    const effectiveUserId = user.id;

    if (!rawText || rawText.trim().length < 10) {
      return {
        success: false,
        error: "Please provide a valid placement notice to submit for review.",
      };
    }

    if (rawText.length > 30000) {
      return {
        success: false,
        error: "Pasted notice exceeds the 30,000 character limit.",
      };
    }

    const submissionId = crypto.randomUUID();
    const contentHash = computeContentHash(rawText);

    // Save as pending review record with user's client (enforces own-row RLS policy)
    try {
      await supabase.from("placement_import_submissions").insert({
        id: submissionId,
        user_id: effectiveUserId,
        raw_text: rawText,
        content_hash: contentHash,
        status: "pending_admin_review",
        notes: `Submitted by ${senderEmail} for review.`,
      });
    } catch (insertErr) {
      logger.warn("Could not insert submission row (continuing with dispatch):", insertErr);
    }

    // Direct email dispatch via Resend to administrative review inbox
    const emailResult = await sendNoticeEmailToReviewer({
      submissionId,
      senderEmail,
      recipientEmail: PLACEMENTS_NOTIFICATION_EMAIL,
      rawText,
      extractedSummary,
    });

    logger.info(`Placement notice ${submissionId} submitted for review (Resend status: ${emailResult.dispatched ? "delivered" : "fallback_ready"})`);

    return {
      success: true,
      submissionId,
      emailDispatched: emailResult.dispatched,
      message: "Notice submitted for verification! Your circular has been recorded and dispatched to the placement desk for administrative review. Only authorized administrators have direct permission to publish live recruitment drives.",
    };
  } catch (err: any) {
    logger.error("Error in submitNoticeForAdminReviewAction:", err);
    return {
      success: false,
      error: err.message || "Failed to submit notice for review.",
    };
  }
}

/**
 * Server action to confirm and idempotently persist reviewed placement items.
 * Strictly requires admin permission (2300030811cser@gmail.com or profile role === "admin").
 * Non-admin users are blocked from direct writes.
 */
export async function confirmPlacementImportAction(
  submissionId: string,
  confirmedItems: ConfirmedImportItem[]
): Promise<ConfirmActionResult> {
  try {
    // Enforce admin permission
    const isAdmin = await requireAdmin();
    if (!isAdmin) {
      return {
        success: false,
        error: "Unauthorized: Only authorized administrators have direct permission to add or modify live campus drives. Notice submissions must be sent for admin verification.",
      };
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const effectiveUserId = user?.id || "00000000-0000-0000-0000-000000000000";

    if (!submissionId || !Array.isArray(confirmedItems) || confirmedItems.length === 0) {
      return {
        success: false,
        error: "Invalid confirmation payload or no items selected.",
      };
    }

    // Sanitize any registration URLs to prevent javascript: or malformed links
    const sanitizedItems = confirmedItems.map((item) => ({
      ...item,
      registrationUrl:
        item.registrationUrl && item.registrationUrl.startsWith("http")
          ? item.registrationUrl
          : null,
    }));

    const adminDb = createAdminClient();
    const summary = await confirmAndPersistImport(
      adminDb,
      effectiveUserId,
      submissionId,
      sanitizedItems
    );

    try {
      revalidatePath("/placements");
    } catch {
      // revalidatePath is unavailable in unit test runner
    }

    return {
      success: true,
      summary,
    };
  } catch (err: any) {
    logger.error("Error in confirmPlacementImportAction:", err);
    return {
      success: false,
      error: err.message || "Failed to confirm and import placement records.",
    };
  }
}

/**
 * Server action to directly create and publish a manual placement record.
 * Strictly requires admin permission.
 * Bypasses AI extraction completely while maintaining audit logging and idempotent persistence.
 */
export async function publishManualPlacementAction(
  item: ConfirmedImportItem
): Promise<ConfirmActionResult> {
  try {
    const isAdmin = await requireAdmin();
    if (!isAdmin) {
      return {
        success: false,
        error:
          "Unauthorized: Only authorized administrators have direct permission to publish placement records.",
      };
    }

    if (!item || !item.companyName || !item.companyName.trim()) {
      return {
        success: false,
        error: "Company name is required.",
      };
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const effectiveUserId = user?.id || "00000000-0000-0000-0000-000000000000";
    const adminDb = createAdminClient();

    // 1. Create a user-scoped audit record in placement_import_submissions
    const insertSub = await adminDb
      .from("placement_import_submissions")
      .insert({
        user_id: effectiveUserId,
        raw_text: item.sanitizedAnnouncementText || `Manual entry: ${item.companyName} (${item.noticeType})`,
        content_hash: `manual_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        draft_snapshot: [item],
        status: "analyzed",
      })
      .select("id")
      .single();

    if (insertSub.error || !insertSub.data?.id) {
      logger.error("Failed to insert manual audit submission record:", insertSub.error);
      return {
        success: false,
        error: "Failed to initialize placement import audit record.",
      };
    }

    const submissionId = insertSub.data.id as string;

    // 2. Sanitize any URLs to prevent javascript: or malformed links
    const sanitizedItem: ConfirmedImportItem = {
      ...item,
      tempId: item.tempId || `manual_${Date.now()}`,
      companyName: item.companyName.trim(),
      roleTitle: item.roleTitle?.trim() || null,
      packageText: item.packageText?.trim() || null,
      registrationUrl:
        item.registrationUrl && item.registrationUrl.startsWith("http")
          ? item.registrationUrl
          : null,
    };

    // 3. Confirm and persist deterministically to production tables
    const summary = await confirmAndPersistImport(
      adminDb,
      effectiveUserId,
      submissionId,
      [sanitizedItem]
    );

    try {
      revalidatePath("/placements");
    } catch {
      // revalidatePath is unavailable in unit test runner
    }

    return {
      success: true,
      summary,
    };
  } catch (err: any) {
    logger.error("Error in publishManualPlacementAction:", err);
    return {
      success: false,
      error: err.message || "Failed to publish placement record.",
    };
  }
}
