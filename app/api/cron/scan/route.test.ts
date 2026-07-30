import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";
import { createAdminClient } from "@/utils/supabase/admin";
import { dedupeScannedJobs, filterJobsByKeywords, scanCompany } from "@/lib/services/scanner";
import { careerOpsRepository } from "@/lib/db/career-ops-repository";

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

vi.mock("@/lib/db/career-ops-repository", () => ({
  careerOpsRepository: {
    loadScanTargets: vi.fn(),
    startScanRun: vi.fn(),
    finishScanRun: vi.fn(),
    fetchExistingPostings: vi.fn(),
    upsertJobPostings: vi.fn(),
  },
}));

const createAdminClientMock = vi.mocked(createAdminClient);
const scanCompanyMock = vi.mocked(scanCompany);
const filterJobsByKeywordsMock = vi.mocked(filterJobsByKeywords);
const dedupeScannedJobsMock = vi.mocked(dedupeScannedJobs);
const careerOpsRepositoryMock = vi.mocked(careerOpsRepository);
const originalEnv = process.env;

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

    careerOpsRepositoryMock.loadScanTargets.mockResolvedValue([
      { name: "Acme", api_type: "lever", api_url: "https://api.lever.co/v0/postings/acme" },
    ]);
    careerOpsRepositoryMock.startScanRun.mockResolvedValue({ id: "run-1" });
    careerOpsRepositoryMock.fetchExistingPostings.mockResolvedValue({
      urls: [],
      fingerprints: [],
    });
    careerOpsRepositoryMock.upsertJobPostings.mockResolvedValue(null as any);

    createAdminClientMock.mockReturnValue({} as any);

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
    expect(careerOpsRepositoryMock.upsertJobPostings).toHaveBeenCalledTimes(1);
    expect(careerOpsRepositoryMock.upsertJobPostings).toHaveBeenCalledWith(
      {},
      expect.arrayContaining([
        expect.objectContaining({
          external_url: "https://jobs.example.com/1",
          posting_status: "uncertain",
        }),
      ])
    );
    expect(careerOpsRepositoryMock.finishScanRun).toHaveBeenCalledWith(
      {},
      "run-1",
      expect.objectContaining({
        status: "completed",
        insertedCount: 1,
      })
    );
  });

  it("returns 500 and finalizes run as failed when upsert fails", async () => {
    process.env.CRON_SCAN_SECRET = "scan-secret";

    careerOpsRepositoryMock.loadScanTargets.mockResolvedValue([
      { name: "Acme", api_type: "lever", api_url: "https://api.lever.co/v0/postings/acme" },
    ]);
    careerOpsRepositoryMock.startScanRun.mockResolvedValue({ id: "run-1" });
    careerOpsRepositoryMock.fetchExistingPostings.mockResolvedValue({
      urls: [],
      fingerprints: [],
    });
    careerOpsRepositoryMock.upsertJobPostings.mockRejectedValue(new Error("insert failed"));

    createAdminClientMock.mockReturnValue({} as any);

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
    expect(careerOpsRepositoryMock.finishScanRun).toHaveBeenCalledWith(
      {},
      "run-1",
      expect.objectContaining({
        status: "failed",
      })
    );
  });
});