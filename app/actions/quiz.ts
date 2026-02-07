"use server";

import { QuizService } from "@/lib/quiz-service";
import type { QuizMode, AWSQuestion, QuizQuestion } from "@/types";
import type { QuizQuestion as AzureQuizQuestion } from "@/lib/azure-quiz-service";

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

export async function fetchAzureQuestionsAction(): Promise<AzureQuizQuestion[]> {
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
    return data as AzureQuizQuestion[];

  } catch (error: any) {
    console.error("Server Action Error (fetchAzureQuestions):", error.message);
    return [];
  }
}

export async function fetchSalesforceQuestions(mode: QuizMode = "practice", countParam: string | null = null): Promise<QuizQuestion[]> {
  const url = "https://mockmatequiz.blob.core.windows.net/quizzes/salesforce-agentforce-specialist1.json";

  try {
    const questions = await QuizService.fetchQuestions(url);
    
    // Use generic selection logic
    const finalQuestions = QuizService.selectQuestions(
      questions, 
      mode, 
      countParam, 
      60, // Default exam count for Salesforce (assumption, json says 100 total)
      false
    );

    return finalQuestions;
  } catch (error: any) {
    console.error("Server Action Error (fetchSalesforceQuestions):", error.message);
    const msg = error instanceof AppError ? error.message : "Internal Server Error";
    
    return [
      {
        id: 999,
        type: "mcq",
        question: `Error loading data: ${msg}`,
        options: ["Retry"],
        answer: "Retry",
        explanation: "Please check the JSON file location and structure.",
      } as QuizQuestion,
    ];
  }
}

export async function fetchMongoDBQuestions(mode: QuizMode = "practice", countParam: string | null = null): Promise<QuizQuestion[]> {
  const url = "https://mockmatequiz.blob.core.windows.net/quizzes/mongodb1.json";

  try {
    const questions = await QuizService.fetchQuestions(url);
    
    // Use generic selection logic
    const finalQuestions = QuizService.selectQuestions(
      questions, 
      mode, 
      countParam, 
      60, // Default exam count for MongoDB
      false
    );

    return finalQuestions;
  } catch (error: any) {
    console.error("Server Action Error (fetchMongoDBQuestions):", error.message);
    const msg = error instanceof AppError ? error.message : "Internal Server Error";
    
    return [
      {
        id: 999,
        type: "mcq",
        question: `Error loading data: ${msg}`,
        options: ["Retry"],
        answer: "Retry",
        explanation: "Please check the JSON file location and structure.",
      } as QuizQuestion,
    ];
  }
}

export async function fetchPCAPQuestions(mode: QuizMode = "practice", countParam: string | null = null): Promise<QuizQuestion[]> {
  const url = "https://mockmatequiz.blob.core.windows.net/quizzes/pcap1.json";

  try {
    // 1. Fetch raw text because the file might contain multiple JSON objects concatenated
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Failed to fetch PCAP questions: ${response.statusText}`);
    
    const text = await response.text();
    
    // 2. Parse the possibly malformed JSON
    // Remove known invalid markers that break JSON
    let jsonString = text.replace(/\[cite_start\]/g, '').trim();
    
    let data: any[];

    try {
        // First try standard parse
        data = JSON.parse(jsonString);
        // If it's a single object, wrap in array
        if (!Array.isArray(data)) {
            data = [data]; 
        }
    } catch (e) {
        // If standard parse fails, it might be concatenated objects: { ... } { ... }
        // We try to fix it by wrapping in [] and adding commas
        if (jsonString.startsWith('{')) {
             const fixedJson = '[' + jsonString.replace(/}\s*\{/g, '},{') + ']';
             try {
                data = JSON.parse(fixedJson);
             } catch (e2) {
                console.error("Fixed JSON parse failed. First error:", e, "Second error:", e2);
                throw new Error("Invalid JSON format in PCAP file");
             }
        } else {
             console.error("JSON parse failed:", e);
             throw new Error("Invalid JSON format in PCAP file");
        }
    }

    const allQuestions: QuizQuestion[] = [];

    // 3. Transform data to QuizQuestion format
    data.forEach((batch: any) => {
      if (batch.questions && Array.isArray(batch.questions)) {
        batch.questions.forEach((q: any) => {
            
            // Map options object to array
            const optionsMap = q.options || {};
            const optionsKeys = Object.keys(optionsMap).sort(); // Sort keys alphabetically (A, B, C...)
            const optionsArray = optionsKeys.map(k => optionsMap[k]);
            
            // Map correctAnswer key(s) to value(s)
            let answer: string | string[];
            if (q.correctAnswer && Array.isArray(q.correctAnswer)) {
                if (q.correctAnswer.length === 1) {
                    answer = optionsMap[q.correctAnswer[0]] || "";
                } else {
                    answer = q.correctAnswer.map((k: string) => optionsMap[k] || "");
                }
            } else {
                answer = ""; 
            }

            let explanation = q.explanation ? q.explanation.replace(/\[cite: \d+\]/g, '').trim() : "";
            
            // Fix specific bad explanations
            if (q.id === 141) {
                explanation = "Attempting to delete an index that is out of range raises an IndexError. Here, `del spam[4]` targets the 5th element, but the list only has indices 0 to 4 (element 16). After checking range(4) creates [0,1,2,3], so index 4 is invalid.";
            } else if (q.id === 64) {
                 explanation = "The loop iterates through range(1, 3) (i.e., 1 and 2). For i=1: 1%1==0 -> prints '*'. For i=2: 2%2==0 and 2>1 -> prints '*'. Total 2 stars printed.";
            }

            // Generic clean for internal monologue
            if (explanation.includes("Wait,")) {
                const parts = explanation.split("Wait,");
                // Use the part before "Wait,"
                let clean = parts[0].trim();
                // If it's too short, maybe the useful info is in the correction
                if (clean.length < 15) {
                    if (explanation.includes("**Correction**")) {
                         clean = explanation.split("**Correction**")[1].replace(/^[:\s]+/, '').trim();
                    } else {
                         // Fallback if we can't salvage it
                         clean = "Review the code execution logic.";
                    }
                }
                explanation = clean;
            }
            
            // Another pattern: "I will provide..."
            if (explanation.includes("I will provide")) {
                 explanation = explanation.split("I will provide")[0].trim();
            }

            allQuestions.push({
                id: `${batch.batchId || 0}-${q.id}`, 
                type: q.type === 'multiple' ? 'MSQ' : 'mcq',
                question: q.question,
                code: q.code, 
                options: optionsArray,
                answer: answer,
                explanation: explanation
            });
        });
      }
    });

    // 4. Select questions based on mode
    const finalQuestions = QuizService.selectQuestions(
      allQuestions, 
      mode, 
      countParam, 
      40, // Standard PCAP exam length
      true // Shuffle
    );

    return finalQuestions;

  } catch (error: any) {
    console.error("Server Action Error (fetchPCAPQuestions):", error.message);
    const msg = error instanceof AppError ? error.message : "Internal Server Error";
    
    return [
      {
        id: "error",
        type: "mcq",
        question: `Error loading data: ${msg}`,
        options: ["Retry"],
        answer: "Retry",
        explanation: "Please check the JSON file location and structure.",
      } as QuizQuestion,
    ];
  }
}
