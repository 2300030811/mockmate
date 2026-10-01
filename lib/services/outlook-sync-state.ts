import { SupabaseClient } from "@supabase/supabase-js";
import { throwIfError, maybeSingle } from "@/lib/db/base";

export interface PlacementSyncState {
  id: string;
  source: "outlook_email" | "outlook_calendar";
  mailbox_id: string;
  folder_id: string | null;
  delta_link: string | null;
  last_attempt_at: string | null;
  last_success_at: string | null;
  last_error: string | null;
  retry_count: number;
  consecutive_failure_count: number;
  last_processed_message_id: string | null;
  last_processed_event_id: string | null;
  updated_at: string;
}

export const outlookSyncStateRepository = {
  async getSyncState(
    db: SupabaseClient,
    source: "outlook_email" | "outlook_calendar"
  ): Promise<PlacementSyncState | null> {
    const res = await db
      .from("placement_sync_state")
      .select("*")
      .eq("source", source)
      .maybeSingle();

    return maybeSingle(res);
  },

  async recordSyncSuccess(
    db: SupabaseClient,
    payload: {
      source: "outlook_email" | "outlook_calendar";
      mailboxId: string;
      folderId?: string | null;
      deltaLink?: string | null;
      lastProcessedMessageId?: string | null;
      lastProcessedEventId?: string | null;
    }
  ): Promise<PlacementSyncState> {
    const nowIso = new Date().toISOString();

    const record = {
      source: payload.source,
      mailbox_id: payload.mailboxId,
      folder_id: payload.folderId ?? null,
      delta_link: payload.deltaLink ?? null,
      last_attempt_at: nowIso,
      last_success_at: nowIso,
      last_error: null,
      retry_count: 0,
      consecutive_failure_count: 0,
      last_processed_message_id: payload.lastProcessedMessageId ?? null,
      last_processed_event_id: payload.lastProcessedEventId ?? null,
    };

    const res = await db
      .from("placement_sync_state")
      .upsert(record, { onConflict: "source" })
      .select("*")
      .single();

    return throwIfError(res);
  },

  async recordSyncFailure(
    db: SupabaseClient,
    source: "outlook_email" | "outlook_calendar",
    errorMessage: string
  ): Promise<void> {
    const nowIso = new Date().toISOString();

    const existing = await this.getSyncState(db, source);
    const newRetryCount = (existing?.retry_count ?? 0) + 1;
    const newFailureCount = (existing?.consecutive_failure_count ?? 0) + 1;

    const res = await db
      .from("placement_sync_state")
      .upsert(
        {
          source,
          mailbox_id: existing?.mailbox_id ?? "unknown",
          last_attempt_at: nowIso,
          last_error: errorMessage,
          retry_count: newRetryCount,
          consecutive_failure_count: newFailureCount,
        },
        { onConflict: "source" }
      );

    if (res.error) {
      // Don't mask underlying sync error if state recording fails
      console.error("Failed to record sync state error:", res.error);
    }
  },

  async invalidateDeltaLink(
    db: SupabaseClient,
    source: "outlook_email" | "outlook_calendar"
  ): Promise<void> {
    const res = await db
      .from("placement_sync_state")
      .update({ delta_link: null, last_error: "Delta link invalidated (HTTP 410 Gone recovery)" })
      .eq("source", source);

    if (res.error) {
      console.error("Failed to invalidate delta link:", res.error);
    }
  },
};
