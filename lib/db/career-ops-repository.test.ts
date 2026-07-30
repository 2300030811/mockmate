import { describe, expect, it, vi } from "vitest";
import { careerOpsRepository } from "./career-ops-repository";

describe("careerOpsRepository", () => {
  it("getFollowUpCount counts correctly", async () => {
    const mockEq2 = vi.fn().mockResolvedValue({ count: 4, error: null });
    const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });
    const mockDb = {
      from: vi.fn().mockReturnValue({ select: mockSelect }),
    } as any;

    const count = await careerOpsRepository.getFollowUpCount(mockDb, "user-1", "app-1");
    expect(mockDb.from).toHaveBeenCalledWith("career_ops_follow_ups");
    expect(mockSelect).toHaveBeenCalledWith("id", { count: "exact", head: true });
    expect(mockEq1).toHaveBeenCalledWith("user_id", "user-1");
    expect(mockEq2).toHaveBeenCalledWith("application_id", "app-1");
    expect(count).toBe(4);
  });

  it("getActiveUserIdsForCadence builds query correctly", async () => {
    const mockLimit = vi.fn().mockResolvedValue({ data: [{ user_id: "u-1" }], error: null });
    const mockOrder = vi.fn().mockReturnValue({ limit: mockLimit });
    const mockIn = vi.fn().mockReturnValue({ order: mockOrder });
    const mockSelect = vi.fn().mockReturnValue({ in: mockIn });
    const mockDb = {
      from: vi.fn().mockReturnValue({ select: mockSelect }),
    } as any;

    const res = await careerOpsRepository.getActiveUserIdsForCadence(mockDb, ["applied"], 10);
    expect(mockDb.from).toHaveBeenCalledWith("career_ops_applications");
    expect(mockSelect).toHaveBeenCalledWith("user_id, updated_at");
    expect(mockIn).toHaveBeenCalledWith("status", ["applied"]);
    expect(mockOrder).toHaveBeenCalledWith("updated_at", { ascending: false });
    expect(mockLimit).toHaveBeenCalledWith(10);
    expect(res).toEqual([{ user_id: "u-1" }]);
  });

  it("loadScanTargets builds query correctly", async () => {
    const mockEq = vi.fn().mockResolvedValue({ data: [{ name: "Acme" }], error: null });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    const mockDb = {
      from: vi.fn().mockReturnValue({ select: mockSelect }),
    } as any;

    const res = await careerOpsRepository.loadScanTargets(mockDb);
    expect(mockDb.from).toHaveBeenCalledWith("career_ops_scan_targets");
    expect(mockSelect).toHaveBeenCalledWith("name, api_type, api_url");
    expect(mockEq).toHaveBeenCalledWith("enabled", true);
    expect(res).toEqual([{ name: "Acme" }]);
  });

  it("startScanRun builds query correctly", async () => {
    const mockSingle = vi.fn().mockResolvedValue({ data: { id: "run-1" }, error: null });
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
    const mockDb = {
      from: vi.fn().mockReturnValue({ insert: mockInsert }),
    } as any;

    const res = await careerOpsRepository.startScanRun(mockDb, { scannedTargets: 5 });
    expect(mockDb.from).toHaveBeenCalledWith("career_ops_scan_runs");
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({ scanned_targets: 5, status: "running" }));
    expect(res).toEqual({ id: "run-1" });
  });

  it("finishScanRun builds query correctly", async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
    const mockDb = {
      from: vi.fn().mockReturnValue({ update: mockUpdate }),
    } as any;

    const payload = {
      status: "completed" as const,
      foundCount: 10,
      filteredCount: 8,
      dedupedCount: 6,
      insertedCount: 4,
      failedCount: 0,
      skippedExistingCount: 2,
      errorMessage: null,
    };
    await careerOpsRepository.finishScanRun(mockDb, "run-1", payload);
    expect(mockDb.from).toHaveBeenCalledWith("career_ops_scan_runs");
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
      status: "completed",
      found_count: 10,
      filtered_count: 8,
      deduped_count: 6,
      inserted_count: 4,
      failed_count: 0,
      skipped_existing_count: 2,
      error_message: null,
    }));
    expect(mockEq).toHaveBeenCalledWith("id", "run-1");
  });

  it("fetchExistingPostings builds query correctly", async () => {
    const mockInUrl = vi.fn().mockResolvedValue({ data: [{ external_url: "url1" }], error: null });
    const mockSelectUrl = vi.fn().mockReturnValue({ in: mockInUrl });
    const mockInFinger = vi.fn().mockResolvedValue({ data: [{ job_fingerprint: "finger1" }], error: null });
    const mockSelectFinger = vi.fn().mockReturnValue({ in: mockInFinger });
    
    const mockDb = {
      from: vi.fn((table: string) => {
        if (table === "career_ops_job_postings") {
          return {
            select: vi.fn((fields: string) => {
              if (fields === "external_url") return { in: mockInUrl };
              if (fields === "job_fingerprint") return { in: mockInFinger };
              throw new Error("unexpected fields");
            })
          };
        }
        throw new Error("unexpected table");
      }),
    } as any;

    const res = await careerOpsRepository.fetchExistingPostings(mockDb, ["url1"], ["finger1"]);
    expect(res).toEqual({
      urls: [{ external_url: "url1" }],
      fingerprints: [{ job_fingerprint: "finger1" }],
    });
  });

  it("upsertJobPostings builds query correctly", async () => {
    const mockUpsert = vi.fn().mockResolvedValue({ error: null });
    const mockDb = {
      from: vi.fn().mockReturnValue({ upsert: mockUpsert }),
    } as any;

    await careerOpsRepository.upsertJobPostings(mockDb, [{ title: "Job" }]);
    expect(mockDb.from).toHaveBeenCalledWith("career_ops_job_postings");
    expect(mockUpsert).toHaveBeenCalledWith([{ title: "Job" }], { onConflict: "external_url" });
  });

  it("loadPostingCandidates builds query correctly", async () => {
    const mockLimit = vi.fn().mockResolvedValue({ data: [{ id: "posting-1" }], error: null });
    const mockOrder = vi.fn().mockReturnValue({ limit: mockLimit });
    const mockIn = vi.fn().mockReturnValue({ order: mockOrder });
    const mockSelect = vi.fn().mockReturnValue({ in: mockIn });
    const mockDb = {
      from: vi.fn().mockReturnValue({ select: mockSelect }),
    } as any;

    const res = await careerOpsRepository.loadPostingCandidates(mockDb, ["active"], 10);
    expect(mockDb.from).toHaveBeenCalledWith("career_ops_job_postings");
    expect(mockSelect).toHaveBeenCalledWith("id, external_url, posting_status");
    expect(mockIn).toHaveBeenCalledWith("posting_status", ["active"]);
    expect(mockOrder).toHaveBeenCalledWith("last_liveness_checked_at", { ascending: true });
    expect(mockLimit).toHaveBeenCalledWith(10);
    expect(res).toEqual([{ id: "posting-1" }]);
  });

  it("updatePostingLiveness builds query correctly", async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
    const mockDb = {
      from: vi.fn().mockReturnValue({ update: mockUpdate }),
    } as any;

    await careerOpsRepository.updatePostingLiveness(mockDb, "p-1", { status: "active", checkedAt: "2026-06-19T00:00:00Z" });
    expect(mockDb.from).toHaveBeenCalledWith("career_ops_job_postings");
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
      posting_status: "active",
      last_liveness_result: "active",
      last_liveness_checked_at: "2026-06-19T00:00:00Z",
    }));
    expect(mockEq).toHaveBeenCalledWith("id", "p-1");
  });
});
