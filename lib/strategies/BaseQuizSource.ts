
import { QuizQuestion, QuizMode } from "@/types";
import { shuffleArray } from "@/utils/quiz-helpers";
import { QuizFetcher } from "@/lib/quiz-fetcher";
import { getCachedQuestions, setCachedQuestions } from "@/lib/quiz-cache";

export abstract class BaseQuizSource {
  protected defaultExamCount: number;
  protected label: string;

  constructor(label: string, defaultExamCount: number = 65) {
    this.label = label;
    this.defaultExamCount = defaultExamCount;
  }

  // Template method: Cache → DB → Remote (with write-back)
  async fetchRawQuestions(forceRefresh: boolean = false): Promise<QuizQuestion[]> {
      const category = this.label.toLowerCase();

      // 0. Check in-memory cache (skip if forcing refresh)
      if (!forceRefresh) {
        const cached = getCachedQuestions(category);
        if (cached && cached.length > 0) {
          return cached;
        }
      }

      // 1. Try DB (skip if forceRefresh is true)
      if (!forceRefresh) {
          try {
              const dbQuestions = await QuizFetcher.fetchQuestionsFromDB(category);
              if (dbQuestions && dbQuestions.length > 0) {
                  setCachedQuestions(category, dbQuestions);
                  return dbQuestions;
              }
          } catch (e) {
              console.warn(`[${this.label}] DB fetch warning:`, e);
          }
      }

      // 2. Fallback to Remote
      const remoteQuestions = await this.fetchRemoteQuestions();
      if (remoteQuestions.length > 0) {
        setCachedQuestions(category, remoteQuestions);
      }
      return remoteQuestions;
  }

  // Abstract method to be implemented by subclasses for specific remote fetching logic
  protected abstract fetchRemoteQuestions(): Promise<QuizQuestion[]>;

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
