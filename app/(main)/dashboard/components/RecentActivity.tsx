"use client";

import { motion } from "framer-motion";
import { TrendingUp, Calendar } from "lucide-react";
import { memo } from "react";
import { ActivityItem } from "@/types/dashboard";

export const RecentActivity = memo(function RecentActivity({ activity }: { activity: ActivityItem[] }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="lg:col-span-2 space-y-6"
    >
       <h2 className="text-xl font-bold flex items-center gap-2">
          <Calendar className="text-blue-500" /> Recent Activity
       </h2>
       
       <div className="space-y-3">
          {activity?.length > 0 ? (
             activity.map((act: any, i: number) => {
                const isArena = act.isArena;
                const status = act.winStatus; 
                const displayCategory = act.category.replace(/^arena:(win|loss|tie):/, '').replace(/^arena_/, '').toUpperCase();
                const name = isArena ? `Arena: ${displayCategory}` : `${act.category} Quiz`;
                
                return (
                 <div key={i} className={`bg-gray-900/50 border ${isArena ? (status === 'win' ? 'border-emerald-500/30' : 'border-red-500/30') : 'border-gray-800'} hover:border-blue-500/30 p-4 rounded-2xl flex items-center justify-between transition-colors group`}>
                    <div className="flex items-center gap-4">
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center border font-bold transition-all ${
                         isArena 
                           ? (status === 'win' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500' : 'bg-red-500/10 border-red-500/50 text-red-500')
                           : 'bg-gray-800 border-gray-700 text-gray-400 group-hover:text-white group-hover:border-blue-500/50'
                       }`}>
                          {act.score}
                       </div>
                       <div>
                          <p className="font-bold text-white capitalize flex items-center gap-2">
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
                         +{isArena ? (act.score * 15 + (status === 'win' ? 100 : 50)) : (act.score * 10 + 50)} XP
                       </p>
                       <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                         {isArena ? 'Combat Log' : 'Completed'}
                       </p>
                    </div>
                 </div>
                );
             })
          ) : (
             <div className="bg-gray-900/30 border border-gray-800 border-dashed p-8 rounded-2xl text-center text-gray-500">
                <TrendingUp className="mx-auto mb-2 opacity-50" />
                <p>No recent activity found. Start a quiz!</p>
             </div>
          )}
       </div>
    </motion.div>
  );
});
