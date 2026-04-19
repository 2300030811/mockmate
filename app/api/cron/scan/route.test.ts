import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";
import { createAdminClient } from "@/utils/supabase/admin";
import { dedupeScannedJobs, filterJobsByKeywords, scanCompany } from "@/lib/services/scanner";

vi.mock("@/utils/supabase/admin", () => ({
  createAdminClient: vi.fn(),
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/lib/services/scanner", () => ({
  scanCompany: vi.fn(),
  filterJobsByKeywords: vi.fn((jobs: unknown[]) => jobs),
  dedupeScannedJobs: vi.fn((jobs: unknown[]) => jobs),
}));

const createAdminClientMock = vi.mocked(createAdminClient);
const scanCompanyMock = vi.mocked(scanCompany);
const filterJobsByKeywordsMock = vi.mocked(filterJobsByKeywords);
const dedupeScannedJobsMock = vi.mocked(dedupeScannedJobs);
const originalEnv = process.env;

function buildAdminDb(params?: {
  upsertError?: { message: string } | null;
}) {
  const scanTargetsSelectEq = vi.fn().mockResolvedValue({
    data: [
      {
        name: "Acme",
        api_type: "lever",
        api_url: "https://api.lever.co/v0/postings/acme",
      },
    ],
    error: null,
  });
  const scanTargetsSelect = vi.fn().mockReturnValue({ eq: scanTargetsSelectEq });

  const scanRunsInsertSingle = vi.fn().mockResolvedValue({
    data: { id: "run-1" },
    error: null,
  });
  const scanRunsInsertSelect = vi.fn().mockReturnValue({ single: scanRunsInsertSingle });
  const scanRunsInsert = vi.fn().mockReturnValue({ select: scanRunsInsertSelect });

  const scanRunsUpdateEq = vi.fn().mockResolvedValue({ error: null });
  const scanRunsUpdate = vi.fn().mockReturnValue({ eq: scanRunsUpdateEq });

  const jobPostingsSelect = vi.fn((column: string) => ({
    in: vi.fn().mockResolvedValue(
      column === "external_url"
        ? { data: [], error: null }
        : { data: [], error: null }
    ),
  }));

  const jobPostingsUpsert = vi.fn().mockResolvedValue({
    error: params?.upsertError ?? null,
  });

  const db = {
    from: vi.fn((table: string) => {
      if (table === "career_ops_scan_targets") {
        return {
          select: scanTargetsSelect,
        };
      }

      if (table === "career_ops_scan_runs") {
        return {
          insert: scanRunsInsert,
          update: scanRunsUpdate,
        };
      }

      if (table === "career_ops_job_postings") {
        return {
          select: jobPostingsSelect,
          upsert: jobPostingsUpsert,
        };
      }

      throw new Error(`Unexpected table ${table}`);
    }),
  };

  return {
    db,
    spies: {
      scanRunsUpdate,
      jobPostingsUpsert,
    },
  };
}

describe("GET /api/cron/scan", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    const mutableEnv = process.env as Record<string, string | undefined>;
    delete mutableEnv.CRON_SCAN_SECRET;
    delete mutableEnv.NODE_ENV;
    delete mutableEnv.SCAN_TITLE_KEYWORDS;
    delete mutableEnv.SCAN_NEGATIVE_TITLE_KEYWORDS;

    filterJobsByKeywordsMock.mockImplementation((jobs) => jobs);
    dedupeScannedJobsMock.mockImplementation((jobs) => jobs);
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("returns misconfiguration in production when scan secret is missing", async () => {
    const mutableEnv = process.env as Record<string, string | undefined>;
    mutableEnv.NODE_ENV = "production";

    const response = await GET(new Request("http://localhost/api/cron/scan"));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toContain("CRON_SCAN_SECRET is missing");
    expect(createAdminClientMock).not.toHaveBeenCalled();
  });

  it("rejects unauthorized request when scan secret is configured", async () => {
    process.env.CRON_SCAN_SECRET = "scan-secret";

    const response = await GET(new Request("http://localhost/api/cron/scan"));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Unauthorized cron request.");
    expect(createAdminClientMock).not.toHaveBeenCalled();
  });

  it("scans and inserts new postings successfully", async () => {
    process.env.CRON_SCAN_SECRET = "scan-secret";

    const { db, spies } = buildAdminDb();
    createAdminClientMock.mockReturnValue(db as never);

    scanCompanyMock.mockResolvedValue([
      {
        title: "Senior Software Engineer",
        url: "https://jobs.example.com/1",
        company: "Acme",
        location: "Remote",
        source: "lever",
        sourceJobId: "job-1",
        normalizedCompany: "acme",
        normalizedTitle: "senior software engineer",
        fingerprint: "acme::senior software engineer",
      },
    ]);

    const response = await GET(
      new Request("http://localhost/api/cron/scan", {
        headers: {
          authorization: "Bearer scan-secret",
        },
      })
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.inserted).toBe(1);
    expect(spies.jobPostingsUpsert).toHaveBeenCalledTimes(1);
    expect(spies.jobPostingsUpsert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          external_url: "https://jobs.example.com/1",
          posting_status: "uncertain",
        }),
      ]),
      { onConflict: "external_url" }
    );
    expect(spies.scanRunsUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "completed",
        inserted_count: 1,
      })
    );
  });

  it("returns 500 and finalizes run as failed when upsert fails", async () => {
    process.env.CRON_SCAN_SECRET = "scan-secret";

    const { db, spies } = buildAdminDb({
      upsertError: { message: "insert failed" },
    });
    createAdminClientMock.mockReturnValue(db as never);

    scanCompanyMock.mockResolvedValue([
      {
        title: "Senior Software Engineer",
        url: "https://jobs.example.com/1",
        company: "Acme",
        location: "Remote",
        source: "lever",
        sourceJobId: "job-1",
        normalizedCompany: "acme",
        normalizedTitle: "senior software engineer",
        fingerprint: "acme::senior software engineer",
      },
    ]);

    const response = await GET(
      new Request("http://localhost/api/cron/scan", {
        headers: {
          "x-cron-secret": "scan-secret",
        },
      })
    );
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toContain("Could not upsert scanned postings: insert failed");
    expect(spies.scanRunsUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "failed",
      })
    );
  });
});