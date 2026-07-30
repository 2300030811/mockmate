import { SupabaseClient } from "@supabase/supabase-js";
import { redis } from "@/lib/cache/redis";
import { quizRepository } from "@/lib/db/quiz-repository";
import type { LeaderboardItem } from "@/types/dashboard";

export const leaderboardService = {
  async getLeaderboard(
    supabase: SupabaseClient,
    category: string,
    timeframe: "all-time" | "weekly" = "all-time"
  ): Promise<LeaderboardItem[]> {
    const cacheKey = `leaderboard:${category}:${timeframe}`;

    try {
      if (redis) {
        const cached = await redis.get<LeaderboardItem[]>(cacheKey);
        if (cached) {
          return cached;
        }
      }
    } catch (e) {
      console.warn("⚠️ Redis cache read failed:", e);
    }

    try {
      let sinceDate: string | undefined;
      if (timeframe === "weekly") {
        const now = new Date();
        const lastSunday = new Date(now);
        lastSunday.setDate(now.getDate() - now.getDay());
        lastSunday.setHours(0, 0, 0, 0);
        sinceDate = lastSunday.toISOString();
      }

      const rawResults = await quizRepository.fetchLeaderboardRows(supabase, category, sinceDate, 100);

      // Pre-compute percentage and time to optimize sorting
      const withStats = rawResults.map(r => ({
        ...r,
        percent: r.total_questions > 0 ? r.score / r.total_questions : 0,
        timeMs: new Date(r.completed_at).getTime()
      }));

      // Sort fairly by percentage correct
      withStats.sort((a, b) => {
        if (b.percent !== a.percent) {
          return b.percent - a.percent;
        }
        // Tie-breaker 1: Total questions
        if (b.total_questions !== a.total_questions) {
          return b.total_questions - a.total_questions;
        }
        // Tie-breaker 2: Most recent
        return b.timeMs - a.timeMs;
      });

      // Strip back the added properties to match the interface
      const finalResults = withStats.slice(0, 50).map(({ percent, timeMs, ...rest }) => rest);

      try {
        if (redis && finalResults.length > 0) {
          redis.set(cacheKey, finalResults, { ex: 300 }).catch(e => console.warn("Redis set failed:", e));
        }
      } catch (e) {
        console.warn("⚠️ Redis cache write failed:", e);
      }

      return finalResults;
    } catch (error: any) {
      console.error("❌ Failed to fetch leaderboard:", error?.message || JSON.stringify(error) || "Unknown error");
      return [];
    }
  }
};
