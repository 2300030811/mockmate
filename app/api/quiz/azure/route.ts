import { NextResponse } from "next/server";
import { parseExplanationForHotspot, shuffleArray } from "../../../../utils/quiz-helpers";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") || "practice";
  const countParam = searchParams.get("count");

  const url = process.env.AZURE_QUESTIONS_AZ900_URL;

  try {
    if (!url) throw new Error("AZURE_QUESTIONS_AZ900_URL is missing.");

    // 1. Fetch from Azure
    const res = await fetch(url, {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
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
      // Fallback or explicit check if data is object but has no questions key (unlikely based on user description but good for safety)
      if (typeof data === "object") {
        // Check if it's the root object or needs extracting
        allQuestions = Object.values(data).find((v) => Array.isArray(v)) || [];
      }
    }

    // Ensure we have an array
    if (!Array.isArray(allQuestions) || allQuestions.length === 0) {
      // If direct array check failed, maybe the JSON is just the array
      if (Array.isArray(data)) allQuestions = data;
      else throw new Error("Question array is empty or invalid format.");
    }

    // 3. Enrich & Normalize Types (Server-side to ensure correct distribution)
    const enrichedQuestions = allQuestions.map((q: any) => {
      // Logic copied/adapted from client to identify Hotspots
      if (
        (q.type === "hotspot" || q.type === "drag_drop" || q.type === "mcq") &&
        (!q.answer || (typeof q.answer === "object" && Object.keys(q.answer).length === 0))
      ) {
        const parsed = parseExplanationForHotspot(q.explanation);
        if (parsed) {
          return { ...q, type: "hotspot", answer: parsed };
        }
      }
      return q;
    });

    // 4. Mode Selection & Count Handling
    let finalQuestions;
    
    if (mode === "exam") {
      // Determine target count
      let targetTotal = 40; // Default for Azure AZ-900
      if (countParam && countParam !== "all") {
        const parsedCount = parseInt(countParam);
        if (!isNaN(parsedCount) && parsedCount > 0) {
          targetTotal = parsedCount;
        }
      }

      // Split into pools
      const mcqs = enrichedQuestions.filter((q: any) => q.type && q.type.toLowerCase() === "mcq");
      const others = enrichedQuestions.filter((q: any) => {
        const isMcq = q.type && q.type.toLowerCase() === "mcq";
        if (isMcq) return false;

        // Filter out Hotspots that don't have a structured answer (prevents "inconsistent" raw UI in Exam)
        if (q.type === "hotspot") {
            const hasStructuredAnswer = q.answer && typeof q.answer === 'object' && Object.keys(q.answer).length > 0;
            return hasStructuredAnswer;
        }

        return true;
      });

      // Shuffle pools
      const shuffledMcqs = shuffleArray(mcqs);
      const shuffledOthers = shuffleArray(others);

      // Calculate distribution: 75% MCQ, 25% Others
      const targetMcq = Math.round(targetTotal * 0.75);
      const targetOther = targetTotal - targetMcq;

      let selectedMcqs = shuffledMcqs.slice(0, targetMcq);
      let selectedOthers = shuffledOthers.slice(0, targetOther);

      // Backfill if shortage
      if (selectedOthers.length < targetOther) {
        const needed = targetOther - selectedOthers.length;
        // Take more from MCQs if available
        const extraMcqs = shuffledMcqs.slice(targetMcq, targetMcq + needed);
        selectedMcqs = [...selectedMcqs, ...extraMcqs];
      } else if (selectedMcqs.length < targetMcq) {
        const needed = targetMcq - selectedMcqs.length;
        // Take more from Others if available
        const extraOthers = shuffledOthers.slice(targetOther, targetOther + needed);
        selectedOthers = [...selectedOthers, ...extraOthers];
      }

      // Combine and shuffle final set
      finalQuestions = shuffleArray([...selectedMcqs, ...selectedOthers]);
      
      // Ensure strictly targetTotal if we have enough total
      if (finalQuestions.length > targetTotal) {
        finalQuestions = finalQuestions.slice(0, targetTotal);
      }
    } else {
      // Practice Mode: Handle count parameter
      if (countParam === "all" || !countParam) {
        // Return all questions shuffled
        finalQuestions = shuffleArray(enrichedQuestions);
      } else {
        const count = parseInt(countParam);
        if (!isNaN(count) && count > 0) {
          const shuffled = shuffleArray(enrichedQuestions);
          finalQuestions = shuffled.slice(0, Math.min(count, shuffled.length));
        } else {
          // Fallback to all
          finalQuestions = shuffleArray(enrichedQuestions);
        }
      }
    }

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
