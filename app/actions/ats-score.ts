"use server";

import { rateLimit } from "@/lib/rate-limit";
import { AtsScoreResult } from "@/types/ats-score";
import { atsScoreService } from "@/lib/services/ats-score-service";

export async function analyzeAtsScoreAction(
  formData: FormData,
  jobRole?: string,
  company?: string,
  jobDescription?: string
): Promise<{ data: AtsScoreResult | null; error?: string }> {
  // 1. Rate Limiting
  const { success: withinLimit, message: limitMsg } = await rateLimit("default");
  if (!withinLimit) {
    return { data: null, error: limitMsg || "Rate limit exceeded." };
  }

  const file = formData.get("file");
  return atsScoreService.analyzeAtsScore(file, jobRole, company, jobDescription);
}
