"use client";

import { useState, useEffect } from "react";
import { m } from "framer-motion";
import { Code2, ChevronRight, Zap, Target, Flame, CheckCircle2, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useStreak } from "@/hooks/useStreak";
import { DAILY_PROBLEMS } from "@/utils/daily-problems";

export function DailyProblem() {
  const { streak, solvedToday, isLoaded, streakMultiplier } = useStreak();
  const [problem, setProblem] = useState(DAILY_PROBLEMS[0]);

  // Mock rotating problem based on day
  useEffect(() => {
    const day = new Date().getDate();
    setProblem(DAILY_PROBLEMS[day % DAILY_PROBLEMS.length]);
  }, []);

  if (!isLoaded || !problem) return null; // Prevent hydration mismatch or flash if data missing

  return (
    <m.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative group mt-12 overflow-hidden rounded-[2rem] border border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/40 backdrop-blur-md p-8 md:p-10 shadow-xl dark:shadow-none"
    >
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 dark:bg-blue-600/10 blur-[80px] -mr-32 -mt-32 rounded-full group-hover:bg-blue-500/20 dark:group-hover:bg-blue-600/20 transition-all duration-500" />
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
        <div className="flex-1 text-left">
          <div className="flex items-center gap-3 mb-4">
            <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-widest">
              Daily Challenge
            </div>
            {/* Streak & Points Indicator */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-amber-500 dark:text-amber-400 text-xs font-bold" title="Points for this problem">
                  <Zap size={14} className="fill-current" />
                  {problem.points} PTS
                </div>
                {streak > 0 && (
                    <div className="flex items-center gap-1 text-orange-500 dark:text-orange-400 text-xs font-bold animate-pulse" title="Current Daily Streak">
                    <Flame size={14} className="fill-current" />
                    {streak} Day Streak
                    </div>
                )}
                {streakMultiplier > 1 && (
                    <div className="flex items-center gap-1 text-emerald-500 dark:text-emerald-400 text-xs font-bold" title="Streak XP Multiplier">
                    <TrendingUp size={14} />
                    {streakMultiplier}x XP
                    </div>
                )}
            </div>
          </div>
          
          <h2 className="text-3xl font-black mb-3 text-gray-900 dark:text-white">
            {problem.title}
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-lg leading-relaxed">
            {solvedToday 
              ? "Great job! You've solved today's challenge. Come back tomorrow to keep your streak alive!" 
              : "Sharpen your skills with today's coding puzzle. Solve it to maintain your streak and climb the leaderboard."
            }
          </p>
          
          <div className="flex flex-wrap gap-3">
             <span className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 text-xs font-medium border border-gray-200 dark:border-gray-700">
               {problem.category}
             </span>
             <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${
               problem.difficulty === 'Easy' ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20' : 
               problem.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' : 
               'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
             }`}>
               {problem.difficulty}
             </span>
          </div>
        </div>

        <div className="shrink-0 w-full md:w-auto">
          <Link 
            href="/daily-challenge" 
            className={`flex items-center justify-center gap-3 px-10 py-5 rounded-2xl font-black text-lg transition-all hover:scale-105 active:scale-95 shadow-xl group/btn ${
                solvedToday 
                ? "bg-green-600 dark:bg-green-500 text-white shadow-green-600/20" 
                : "bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-gray-200 shadow-gray-900/10 dark:shadow-white/5"
            }`}
          >
            {solvedToday ? "Solved!" : "Solve Now"}
            {solvedToday ? <CheckCircle2 size={20} /> : <ChevronRight className="group-hover/btn:translate-x-1 transition-transform" />}
          </Link>
          <p className="text-center md:text-right mt-3 text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-widest">
            {solvedToday ? "Keep it up!" : "Challenge yourself with today's problem"}
          </p>
        </div>
      </div>
      
      {/* Visual Element */}
      <div className="absolute right-10 bottom-10 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
        <Code2 size={120} className="text-gray-900 dark:text-white" />
      </div>
    </m.div>
  );
}
