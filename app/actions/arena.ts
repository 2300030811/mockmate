"use server";

import { getRawQuestions } from "@/app/actions/quiz";
import { ArenaQuestion } from "../(main)/arena/types";
import { shuffleArray } from "@/lib/shuffle";

import { getAllCategories } from "@/lib/quiz-registry";

interface Question {
  id: string | number;
  question: string;
  type?: string;
  options?: any;
  answer?: any;
  explanation?: string;
  code?: string;
}

function normalizeAnswer(ans: unknown): string {
  if (typeof ans === "string") return ans;
  if (typeof ans === "number" || typeof ans === "boolean") return String(ans);
  if (Array.isArray(ans)) return ans.map(normalizeAnswer).join("|||");
  if (typeof ans === "object" && ans !== null) {
    try {
      return Object.entries(ans as Record<string, unknown>)
        .map(([k, v]) => `${k}: ${normalizeAnswer(v)}`)
        .join(" • ");
    } catch {
      return JSON.stringify(ans);
    }
  }
  return ans ? String(ans) : "";
}

export async function startArenaMatch(category?: string) {
  try {
    const categories = getAllCategories();
    const actualCategory = (category && category !== "random") 
      ? category 
      : categories[Math.floor(Math.random() * categories.length)].id;
    
    const rawQuestions = await getRawQuestions(actualCategory) as Question[];
    
    if (!rawQuestions || rawQuestions.length === 0) {
      throw new Error(`The questions database for '${actualCategory}' is currently offline or empty. Please try another category.`);
    }

    // Filter questions that are multiple-choice or have options
    const filtered = rawQuestions.filter(q => {
      if (!q.question) return false;
      if (Array.isArray(q.options) && q.options.length >= 2) return true;
      if (q.type === 'mcq' || q.type === 'MSQ') return true;
      return false;
    });
    
    const pool = filtered.length >= 5 ? filtered : rawQuestions;
    if (pool.length === 0) {
      throw new Error(`No compatible questions found for category: ${actualCategory}`);
    }

    const shuffled = shuffleArray(pool).slice(0, 5);

    const formattedQuestions: ArenaQuestion[] = shuffled.map(q => {
      let options: string[] = [];
      if (Array.isArray(q.options) && q.options.length > 0) {
        options = q.options.map(opt => typeof opt === "string" ? opt : String(opt));
      } else if (typeof q.answer === "object" && q.answer !== null && !Array.isArray(q.answer)) {
        options = Object.keys(q.answer);
      } else {
        options = ["True", "False"];
      }

      return {
        id: String(q.id),
        q: typeof q.question === "string" ? q.question : String(q.question || ""),
        options,
        a: normalizeAnswer(q.answer),
        tip: typeof q.explanation === "string" ? q.explanation : String(q.explanation || ""),
        category: actualCategory,
        code: q.code
      };
    });

    return {
      success: true,
      questions: formattedQuestions,
      category: actualCategory
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to start arena match";
    console.error("❌ Failed to start arena match:", message);
    return {
      success: false,
      error: message
    };
  }
}

export async function getArenaStats() {
  try {
    const { getDashboardData } = await import("./dashboard");
    const data = await getDashboardData();
    
    if (!data) return null;

    // Elo is now materialised on the profiles table
    const elo = data.stats.elo ?? 1000;
    
    // Recent arena activity
    const arenaResults = data.recentActivity
      .filter((r) => r.isArena)
      .slice(0, 3);

    let winStreak = 0;
    const allArenaResults = data.recentActivity.filter((r) => r.isArena);
    for (const res of allArenaResults) {
      if (res.winStatus === 'win' || (!res.winStatus && res.score > res.total_questions / 2)) {
        winStreak++;
      } else {
        break;
      }
    }

    return {
      elo,
      winStreak,
      rank: data.stats.totalTests > 10 ? `#${Math.max(1, 421 - Math.floor(data.stats.xp / 100))}` : "Unranked",
      nickname: data.user.profile?.nickname || "Guest",
      avatarIcon: data.user.profile?.avatar_icon || "User",
      recentArenaMatches: arenaResults
    };
  } catch (error) {
    console.error("❌ Failed to fetch arena stats:", error);
    return null;
  }
}
