import { SupabaseClient } from "@supabase/supabase-js";
import { validateNickname } from "@/utils/moderation";
import { withRetry } from "@/lib/retry";
import { getRawQuestions } from "@/app/actions/quiz";
import { checkAnswer } from "@/utils/quiz-helpers";
import type { QuizQuestion } from "@/types";
import { invalidateLeaderboardCache } from "@/lib/cache/invalidate";
import { profileRepository } from "@/lib/db/profile-repository";
import { quizRepository } from "@/lib/db/quiz-repository";
import { profileService } from "./profile-service";
import { parseArenaBaseCategory, isArenaCategory, parseArenaStatus } from "@/lib/arena-category";

export const quizService = {
  async saveQuizResult(
    supabase: SupabaseClient,
    adminDb: SupabaseClient,
    data: {
      sessionId: string;
      category: string;
      userAnswers: Record<string, string | string[] | Record<string, string> | boolean | number>;
      totalQuestions: number;
      nickname?: string;
      generatedQuiz?: QuizQuestion[];
      arenaStatus?: "win" | "loss" | "tie";
      arenaTotalQuestions?: number;
      arenaUserScore?: number;
      arenaOpponentScore?: number;
    }
  ) {
    const { data: { user } } = await withRetry(
      () => supabase.auth.getUser(),
      { retries: 1, baseDelay: 1000, label: "Save result auth" }
    ).then(r => r).catch(() => ({ data: { user: null } }));
    const userId = user?.id || null;

    // Resolve nickname (Required by DB constraint)
    let finalNickname: string = data.nickname || "";
    if (!finalNickname && userId) {
      const profile = await profileRepository.getProfileFields(adminDb, userId, "nickname");
      finalNickname = profile?.nickname || "";
    }
    if (!finalNickname) {
      finalNickname = "Guest";
    }

    if (data.nickname) {
      const validation = validateNickname(data.nickname);
      if (!validation.success) {
        return { success: false, error: validation.error };
      }
    }

    const isArena = isArenaCategory(data.category) || !!data.arenaStatus;
    const winStatus = data.arenaStatus || parseArenaStatus(data.category);
    const cleanCategory = parseArenaBaseCategory(data.category);

    const quizMode = isArena
      ? "arena" as const
      : cleanCategory === "daily-challenge"
        ? "daily-challenge" as const
        : "standard" as const;

    let questions: QuizQuestion[] = [];

    // Determine Source of Truth
    if (data.generatedQuiz && (cleanCategory === "AI Generated" || cleanCategory.startsWith("PDF:"))) {
      questions = data.generatedQuiz;
    } else {
      questions = await getRawQuestions(cleanCategory);
    }

    if (!questions || questions.length === 0) {
      throw new Error(`Failed to validate quiz: Questions not found for ${cleanCategory}.`);
    }

    // Calculate Score Server-Side
    let calculatedScore = 0;
    const questionMap = new Map(questions.map(q => [String(q.id), q]));

    Object.entries(data.userAnswers).forEach(([qId, ans]) => {
      const question = questionMap.get(String(qId));
      if (question) {
        if (checkAnswer(question, ans)) {
          calculatedScore++;
        }
      }
    });

    const scoreToSave = calculatedScore;
    const recentTimeAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

    const existing = await quizRepository.findDuplicateResult(adminDb, {
      category: cleanCategory,
      score: scoreToSave,
      sinceDate: recentTimeAgo,
      userId,
      sessionId: data.sessionId,
      quizMode,
    });

    if (existing) {
      await quizRepository.updateNickname(adminDb, existing.id, finalNickname);
      await invalidateLeaderboardCache(cleanCategory);
      return { success: true, updated: true };
    }

    await withRetry(
      () => quizRepository.saveResult(adminDb, {
        session_id: data.sessionId,
        user_id: userId,
        category: cleanCategory,
        score: scoreToSave,
        total_questions: data.totalQuestions,
        nickname: finalNickname,
        completed_at: new Date().toISOString(),
        quiz_mode: quizMode,
        arena_status: winStatus || null,
        arena_user_score: data.arenaUserScore !== undefined ? data.arenaUserScore : null,
        arena_opponent_score: data.arenaOpponentScore !== undefined ? data.arenaOpponentScore : null,
      }),
      { retries: 2, baseDelay: 1000, label: "Insert quiz result" }
    );

    if (userId) {
      try {
        const syncType = quizMode === "arena"
          ? "arena" as const
          : quizMode === "daily-challenge"
            ? "daily-challenge" as const
            : "quiz" as const;

        await profileService.syncStats(
          userId,
          syncType,
          scoreToSave,
          data.arenaTotalQuestions || data.totalQuestions,
          winStatus,
          undefined,
          data.arenaUserScore,
          data.arenaOpponentScore
        );
      } catch (syncErr) {
        console.error("⚠️ Failed to sync profile stats:", syncErr);
      }
    }

    await invalidateLeaderboardCache(cleanCategory);

    return { success: true };
  },

  async updateNickname(adminDb: SupabaseClient, id: string, nickname: string) {
    const validation = validateNickname(nickname);
    if (!validation.success) {
      return { success: false, error: validation.error };
    }

    const resultData = await quizRepository.getResultById(adminDb, id);
    await quizRepository.updateNickname(adminDb, id, nickname);

    if (resultData?.category) {
      await invalidateLeaderboardCache(resultData.category);
    }

    return { success: true };
  },

  async deleteQuizResult(supabase: SupabaseClient, userId: string, id: string) {
    const profile = await profileRepository.getProfileFields(supabase, userId, "role");

    if (profile?.role !== "admin") {
      throw new Error("Forbidden: Admin access required");
    }

    await quizRepository.deleteResult(supabase, id);
    return { success: true };
  }
};
