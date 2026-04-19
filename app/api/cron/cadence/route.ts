import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import {
  ACTIVE_CAREER_OPS_STATUSES,
  isMissingCareerOpsTableError,
  recomputeCadenceForUser,
} from "@/lib/career-ops/recompute";

export const dynamic = "force-dynamic";

const DEFAULT_USERS_LIMIT = 100;
const MAX_USERS_LIMIT = 500;

const DEFAULT_USER_APPLICATION_LIMIT = 200;
const MIN_USER_APPLICATION_LIMIT = 1;
const MAX_USER_APPLICATION_LIMIT = 400;

interface ActiveUserRow {
  user_id: string;
  updated_at: string;
}

function extractAuthSecret(request: Request): string {
  const authHeader = request.headers.get("authorization") ?? "";
  if (authHeader.toLowerCase().startsWith("bearer ")) {
    return authHeader.slice(7).trim();
  }

  return request.headers.get("x-cron-secret")?.trim() ?? "";
}

function parseIntegerParam(params: URLSearchParams, key: string, fallback: number, min: number, max: number): number {
  const raw = params.get(key);
  if (!raw) return fallback;

  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed)) return fallback;

  return Math.max(min, Math.min(max, parsed));
}

async function loadActiveUserIds(
  adminDb: ReturnType<typeof createAdminClient>,
  usersLimit: number
): Promise<{ userIds: string[]; error?: string; missingTable?: boolean }> {
  const oversampleLimit = Math.min(usersLimit * 8, MAX_USERS_LIMIT * 8);

  const { data, error } = await adminDb
    .from("career_ops_applications")
    .select("user_id, updated_at")
    .in("status", ACTIVE_CAREER_OPS_STATUSES)
    .order("updated_at", { ascending: false })
    .limit(oversampleLimit);

  if (error) {
    return {
      userIds: [],
      error: error.message,
      missingTable: isMissingCareerOpsTableError(error),
    };
  }

  const userIds: string[] = [];
  const seen = new Set<string>();

  for (const row of ((data as ActiveUserRow[] | null) ?? [])) {
    if (!row.user_id || seen.has(row.user_id)) continue;

    seen.add(row.user_id);
    userIds.push(row.user_id);

    if (userIds.length >= usersLimit) {
      break;
    }
  }

  return { userIds };
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_CAREER_OPS_SECRET;

  if (!cronSecret && process.env.NODE_ENV === "production") {
    return NextResponse.json(
      {
        error: "Cadence cron is misconfigured: set CRON_CAREER_OPS_SECRET in production.",
      },
      { status: 500 }
    );
  }

  if (cronSecret) {
    const incomingSecret = extractAuthSecret(request);
    if (incomingSecret !== cronSecret) {
      return NextResponse.json({ error: "Unauthorized cron request." }, { status: 401 });
    }
  }

  const requestUrl = new URL(request.url);
  const userId = requestUrl.searchParams.get("userId")?.trim() || null;
  const usersLimit = parseIntegerParam(
    requestUrl.searchParams,
    "users",
    DEFAULT_USERS_LIMIT,
    1,
    MAX_USERS_LIMIT
  );
  const userApplicationLimit = parseIntegerParam(
    requestUrl.searchParams,
    "limit",
    DEFAULT_USER_APPLICATION_LIMIT,
    MIN_USER_APPLICATION_LIMIT,
    MAX_USER_APPLICATION_LIMIT
  );

  try {
    const adminDb = createAdminClient();

    let userIds: string[] = [];
    if (userId) {
      userIds = [userId];
    } else {
      const activeUsers = await loadActiveUserIds(adminDb, usersLimit);
      if (activeUsers.error) {
        if (activeUsers.missingTable) {
          return NextResponse.json(
            {
              error: "Career tracker setup is pending. Run the latest database migration first.",
            },
            { status: 500 }
          );
        }

        return NextResponse.json(
          {
            error: `Could not load active tracker users: ${activeUsers.error}`,
          },
          { status: 500 }
        );
      }

      userIds = activeUsers.userIds;
    }

    if (userIds.length === 0) {
      return NextResponse.json({
        success: true,
        usersTargeted: 0,
        usersProcessed: 0,
        usersFailed: 0,
        processedApplications: 0,
        updated: 0,
        skipped: 0,
        failedUpdates: 0,
        failures: [],
      });
    }

    let usersProcessed = 0;
    let usersFailed = 0;
    let processedApplications = 0;
    let updated = 0;
    let skipped = 0;
    let failedUpdates = 0;
    const failures: string[] = [];

    for (const activeUserId of userIds) {
      const result = await recomputeCadenceForUser({
        db: adminDb,
        userId: activeUserId,
        limit: userApplicationLimit,
      });

      if (!result.success) {
        usersFailed += 1;
        const errorMessage = result.missingTable
          ? "Career tracker setup is pending. Run the latest database migration first."
          : result.error ?? "Unknown cadence recompute error.";
        failures.push(`${activeUserId}: ${errorMessage}`);
        continue;
      }

      const data = result.data ?? {
        updatedCount: 0,
        skippedCount: 0,
        failedCount: 0,
        processedCount: 0,
      };

      usersProcessed += 1;
      processedApplications += data.processedCount;
      updated += data.updatedCount;
      skipped += data.skippedCount;
      failedUpdates += data.failedCount;
    }

    return NextResponse.json({
      success: true,
      usersTargeted: userIds.length,
      usersProcessed,
      usersFailed,
      processedApplications,
      updated,
      skipped,
      failedUpdates,
      failures: failures.slice(0, 25),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
