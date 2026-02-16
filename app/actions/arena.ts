"use server";

import { getRawQuestions } from "@/app/actions/quiz";
import { ArenaQuestion } from "../(main)/arena/types";

const CATEGORIES = ["aws", "azure", "salesforce", "mongodb", "pcap", "oracle"];

export async function startArenaMatch(category?: string) {
  try {
    // 1. Pick category
    const actualCategory = (category && category !== "random") 
      ? category 
      : CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    
    // 2. Fetch questions
    const rawQuestions = await getRawQuestions(actualCategory);
    
    if (!rawQuestions || rawQuestions.length === 0) {
      throw new Error(`No questions found for category: ${actualCategory}`);
    }

    // 3. Filter for MCQ only (Arena UI is built for MCQs) and Shuffle
    const filtered = rawQuestions.filter(q => q.type === 'mcq' || q.type === 'MSQ' || (q as any).options);
    
    if (filtered.length === 0) {
      throw new Error(`No compatible questions found for category: ${actualCategory}`);
    }

    const shuffled = [...filtered]
      .sort(() => 0.5 - Math.random())
      .slice(0, 5);

    // 4. Transform to ArenaQuestion format
    const formattedQuestions: ArenaQuestion[] = shuffled.map(q => {
      const mcq = q as any; // Cast to access fields safely after check
      return {
        id: String(q.id),
        q: q.question,
        options: mcq.options || [],
        a: Array.isArray(mcq.answer) ? mcq.answer[0] : (mcq.answer as string),
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
