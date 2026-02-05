import { NextResponse } from "next/server";
import { QuizService } from "@/lib/quiz-service";
import { QuizMode } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = (searchParams.get("mode") || "practice") as QuizMode;
  const countParam = searchParams.get("count");
  
  const url = process.env.AZURE_QUESTIONS_AZ900_URL;

  try {
     if (!url) throw new Error("AZURE_QUESTIONS_AZ900_URL is missing.");
     
     const questions = await QuizService.fetchQuestions(url);
     const finalQuestions = QuizService.selectQuestions(
         questions, 
         mode, 
         countParam, 
         40, // Default exam count for Azure
         true // Use strict exam distribution
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
