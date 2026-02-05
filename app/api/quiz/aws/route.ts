import { NextResponse } from "next/server";
import { QuizService } from "@/lib/quiz-service";
import { QuizMode } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = (searchParams.get("mode") || "practice") as QuizMode;
  const countParam = searchParams.get("count");

  // Note: This variable name is confusingly generic but points to AWS questions in .env/next.config.js
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

     return NextResponse.json(finalQuestions);
  } catch (error: any) {
    console.error("API Error:", error.message);
    return NextResponse.json([
      {
        id: 999,
        type: "mcq",
        question: `Error loading data: ${error.message}`,
        options: ["Retry"],
        answer: ["Retry"],
        explanation: "Please check the JSON structure.",
      },
    ]);
  }
}