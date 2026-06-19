"use server";

import { createClient } from "@/utils/supabase/server";
import { QuizFactory } from "@/lib/strategies/QuizFactory";
import { clearQuizCache } from "@/lib/quiz-cache";
import { requireAdmin } from "@/lib/auth-utils";
import { logger } from "@/lib/logger";
import { quizRepository } from "@/lib/db/quiz-repository";

const CATEGORIES = ["aws", "azure", "salesforce", "mongodb", "pcap", "oracle"];

export async function seedDatabase() {
  if (!await requireAdmin()) throw new Error("Admin access required.");

  const supabase = createClient();
  const results = [];

  for (const category of CATEGORIES) {
    try {
      logger.info(`📡 Fetching and normalizing ${category} questions...`);
      
      // Use the Factory Pattern
      const source = QuizFactory.getSource(category);
      // Force refresh to ensure we get the latest data from remote source to update DB
      const questions = await source.fetchRawQuestions(true);

      if (!questions || questions.length === 0) {
        throw new Error("No questions found or parsing failed");
      }

      logger.info(`💾 Saving ${questions.length} questions to database...`);
      
      await quizRepository.upsertQuiz(supabase, category, questions);

      results.push({ category, status: "success", count: questions.length });
    } catch (error: any) {
      const message = error.message || "Unknown error";
      logger.error(`❌ Failed to seed ${category}:`, message);
      results.push({ category, status: "error", error: message });
    }
  }

  // Clear in-memory cache so fresh data is served
  clearQuizCache();

  return results;
}
