
import { QuizQuestion, QuizMode } from "@/types";
import { shuffleArray } from "@/utils/quiz-helpers";

export abstract class BaseQuizSource {
  protected defaultExamCount: number;
  protected label: string;

  constructor(label: string, defaultExamCount: number = 65) {
    this.label = label;
    this.defaultExamCount = defaultExamCount;
  }

  abstract fetchRawQuestions(): Promise<QuizQuestion[]>;

  async getQuestions(mode: QuizMode, countParam: string | number | null): Promise<QuizQuestion[]> {
    const rawQuestions = await this.fetchRawQuestions();
    
    if (!rawQuestions || rawQuestions.length === 0) {
        console.warn(`[${this.label}] No questions found.`);
        return [];
    }

    return this.processQuestions(rawQuestions, mode, countParam);
  }

  protected processQuestions(questions: QuizQuestion[], mode: QuizMode, countParam: string | number | null): QuizQuestion[] {
     // Always shuffle first
     let pool = shuffleArray([...questions]);
     
     let targetCount = this.defaultExamCount;
     
     if (countParam === "all") {
         targetCount = pool.length;
     } else if (countParam) {
         const p = typeof countParam === 'string' ? parseInt(countParam) : countParam;
         if (!isNaN(p) && p > 0) targetCount = p;
     }

     if (mode === "practice") {
         if (countParam === "all" || !countParam) return pool;
         return pool.slice(0, targetCount);
     }

     if (mode === "exam") {
         return pool.slice(0, targetCount);
     }
     
     return pool;
  }
}
