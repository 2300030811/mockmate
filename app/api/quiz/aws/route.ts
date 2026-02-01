import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") || "practice";
  const countParam = searchParams.get("count");

  const url = process.env.AZURE_QUESTIONS_URL;

  try {
    if (!url) throw new Error("AZURE_QUESTIONS_URL is missing.");

    // 1. Fetch from Azure
    const res = await fetch(url, { 
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" } 
    });

    if (!res.ok) throw new Error(`Azure Fetch Failed: ${res.status}`);

    const data = await res.json();
    
    // 2. Unwrap
    let allQuestions = [];
    if (Array.isArray(data)) {
      allQuestions = data;
    } else if (data.questions && Array.isArray(data.questions)) {
      allQuestions = data.questions;
    } else {
      throw new Error("Invalid JSON format.");
    }

    if (allQuestions.length === 0) throw new Error("Question array is empty.");

    // 3. Shuffle (always shuffle for randomness)
    const shuffled = [...allQuestions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // 4. Slice based on Count Parameter
    let finalQuestions;
    
    if (countParam === "all" || !countParam) {
      // Return all questions if "all" is specified or no count provided in practice mode
      if (mode === "practice" && !countParam) {
        finalQuestions = shuffled;
      } else if (countParam === "all") {
        finalQuestions = shuffled;
      } else {
        // Default exam mode behavior
        finalQuestions = shuffled.slice(0, 65);
      }
    } else {
      // Use the specified count
      const count = parseInt(countParam);
      if (!isNaN(count) && count > 0) {
        finalQuestions = shuffled.slice(0, Math.min(count, shuffled.length));
      } else {
        // Fallback to default
        finalQuestions = mode === "exam" ? shuffled.slice(0, 65) : shuffled;
      }
    }

    return NextResponse.json(finalQuestions);

  } catch (error: any) {
    console.error("API Error:", error.message);
    return NextResponse.json([{
      id: 999,
      question: `Error loading data: ${error.message}`,
      options: ["Retry"],
      answer: "Retry",
      explanation: "Please check the JSON structure."
    }]);
  }
}