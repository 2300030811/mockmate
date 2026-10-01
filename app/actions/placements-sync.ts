"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/utils/supabase/admin";
import {
  runOutlookPlacementSync,
  SyncOrchestratorOptions,
  SyncOrchestratorResult,
} from "@/lib/services/outlook-sync-orchestrator";

/**
 * Server action to trigger immediate Outlook email & calendar placement sync.
 * Revalidates `/placements` so live UI reflects new drives, events, and notices.
 */
export async function syncPlacementsNow(
  options?: SyncOrchestratorOptions
): Promise<SyncOrchestratorResult> {
  const adminDb = createAdminClient();
  const result = await runOutlookPlacementSync(adminDb, options);

  try {
    revalidatePath("/placements");
  } catch {
    // revalidatePath may not be available in standalone test environments
  }

  return result;
}
