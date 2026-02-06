import { QuizQuestion, QuizConfig, QuizMode } from "@/types";
import { parseExplanationForHotspot, shuffleArray } from "@/utils/quiz-helpers";
import { QuizQuestionSchema } from "./schemas";
import { AppError, ValidationError } from "@/lib/exceptions";

export class QuizService {
  /**
   * Fetches questions from a URL and normalizes them.
   */
  static async fetchQuestions(url: string): Promise<QuizQuestion[]> {
    if (!url) throw new Error("Quiz URL is missing.");

    const res = await fetch(url, {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
    });

    if (!res.ok) throw new Error(`Fetch Failed: ${res.status}`);

    const rawData = await res.json();
    let allQuestions: unknown[] = [];

    // Robust unwrapping
    if (Array.isArray(rawData)) {
      allQuestions = rawData;
    } else if (rawData && typeof rawData === "object") {
        const asObj = rawData as Record<string, unknown>;
        if (Array.isArray(asObj.questions)) {
            allQuestions = asObj.questions;
        } else {
            // Find the first array property
            allQuestions = (Object.values(asObj).find((v) => Array.isArray(v)) as unknown[]) || [];
        }
    }

    if (!Array.isArray(allQuestions)) {
        throw new Error("Invalid question format or empty array");
    }

    // Enrich & Type Check with Zod
    return allQuestions.map((q) => {
        if (!q || typeof q !== "object") return null;
        
        const safeQ = q as Record<string, unknown>;
        const newQ = { ...safeQ };

        // Fix Hotspots with empty answers using explanation parsing
        // We ensure type is treated as string for comparison to avoid "any" pollution
        const qType = String(newQ.type || "");

        if (
            (qType === "hotspot" || qType === "drag_drop" || qType === "mcq") &&
            (!newQ.answer || (typeof newQ.answer === "object" && Object.keys(newQ.answer as object).length === 0))
          ) {
            const explanation = typeof newQ.explanation === 'string' ? newQ.explanation : undefined;
            const parsed = parseExplanationForHotspot(explanation);
            if (parsed) {
               newQ.type = "hotspot";
               newQ.answer = parsed;
            }
          }
        
        // Strict Validation
        const parsedQ = QuizQuestionSchema.safeParse(newQ);
        if (!parsedQ.success) {
            // In strict mode, we might want to log this
            // console.warn(`Skipping invalid question ID ${safeQ.id}`);
            return null;
        }
        return parsedQ.data;
    }).filter((q): q is QuizQuestion => q !== null);
  }

  /**
   * Generic selection logic
   */
  static selectQuestions(questions: QuizQuestion[], mode: QuizMode, countParam: string | number | null, defaultExamCount: number = 65, useAzureLogic: boolean = false): QuizQuestion[] {
     // Always shuffle first
     let pool = shuffleArray([...questions]);
     
     // Resolve Count
     let targetCount = defaultExamCount;
     if (countParam === "all") targetCount = pool.length;
     else if (countParam) {
         const p = typeof countParam === 'string' ? parseInt(countParam) : countParam;
         if (!isNaN(p) && p > 0) targetCount = p;
     }

     if (mode === "practice") {
         if (countParam === "all") return pool;
         // If count is specified, slice. If not, return ALL for practice (default) OR partial?
         // Azure route logic: if countParam is missing => all.
         // AWS route logic: if countParam is missing => all.
         if (!countParam) return pool;
         return pool.slice(0, targetCount);
     }

     if (mode === "exam") {
         if (useAzureLogic) {
             return this.selectExamQuestionsAzureStyle(pool, targetCount);
         }
         return pool.slice(0, targetCount);
     }
     
     return pool;
  }

  static selectExamQuestionsAzureStyle(questions: QuizQuestion[], targetTotal: number): QuizQuestion[] {
      const mcqs = questions.filter((q) => q.type && q.type.toLowerCase() === "mcq");
      const others = questions.filter((q) => {
        const isMcq = q.type && q.type.toLowerCase() === "mcq";
        if (isMcq) return false;
        
        // Filter out Hotspots that don't have a structured answer
        if (q.type === "hotspot") {
            const hasStructuredAnswer = q.answer && typeof q.answer === 'object' && Object.keys(q.answer).length > 0;
            return !!hasStructuredAnswer;
        }
        return true;
      });

      const shuffledMcqs = shuffleArray(mcqs);
      const shuffledOthers = shuffleArray(others);

      // 75% MCQ
      const targetMcq = Math.round(targetTotal * 0.75);
      const targetOther = targetTotal - targetMcq;

      let selectedMcqs = shuffledMcqs.slice(0, targetMcq);
      let selectedOthers = shuffledOthers.slice(0, targetOther);

      // Backfill
      if (selectedOthers.length < targetOther) {
        const needed = targetOther - selectedOthers.length;
        selectedMcqs = [...selectedMcqs, ...shuffledMcqs.slice(targetMcq, targetMcq + needed)];
      } else if (selectedMcqs.length < targetMcq) {
        const needed = targetMcq - selectedMcqs.length;
        selectedOthers = [...selectedOthers, ...shuffledOthers.slice(targetOther, targetOther + needed)];
      }

      const final = shuffleArray([...selectedMcqs, ...selectedOthers]);
      if (final.length > targetTotal) return final.slice(0, targetTotal);
      return final;
  }
}
