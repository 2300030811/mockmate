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
      initial={prefersReduced ? false : { opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={prefersReduced ? { duration: 0 } : { delay: 0.3 }}
      className="bg-white/70 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 backdrop-blur-md shadow-lg dark:shadow-none transition-colors duration-300"
    >
       <div className="flex items-center justify-between mb-6">
         <h2 className="text-sm font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <Award size={16} /> Badges
         </h2>
         <span className="text-xs font-bold text-gray-400 dark:text-gray-500">
           {unlockedCount}/{badges.length} unlocked
         </span>
       </div>
       <div className="grid grid-cols-4 sm:grid-cols-5 gap-2" role="list" aria-label="Achievement badges">
          {badges.map((badge) => {
             const IconComp = ICON_MAP[badge.icon] || Star;
             return (
               <div
                 key={badge.id}
                 role="listitem"
                 className="group relative flex flex-col items-center"
                 aria-label={`${badge.name} badge - ${badge.unlocked ? 'Unlocked' : 'Locked'}: ${badge.desc}`}
               >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg transition-all ${
                     badge.unlocked 
                       ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white shadow-lg shadow-black/5 dark:shadow-white/5 border border-gray-200 dark:border-gray-700' 
                       : 'bg-gray-50 dark:bg-gray-900 text-gray-300 dark:text-gray-700 border border-gray-200 dark:border-gray-800 grayscale opacity-50'
                  }`}>
                     <IconComp className={`w-5 h-5 ${badge.unlocked ? badge.color : ''}`} />
                  </div>
                  {/* Tooltip */}
                  <div
                    role="tooltip"
                    className="absolute top-full mt-2 w-32 p-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg text-center hidden group-hover:block z-20 shadow-lg"
                  >
                     <p className="text-xs font-bold text-gray-900 dark:text-white mb-1">{badge.name}</p>
                     <p className="text-[10px] text-gray-500">{badge.desc}</p>
                  </div>
               </div>
             );
          })}
       </div>
    </m.div>
  );
});
