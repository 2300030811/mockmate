"use client";

import React from "react";
import { m } from "framer-motion";
import {
   User,
   Zap,
   Target,
   Flame,
   ShieldCheck,
   Volume2,
   VolumeX,
   TrendingUp
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getAvatarIcon } from "@/lib/icons";
import { useAudio } from "@/components/providers/AudioProvider";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { DashboardData } from "@/types/dashboard";
import { calculateLevel, xpProgressInLevel, XP_CONFIG } from "@/lib/scoring";

export const ProfileHeader = React.memo(function ProfileHeader({ data }: { data: DashboardData }) {
   const router = useRouter();
   const { isAudioEnabled, toggleAudio } = useAudio();
   const prefersReduced = useReducedMotion();
   const avatarIconName = data.user.profile.avatar_icon || "User";
   const AvatarIcon = getAvatarIcon(avatarIconName);

   const level = data.stats.level ?? calculateLevel(data.stats.xp);
   const progress = xpProgressInLevel(data.stats.xp);
   const progressPercent = Math.round((progress / XP_CONFIG.XP_PER_LEVEL) * 100);
   const streakMultiplier = data.stats.streakMultiplier ?? 1;

   return (
      <m.div
         initial={prefersReduced ? false : { opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         className="bg-white/70 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 backdrop-blur-xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group shadow-lg dark:shadow-none transition-colors duration-300"
      >
         <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 pointer-events-none group-hover:rotate-6 transition-transform duration-700">
            <AvatarIcon size={200} />
         </div>

         <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/20 ring-4 ring-white dark:ring-gray-900 border border-blue-400/30">
            <AvatarIcon className="w-12 h-12 md:w-16 md:h-16 text-white" />
         </div>

         <div className="flex-1 text-center md:text-left z-10">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-2">
               {data.user.profile.nickname || "Space Cadet"}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-mono mb-4 flex items-center justify-center md:justify-start gap-2">
               <ShieldCheck size={14} className="text-emerald-500" />
               {data.user.email}
            </p>

            <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-3">
               <div className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                  <Zap size={12} /> Level {level}
               </div>
               <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                  <Target size={12} /> {data.stats.xp} XP
               </div>
               <div className="px-3 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                  <Flame size={12} /> {data.stats.streak} Day Streak
               </div>
               {streakMultiplier > 1 && (
                  <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 animate-pulse">
                     <TrendingUp size={12} /> {streakMultiplier}x XP
                  </div>
               )}
            </div>

            {/* XP Progress Bar */}
            <div className="w-full max-w-xs mx-auto md:mx-0">
               <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                  <span>Level {level}</span>
                  <span>{progress}/{XP_CONFIG.XP_PER_LEVEL} XP</span>
               </div>
               <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                     className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                     style={{ width: `${progressPercent}%` }}
                  />
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

            <button
               onClick={toggleAudio}
               className={`px-6 py-2 border rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${isAudioEnabled
                  ? 'bg-orange-500/10 border-orange-500/50 text-orange-400 hover:bg-orange-500/20'
                  : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
            >
               {isAudioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
               Audio: {isAudioEnabled ? "ON" : "OFF"}
            </button>
         </div>
      </m.div>
   );
});
