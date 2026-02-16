"use client";

import { motion } from "framer-motion";
import { User, Zap, Target, Flame, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

export function ProfileHeader({ data }: { data: any }) {
  const router = useRouter();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8 backdrop-blur-xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 pointer-events-none group-hover:rotate-6 transition-transform duration-700">
        <User size={200} />
      </div>

      <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/20 ring-4 ring-gray-900 border border-blue-400/30">
         <span className="text-3xl md:text-5xl font-black text-white">
            {data.user.profile.nickname?.[0]?.toUpperCase() || data.user.email?.[0]?.toUpperCase()}
         </span>
      </div>

      <div className="flex-1 text-center md:text-left z-10">
         <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
            {data.user.profile.nickname || "Space Cadet"}
         </h1>
         <p className="text-gray-400 text-sm font-mono mb-4 flex items-center justify-center md:justify-start gap-2">
            <ShieldCheck size={14} className="text-emerald-500" />
            {data.user.email}
         </p>

         <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            <div className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2">
               <Zap size={12} /> Level {Math.floor(data.stats.xp / 100) + 1}
            </div>
            <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2">
               <Target size={12} /> {data.stats.xp} XP
            </div>
            <div className="px-3 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2">
               <Flame size={12} /> {data.stats.streak} Day Streak
            </div>
         </div>
      </div>

      <div className="w-full md:w-auto flex flex-col gap-3 z-10">
         <button 
            onClick={() => router.push("/")}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-blue-600/20"
         >
            Start Practice
         </button>
      </div>
    </motion.div>
  );
}
