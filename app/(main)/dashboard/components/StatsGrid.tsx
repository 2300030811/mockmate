"use client";

import { m } from "framer-motion";
import { Activity, Target, Flame, Trophy, Swords, TrendingUp } from "lucide-react";
import { memo } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { DashboardStats } from "@/types/dashboard";

export const StatsGrid = memo(function StatsGrid({ stats }: { stats: DashboardStats }) {
  const statItems = [
    { label: "Total Quizzes", value: stats.totalTests || 0, icon: Activity, iconColor: "text-[#5e6ad2]", subtext: "Simulations taken" },
    { label: "Arena Wins", value: stats.arenaWins || 0, icon: Swords, iconColor: "text-rose-500", subtext: "Combat victories" },
    { label: "Avg. Accuracy", value: `${stats.avgScore || 0}%`, icon: Target, iconColor: "text-emerald-500", subtext: "Passing threshold" },
    { label: "Day Streak", value: `${stats.streak || 0}d${(stats.streakMultiplier ?? 1) > 1 ? ` (${stats.streakMultiplier}x)` : ''}`, icon: Flame, iconColor: "text-amber-500", subtext: "Daily cadence" },
    { label: "Elo Rating", value: stats.elo ?? 1000, icon: TrendingUp, iconColor: "text-[#5e6ad2]", subtext: "Skill rating" },
    { 
      label: "Best Track", 
      value: stats.bestCategory 
        ? stats.bestCategory.replace(/^arena_/, '').replace(/[-_]/g, ' ').toUpperCase() 
        : "GENERAL", 
      icon: Trophy, 
      iconColor: "text-amber-400", 
      subtext: "Top specialty" 
    },
  ];

  const prefersReduced = useReducedMotion();

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {statItems.map((stat, i) => {
        const valStr = String(stat.value);
        const isLong = valStr.length > 9;
        return (
          <m.div
             key={i}
             initial={prefersReduced ? false : { opacity: 0, y: 15 }}
             animate={{ opacity: 1, y: 0 }}
             transition={prefersReduced ? { duration: 0 } : { delay: i * 0.05 }}
             className="rounded-xl border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] hover:border-zinc-300 dark:hover:border-[#2a2a3e] p-4 flex flex-col justify-between shadow-subtle transition-all"
          >
             <div className="text-[10px] font-mono text-zinc-500 dark:text-[#8b8b9e] font-medium uppercase tracking-[0.06em] flex items-center justify-between">
                <span className="truncate pr-1">{stat.label}</span>
                <stat.icon className={`w-3.5 h-3.5 ${stat.iconColor} shrink-0`} />
             </div>
             <div 
               className={`mt-2 font-bold font-mono tracking-tight text-zinc-900 dark:text-[#ebebef] tabular-nums truncate ${
                 isLong ? "text-base sm:text-lg leading-tight" : "text-2xl"
               }`}
               title={valStr}
             >
                {stat.value}
             </div>
             <span className="text-[10px] font-mono text-zinc-400 dark:text-[#5a5a6e] mt-1.5 truncate">
                {stat.subtext}
             </span>
          </m.div>
        );
      })}
    </div>
  );
});
