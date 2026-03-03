"use client";

import { useState, useEffect } from "react";
import { getServerDailyStats } from "@/app/actions/challenge";

interface UserStats {
  streak: number;
  xp: number;
  level: number;
  elo: number;
  solvedToday: boolean;
  streakMultiplier: number;
  isLoaded: boolean;
}

/**
 * Server-backed user stats hook.
 * Replaces the old `useDailyStreak` localStorage hook with authoritative server data.
 * Falls back gracefully if the server call fails.
 */
export function useStreak(): UserStats {
  const [stats, setStats] = useState<UserStats>({
    streak: 0,
    xp: 0,
    level: 1,
    elo: 1000,
    solvedToday: false,
    streakMultiplier: 1.0,
    isLoaded: false,
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      try {
        const data = await getServerDailyStats();
        if (!cancelled) {
          setStats({
            streak: data.streak,
            xp: data.xp,
            level: data.level,
            elo: data.elo,
            solvedToday: data.solvedToday,
            streakMultiplier: data.streakMultiplier,
            isLoaded: true,
          });
        }
      } catch (err) {
        console.error("Failed to fetch user stats:", err);
        if (!cancelled) {
          setStats((prev) => ({ ...prev, isLoaded: true }));
        }
      }
    }

    fetchStats();

    return () => {
      cancelled = true;
    };
  }, []);

  return stats;
}
