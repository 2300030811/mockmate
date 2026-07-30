"use server";

import { rateLimit } from "@/lib/rate-limit";
import { DeepEvalResult } from "@/types/deep-eval";
import { deepEvalService } from "@/lib/services/deep-eval-service";

export async function analyzeDeepEvalAction(
  formData: FormData,
  jobRole?: string,
  company?: string,
  jobDescription?: string
): Promise<{ data: DeepEvalResult | null; error?: string }> {
  // 1. Rate Limiting
  const { success: withinLimit, message: limitMsg } = await rateLimit("default");
  if (!withinLimit) {
    return { data: null, error: limitMsg || "Rate limit exceeded." };
  }

  const file = formData.get("file");
  return deepEvalService.analyzeDeepEval(file, jobRole, company, jobDescription);
}
