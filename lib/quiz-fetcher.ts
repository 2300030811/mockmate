import { QuizQuestion } from "@/types";
import { createClient } from "@/utils/supabase/server";

export class QuizFetcher {
  /**
   * Fetches questions from Supabase database.
   */
  static async fetchQuestionsFromDB(category: string): Promise<QuizQuestion[] | null> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('questions')
        .eq('category', category)
        .single();

      if (error || !data) return null;
      return data.questions as QuizQuestion[];
    } catch (e) {
      console.warn(`⚠️ [QuizFetcher] DB fetch failed for ${category}:`, e);
      return null;
    }
  }
}
