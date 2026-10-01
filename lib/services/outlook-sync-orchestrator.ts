/**
 * Microsoft Outlook Placement Synchronization Orchestrator.
 * Connects Graph delta email ingestion and calendarView synchronization
 * with MockMate's Placement Hub repository and database.
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { syncPlacementEmailsDelta } from "./outlook-email-sync";
import {
  fetchPlacementCalendarEvents,
} from "./outlook-calendar-sync";
import {
  parsePlacementNotice,
  extractAttachmentPdfText,
} from "./outlook-extractor";
import {
  ingestPlacementEmailNotice,
  resolvePlacementEvent,
  handleRemovedOutlookMessage,
  resolveCompany,
  resolveDrive,
  getActiveAcademicYearId,
} from "./outlook-drive-resolver";
import { outlookSyncStateRepository } from "./outlook-sync-state";
import { getTodayISTDate, getISTUpcomingRange } from "../db/placement-repository";
import { callGraphApi } from "./outlook-client";

export interface SyncOrchestratorResult {
  success: boolean;
  mailboxId: string;
  processedEmails: number;
  removedEmails: number;
  syncedCalendarEvents: number;
  errors: string[];
}

export interface SyncOrchestratorOptions {
  mailboxId?: string;
  folderId?: string;
  skipCalendar?: boolean;
}

/**
 * Orchestrates complete Outlook sync (Emails Delta + Calendar Appointments).
 */
export async function runOutlookPlacementSync(
  db: SupabaseClient,
  options: SyncOrchestratorOptions = {}
): Promise<SyncOrchestratorResult> {
  const mailboxId =
    options.mailboxId ||
    process.env.OUTLOOK_PLACEMENT_MAILBOX_ID ||
    "placement@klu.ac.in";
  const folderId = options.folderId || process.env.OUTLOOK_PLACEMENT_FOLDER_ID;

  const result: SyncOrchestratorResult = {
    success: true,
    mailboxId,
    processedEmails: 0,
    removedEmails: 0,
    syncedCalendarEvents: 0,
    errors: [],
  };

  // ────────────────────────────────────────────────────────────────
  // 1. EMAIL DELTA SYNCHRONIZATION
  // ────────────────────────────────────────────────────────────────
  try {
    const emailState = await outlookSyncStateRepository.getSyncState(
      db,
      "outlook_email"
    );

    let deltaResponse = await syncPlacementEmailsDelta({
      mailboxId,
      folderId,
      deltaLink: emailState?.delta_link,
    });

    // 410 Gone / Expired delta token automatic recovery
    if (deltaResponse.resyncRequired) {
      console.warn("Delta token expired (410 Gone). Performing initial delta sync...");
      await outlookSyncStateRepository.invalidateDeltaLink(db, "outlook_email");
      deltaResponse = await syncPlacementEmailsDelta({
        mailboxId,
        folderId,
        deltaLink: null,
      });
    }

    let lastProcessedMessageId: string | undefined;

    // Process new / updated messages
    for (const msg of deltaResponse.newOrUpdatedMessages) {
      try {
        let attachmentText = "";

        // If email has attachments, fetch and extract text from PDF attachments
        if (msg.hasAttachments) {
          try {
            const attachRes = await callGraphApi<{
              value: Array<{
                "@odata.type": string;
                name: string;
                contentType: string;
                contentBytes?: string;
              }>;
            }>(`/users/${encodeURIComponent(mailboxId)}/messages/${msg.id}/attachments`);

            for (const att of attachRes.value || []) {
              if (
                att.contentBytes &&
                (att.contentType?.includes("pdf") || att.name?.endsWith(".pdf"))
              ) {
                const pdfText = await extractAttachmentPdfText(att.contentBytes);
                if (pdfText) attachmentText += `\n[PDF Attachment: ${att.name}]\n${pdfText}`;
              }
            }
          } catch (attErr) {
            console.warn(`Could not fetch attachments for message ${msg.id}:`, attErr);
          }
        }

        const notice = parsePlacementNotice(
          msg.subject || "",
          msg.body?.content || msg.bodyPreview || "",
          attachmentText
        );

        await ingestPlacementEmailNotice(db, notice, {
          messageId: msg.id,
          subject: msg.subject || "Placement Notice",
          receivedDateTime: msg.receivedDateTime || new Date().toISOString(),
          importance: msg.importance || "normal",
        });

        lastProcessedMessageId = msg.id;
        result.processedEmails++;
      } catch (msgErr: any) {
        result.errors.push(`Error processing message ${msg.id}: ${msgErr.message}`);
      }
    }

    // Process @removed items (Zero-deletion safety: keep drives & events intact)
    for (const remId of deltaResponse.removedMessageIds) {
      try {
        await handleRemovedOutlookMessage(db, remId, "deleted");
        result.removedEmails++;
      } catch (remErr: any) {
        result.errors.push(`Error handling removed message ${remId}: ${remErr.message}`);
      }
    }

    // Persist updated deltaLink and progress state
    await outlookSyncStateRepository.recordSyncSuccess(db, {
      source: "outlook_email",
      mailboxId,
      folderId,
      deltaLink: deltaResponse.newDeltaLink || emailState?.delta_link,
      lastProcessedMessageId,
    });
  } catch (emailErr: any) {
    result.success = false;
    result.errors.push(`Email sync failed: ${emailErr.message}`);
    await outlookSyncStateRepository.recordSyncFailure(
      db,
      "outlook_email",
      emailErr.message
    );
  }

  // ────────────────────────────────────────────────────────────────
  // 2. CALENDAR SYNCHRONIZATION (IST VIEW)
  // ────────────────────────────────────────────────────────────────
  if (!options.skipCalendar) {
    try {
      const todayStr = getTodayISTDate();
      const { endIso } = getISTUpcomingRange(todayStr, 30);

      // Convert to explicit IST format (offset +05:30) as required by Graph
      const startIsoWithOffset = `${todayStr}T00:00:00+05:30`;
      const endTarget = new Date(endIso);
      const endTargetStr = getTodayISTDate(endTarget);
      const endIsoWithOffset = `${endTargetStr}T23:59:59+05:30`;

      const calendarEvents = await fetchPlacementCalendarEvents({
        mailboxId,
        startIsoWithOffset,
        endIsoWithOffset,
      });

      const academicYearId = await getActiveAcademicYearId(db);

      let lastProcessedEventId: string | undefined;

      for (const evt of calendarEvents) {
        try {
          // Infer company name from title (e.g. "Google Interview - Slot 1")
          const companyNameMatch = evt.title.split(/[-–:]/)[0].trim();
          const companyName = companyNameMatch || "Placement Drive";

          const companyId = await resolveCompany(db, companyName);
          const { driveId } = await resolveDrive(db, {
            companyId,
            academicYearId,
            notice: {
              companyName,
              roleTitle: null,
              packageText: null,
              minLpa: null,
              maxLpa: null,
              eligibleBranches: [],
              minCgpa: null,
              confidence: 0.95,
              evidence: { company: companyName },
              isRescheduling: false,
              isCancellation: evt.isCancelled,
              reschedulingDetails: evt.isCancelled ? "Cancelled via Calendar" : null,
              events: [],
              rawSourceText: evt.description || evt.title,
            },
          });

          await resolvePlacementEvent(db, {
            driveId,
            candidate: evt,
          });

          lastProcessedEventId = evt.outlookEventId;
          result.syncedCalendarEvents++;
        } catch (evtErr: any) {
          result.errors.push(`Error syncing event ${evt.outlookEventId}: ${evtErr.message}`);
        }
      }

      await outlookSyncStateRepository.recordSyncSuccess(db, {
        source: "outlook_calendar",
        mailboxId,
        lastProcessedEventId,
      });
    } catch (calErr: any) {
      result.success = false;
      result.errors.push(`Calendar sync failed: ${calErr.message}`);
      await outlookSyncStateRepository.recordSyncFailure(
        db,
        "outlook_calendar",
        calErr.message
      );
    }
  }

  return result;
}
