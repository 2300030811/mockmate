import { SupabaseClient } from "@supabase/supabase-js";
import { profileRepository } from "@/lib/db/profile-repository";
import { quizRepository } from "@/lib/db/quiz-repository";
import { careerPathRepository } from "@/lib/db/career-path-repository";
import { validateNickname } from "@/utils/moderation";
import { syncProfileStats } from "@/lib/profile-sync";

export const profileService = {
  async updateProfile(
    supabase: SupabaseClient,
    userId: string,
    data: { nickname: string; avatar_icon: string }
  ) {
    const validation = validateNickname(data.nickname);
    if (!validation.success) {
      throw new Error(validation.error);
    }

    await profileRepository.updateProfile(supabase, userId, {
      nickname: data.nickname,
      avatar_icon: data.avatar_icon,
    });
  },

  async exportUserData(supabase: SupabaseClient, userId: string) {
    const [profile, quizResults, careerPaths] = await Promise.all([
      profileRepository.getProfile(supabase, userId),
      quizRepository.getRecentResults(supabase, userId, null, 500),
      careerPathRepository.getRecentCareerPaths(supabase, userId, 500),
    ]);

    return {
      exportedAt: new Date().toISOString(),
      user: {
        id: userId,
      },
      profile,
      quizResults: quizResults || [],
      careerPaths: careerPaths || [],
    };
  },

  async syncStats(
    userId: string,
    type: "quiz" | "arena" | "daily-challenge",
    score: number,
    totalQuestions: number,
    arenaStatus?: "win" | "loss" | "tie" | null,
    dailyPoints?: number
  ) {
    await syncProfileStats({
      userId,
      type,
      score,
      totalQuestions,
      arenaStatus,
      dailyPoints,
    });
  },

  async getDailyOverview(adminDb: SupabaseClient, userId: string) {
    return profileRepository.getStats(adminDb, userId);
  }
};
