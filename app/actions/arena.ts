"use server";

import { getRawQuestions } from "@/app/actions/quiz";
import { ArenaQuestion } from "../(main)/arena/types";

const CATEGORIES = ["aws", "azure", "salesforce", "mongodb", "pcap", "oracle"];

interface Question {
  id: string | number;
  question: string;
  type?: string;
  options?: string[];
  answer?: string | string[];
  explanation?: string;
  code?: string;
}

export async function startArenaMatch(category?: string) {
  try {
    const actualCategory = (category && category !== "random") 
      ? category 
      : CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    
    const rawQuestions = await getRawQuestions(actualCategory) as Question[];
    
    if (!rawQuestions || rawQuestions.length === 0) {
      throw new Error(`The questions database for '${actualCategory}' is currently offline or empty. Please try another category.`);
    }

    const filtered = rawQuestions.filter(q => q.type === 'mcq' || q.type === 'MSQ' || q.options);
    
    if (filtered.length === 0) {
      throw new Error(`No compatible questions found for category: ${actualCategory}`);
    }

    const shuffled = [...filtered]
      .sort(() => 0.5 - Math.random())
      .slice(0, 5);

    const formattedQuestions: ArenaQuestion[] = shuffled.map(q => {
      return {
        id: String(q.id),
        q: q.question,
        options: q.options || [],
        a: Array.isArray(q.answer) ? q.answer[0] : (q.answer as string),
        tip: q.explanation || "",
        category: actualCategory,
        code: q.code
      };
    });

    return {
      success: true,
      questions: formattedQuestions,
      category: actualCategory
    };
  } catch (error: any) {
    console.error("❌ Failed to start arena match:", error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

export async function getArenaStats() {
  try {
    const { getDashboardData } = await import("./dashboard");
    const data = await getDashboardData();
    
    if (!data) return null;

    // Calculate a mock Elo based on XP for now, or just use XP
    // Elo starts at 1000 + (totalXP / 10)
    const elo = 1000 + Math.floor(data.stats.xp / 10);
    
    // Recent arena activity
    const arenaResults = data.recentActivity
      .filter((r: any) => r.isArena)
      .slice(0, 3);

    let winStreak = 0;
    const allArenaResults = data.recentActivity.filter((r: any) => r.isArena);
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
      recentArenaMatches: arenaResults
    };
  } catch (error) {
    console.error("❌ Failed to fetch arena stats:", error);
    return null;
  }
}
