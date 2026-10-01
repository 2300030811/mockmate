import { describe, it, expect, vi } from "vitest";
import { outlookSyncStateRepository } from "./outlook-sync-state";

describe("Outlook Sync State Repository", () => {
  it("getSyncState queries placement_sync_state by source correctly", async () => {
    const mockMaybeSingle = vi.fn().mockResolvedValue({
      data: {
        id: "s-1",
        source: "outlook_email",
        delta_link: "https://graph.microsoft.com/delta?token=xyz",
      },
      error: null,
    });
    const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    const mockDb = {
      from: vi.fn().mockReturnValue({ select: mockSelect }),
    } as any;

    const state = await outlookSyncStateRepository.getSyncState(mockDb, "outlook_email");
    expect(mockDb.from).toHaveBeenCalledWith("placement_sync_state");
    expect(mockEq).toHaveBeenCalledWith("source", "outlook_email");
    expect(state?.delta_link).toBe("https://graph.microsoft.com/delta?token=xyz");
  });

  it("recordSyncSuccess resets retry count and updates deltaLink", async () => {
    const mockSingle = vi.fn().mockResolvedValue({
      data: { id: "s-1", delta_link: "new-delta-link" },
      error: null,
    });
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
    const mockUpsert = vi.fn().mockReturnValue({ select: mockSelect });
    const mockDb = {
      from: vi.fn().mockReturnValue({ upsert: mockUpsert }),
    } as any;

    const res = await outlookSyncStateRepository.recordSyncSuccess(mockDb, {
      source: "outlook_email",
      mailboxId: "placement@klu.ac.in",
      deltaLink: "new-delta-link",
      lastProcessedMessageId: "msg-999",
    });

    expect(mockDb.from).toHaveBeenCalledWith("placement_sync_state");
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        source: "outlook_email",
        delta_link: "new-delta-link",
        retry_count: 0,
        consecutive_failure_count: 0,
        last_error: null,
        last_processed_message_id: "msg-999",
      }),
      { onConflict: "source" }
    );
    expect(res.delta_link).toBe("new-delta-link");
  });

  it("recordSyncFailure increments failure and retry counts", async () => {
    // Mock existing state
    const mockMaybeSingle = vi.fn().mockResolvedValue({
      data: { source: "outlook_email", retry_count: 2, consecutive_failure_count: 2 },
      error: null,
    });
    const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

    const mockUpsert = vi.fn().mockResolvedValue({ error: null });
    const mockDb = {
      from: vi.fn((table) => {
        if (table === "placement_sync_state") {
          return {
            select: mockSelect,
            upsert: mockUpsert,
          };
        }
        return {};
      }),
    } as any;

    await outlookSyncStateRepository.recordSyncFailure(
      mockDb,
      "outlook_email",
      "Network timeout"
    );

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        source: "outlook_email",
        last_error: "Network timeout",
        retry_count: 3,
        consecutive_failure_count: 3,
      }),
      { onConflict: "source" }
    );
  });

  it("invalidateDeltaLink sets delta_link to null for 410 recovery", async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
    const mockDb = {
      from: vi.fn().mockReturnValue({ update: mockUpdate }),
    } as any;

    await outlookSyncStateRepository.invalidateDeltaLink(mockDb, "outlook_email");

    expect(mockDb.from).toHaveBeenCalledWith("placement_sync_state");
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        delta_link: null,
      })
    );
    expect(mockEq).toHaveBeenCalledWith("source", "outlook_email");
  });
});
