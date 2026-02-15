"use server";

import { createClient } from "@/utils/supabase/server";

export async function getDashboardData() {
  const supabase = createClient();
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

  // 2. Fetch Quiz Results
  const { data: quizResults } = await supabase
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
  const totalTests = quizResults?.length || 0;
  const totalQuestionsAnswered = quizResults?.reduce((acc, curr) => acc + curr.total_questions, 0) || 0;
  const correctAnswers = quizResults?.reduce((acc, curr) => acc + curr.score, 0) || 0;
  const avgScore = totalTests > 0 ? Math.round((correctAnswers / totalQuestionsAnswered) * 100) : 0;
  
  // Best Category
  const categoryScores: Record<string, { total: number, count: number }> = {};
  quizResults?.forEach(r => {
    if (!categoryScores[r.category]) categoryScores[r.category] = { total: 0, count: 0 };
    categoryScores[r.category].total += (r.score / r.total_questions) * 100;
    categoryScores[r.category].count += 1;
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
      ...user,
      profile: profile || {}
    },
    stats: {
      totalTests,
      totalQuestions: totalQuestionsAnswered,
      avgScore,
      bestCategory,
      xp: correctAnswers * 10 + totalTests * 50 // Mock XP calculation
    },
    recentActivity: quizResults?.slice(0, 5) || [],
    careerPaths: careerPaths?.slice(0, 3) || []
  };
}
