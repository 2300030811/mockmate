import { QuizQuestion, QuizConfig, QuizMode } from "@/types";
import { shuffleArray } from "@/utils/quiz-helpers";
import { AppError, ValidationError } from "@/lib/exceptions";
import { detectAndParse } from "./parsers";

export class QuizService {
  /**
   * Parses and normalizes raw question data using the Strategy Pattern.
   */
  static parseQuestions(rawData: unknown): QuizQuestion[] {
    // Delegate to the unified parser detector
    // This allows easy extension for new formats without modifying this class
    return detectAndParse(rawData);
  }


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
    return this.parseQuestions(rawData);
  }

  /**
   * Fetches PCAP questions handling specific malformed JSON issues.
   */
  /**
   * Fetches PCAP questions handling specific malformed JSON issues.
   */
  static async fetchPCAPQuestions(url: string): Promise<QuizQuestion[]> {
      if (!url) throw new Error("PCAP Quiz URL is missing.");

      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Failed to fetch PCAP questions: ${response.statusText}`);
      
      const text = await response.text();
      
      // Remove known invalid markers that break JSON
      let jsonString = text.replace(/\[cite_start\]/g, '').trim();
      
      // Define a type for the raw structure we expect
      type PCAPRawQuestion = {
          id: number;
          type: string;
          question: string;
          code?: string;
          options?: Record<string, string>;
          correctAnswer?: string[];
          explanation?: string;
      };
      
      type PCAPBatch = {
          batchId?: string | number;
          questions: PCAPRawQuestion[];
      };

      let data: PCAPBatch[];

      try {
          // First try standard parse
          const parsed = JSON.parse(jsonString);
          if (Array.isArray(parsed)) {
              data = parsed as PCAPBatch[];
          } else {
              data = [parsed as PCAPBatch]; 
          }
      } catch (e: unknown) {
          // If standard parse fails, it might be concatenated objects: { ... } { ... }
          if (jsonString.startsWith('{')) {
                const fixedJson = '[' + jsonString.replace(/}\s*\{/g, '},{') + ']';
                try {
                  data = JSON.parse(fixedJson) as PCAPBatch[];
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

      // Transform data to QuizQuestion format with specific cleaning rules
      data.forEach((batch) => {
        if (batch.questions && Array.isArray(batch.questions)) {
          batch.questions.forEach((q) => {
              
              const optionsMap = q.options || {};
              const optionsKeys = Object.keys(optionsMap).sort();
              const optionsArray = optionsKeys.map(k => optionsMap[k]);
              
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
              
              // Specific fixes
              if (q.id === 141) {
                  explanation = "Attempting to delete an index that is out of range raises an IndexError. Here, `del spam[4]` targets the 5th element, but the list only has indices 0 to 4 (element 16). After checking range(4) creates [0,1,2,3], so index 4 is invalid.";
              } else if (q.id === 64) {
                    explanation = "The loop iterates through range(1, 3) (i.e., 1 and 2). For i=1: 1%1==0 -> prints '*'. For i=2: 2%2==0 and 2>1 -> prints '*'. Total 2 stars printed.";
              }

              // Clean internal monologue
              if (explanation.includes("Wait,")) {
                  const parts = explanation.split("Wait,");
                  let clean = parts[0].trim();
                  if (clean.length < 15) {
                      if (explanation.includes("**Correction**")) {
                            clean = explanation.split("**Correction**")[1].replace(/^[:\s]+/, '').trim();
                      } else {
                            clean = "Review the code execution logic.";
                      }
                  }
                  explanation = clean;
              }
              
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

      return allQuestions;
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
