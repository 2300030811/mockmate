"use client";

import { m } from "framer-motion";
import { TrendingUp, Calendar, ChevronDown, Loader2 } from "lucide-react";
import { memo, useState, useCallback, useEffect } from "react";
import { ActivityItem } from "@/types/dashboard";
import { calculateActivityXP } from "@/lib/scoring";
import { getActivityPage } from "@/app/actions/dashboard";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ClientDate } from "@/components/ui/ClientDate";

/** Group activity items by relative date label */
function groupByDate(items: ActivityItem[]): Record<string, ActivityItem[]> {
  const groups: Record<string, ActivityItem[]> = {};
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  for (const item of items) {
    const d = new Date(item.completed_at);
    let label: string;
    if (d >= today) label = "Today";
    else if (d >= yesterday) label = "Yesterday";
    else if (d >= weekAgo) label = "This Week";
    else label = "Earlier";

    if (!groups[label]) groups[label] = [];
    groups[label].push(item);
  }
  return groups;
}

export const RecentActivity = memo(function RecentActivity({ activity }: { activity: ActivityItem[] }) {
  const [items, setItems] = useState<ActivityItem[]>(activity);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(activity.length >= 5);

  const loadMore = useCallback(async () => {
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const result = await getActivityPage(nextPage);
      setItems(prev => [...prev, ...result.items]);
      setPage(nextPage);
      setHasMore(result.hasMore);
    } catch (err) {
      console.error("Failed to load more activity", err);
    } finally {
      setLoadingMore(false);
    }
  }, [page]);

  const grouped = groupByDate(items);
  const groupOrder = ["Today", "Yesterday", "This Week", "Earlier"];
  const prefersReduced = useReducedMotion();

  return (
    <m.div 
      initial={prefersReduced ? false : { opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={prefersReduced ? { duration: 0 } : { delay: 0.1 }}
      className="space-y-4"
    >
       <div className="flex items-center justify-between border-b border-zinc-200 dark:border-[#1e1e2a] pb-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5e6ad2]" />
            <h2 className="text-xs font-mono font-semibold uppercase tracking-[0.08em] text-zinc-500 dark:text-[#8b8b9e]">
              Recent Activity Log
            </h2>
          </div>
          <span className="text-[11px] font-mono text-zinc-400 dark:text-[#5a5a6e]">
            {items.length} records
          </span>
       </div>
       
       <div className="rounded-xl border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] p-4 sm:p-5 shadow-subtle space-y-4" role="list" aria-label="Recent quiz activity">
          {items.length > 0 ? (
             <>
               {groupOrder.map(label => {
                 const group = grouped[label];
                 if (!group || group.length === 0) return null;
                 return (
                   <div key={label} className="space-y-2">
                     <h3 className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-400 dark:text-[#5a5a6e] px-1">{label}</h3>
                     {group.map((act) => {
                       const isArena = act.isArena;
                       const status = act.winStatus;
                       const displayCategory = act.category.replace(/^arena:(win|loss|tie):/, '').replace(/^arena_/, '').toUpperCase();
                       const name = isArena ? `Arena: ${displayCategory}` : `${act.category} Simulation`;

                       return (
                         <div
                           key={act.id ?? `${act.category}-${act.completed_at}`}
                           role="listitem"
                           aria-label={`${name} - Score: ${act.score}, ${calculateActivityXP(act.score, act.total_questions, isArena ?? false, status ?? null)} XP`}
                           className={`rounded-lg border ${
                             isArena 
                               ? (status === 'win' ? 'border-emerald-500/30' : 'border-rose-500/30') 
                               : 'border-zinc-200/80 dark:border-[#1a1a26]'
                           } bg-zinc-50/60 dark:bg-[#101018] hover:border-zinc-300 dark:hover:border-[#28283c] p-3.5 flex items-center justify-between transition-colors`}
                         >
                           <div className="flex items-center gap-3.5 min-w-0">
                             <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 border ${
                               isArena
                                 ? (status === 'win' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-rose-500/10 border-rose-500/30 text-rose-500')
                                 : 'bg-white dark:bg-[#161622] border-zinc-200 dark:border-[#20202e] text-zinc-800 dark:text-[#ebebef]'
                             }`}>
                               {act.score}
                             </div>
                             <div className="min-w-0">
                               <p className="text-sm font-semibold text-zinc-900 dark:text-[#ebebef] capitalize flex items-center gap-2 truncate">
                                 <span className="truncate">{name}</span>
                                 {isArena && status && (
                                   <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase shrink-0 ${
                                     status === 'win' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' :
                                     status === 'loss' ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                                   }`}>
                                     {status}
                                   </span>
                                 )}
                               </p>
                               <p className="text-xs font-mono text-zinc-400 dark:text-[#5a5a6e]"><ClientDate date={act.completed_at} /></p>
                             </div>
                           </div>
                           <div className="text-right shrink-0 pl-3">
                             <p className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
                               +{calculateActivityXP(act.score, act.total_questions, isArena ?? false, status ?? null)} XP
                             </p>
                             <p className="text-[10px] font-mono text-zinc-400 dark:text-[#5a5a6e] uppercase">
                               {isArena ? 'Combat Log' : 'Completed'}
                             </p>
                           </div>
                         </div>
                       );
                     })}
                   </div>
                 );
               })}

               {hasMore && (
                 <button
                   onClick={loadMore}
                   disabled={loadingMore}
                   className="w-full py-2.5 text-xs font-mono font-semibold text-zinc-600 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-white bg-zinc-50 dark:bg-[#14141e] hover:bg-zinc-100 dark:hover:bg-[#1a1a26] border border-zinc-200 dark:border-[#1e1e2a] rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                   aria-label="Load more activity items"
                 >
                   {loadingMore ? (
                     <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading...</>
                   ) : (
                     <><ChevronDown className="w-3.5 h-3.5" /> Load More Activity</>
                   )}
                 </button>
               )}
             </>
          ) : (
             <div className="border border-dashed border-zinc-200 dark:border-[#1e1e2a] p-8 rounded-lg text-center text-zinc-400 dark:text-[#5a5a6e]">
                <TrendingUp className="mx-auto mb-2 opacity-40 w-5 h-5" />
                <p className="text-xs font-mono">No recent activity found. Start a quiz!</p>
             </div>
          )}
       </div>
    </m.div>
  );
});
