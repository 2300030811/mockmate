"use client";

import { motion } from "framer-motion";
import { Activity, Target, Flame, Trophy, Swords } from "lucide-react";
import { memo } from "react";
import { DashboardStats } from "@/types/dashboard";

export const StatsGrid = memo(function StatsGrid({ stats }: { stats: DashboardStats }) {
  const statItems = [
    { label: "Total Quizzes", value: stats.totalTests, icon: Activity, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { label: "Arena Wins", value: stats.arenaWins || 0, icon: Swords, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
    { label: "Avg. Accuracy", value: `${stats.avgScore}%`, icon: Target, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
    { label: "Day Streak", value: stats.streak, icon: Flame, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
    { label: "Best Track", value: stats.bestCategory, icon: Trophy, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {statItems.map((stat, i) => (
        <motion.div
           key={i}
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: i * 0.1 }}
           className={`p-6 rounded-2xl border ${stat.border} ${stat.bg} backdrop-blur-md flex flex-col items-center text-center gap-2 group hover:scale-105 transition-transform duration-300`}
        >
           <stat.icon className={`w-8 h-8 ${stat.color} mb-2`} />
           <span className="text-2xl font-black text-white">{stat.value}</span>
           <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{stat.label}</span>
        </motion.div>
      ))}
    </div>
  );
});
