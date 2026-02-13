"use server";

import { QuizFetcher } from "@/lib/quiz-fetcher";
import type { QuizMode, QuizQuestion } from "@/types";
import { AppError } from "@/lib/exceptions";
import { env } from "@/lib/env";

// ─────────────────────────────────────────────────────────
// Quiz Type Configuration
// ─────────────────────────────────────────────────────────

type QuizType = "aws" | "azure" | "salesforce" | "mongodb" | "pcap" | "oracle";

interface QuizConfig {
  getUrl: () => string | undefined;
  fallbackUrl?: string;
  defaultExamCount: number;
  useAzureLogic: boolean;
  usePCAPFetcher: boolean;
  label: string;
}

const QUIZ_CONFIGS: Record<QuizType, QuizConfig> = {
  aws: {
    getUrl: () => env.AWS_QUESTIONS_URL || process.env.AWS_QUESTIONS_URL,
    defaultExamCount: 65,
    useAzureLogic: false,
    usePCAPFetcher: false,
    label: "AWS",
  },
  azure: {
    getUrl: () => env.AZURE_QUESTIONS_URL || env.NEXT_PUBLIC_AZURE_FINAL_JSON_URL,
    defaultExamCount: 50,
    useAzureLogic: true,
    usePCAPFetcher: false,
    label: "Azure",
  },
  salesforce: {
    getUrl: () => env.SALESFORCE_QUESTIONS_URL,
    defaultExamCount: 60,
    useAzureLogic: false,
    usePCAPFetcher: false,
    label: "Salesforce",
  },
  mongodb: {
    getUrl: () => env.MONGODB_QUESTIONS_URL,
    defaultExamCount: 60,
    useAzureLogic: false,
    usePCAPFetcher: false,
    label: "MongoDB",
  },
  pcap: {
    getUrl: () => env.PCAP_QUESTIONS_URL,
    defaultExamCount: 40,
    useAzureLogic: true,
    usePCAPFetcher: true,
    label: "PCAP",
  },
  oracle: {
    getUrl: () => env.ORACLE_QUESTIONS_URL,
    fallbackUrl: "https://mockmatequiz.blob.core.windows.net/quizzes/oracle.json",
    defaultExamCount: 50,
    useAzureLogic: false,
    usePCAPFetcher: false,
    label: "Oracle",
  },
};

// ─────────────────────────────────────────────────────────
// Generic Fetcher (single source of truth)
// ─────────────────────────────────────────────────────────

export async function fetchQuizQuestions(
  quizType: QuizType,
  mode: QuizMode = "practice",
  countParam: string | null = null,
): Promise<QuizQuestion[]> {
  const config = QUIZ_CONFIGS[quizType];

  // 1. Try Database First
  const dbQuestions = await QuizFetcher.fetchQuestionsFromDB(quizType);
  let questions: QuizQuestion[] = [];

  if (dbQuestions && dbQuestions.length > 0) {
    questions = dbQuestions;
  } else {
    // 2. Fallback to URL-based fetching
    const url = config.getUrl() || config.fallbackUrl;
    if (!url) {
      throw new AppError(`${config.label}_QUESTIONS_URL is missing.`, 500);
    }
    questions = config.usePCAPFetcher
      ? await QuizFetcher.fetchPCAPQuestions(url)
      : await QuizFetcher.fetchQuestions(url);
  }

  return QuizFetcher.selectQuestions(
    questions,
    mode,
    countParam,
    config.defaultExamCount,
    config.useAzureLogic,
  );
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

export async function fetchAzureQuestionsAction(): Promise<QuizQuestion[]> {
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
