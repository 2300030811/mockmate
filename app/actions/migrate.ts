"use server";

import { supabase } from "@/lib/supabase";
import { QuizFetcher } from "@/lib/quiz-fetcher";

const QUIZ_URLS: Record<string, string | undefined> = {
  aws: process.env.AWS_QUESTIONS_URL,
  azure: process.env.AZURE_QUESTIONS_URL,
  salesforce: process.env.SALESFORCE_QUESTIONS_URL,
  mongodb: process.env.MONGODB_QUESTIONS_URL,
  pcap: process.env.PCAP_QUESTIONS_URL,
  oracle: process.env.ORACLE_QUESTIONS_URL,
};

export async function seedDatabase() {
  const results = [];

  for (const [category, url] of Object.entries(QUIZ_URLS)) {
    if (!url) {
      results.push({ category, status: "skipped", reason: "No URL found" });
      continue;
    }

    try {
      console.log(`📡 Fetching and normalizing ${category} questions...`);
      
      // Use the robust fetchers we already built
      const questions = (category === 'pcap') 
        ? await QuizFetcher.fetchPCAPQuestions(url)
        : await QuizFetcher.fetchQuestions(url);

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
    } catch (error: any) {
      console.error(`❌ Failed to seed ${category}:`, error.message);
      results.push({ category, status: "error", error: error.message });
    }
  }

  return results;
}
