import { SupabaseClient } from "@supabase/supabase-js";
import { aiOrchestrator } from "@/lib/services/ai-orchestrator";
import { z } from "zod";
import { sanitizePromptInput } from "@/utils/sanitize";
import { logger } from "@/lib/logger";
import { DAILY_PROBLEMS } from "@/utils/daily-problems";
import { getStreakMultiplier } from "@/lib/scoring";
import { profileRepository } from "@/lib/db/profile-repository";
import { quizRepository } from "@/lib/db/quiz-repository";
import { profileService } from "./profile-service";

export const challengeService = {
  async submitChallenge(
    supabase: SupabaseClient,
    adminDb: SupabaseClient,
    userId: string | null,
    problemTitle: string,
    code: string,
    language: string,
    output: string
  ) {
    const problem = DAILY_PROBLEMS.find(p => p.title === problemTitle);
    if (!problem) {
      return {
        success: false,
        score: 0,
        efficiency: "N/A",
        feedback: "Invalid problem selected. Please try a valid daily challenge."
      };
    }

    const sanitizedCode = sanitizePromptInput(code, 20000);
    const sanitizedOutput = sanitizePromptInput(output, 5000);
    const prompt = `
        You are an automated code judge.
        Problem: "${sanitizePromptInput(problemTitle, 200)}"
        User Code:
        <USER_CODE>
        ${sanitizedCode}
        </USER_CODE>
        Execution Output:
        <USER_OUTPUT>${sanitizedOutput}</USER_OUTPUT>

        Evaluate the solution based on:
        1. Correctness (Does it solve the problem? Strict check.)
        2. Efficiency (Big O time/space)
        3. Code Style (Cleanliness)

        Return a JSON object:
        {
           "success": boolean,
           "score": number (0-100),
           "efficiency": string (e.g., "O(n)"),
           "feedback": string (One sentence summary)
        }
        ONLY RETURN JSON.
    `;

    const challengeEvalSchema = z.object({
      success: z.boolean(),
      score: z.number().min(0).max(100),
      efficiency: z.string(),
      feedback: z.string(),
    });

    const result = await aiOrchestrator.generateStructured(
      [{ role: "user", content: prompt }],
      "You are an automated code judge.",
      challengeEvalSchema,
      "auto",
      {
        temperature: 0.1,
        maxTokens: 500,
      }
    );

    if (!result.success) {
      throw new Error("Invalid JSON from Groq");
    }

    const evalResult = result.data!;

    // Server-Side Persistence for Daily Streak
    if (evalResult.success && userId) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const existing = await quizRepository.checkDailyChallengeSolved(
        adminDb,
        userId,
        todayStart.toISOString()
      );

      if (!existing) {
        const problemPoints = problem ? problem.points : 10;

        // Fetch nickname required by DB constraint
        const profile = await profileRepository.getProfileFields(adminDb, userId, "nickname");
        const userNickname = profile?.nickname || "User";

        try {
          await quizRepository.saveResult(adminDb, {
            nickname: userNickname,
            user_id: userId,
            session_id: `user_session_${userId}`,
            category: "daily-challenge",
            score: problemPoints,
            total_questions: problemPoints,
            completed_at: new Date().toISOString(),
            quiz_mode: "daily-challenge",
          });
        } catch (insertError) {
          logger.error("❌ Failed to insert challenge result:", insertError);
        }
      }
    }
    return evalResult;
  },

  async getServerDailyStats(adminDb: SupabaseClient, userId: string) {
    // Fetch profile stats (materialised) + daily-challenge results for solvedToday check
    const [profile, dailyResultList] = await Promise.all([
      profileRepository.getStats(adminDb, userId),
      quizRepository.getLatestDailyChallengeResult(adminDb, userId),
    ]);

    const streak = profile?.streak ?? 0;
    const xp = profile?.xp ?? 0;
    const level = profile?.level ?? 1;
    const elo = profile?.elo ?? 1000;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let solvedToday = false;
    if (dailyResultList && dailyResultList.length > 0) {
      const lastSolved = new Date(dailyResultList[0].completed_at);
      lastSolved.setHours(0, 0, 0, 0);
      solvedToday = lastSolved.getTime() === today.getTime();
    }

    return {
      streak,
      points: xp, // renamed for clarity — total XP
      solvedToday,
      xp,
      level,
      elo,
      streakMultiplier: getStreakMultiplier(streak),
    };
  },

  async syncDailyChallenge(
    supabase: SupabaseClient,
    adminDb: SupabaseClient,
    userId: string,
    points: number
  ) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Check if record exists
    const existing = await quizRepository.checkDailyChallengeSolved(
      adminDb,
      userId,
      todayStart.toISOString()
    );

    if (!existing) {
      // Fetch nickname required by DB constraint
      const profile = await profileRepository.getProfileFields(
        adminDb,
        userId,
        "nickname, xp, streak, last_activity_at"
      );

      const userNickname = profile?.nickname || "User";

      logger.info(`[Sync] Restoring missing daily challenge for user ${userId}`);
      await quizRepository.saveResult(adminDb, {
        user_id: userId,
        nickname: userNickname,
        session_id: `user_session_${userId}`,
        category: "daily-challenge",
        score: 1,
        total_questions: 1,
        completed_at: new Date().toISOString(),
        quiz_mode: "daily-challenge",
      });

      // Sync XP and streak on profiles
      await profileService.syncStats(
        userId,
        "daily-challenge",
        1,
        1,
        null,
        points
      );
    }

    return { success: true };
  }
};
