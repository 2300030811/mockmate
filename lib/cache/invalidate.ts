import { redis } from "./redis";

export async function invalidateLeaderboardCache(category: string): Promise<void> {
  if (!redis) return;
  try {
    await redis.del(
      `leaderboard:${category}:all-time`,
      `leaderboard:${category}:weekly`
    );
  } catch (error) {
    console.warn(`[Cache Invalidation] Failed to delete leaderboard cache for ${category}:`, error);
  }
}
