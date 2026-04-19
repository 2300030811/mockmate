"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { unstable_cache } from "next/cache";
import { rateLimit } from "@/lib/rate-limit";
import { getStreakMultiplier, calculateLevel } from "@/lib/scoring";
import { isArenaCategory, parseArenaStatus, formatArenaCategoryLabel } from "@/lib/arena-category";
import { logger } from "@/lib/logger";
import {
  buildCareerOpsTrackerSummary,
  CareerOpsApplicationSnapshot,
  emptyCareerOpsTrackerSummary,
} from "@/lib/career-ops/summary";
import {
  buildCareerOpsPatternInsights,
  emptyCareerOpsPatternInsights,
} from "@/lib/career-ops/patterns";
import { isMissingCareerOpsTableError } from "@/lib/career-ops/recompute";


async function fetchDashboardData(userId: string, userEmail: string | undefined) {
  // Use admin client inside unstable_cache to bypass cookies usage requirement
  // Next.js unstable_cache throws errors if dynamic functions like cookies() are called inside
  // Auth has already been verified outside unstable_cache
  const adminDb = createAdminClient();

  // Parallel fetch: Profile (with stats), Quiz Results, Career Paths, Tracker Applications
  const [profileResult, quizResultsResult, careerPathsResult, trackerResult] = await Promise.all([
    adminDb
      .from('profiles')
      .select('nickname, avatar_icon, role, created_at, xp, level, streak, elo')
      .eq('id', userId)
      .single(),
    adminDb
      .from('quiz_results')
      .select('id, category, score, total_questions, completed_at')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(500),
    adminDb
      .from('career_paths')
      .select('id, job_role, company, match_score, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10),
    adminDb
      .from('career_ops_applications')
      .select('id, job_role, company, status, match_score, next_follow_up_date, updated_at, applied_on, role_archetype, target_level, primary_blocker, blocker_tags')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(200),
  ]);

  const profile = profileResult.data;
  const quizResults = quizResultsResult.data;
  const careerPaths = careerPathsResult.data;

  let tracker = emptyCareerOpsTrackerSummary();
  let trackerInsights = emptyCareerOpsPatternInsights();
  if (trackerResult.error) {
    if (!isMissingCareerOpsTableError(trackerResult.error)) {
      logger.warn("[Dashboard] Failed to load career_ops_applications.", trackerResult.error.message);
    }
  } else {
    const trackerRows = (trackerResult.data as CareerOpsApplicationSnapshot[] | null) ?? [];
    tracker = buildCareerOpsTrackerSummary(trackerRows);
    trackerInsights = buildCareerOpsPatternInsights(trackerRows);
  }

  // Read materialised stats from profile
  const totalXP = profile?.xp ?? 0;
  const level = profile?.level ?? calculateLevel(totalXP);
  const streak = profile?.streak ?? 0;
  const elo = profile?.elo ?? 1000;
  const streakMultiplier = getStreakMultiplier(streak);

  // Segment results for analytics (avgScore, bestCategory, arena stats)
  const dailyChallenges = quizResults?.filter(r => r.category === 'daily-challenge') || [];
  const arenaMatches = quizResults?.filter(r => isArenaCategory(r.category)) || [];
  const standardQuizzes = quizResults?.filter(r => r.category !== 'daily-challenge' && !isArenaCategory(r.category)) || [];

  const totalTests = quizResults?.length || 0;

  // Avg score from standard + arena (exclude daily challenges to avoid inflation)
  const stdTotalQuestions = [...standardQuizzes, ...arenaMatches].reduce((acc, curr) => acc + curr.total_questions, 0);
  const stdCorrectData = [...standardQuizzes, ...arenaMatches].reduce((acc, curr) => acc + curr.score, 0);

  let avgScore = 0;
  if (stdTotalQuestions > 0) {
    avgScore = Math.round((stdCorrectData / stdTotalQuestions) * 100);
  } else if (dailyChallenges.length > 0) {
    const passed = dailyChallenges.filter(d => d.score >= 1).length;
    avgScore = Math.round((passed / dailyChallenges.length) * 100);
  }

  const arenaWins = arenaMatches.filter(r => r.category.includes(':win:') || (r.category.startsWith('arena_') && r.score > r.total_questions / 2)).length;
  const arenaLosses = arenaMatches.filter(r => r.category.includes(':loss:')).length;

  const totalQuestionsAnswered = stdTotalQuestions + dailyChallenges.length;

  const categoryScores: Record<string, { total: number, count: number }> = {};
  quizResults?.forEach(r => {
    let cat = r.category;
    if (isArenaCategory(cat)) {
      cat = formatArenaCategoryLabel(cat);
    }
    if (!categoryScores[cat]) categoryScores[cat] = { total: 0, count: 0 };
    categoryScores[cat].total += (r.score / Math.max(1, r.total_questions)) * 100;
    categoryScores[cat].count += 1;
  });

  let bestCategory = "None";
  let maxAvg = -1;
  Object.entries(categoryScores).forEach(([cat, data]) => {
    const avg = data.total / data.count;
    if (avg > maxAvg) {
      maxAvg = avg;
      bestCategory = cat;
    }
  });

  return {
    user: {
      id: userId,
      email: userEmail,
      profile: {
        nickname: profile?.nickname,
        avatar_icon: profile?.avatar_icon,
        role: profile?.role,
        created_at: profile?.created_at,
      }
    },
    stats: {
      totalTests,
      totalQuestions: totalQuestionsAnswered,
      avgScore,
      bestCategory,
      xp: totalXP,
      streak,
      arenaWins,
      arenaLosses,
      elo,
      level,
      streakMultiplier,
    },
    recentActivity: quizResults?.map(r => ({
      ...r,
      isArena: isArenaCategory(r.category),
      winStatus: parseArenaStatus(r.category)
    })).slice(0, 5) || [],
    careerPaths: careerPaths?.slice(0, 3) || [],
    tracker,
    trackerInsights,
  };
}

export async function getDashboardData() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      // In CI/PR builds, return safe fallback to avoid crashing SSR
      return {
        user: null,
        stats: {
          totalTests: 0,
          totalQuestions: 0,
          avgScore: 0,
          bestCategory: "N/A",
          xp: 0,
          streak: 0,
          arenaWins: 0,
          arenaLosses: 0,
          elo: 1000,
          level: 1,
          streakMultiplier: 1,
        },
        recentActivity: [],
        careerPaths: [],
        tracker: emptyCareerOpsTrackerSummary(),
        trackerInsights: emptyCareerOpsPatternInsights(),
      };
    }

    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("[Dashboard] Auth failed:", authError?.message || "No user");
      return null;
    }

    const getCachedDashboard = unstable_cache(
      async () => {
        // Rate limit inside cache miss — only burns a token when data is actually fetched
        const rl = await rateLimit("default", user.id);
        if (!rl.success) {
          throw new Error(rl.message || "Too many requests. Please wait before refreshing.");
        }
        return fetchDashboardData(user.id, user.email);
      },
      [`dashboard-${user.id}`],
      { revalidate: 60, tags: [`dashboard-${user.id}`] }
    );

    return await getCachedDashboard();
  } catch (err) {
    console.error("[Dashboard] Unexpected error:", err instanceof Error ? err.message : err);
    return null;
  }
}

/**
 * Paginated activity feed for the "Load more" feature.
 * Returns the next page of activity items.
 */
export async function getActivityPage(page: number = 1, limit: number = 5) {
  const supabase = createClient();
  const adminDb = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { items: [], hasMore: false };

  const offset = (page - 1) * limit;

  const { data: quizResults, count } = await adminDb
    .from("quiz_results")
    .select("id, category, score, total_questions, completed_at", { count: "exact" })
    .eq("user_id", user.id)
    .order("completed_at", { ascending: false })
    .range(offset, offset + limit - 1);

  const items = (quizResults || []).map((r) => ({
    ...r,
    isArena: r.category.includes("arena"),
    winStatus: r.category.includes(":win:")
      ? ("win" as const)
      : r.category.includes(":loss:")
        ? ("loss" as const)
        : r.category.includes(":tie:")
          ? ("tie" as const)
          : null,
  }));

  return {
    items,
    hasMore: (count || 0) > offset + limit,
  };
}
