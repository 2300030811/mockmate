import { NextResponse } from "next/server";
import { StorageService } from "@/lib/services/storage";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function extractAuthSecret(request: Request): string {
  const authHeader = request.headers.get("authorization") ?? "";
  if (authHeader.toLowerCase().startsWith("bearer ")) {
    return authHeader.slice(7).trim();
  }
  return request.headers.get("x-cron-secret")?.trim() ?? "";
}

/**
 * DPDP Act (2023) Automated Storage Purge Cron
 * Enforces 24h maximum retention on candidate resume uploads and temporary OCR artifacts.
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_STORAGE_SECRET || process.env.CRON_LIVENESS_SECRET;

  if (cronSecret) {
    const incomingSecret = extractAuthSecret(request);
    if (incomingSecret !== cronSecret) {
      return NextResponse.json({ error: "Unauthorized cron request." }, { status: 401 });
    }
  }

  try {
    logger.info("[Cron Storage Purge] Initiating 24-hour TTL purge for candidate resumes.");
    const result = await StorageService.cleanupExpiredResumes(24);
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...result,
      compliance: "DPDP_ACT_2023_COMPLIANT",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error("[Cron Storage Purge] Failure:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
