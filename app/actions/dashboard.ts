"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { unstable_cache } from "next/cache";
import { rateLimit } from "@/lib/rate-limit";
import { getStreakMultiplier, calculateLevel } from "@/lib/scoring";

async function fetchDashboardData(userId: string, userEmail: string | undefined) {
  const supabase = createClient();

  // adminDb may throw if SUPABASE_SERVICE_ROLE_KEY is missing — fall back to anon client
  let adminDb;
  try {
    adminDb = createAdminClient();
  } catch (err) {
    console.warn("[Dashboard] Admin client unavailable, falling back to anon client:", err instanceof Error ? err.message : err);
    adminDb = supabase;
  }

  // Parallel fetch: Profile (with stats), Quiz Results, Career Paths
  const [profileResult, quizResultsResult, careerPathsResult] = await Promise.all([
    supabase
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
    supabase
      .from('career_paths')
      .select('id, job_role, company, match_score, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  const profile = profileResult.data;
  const quizResults = quizResultsResult.data;
  const careerPaths = careerPathsResult.data;

  // Read materialised stats from profile
  const totalXP = profile?.xp ?? 0;
  const level = profile?.level ?? calculateLevel(totalXP);
  const streak = profile?.streak ?? 0;
  const elo = profile?.elo ?? 1000;
  const streakMultiplier = getStreakMultiplier(streak);

  // Segment results for analytics (avgScore, bestCategory, arena stats)
  const dailyChallenges = quizResults?.filter(r => r.category === 'daily-challenge') || [];
  const arenaMatches = quizResults?.filter(r => r.category.includes('arena')) || [];
  const standardQuizzes = quizResults?.filter(r => r.category !== 'daily-challenge' && !r.category.includes('arena')) || [];

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
    if (cat.includes('arena')) {
       cat = cat.replace(/^arena:[^:]+:/, 'arena_').replace(/^arena_/, 'Arena: ');
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
      isArena: r.category.includes('arena'),
      winStatus: r.category.includes(':win:') ? 'win' as const : r.category.includes(':loss:') ? 'loss' as const : r.category.includes(':tie:') ? 'tie' as const : null
    })).slice(0, 5) || [],
    careerPaths: careerPaths?.slice(0, 3) || []
  };
}

/**
 * Public server action that checks auth and returns cached dashboard data.
 * Cache is per-user with a 60-second TTL and tagged for on-demand revalidation.
 */
export async function getDashboardData() {
  try {
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

    return getCachedDashboard();
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
