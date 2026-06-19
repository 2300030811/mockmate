import { QuizQuestion } from "@/types";
import { createClient } from "@/utils/supabase/server";
import { quizRepository } from "@/lib/db/quiz-repository";

export class QuizFetcher {
  /**
   * Fetches questions from Supabase database.
   */
  static async fetchQuestionsFromDB(category: string): Promise<QuizQuestion[] | null> {
    const supabase = createClient();
    try {
      const data = await quizRepository.fetchQuestions(supabase, category);
      if (!data) return null;
      return data.questions as QuizQuestion[];
    } catch (e) {
      console.warn(`⚠️ [QuizFetcher] DB fetch failed for ${category}:`, e);
      return null;
    }
  }
}
