"use server";

import type { QuizMode, QuizQuestion } from "@/types";
import { AppError } from "@/lib/exceptions";

// ─────────────────────────────────────────────────────────
// Quiz Type Configuration
// ─────────────────────────────────────────────────────────

import { QuizFactory } from "@/lib/strategies/QuizFactory";

// ─────────────────────────────────────────────────────────
// Generic Fetcher (delegating to Strategy Pattern)
// ─────────────────────────────────────────────────────────

export async function getRawQuestions(
  quizType: string,
): Promise<QuizQuestion[]> {
  try {
    const source = QuizFactory.getSource(quizType);
    return await source.fetchRawQuestions();
  } catch (error: any) {
    console.error(
      `Error fetching raw questions for ${quizType}:`,
      error.message,
    );
    // Return empty array or throw based on preference, existing code returned [] on error sometimes?
    // Existing code threw AppError if URL missing.
    throw new AppError(
      error.message || `Failed to fetch questions for ${quizType}`,
      500,
    );
  }
}

import { z } from "zod";

const quizParamsSchema = z.object({
  quizType: z.enum(["aws", "azure", "salesforce", "mongodb", "pcap", "oracle"]),
  mode: z.enum(["practice", "exam"]),
  countParam: z.union([z.string().regex(/^\d+$/), z.literal("all"), z.null()]),
});

export async function fetchQuizQuestions(
  quizType: string,
  mode: QuizMode = "practice",
  countParam: string | null = null,
): Promise<QuizQuestion[]> {
  const result = quizParamsSchema.safeParse({ quizType, mode, countParam });

  if (!result.success) {
    console.error("Invalid quiz parameters:", result.error);
    throw new AppError("Invalid quiz parameters", 400);
  }

  // Let errors propagate to useQuery
  const source = QuizFactory.getSource(quizType);
  return await source.getQuestions(mode, countParam);
}

// ─────────────────────────────────────────────────────────
// Backwards-compatible named exports
// (existing hooks/components import these by name)
// ─────────────────────────────────────────────────────────

export async function fetchAWSQuestions(
  mode: QuizMode = "practice",
  countParam: string | null = null,
): Promise<QuizQuestion[]> {
  return fetchQuizQuestions("aws", mode, countParam);
}

export async function fetchAzureQuestions(): Promise<QuizQuestion[]> {
  return fetchQuizQuestions("azure");
}

export async function fetchSalesforceQuestions(
  mode: QuizMode = "practice",
  countParam: string | null = null,
): Promise<QuizQuestion[]> {
  return fetchQuizQuestions("salesforce", mode, countParam);
}

export async function fetchMongoDBQuestions(
  mode: QuizMode = "practice",
  countParam: string | null = null,
): Promise<QuizQuestion[]> {
  return fetchQuizQuestions("mongodb", mode, countParam);
}

export async function fetchPCAPQuestions(
  mode: QuizMode = "practice",
  countParam: string | null = null,
): Promise<QuizQuestion[]> {
  return fetchQuizQuestions("pcap", mode, countParam);
}

export async function fetchOracleQuestions(
  mode: QuizMode = "practice",
  countParam: string | null = null,
): Promise<QuizQuestion[]> {
  return fetchQuizQuestions("oracle", mode, countParam);
}
