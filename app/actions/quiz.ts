import { QuizService } from "@/lib/quiz-service";
import type { QuizMode, QuizQuestion } from "@/types";
import { AppError } from "@/lib/exceptions";
import { env } from "@/lib/env";

export async function fetchAWSQuestions(mode: QuizMode = "practice", countParam: string | null = null): Promise<QuizQuestion[]> {
  const url = env.AWS_QUESTIONS_URL;

  try {
    if (!url) throw new Error("AWS_QUESTIONS_URL is missing.");

    const questions = await QuizService.fetchQuestions(url);
    const finalQuestions = QuizService.selectQuestions(
      questions,
      mode,
      countParam,
      65, // Default exam count for AWS
      false
    );

    return finalQuestions as QuizQuestion[];
  } catch (error: unknown) {
    if (error instanceof Error) {
        console.error("Server Action Error (fetchAWSQuestions):", error.message);
    } else {
        console.error("Server Action Error (fetchAWSQuestions):", error);
    }
    const msg = error instanceof AppError ? error.message : "Internal Server Error";
    
    return [
      {
        id: 999,
        question: `Error loading data: ${msg}`,
        options: ["Retry"],
        answer: "Retry",
        explanation: "Please check the AWS questions URL.",
      } as QuizQuestion,
    ];
  }
}

export async function fetchAzureQuestionsAction(): Promise<QuizQuestion[]> {
  const url = env.AZURE_QUESTIONS_URL;
  
  try {
    if (!url) {
      // Fallback for backward compat if env var missing but NEXT_PUBLIC one exists
      const fallback = env.NEXT_PUBLIC_AZURE_FINAL_JSON_URL;
      if (!fallback) throw new Error("AZURE_QUESTIONS_URL is missing.");
      return (await QuizService.fetchQuestions(fallback)) as unknown as QuizQuestion[];
    }
    
    // Using generic service now instead of custom logic inside action
    const questions = await QuizService.fetchQuestions(url);
    return questions as unknown as QuizQuestion[];

  } catch (error: unknown) {
    if (error instanceof Error) {
        console.error("Server Action Error (fetchAzureQuestionsAction):", error.message);
    } else {
        console.error("Server Action Error (fetchAzureQuestionsAction):", error);
    }
    return [];
  }
}

export async function fetchSalesforceQuestions(mode: QuizMode = "practice", countParam: string | null = null): Promise<QuizQuestion[]> {
  const url = env.SALESFORCE_QUESTIONS_URL;

  try {
    if (!url) throw new Error("SALESFORCE_QUESTIONS_URL is missing.");

    const questions = await QuizService.fetchQuestions(url);
    
    const finalQuestions = QuizService.selectQuestions(
      questions, 
      mode, 
      countParam, 
      60, 
      false
    );

    return finalQuestions;
  } catch (error: unknown) {
    if (error instanceof Error) {
        console.error("Server Action Error (fetchSalesforceQuestions):", error.message);
    } else {
        console.error("Server Action Error (fetchSalesforceQuestions):", error);
    }
    const msg = error instanceof AppError ? error.message : "Internal Server Error";
    
    return [
      {
        id: 999,
        type: "mcq",
        question: `Error loading data: ${msg}`,
        options: ["Retry"],
        answer: "Retry",
        explanation: "Please check the Salesforce questions URL.",
      } as QuizQuestion,
    ];
  }
}

export async function fetchMongoDBQuestions(mode: QuizMode = "practice", countParam: string | null = null): Promise<QuizQuestion[]> {
  const url = env.MONGODB_QUESTIONS_URL;

  try {
    if (!url) throw new Error("MONGODB_QUESTIONS_URL is missing.");

    const questions = await QuizService.fetchQuestions(url);
    
    const finalQuestions = QuizService.selectQuestions(
      questions, 
      mode, 
      countParam, 
      60, 
      false
    );

    return finalQuestions;
  } catch (error: unknown) {
    if (error instanceof Error) {
        console.error("Server Action Error (fetchMongoDBQuestions):", error.message);
    } else {
        console.error("Server Action Error (fetchMongoDBQuestions):", error);
    }
    const msg = error instanceof AppError ? error.message : "Internal Server Error";
    
    return [
      {
        id: 999,
        type: "mcq",
        question: `Error loading data: ${msg}`,
        options: ["Retry"],
        answer: "Retry",
        explanation: "Please check the MongoDB questions URL.",
      } as QuizQuestion,
    ];
  }
}

export async function fetchPCAPQuestions(mode: QuizMode = "practice", countParam: string | null = null): Promise<QuizQuestion[]> {
  const url = env.PCAP_QUESTIONS_URL;

  try {
    if (!url) throw new Error("PCAP_QUESTIONS_URL is missing.");

    // Uses the specialized fetcher for PCAP logic
    const allQuestions = await QuizService.fetchPCAPQuestions(url);

    const finalQuestions = QuizService.selectQuestions(
      allQuestions, 
      mode, 
      countParam, 
      40, 
      true
    );

    return finalQuestions;

  } catch (error: unknown) {
    if (error instanceof Error) {
        console.error("Server Action Error (fetchPCAPQuestions):", error.message);
    } else {
        console.error("Server Action Error (fetchPCAPQuestions):", error);
    }
    const msg = error instanceof AppError ? error.message : "Internal Server Error";
    
    return [
      {
        id: "error",
        type: "mcq",
        question: `Error loading data: ${msg}`,
        options: ["Retry"],
        answer: "Retry",
        explanation: "Please check the PCAP questions URL or JSON format.",
      } as QuizQuestion,
    ];
  }
}
