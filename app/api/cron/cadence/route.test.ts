import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";
import { createAdminClient } from "@/utils/supabase/admin";
import { recomputeCadenceForUser } from "@/lib/career-ops/recompute";

vi.mock("@/utils/supabase/admin", () => ({
  createAdminClient: vi.fn(),
}));

vi.mock("@/lib/career-ops/recompute", () => ({
  ACTIVE_CAREER_OPS_STATUSES: ["evaluated", "applied", "responded", "interview"],
  isMissingCareerOpsTableError: (error: { code?: string; message?: string } | null | undefined) => {
    if (!error) return false;
    return error.code === "42P01" || (error.message ?? "").toLowerCase().includes("career_ops");
  },
  recomputeCadenceForUser: vi.fn(),
}));

const createAdminClientMock = vi.mocked(createAdminClient);
const recomputeCadenceForUserMock = vi.mocked(recomputeCadenceForUser);
const originalEnv = process.env;

function makeActiveUsersQuery(result: { data: unknown; error: { code?: string; message?: string } | null }) {
  return {
    select: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue(result),
  };
}

describe("GET /api/cron/cadence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    const mutableEnv = process.env as Record<string, string | undefined>;
    delete mutableEnv.CRON_CAREER_OPS_SECRET;
    delete mutableEnv.CRON_SCAN_SECRET;
    delete mutableEnv.NODE_ENV;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("rejects unauthorized request when cron secret is configured", async () => {
    process.env.CRON_CAREER_OPS_SECRET = "test-secret";

    const response = await GET(new Request("http://localhost/api/cron/cadence"));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Unauthorized cron request.");
    expect(createAdminClientMock).not.toHaveBeenCalled();
  });

  it("recomputes cadence for a specific user", async () => {
    const adminDb = { from: vi.fn() };
    createAdminClientMock.mockReturnValue(adminDb as never);

    recomputeCadenceForUserMock.mockResolvedValue({
      success: true,
      data: {
        updatedCount: 3,
        skippedCount: 1,
        failedCount: 0,
        processedCount: 4,
      },
    });

    const response = await GET(
      new Request("http://localhost/api/cron/cadence?userId=user-1&limit=50")
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.usersTargeted).toBe(1);
    expect(body.usersProcessed).toBe(1);
    expect(body.usersFailed).toBe(0);
    expect(body.updated).toBe(3);
    expect(body.skipped).toBe(1);
    expect(body.processedApplications).toBe(4);

    expect(recomputeCadenceForUserMock).toHaveBeenCalledWith({
      db: adminDb,
      userId: "user-1",
      limit: 50,
    });
  });

  it("aggregates results for discovered active users", async () => {
    const activeUserQuery = makeActiveUsersQuery({
      data: [
        { user_id: "user-1", updated_at: "2026-04-18T10:00:00.000Z" },
        { user_id: "user-2", updated_at: "2026-04-18T09:00:00.000Z" },
        { user_id: "user-1", updated_at: "2026-04-18T08:00:00.000Z" },
        { user_id: "user-3", updated_at: "2026-04-18T07:00:00.000Z" },
      ],
      error: null,
    });

    const adminDb = {
      from: vi.fn().mockReturnValue(activeUserQuery),
    };
    createAdminClientMock.mockReturnValue(adminDb as never);

    recomputeCadenceForUserMock
      .mockResolvedValueOnce({
        success: true,
        data: {
          updatedCount: 2,
          skippedCount: 1,
          failedCount: 0,
          processedCount: 3,
        },
      })
      .mockResolvedValueOnce({
        success: false,
        error: "boom",
      })
      .mockResolvedValueOnce({
        success: true,
        data: {
          updatedCount: 0,
          skippedCount: 1,
          failedCount: 0,
          processedCount: 1,
        },
      });

    const response = await GET(new Request("http://localhost/api/cron/cadence?users=3"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.usersTargeted).toBe(3);
    expect(body.usersProcessed).toBe(2);
    expect(body.usersFailed).toBe(1);
    expect(body.updated).toBe(2);
    expect(body.skipped).toBe(2);
    expect(body.failedUpdates).toBe(0);
    expect(body.processedApplications).toBe(4);
    expect(body.failures).toEqual(["user-2: boom"]);
  });

  it("returns setup-pending error when tracker tables are missing", async () => {
    const activeUserQuery = makeActiveUsersQuery({
      data: null,
      error: {
        code: "42P01",
        message: "relation \"career_ops_applications\" does not exist",
      },
    });

    const adminDb = {
      from: vi.fn().mockReturnValue(activeUserQuery),
    };
    createAdminClientMock.mockReturnValue(adminDb as never);

    const response = await GET(new Request("http://localhost/api/cron/cadence"));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toContain("Career tracker setup is pending");
  });
});
