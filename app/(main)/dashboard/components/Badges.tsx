"use client";

import { motion } from "framer-motion";
import { Award, Star, Trophy, Target, Flame } from "lucide-react";

export function Badges({ stats }: { stats: any }) {
  const badges = [
    { id: 1, name: "Early Adopter", icon: <Star className="text-yellow-400" />, unlocked: true, desc: "Joined the platform early." },
    { id: 2, name: "Quiz Master", icon: <Trophy className="text-blue-400" />, unlocked: (stats.totalTests || 0) >= 5, desc: "Completed 5+ quizzes." },
    { id: 3, name: "Perfectionist", icon: <Target className="text-red-400" />, unlocked: (stats.avgScore || 0) >= 90, desc: "Maintained 90%+ accuracy." },
    { id: 4, name: "Streak Keeper", icon: <Flame className="text-orange-400" />, unlocked: (stats.streak || 0) >= 3, desc: "3+ Day Streak." },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6 backdrop-blur-md"
    >
       <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
          <Award size={16} /> Earned Badges
       </h2>
       <div className="grid grid-cols-4 gap-2">
          {badges.map((badge, i) => (
             <div key={i} className="group relative flex flex-col items-center">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg transition-all ${
                   badge.unlocked 
                     ? 'bg-gray-800 text-white shadow-lg shadow-white/5 border border-gray-700' 
                     : 'bg-gray-900 text-gray-700 border border-gray-800 grayscale opacity-50'
                }`}>
                   {badge.icon}
                </div>
                {/* Tooltip */}
                <div className="absolute top-full mt-2 w-32 p-2 bg-black border border-gray-800 rounded-lg text-center hidden group-hover:block z-20">
                   <p className="text-xs font-bold text-white mb-1">{badge.name}</p>
                   <p className="text-[10px] text-gray-500">{badge.desc}</p>
                </div>
             </div>
          ))}
       </div>
    </motion.div>
  );
}
