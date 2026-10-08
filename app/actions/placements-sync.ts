"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/utils/supabase/admin";
import { requireAdmin } from "@/lib/auth-utils";
import { runOutlookPlacementSync } from "@/lib/services/outlook-sync-orchestrator";

export interface SafePlacementSyncResult {
  success: boolean;
  message: string;
  processedCount: number;
}

/**
 * Server action to trigger Outlook placement sync.
 * STRICT SECURITY: Restricted exclusively to verified administrators.
 * Mailbox and folder parameters are server-environment locked to prevent unauthorized traversal.
 */
export async function syncPlacementsNow(): Promise<SafePlacementSyncResult> {
  const isAdmin = await requireAdmin();
  if (!isAdmin) {
    return {
      success: false,
      message: "Unauthorized: Administrator privileges required.",
      processedCount: 0,
    };
  }

  try {
    const adminDb = createAdminClient();
    // Options are locked to server environment only; no caller-supplied overrides permitted.
    const result = await runOutlookPlacementSync(adminDb, {
      mailboxId: process.env.OUTLOOK_PLACEMENT_MAILBOX_ID,
      folderId: process.env.OUTLOOK_PLACEMENT_FOLDER_ID,
    });

    try {
      revalidatePath("/placements");
    } catch {
      // revalidatePath may not be available in test runners
    }

    const totalProcessed = (result.processedEmails || 0) + (result.syncedCalendarEvents || 0);
    return {
      success: result.success,
      message: result.success
        ? `Successfully synchronized ${totalProcessed} placement updates.`
        : "Sync completed with partial warnings.",
      processedCount: totalProcessed,
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Sync execution failed.",
      processedCount: 0,
    };
  }
}
