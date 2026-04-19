import { NextResponse } from "next/server";
import { chromium, type Browser, type Page } from "playwright";
import { createAdminClient } from "@/utils/supabase/admin";
import { logger } from "@/lib/logger";
import {
  classifyLiveness,
  type JobPostingLiveness,
  type LivenessClassification,
} from "@/lib/career-ops/liveness";
import { isMissingCareerOpsTableError } from "@/lib/career-ops/recompute";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;
const NAVIGATION_TIMEOUT_MS = 15_000;
const SPA_HYDRATION_WAIT_MS = 2_000;
const CHECKABLE_STATUSES: JobPostingLiveness[] = ["active", "uncertain"];

interface PostingRow {
  id: string;
  external_url: string;
  posting_status: JobPostingLiveness;
}

interface LivenessCheckResult extends LivenessClassification {
  status: number;
  finalUrl: string;
}

function extractAuthSecret(request: Request): string {
  const authHeader = request.headers.get("authorization") ?? "";
  if (authHeader.toLowerCase().startsWith("bearer ")) {
    return authHeader.slice(7).trim();
  }

  return request.headers.get("x-cron-secret")?.trim() ?? "";
}

function parseIntegerParam(
  params: URLSearchParams,
  key: string,
  fallback: number,
  min: number,
  max: number
): number {
  const raw = params.get(key);
  if (!raw) return fallback;

  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed)) return fallback;

  return Math.max(min, Math.min(max, parsed));
}

function parseStatusesParam(params: URLSearchParams): JobPostingLiveness[] {
  const raw = params.get("statuses")?.trim();
  if (!raw) return CHECKABLE_STATUSES;

  const parsed = raw
    .split(",")
    .map((status) => status.trim().toLowerCase())
    .filter((status): status is JobPostingLiveness =>
      status === "active" || status === "uncertain" || status === "expired"
    );

  const unique = Array.from(new Set(parsed));
  return unique.length > 0 ? unique : CHECKABLE_STATUSES;
}

async function collectApplyControls(page: Page): Promise<string[]> {
  return await page.evaluate(() => {
    const candidates = Array.from(
      document.querySelectorAll(
        "a, button, input[type=\"submit\"], input[type=\"button\"], [role=\"button\"]"
      )
    );

    return candidates
      .filter((element) => {
        if (element.closest("nav, header, footer")) return false;
        if (element.closest("[aria-hidden=\"true\"]")) return false;

        const style = window.getComputedStyle(element);
        if (style.display === "none" || style.visibility === "hidden") return false;
        if (!element.getClientRects().length) return false;

        return Array.from(element.getClientRects()).some(
          (rect) => rect.width > 0 && rect.height > 0
        );
      })
      .map((element) => {
        const inputLike = element as HTMLInputElement;
        const textElement = element as HTMLElement;
        const label = [
          textElement.innerText,
          inputLike.value,
          element.getAttribute("aria-label"),
          element.getAttribute("title"),
        ]
          .filter(Boolean)
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();

        return label;
      })
      .filter(Boolean);
  });
}

async function checkPostingLiveness(page: Page, url: string): Promise<LivenessCheckResult> {
  try {
    const response = await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: NAVIGATION_TIMEOUT_MS,
    });

    const status = response?.status() ?? 0;

    // Give SPA job pages time to hydrate before checking controls.
    await page.waitForTimeout(SPA_HYDRATION_WAIT_MS);

    const finalUrl = page.url();
    const bodyText = await page.evaluate(() => document.body?.innerText ?? "");
    const applyControls = await collectApplyControls(page);

    const classification = classifyLiveness({ status, finalUrl, bodyText, applyControls });
    return {
      ...classification,
      status,
      finalUrl,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      result: "expired",
      reason: `navigation error: ${message.split("\n")[0]}`,
      status: 0,
      finalUrl: url,
    };
  }
}

async function loadPostingCandidates(params: {
  db: ReturnType<typeof createAdminClient>;
  statuses: JobPostingLiveness[];
  limit: number;
}): Promise<{ rows: PostingRow[]; error?: string; missingTable?: boolean }> {
  const { data, error } = await params.db
    .from("career_ops_job_postings")
    .select("id, external_url, posting_status")
    .in("posting_status", params.statuses)
    .order("last_liveness_checked_at", { ascending: true })
    .limit(params.limit);

  if (error) {
    return {
      rows: [],
      error: error.message,
      missingTable: isMissingCareerOpsTableError(error),
    };
  }

  return {
    rows: ((data as PostingRow[] | null) ?? []).filter((row) => Boolean(row.external_url)),
  };
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_LIVENESS_SECRET;

  if (!cronSecret && process.env.NODE_ENV === "production") {
    return NextResponse.json(
      {
        error: "Liveness cron is misconfigured: set CRON_LIVENESS_SECRET in production.",
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
  const limit = parseIntegerParam(requestUrl.searchParams, "limit", DEFAULT_LIMIT, 1, MAX_LIMIT);
  const statuses = parseStatusesParam(requestUrl.searchParams);

  let browser: Browser | null = null;

  try {
    const adminDb = createAdminClient();
    const candidates = await loadPostingCandidates({ db: adminDb, statuses, limit });

    if (candidates.error) {
      if (candidates.missingTable) {
        return NextResponse.json(
          {
            error: "Career tracker setup is pending. Run the latest database migration first.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: `Could not load postings for liveness check: ${candidates.error}` },
        { status: 500 }
      );
    }

    if (candidates.rows.length === 0) {
      return NextResponse.json({
        success: true,
        checked: 0,
        updated: 0,
        failedUpdates: 0,
        resultCounts: { active: 0, expired: 0, uncertain: 0 },
        failures: [],
      });
    }

    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    const nowIso = new Date().toISOString();
    const resultCounts: Record<JobPostingLiveness, number> = {
      active: 0,
      expired: 0,
      uncertain: 0,
    };

    let checked = 0;
    let updated = 0;
    let failedUpdates = 0;
    const failures: string[] = [];

    for (const posting of candidates.rows) {
      const check = await checkPostingLiveness(page, posting.external_url);
      checked += 1;

      const { error: updateError } = await adminDb
        .from("career_ops_job_postings")
        .update({
          posting_status: check.result,
          last_liveness_result: check.result,
          last_liveness_checked_at: nowIso,
        })
        .eq("id", posting.id);

      if (updateError) {
        failedUpdates += 1;
        failures.push(`${posting.id}: ${updateError.message}`);
        continue;
      }

      updated += 1;
      resultCounts[check.result] += 1;

      if (check.result !== "active") {
        logger.info(
          `[Cron Liveness] ${check.result.toUpperCase()} ${posting.external_url} (${check.reason})`
        );
      }
    }

    return NextResponse.json({
      success: true,
      checked,
      updated,
      failedUpdates,
      resultCounts,
      failures: failures.slice(0, 25),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}