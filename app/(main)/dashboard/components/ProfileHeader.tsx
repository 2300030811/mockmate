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
         initial={prefersReduced ? false : { opacity: 0, y: 15 }}
         animate={{ opacity: 1, y: 0 }}
         className="bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] rounded-xl p-6 sm:p-7 shadow-subtle flex flex-col md:flex-row items-center gap-6 sm:gap-8 relative overflow-hidden group transition-colors"
      >
         <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 bg-[#5e6ad2]/10 rounded-full blur-3xl opacity-60" />

         <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-[#5e6ad2]/10 border border-[#5e6ad2]/30 flex items-center justify-center text-[#5e6ad2] dark:text-[#7f8cf8] shrink-0 shadow-subtle relative z-10">
            <AvatarIcon className="w-10 h-10 md:w-12 md:h-12" />
         </div>

         <div className="flex-1 text-center md:text-left z-10 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-[#ebebef] mb-1">
               {data.user.profile.nickname || "Space Cadet"}
            </h1>
            <p className="text-xs font-mono text-zinc-500 dark:text-[#8b8b9e] mb-3 flex items-center justify-center md:justify-start gap-1.5">
               <ShieldCheck size={13} className="text-emerald-500" />
               {data.user.email}
            </p>

            <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-3.5">
               <div className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 rounded-md text-xs font-mono font-medium flex items-center gap-1.5">
                  <Zap size={12} /> Level {level}
               </div>
               <div className="px-2.5 py-1 bg-[#5e6ad2]/10 border border-[#5e6ad2]/25 text-[#5e6ad2] dark:text-[#828df8] rounded-md text-xs font-mono font-medium flex items-center gap-1.5">
                  <Target size={12} /> {data.stats.xp} XP
               </div>
               <div className="px-2.5 py-1 bg-orange-500/10 border border-orange-500/25 text-orange-600 dark:text-orange-400 rounded-md text-xs font-mono font-medium flex items-center gap-1.5">
                  <Flame size={12} /> {data.stats.streak} Day Streak
               </div>
               {streakMultiplier > 1 && (
                  <div className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 rounded-md text-xs font-mono font-medium flex items-center gap-1.5">
                     <TrendingUp size={12} /> {streakMultiplier}x XP
                  </div>
               )}
            </div>

            {/* XP Progress Bar */}
            <div className="w-full max-w-sm mx-auto md:mx-0">
               <div className="flex justify-between text-[11px] font-mono text-zinc-500 dark:text-[#8b8b9e] mb-1.5">
                  <span>Level {level}</span>
                  <span className="tabular-nums">{progress} / {XP_CONFIG.XP_PER_LEVEL} XP</span>
               </div>
               <div className="h-1.5 bg-zinc-100 dark:bg-[#1e1e2a] rounded-full overflow-hidden">
                  <div
                     className="h-full bg-[#5e6ad2] rounded-full transition-all duration-500"
                     style={{ width: `${progressPercent}%` }}
                  />
               </div>
            </div>
         </div>

         <div className="w-full md:w-auto flex flex-col gap-2.5 z-10 shrink-0">
            <button
               onClick={() => router.push("/certification")}
               className="px-5 py-2 bg-[#5e6ad2] hover:bg-[#4f59b8] text-white rounded-lg font-semibold text-xs transition-colors shadow-subtle flex items-center justify-center gap-2 cursor-pointer"
            >
               Start Practice
            </button>

            <button
               onClick={toggleAudio}
               aria-label={`Sound Effects: ${isAudioEnabled ? "Enabled" : "Disabled"}`}
               title="Toggle quiz and interface sound effects"
               className={`px-4 py-2 border rounded-lg font-medium text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                  isAudioEnabled
                     ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
                     : "bg-zinc-50 dark:bg-[#181824] border-zinc-200 dark:border-[#1e1e2a] text-zinc-500 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-[#ebebef]"
               }`}
            >
               {isAudioEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
               Sound FX: {isAudioEnabled ? "ON" : "OFF"}
            </button>
         </div>
      </m.div>
   );
});
