"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";


export async function getDashboardData() {
  const supabase = createClient();
  const adminDb = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // 1. Fetch Profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // 2. Fetch Quiz Results (Using Admin Client to ensure visibility)
  const { data: quizResults } = await adminDb
    .from('quiz_results')
    .select('*')
    .eq('user_id', user.id)
    .order('completed_at', { ascending: false });

  // 3. Fetch Career Paths
  const { data: careerPaths } = await supabase
    .from('career_paths')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // 4. Calculate Stats
  const dailyChallenges = quizResults?.filter(r => r.category === 'daily-challenge') || [];
  const arenaMatches = quizResults?.filter(r => r.category.includes('arena')) || [];
  const standardQuizzes = quizResults?.filter(r => r.category !== 'daily-challenge' && !r.category.includes('arena')) || [];

  const totalTests = quizResults?.length || 0;
  
  const stdTotalQuestions = [...standardQuizzes, ...arenaMatches].reduce((acc, curr) => acc + curr.total_questions, 0);
  const stdCorrectData = [...standardQuizzes, ...arenaMatches].reduce((acc, curr) => acc + curr.score, 0);
  
  let avgScore = 0;
  if (stdTotalQuestions > 0) {
      avgScore = Math.round((stdCorrectData / stdTotalQuestions) * 100);
  } else if (dailyChallenges.length > 0) {
      const passed = dailyChallenges.filter(d => d.score >= 1).length;
      avgScore = Math.round((passed / dailyChallenges.length) * 100);
  }

  // XP Calculation
  const stdXP = (standardQuizzes.reduce((acc, curr) => acc + curr.score, 0) * 10) + (standardQuizzes.length * 50);
  
  const arenaWins = arenaMatches.filter(r => r.category.includes(':win:') || (r.category.startsWith('arena_') && r.score > r.total_questions / 2)).length;
  const arenaLosses = arenaMatches.filter(r => r.category.includes(':loss:')).length;
  const arenaTies = arenaMatches.filter(r => r.category.includes(':tie:')).length;
  
  const arenaXP = (arenaMatches.reduce((acc, curr) => acc + curr.score, 0) * 15) + (arenaWins * 100) + ((arenaLosses + arenaTies) * 50);
  const dailyPoints = dailyChallenges.reduce((acc, curr) => acc + (curr.score || 0), 0);
  const dailyXP = dailyPoints + (dailyChallenges.length * 10); 

  const totalXP = stdXP + arenaXP + dailyXP;
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

  // 5. Calculate Streak
  let streak = 0;
  if (dailyChallenges.length > 0) {
      const today = new Date();
      today.setHours(0,0,0,0);
      const uniqueDays = Array.from(new Set(dailyChallenges.map(r => {
          const d = new Date(r.completed_at);
          d.setHours(0,0,0,0);
          return d.getTime();
      }))).sort((a, b) => b - a);

      if (uniqueDays.length > 0) {
          const mostRecent = uniqueDays[0];
          const diffDays = (today.getTime() - mostRecent) / (1000 * 3600 * 24);
          if (diffDays <= 1) {
              streak = 1;
              for (let i = 0; i < uniqueDays.length - 1; i++) {
                  if ((uniqueDays[i] - uniqueDays[i+1]) / (1000 * 3600 * 24) === 1) streak++;
                  else break;
              }
          }
      }
  }

  return {
    user: {
      ...user,
      profile: profile || {}
    },
    stats: {
      totalTests,
      totalQuestions: totalQuestionsAnswered,
      avgScore,
      bestCategory,
      xp: totalXP, 
      streak,
      arenaWins,
      arenaLosses
    },
    recentActivity: quizResults?.map(r => ({
      ...r,
      isArena: r.category.includes('arena'),
      winStatus: r.category.includes(':win:') ? 'win' : r.category.includes(':loss:') ? 'loss' : r.category.includes(':tie:') ? 'tie' : null
    })).slice(0, 5) || [],
    careerPaths: careerPaths?.slice(0, 3) || []
  };
}
