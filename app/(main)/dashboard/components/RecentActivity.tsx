"use client";

import { m } from "framer-motion";
import { TrendingUp, Calendar, ChevronDown, Loader2 } from "lucide-react";
import { memo, useState, useCallback } from "react";
import { ActivityItem } from "@/types/dashboard";
import { calculateActivityXP } from "@/lib/scoring";
import { getActivityPage } from "@/app/actions/dashboard";
import { useReducedMotion } from "@/hooks/useReducedMotion";

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
      initial={prefersReduced ? false : { opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={prefersReduced ? { duration: 0 } : { delay: 0.2 }}
      className="lg:col-span-2 space-y-6"
    >
       <h2 className="text-xl font-bold flex items-center gap-2">
          <Calendar className="text-blue-500" /> Recent Activity
       </h2>
       
       <div className="space-y-5" role="list" aria-label="Recent quiz activity">
          {items.length > 0 ? (
             <>
               {groupOrder.map(label => {
                 const group = grouped[label];
                 if (!group || group.length === 0) return null;
                 return (
                   <div key={label} className="space-y-2">
                     <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 px-1">{label}</h3>
                     {group.map((act) => {
                       const isArena = act.isArena;
                       const status = act.winStatus;
                       const displayCategory = act.category.replace(/^arena:(win|loss|tie):/, '').replace(/^arena_/, '').toUpperCase();
                       const name = isArena ? `Arena: ${displayCategory}` : `${act.category} Quiz`;

                       return (
                         <div
                           key={act.id ?? `${act.category}-${act.completed_at}`}
                           role="listitem"
                           aria-label={`${name} - Score: ${act.score}, ${calculateActivityXP(act.score, act.total_questions, isArena ?? false, status ?? null)} XP`}
                           className={`bg-white/70 dark:bg-gray-900/50 border ${isArena ? (status === 'win' ? 'border-emerald-500/30' : 'border-red-500/30') : 'border-gray-200 dark:border-gray-800'} hover:border-blue-500/30 p-4 rounded-2xl flex items-center justify-between transition-colors group shadow-sm dark:shadow-none`}
                         >
                           <div className="flex items-center gap-4">
                             <div className={`w-10 h-10 rounded-full flex items-center justify-center border font-bold transition-all ${
                               isArena
                                 ? (status === 'win' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500' : 'bg-red-500/10 border-red-500/50 text-red-500')
                                 : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white group-hover:border-blue-500/50'
                             }`}>
                               {act.score}
                             </div>
                             <div>
                               <p className="font-bold text-gray-900 dark:text-white capitalize flex items-center gap-2">
                                 {name}
                                 {isArena && status && (
                                   <span className={`text-[8px] px-1.5 py-0.5 rounded-md font-black uppercase ${
                                     status === 'win' ? 'bg-emerald-500/20 text-emerald-400' :
                                     status === 'loss' ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'
                                   }`}>
                                     {status}
                                   </span>
                                 )}
                               </p>
                               <p className="text-xs text-gray-500">{new Date(act.completed_at).toLocaleDateString()}</p>
                             </div>
                           </div>
                           <div className="text-right">
                             <p className={`font-bold text-sm ${isArena && status === 'win' ? 'text-blue-400' : 'text-emerald-400'}`}>
                               +{calculateActivityXP(act.score, act.total_questions, isArena ?? false, status ?? null)} XP
                             </p>
                             <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
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
                   className="w-full py-3 text-sm font-bold text-blue-500 dark:text-blue-400 hover:text-blue-400 dark:hover:text-blue-300 bg-gray-100/50 dark:bg-gray-900/30 hover:bg-gray-200/50 dark:hover:bg-gray-900/50 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 rounded-xl transition-all flex items-center justify-center gap-2"
                   aria-label="Load more activity items"
                 >
                   {loadingMore ? (
                     <><Loader2 className="w-4 h-4 animate-spin" /> Loading...</>
                   ) : (
                     <><ChevronDown className="w-4 h-4" /> Load More</>
                   )}
                 </button>
               )}
             </>
          ) : (
             <div className="bg-gray-100/50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 border-dashed p-8 rounded-2xl text-center text-gray-500">
                <TrendingUp className="mx-auto mb-2 opacity-50" />
                <p>No recent activity found. Start a quiz!</p>
             </div>
          )}
       </div>
    </m.div>
  );
});
