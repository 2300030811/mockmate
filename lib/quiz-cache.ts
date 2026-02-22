import { QuizQuestion } from "@/types";

interface CacheEntry {
  questions: QuizQuestion[];
  timestamp: number;
}

/**
 * In-memory quiz question cache.
 * 
 * Quiz questions are fetched from external URLs or Supabase and rarely change
 * (typically refreshed via manual seed). This cache avoids re-fetching on
 * every quiz start during the same server process lifetime.
 * 
 * TTL defaults to 30 minutes — enough to serve most user sessions
 * without stale data concerns.
 */
const cache = new Map<string, CacheEntry>();
const DEFAULT_TTL_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Retrieves cached quiz questions for a category.
 * Returns null if not cached or expired.
 */
export function getCachedQuestions(category: string): QuizQuestion[] | null {
  const entry = cache.get(category.toLowerCase());
  if (!entry) return null;

  const age = Date.now() - entry.timestamp;
  if (age > DEFAULT_TTL_MS) {
    cache.delete(category.toLowerCase());
    return null;
  }

  return entry.questions;
}

/**
 * Stores quiz questions in the cache.
 */
export function setCachedQuestions(category: string, questions: QuizQuestion[]): void {
  if (!questions || questions.length === 0) return;

  cache.set(category.toLowerCase(), {
    questions,
    timestamp: Date.now(),
  });
}

/**
 * Clears all cached quiz data (useful after seeding).
 */
export function clearQuizCache(): void {
  cache.clear();
}

/**
 * Returns cache stats for monitoring.
 */
export function getQuizCacheStats(): { size: number; categories: string[] } {
  return {
    size: cache.size,
    categories: Array.from(cache.keys()),
  };
}
