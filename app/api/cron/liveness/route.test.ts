import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";
import { createAdminClient } from "@/utils/supabase/admin";
import { chromium } from "playwright";

vi.mock("@/utils/supabase/admin", () => ({
  createAdminClient: vi.fn(),
}));

vi.mock("playwright", () => ({
  chromium: {
    launch: vi.fn(),
  },
}));

const createAdminClientMock = vi.mocked(createAdminClient);
const launchMock = vi.mocked(chromium.launch);
const originalEnv = process.env;

function makeSelectQuery(result: {
  data: unknown;
  error: { code?: string; message?: string } | null;
}) {
  return {
    select: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue(result),
  };
}

describe("GET /api/cron/liveness", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    const mutableEnv = process.env as Record<string, string | undefined>;
    delete mutableEnv.CRON_LIVENESS_SECRET;
    delete mutableEnv.CRON_SCAN_SECRET;
    delete mutableEnv.CRON_CAREER_OPS_SECRET;
    delete mutableEnv.NODE_ENV;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("rejects unauthorized request when cron secret is configured", async () => {
    process.env.CRON_LIVENESS_SECRET = "test-secret";

    const response = await GET(new Request("http://localhost/api/cron/liveness"));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Unauthorized cron request.");
    expect(createAdminClientMock).not.toHaveBeenCalled();
  });

  it("returns setup-pending error when tracker tables are missing", async () => {
    const selectQuery = makeSelectQuery({
      data: null,
      error: {
        code: "42P01",
        message: 'relation "career_ops_job_postings" does not exist',
      },
    });

    const adminDb = {
      from: vi.fn().mockReturnValue(selectQuery),
    };
    createAdminClientMock.mockReturnValue(adminDb as never);

    const response = await GET(new Request("http://localhost/api/cron/liveness"));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toContain("Career tracker setup is pending");
    expect(launchMock).not.toHaveBeenCalled();
  });

  it("returns success without launching browser when no candidates are found", async () => {
    const selectQuery = makeSelectQuery({
      data: [],
      error: null,
    });

    const adminDb = {
      from: vi.fn().mockReturnValue(selectQuery),
    };
    createAdminClientMock.mockReturnValue(adminDb as never);

    const response = await GET(new Request("http://localhost/api/cron/liveness?limit=5"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.checked).toBe(0);
    expect(launchMock).not.toHaveBeenCalled();
  });

  it("checks candidates and persists active classification", async () => {
    const selectQuery = makeSelectQuery({
      data: [
        {
          id: "posting-1",
          external_url: "https://jobs.example.com/1",
          posting_status: "uncertain",
        },
      ],
      error: null,
    });

    const updateQuery = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    };

    const adminDb = {
      from: vi
        .fn()
        .mockReturnValueOnce(selectQuery)
        .mockReturnValue(updateQuery),
    };
    createAdminClientMock.mockReturnValue(adminDb as never);

    const page = {
      goto: vi.fn().mockResolvedValue({ status: () => 200 }),
      waitForTimeout: vi.fn().mockResolvedValue(undefined),
      url: vi.fn().mockReturnValue("https://jobs.example.com/1"),
      evaluate: vi
        .fn()
        .mockResolvedValueOnce("Role details and responsibilities. ".repeat(20))
        .mockResolvedValueOnce(["Apply now"]),
    };

    const browser = {
      newPage: vi.fn().mockResolvedValue(page),
      close: vi.fn().mockResolvedValue(undefined),
    };
    launchMock.mockResolvedValue(browser as never);

    const response = await GET(new Request("http://localhost/api/cron/liveness?limit=1"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.checked).toBe(1);
    expect(body.updated).toBe(1);
    expect(body.resultCounts.active).toBe(1);

    expect(updateQuery.update).toHaveBeenCalledWith(
      expect.objectContaining({
        posting_status: "active",
        last_liveness_result: "active",
      })
    );
    expect(updateQuery.eq).toHaveBeenCalledWith("id", "posting-1");
    expect(browser.close).toHaveBeenCalledTimes(1);
  });
});