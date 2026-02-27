"use server";

import { createClient } from "@/utils/supabase/server";
import { QuizFactory } from "@/lib/strategies/QuizFactory";
import { clearQuizCache } from "@/lib/quiz-cache";
import { requireAdmin } from "@/lib/auth-utils";

const CATEGORIES = ["aws", "azure", "salesforce", "mongodb", "pcap", "oracle"];

export async function seedDatabase() {
  if (!await requireAdmin()) throw new Error("Admin access required.");

  const supabase = createClient();
  const results = [];

  for (const category of CATEGORIES) {
    try {
      console.log(`📡 Fetching and normalizing ${category} questions...`);
      
      // Use the Factory Pattern
      const source = QuizFactory.getSource(category);
      // Force refresh to ensure we get the latest data from remote source to update DB
      const questions = await source.fetchRawQuestions(true);

      if (!questions || questions.length === 0) {
        throw new Error("No questions found or parsing failed");
      }

      console.log(`💾 Saving ${questions.length} questions to database...`);
      const { error } = await supabase
        .from('quizzes')
        .upsert({ 
          category, 
          questions, 
          updated_at: new Date().toISOString() 
        }, { onConflict: 'category' });

      if (error) {
        if (error.code === '42501') {
          throw new Error("RLS Violation: Please update your Supabase SQL policies to allow INSERT/UPDATE on 'quizzes'.");
        }
        throw error;
      }

      results.push({ category, status: "success", count: questions.length });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error(`❌ Failed to seed ${category}:`, message);
      results.push({ category, status: "error", error: message });
    }
  }

  // Clear in-memory cache so fresh data is served
  clearQuizCache();

  return results;
}
