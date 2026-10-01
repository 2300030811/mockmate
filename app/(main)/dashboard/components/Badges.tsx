"use client";

import { m } from "framer-motion";
import { Award, Star, Trophy, Target, Flame, Swords, Zap, Play, Medal, Crown, Crosshair } from "lucide-react";
import { memo, useMemo } from "react";
import { DashboardStats } from "@/types/dashboard";
import { BADGE_DEFINITIONS } from "@/lib/badges";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/** Map icon name strings to Lucide components */
const ICON_MAP: Record<string, React.ElementType> = {
  Star, Trophy, Target, Flame, Swords, Zap, Play, Medal, Crown, Crosshair, Award,
};

export const Badges = memo(function Badges({ stats }: { stats: DashboardStats }) {
  const badges = useMemo(() => BADGE_DEFINITIONS.map(def => ({
    ...def,
    unlocked: def.check(stats),
  })), [stats]);

  const unlockedCount = useMemo(() => badges.filter(b => b.unlocked).length, [badges]);
  const prefersReduced = useReducedMotion();

  return (
    <m.div 
      initial={prefersReduced ? false : { opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={prefersReduced ? { duration: 0 } : { delay: 0.15 }}
      className="rounded-xl border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] p-5 sm:p-6 shadow-subtle transition-colors"
    >
       <div className="flex items-center justify-between border-b border-zinc-200 dark:border-[#1e1e2a] pb-2 mb-4">
         <div className="flex items-center gap-2">
           <span className="w-1.5 h-1.5 rounded-full bg-[#5e6ad2]" />
           <h2 className="text-xs font-mono font-semibold uppercase tracking-[0.08em] text-zinc-500 dark:text-[#8b8b9e]">
             Achievements
           </h2>
         </div>
         <span className="text-[11px] font-mono text-zinc-400 dark:text-[#5a5a6e]">
           {unlockedCount}/{badges.length} unlocked
         </span>
       </div>
       <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5" role="list" aria-label="Achievement badges">
          {badges.map((badge) => {
             const IconComp = ICON_MAP[badge.icon] || Star;
             return (
               <div
                 key={badge.id}
                 role="listitem"
                 className="group relative flex flex-col items-center"
                 aria-label={`${badge.name} badge - ${badge.unlocked ? 'Unlocked' : 'Locked'}: ${badge.desc}`}
               >
                  <div className={`w-11 h-11 rounded-lg flex items-center justify-center text-base transition-all ${
                     badge.unlocked 
                       ? 'bg-zinc-50 dark:bg-[#181824] text-zinc-900 dark:text-[#ebebef] border border-zinc-200 dark:border-[#2a2a3a] shadow-subtle hover:border-[#5e6ad2]' 
                       : 'bg-zinc-100/50 dark:bg-[#101018] text-zinc-300 dark:text-[#3a3a4c] border border-zinc-200/50 dark:border-[#181822] opacity-40'
                  }`}>
                     <IconComp className={`w-4 h-4 ${badge.unlocked ? badge.color : ''}`} />
                  </div>
                  {/* Tooltip */}
                  <div
                    role="tooltip"
                    className="absolute top-full mt-2 w-36 p-2 bg-white dark:bg-[#181824] border border-zinc-200 dark:border-[#2a2a3a] rounded-lg text-center hidden group-hover:block z-30 shadow-subtle"
                  >
                     <p className="text-xs font-semibold text-zinc-900 dark:text-[#ebebef] mb-0.5">{badge.name}</p>
                     <p className="text-[10px] font-mono text-zinc-400 dark:text-[#8b8b9e] leading-tight">{badge.desc}</p>
                  </div>
               </div>
             );
          })}
       </div>
    </m.div>
  );
});
