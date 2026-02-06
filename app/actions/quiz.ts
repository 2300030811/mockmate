"use server";

import { QuizService } from "@/lib/quiz-service";
import type { QuizMode, AWSQuestion } from "@/types";
import type { QuizQuestion } from "@/lib/azure-quiz-service";

import { AppError } from "@/lib/exceptions";
// ⚠️ FORCE NODEJS RUNTIME
// export const runtime = "nodejs";

export async function fetchAWSQuestions(mode: QuizMode = "practice", countParam: string | null = null): Promise<AWSQuestion[]> {
  const url = process.env.AZURE_QUESTIONS_URL;

  try {
    if (!url) throw new Error("AZURE_QUESTIONS_URL is missing.");

    const questions = await QuizService.fetchQuestions(url);
    const finalQuestions = QuizService.selectQuestions(
      questions,
      mode,
      countParam,
      65, // Default exam count for AWS
      false // Use simple random distribution
    );

    return finalQuestions as AWSQuestion[];
  } catch (error: any) {
    console.error("Server Action Error (fetchAWSQuestions):", error.message);
    const msg = error instanceof AppError ? error.message : "Internal Server Error";
    
    // Return a dummy error question to gracefully handle failure on client
    return [
      {
        id: 999,
        question: `Error loading data: ${msg}`,
        options: ["Retry"],
        answer: "Retry",
        explanation: "Please check the JSON structure.",
      } as AWSQuestion,
    ];
  }
}

export async function fetchAzureQuestionsAction(): Promise<QuizQuestion[]> {
  try {
    // Fallback to Azure Blob if local file doesn't exist
    const blobUrl = process.env.NEXT_PUBLIC_AZURE_FINAL_JSON_URL;
    
    if (!blobUrl) {
      throw new Error("Azure questions file URL not found in env.");
    }

    const response = await fetch(blobUrl, { cache: 'no-store' });
    
    if (!response.ok) {
        throw new Error(`Failed to fetch from Blob: ${response.statusText}`);
    }

    const data = await response.json();
    return data as QuizQuestion[];

  } catch (error: any) {
    console.error("Server Action Error (fetchAzureQuestions):", error.message);
    return [];
  }
}
