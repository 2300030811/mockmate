import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { logger } from "@/lib/logger";
import {
  CompanyTarget,
  ScannedJob,
  dedupeScannedJobs,
  filterJobsByKeywords,
  scanCompany,
} from "@/lib/services/scanner";
import { careerOpsRepository } from "@/lib/db/career-ops-repository";

export const dynamic = "force-dynamic";

interface ScanTargetRow {
  name: string;
  api_type: CompanyTarget["apiType"];
  api_url: string;
}

const DEFAULT_TARGETS: CompanyTarget[] = [
  { name: "Cohere", apiType: "lever", apiUrl: "https://api.lever.co/v0/postings/cohere" },
  { name: "Anthropic", apiType: "lever", apiUrl: "https://api.lever.co/v0/postings/anthropic" },
];

const DEFAULT_POSITIVE_KEYWORDS = ["developer", "engineer", "machine learning", "software"];
const DEFAULT_NEGATIVE_KEYWORDS = ["intern", "junior"];

function parseKeywords(raw: string | undefined, fallback: string[]): string[] {
  if (!raw || !raw.trim()) return fallback;
  const parsed = raw
    .split(",")
    .map((keyword) => keyword.trim().toLowerCase())
    .filter(Boolean);
  return parsed.length > 0 ? parsed : fallback;
}

function summarizeUnknownError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

function extractAuthSecret(request: Request): string {
  const authHeader = request.headers.get("authorization") ?? "";
  if (authHeader.toLowerCase().startsWith("bearer ")) {
    return authHeader.slice(7).trim();
  }

  return request.headers.get("x-cron-secret")?.trim() ?? "";
}

async function loadScanTargets(adminDb: ReturnType<typeof createAdminClient>): Promise<CompanyTarget[]> {
  try {
    const rows = await careerOpsRepository.loadScanTargets(adminDb) as ScanTargetRow[];
    if (rows.length === 0) return DEFAULT_TARGETS;

    return rows.map((row) => ({
      name: row.name,
      apiType: row.api_type,
      apiUrl: row.api_url,
    }));
  } catch (error: any) {
    logger.warn("[Cron Scan] Failed to load DB targets. Falling back to defaults.", error.message);
    return DEFAULT_TARGETS;
  }
}

async function startScanRun(
  adminDb: ReturnType<typeof createAdminClient>,
  scannedTargets: number
): Promise<string | null> {
  try {
    const data = await careerOpsRepository.startScanRun(adminDb, { scannedTargets });
    return data.id;
  } catch (error: any) {
    logger.warn("[Cron Scan] Failed to persist scan run metadata.", error.message);
    return null;
  }
}

async function finishScanRun(
  adminDb: ReturnType<typeof createAdminClient>,
  runId: string | null,
  payload: {
    status: "completed" | "failed";
    foundCount: number;
    filteredCount: number;
    dedupedCount: number;
    insertedCount: number;
    failedCount: number;
    skippedExistingCount: number;
    errorMessage: string | null;
  }
) {
  if (!runId) return;

  try {
    await careerOpsRepository.finishScanRun(adminDb, runId, payload);
  } catch (error: any) {
    logger.warn("[Cron Scan] Failed to finalize scan run metadata.", error.message);
  }
}

function toPostingRow(job: ScannedJob) {
  return {
    external_url: job.url,
    source: job.source,
    source_job_id: job.sourceJobId,
    company: job.company,
    title: job.title,
    location: job.location || null,
    normalized_company: job.normalizedCompany,
    normalized_title: job.normalizedTitle,
    job_fingerprint: job.fingerprint,
    posting_status: "uncertain",
    last_seen_at: new Date().toISOString(),
    metadata: {},
  };
}

async function fetchExistingSets(
  adminDb: ReturnType<typeof createAdminClient>,
  urls: string[],
  fingerprints: string[]
): Promise<{ existingUrlSet: Set<string>; existingFingerprintSet: Set<string> }> {
  const existingUrlSet = new Set<string>();
  const existingFingerprintSet = new Set<string>();

  try {
    const { urls: urlRows, fingerprints: fingerprintRows } = await careerOpsRepository.fetchExistingPostings(
      adminDb,
      urls,
      fingerprints
    );

    for (const row of urlRows) {
      if (row.external_url) {
        existingUrlSet.add(row.external_url);
      }
    }

    for (const row of fingerprintRows) {
      if (row.job_fingerprint) {
        existingFingerprintSet.add(row.job_fingerprint);
      }
    }
  } catch (error: any) {
    throw new Error(`Could not fetch existing posting URLs/fingerprints: ${error.message}`);
  }

  return { existingUrlSet, existingFingerprintSet };
}


export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SCAN_SECRET;

  if (!cronSecret && process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Cron scan is misconfigured: CRON_SCAN_SECRET is missing in production." },
      { status: 500 }
    );
  }

  if (cronSecret) {
    const incomingSecret = extractAuthSecret(request);
    if (incomingSecret !== cronSecret) {
      return NextResponse.json({ error: "Unauthorized cron request." }, { status: 401 });
    }
  }

  let adminDb: ReturnType<typeof createAdminClient> | null = null;
  let runId: string | null = null;

  try {
    adminDb = createAdminClient();
    const targets = await loadScanTargets(adminDb);
    runId = await startScanRun(adminDb, targets.length);

    const discoveredJobs: ScannedJob[] = [];
    const targetFailures: string[] = [];
    
    // Process targets in chunks of 3 to avoid overwhelming outbound connections
    const CONCURRENCY_LIMIT = 3;
    for (let i = 0; i < targets.length; i += CONCURRENCY_LIMIT) {
      const chunk = targets.slice(i, i + CONCURRENCY_LIMIT);
      const chunkResults = await Promise.allSettled(chunk.map((target) => scanCompany(target)));
      
      chunkResults.forEach((result, index) => {
        const targetName = chunk[index]?.name ?? `target-${i + index + 1}`;
        if (result.status === "fulfilled") {
          discoveredJobs.push(...result.value);
        } else {
          targetFailures.push(`${targetName}: ${summarizeUnknownError(result.reason)}`);
        }
      });
    }

    const positiveKeywords = parseKeywords(process.env.SCAN_TITLE_KEYWORDS, DEFAULT_POSITIVE_KEYWORDS);
    const negativeKeywords = parseKeywords(process.env.SCAN_NEGATIVE_TITLE_KEYWORDS, DEFAULT_NEGATIVE_KEYWORDS);

    const keywordFiltered = filterJobsByKeywords(discoveredJobs, positiveKeywords, negativeKeywords);
    const dedupedInScan = dedupeScannedJobs(keywordFiltered);

    const urls = [...new Set(dedupedInScan.map((job) => job.url))];
    const fingerprints = [...new Set(dedupedInScan.map((job) => job.fingerprint))];

    const { existingUrlSet, existingFingerprintSet } = await fetchExistingSets(adminDb, urls, fingerprints);

    const newJobs = dedupedInScan.filter(
      (job) => !existingUrlSet.has(job.url) && !existingFingerprintSet.has(job.fingerprint)
    );

    if (newJobs.length > 0) {
      try {
        await careerOpsRepository.upsertJobPostings(adminDb, newJobs.map(toPostingRow));
      } catch (error: any) {
        throw new Error(`Could not upsert scanned postings: ${error.message}`);
      }
    }

    const payload = {
      status: "completed" as const,
      foundCount: discoveredJobs.length,
      filteredCount: keywordFiltered.length,
      dedupedCount: dedupedInScan.length,
      insertedCount: newJobs.length,
      failedCount: targetFailures.length,
      skippedExistingCount: dedupedInScan.length - newJobs.length,
      errorMessage: targetFailures.length > 0 ? targetFailures.slice(0, 5).join(" | ") : null,
    };

    await finishScanRun(adminDb, runId, payload);

    return NextResponse.json({
      success: true,
      runId,
      scannedTargets: targets.length,
      found: payload.foundCount,
      filtered: payload.filteredCount,
      deduped: payload.dedupedCount,
      inserted: payload.insertedCount,
      skippedExisting: payload.skippedExistingCount,
      failedTargets: payload.failedCount,
      failures: targetFailures,
    });
  } catch (error: unknown) {
    const message = summarizeUnknownError(error);
    logger.error("[Cron Scan] Job scan failed:", message);

    if (adminDb) {
      await finishScanRun(adminDb, runId, {
        status: "failed",
        foundCount: 0,
        filteredCount: 0,
        dedupedCount: 0,
        insertedCount: 0,
        failedCount: 1,
        skippedExistingCount: 0,
        errorMessage: message,
      });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
