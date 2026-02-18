"use client";

import { motion } from "framer-motion";
import { ChevronRight, History, Swords, Globe, Database, Cloud, Terminal, Shield } from "lucide-react";
import { StatItem, RecentMatch } from "../types";
import { getAvatarIcon } from "@/lib/icons";

interface ArenaLobbyProps {
  stats: StatItem[];
  recentMatches: RecentMatch[];
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  onStart: () => void;
  userAvatar?: string;
}

const CATEGORIES = [
  { id: "random", name: "Random", icon: Globe },
  { id: "aws", name: "AWS", icon: Cloud },
  { id: "azure", name: "Azure", icon: Shield },
  { id: "salesforce", name: "Salesforce", icon: Database },
  { id: "mongodb", name: "MongoDB", icon: Database },
  { id: "pcap", name: "PCAP", icon: Terminal },
  { id: "oracle", name: "Oracle", icon: Database },
];

export function ArenaLobby({ 
  stats, 
  recentMatches, 
  selectedCategory, 
  onCategoryChange, 
  onStart,
  userAvatar
}: ArenaLobbyProps) {
  const UserIcon = getAvatarIcon(userAvatar);
  return (
    <motion.div 
      key="lobby"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      className="flex-1 flex flex-col items-center justify-start py-12 md:py-20 p-6 relative z-10 overflow-y-auto custom-scrollbar"
    >
      <div className="relative group mb-8">
         <div className="absolute inset-0 bg-red-600 rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
         <div className="relative w-24 h-24 md:w-28 md:h-28 bg-gray-900 border-2 border-red-500/30 rounded-[2.5rem] flex items-center justify-center shadow-2xl overflow-hidden">
            <UserIcon className="w-10 h-10 md:w-12 md:h-12 text-red-500 animate-[wiggle_3s_ease-in-out_infinite]" />
            <div className="absolute inset-0 bg-gradient-to-tr from-red-600/10 to-transparent" />
         </div>
      </div>
      
      <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tighter italic text-center">
         THE <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">ARENA</span>
      </h1>
      <p className="text-gray-500 mb-8 md:mb-12 text-center max-w-sm font-bold uppercase tracking-widest text-[8px] md:text-[10px] px-4">
         Technical Combat • Ranked Battles • Global Leaderboard
      </p>
      
      {/* Category Selection */}
      <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-10 max-w-2xl px-4">
         {CATEGORIES.map((cat) => (
           <button
             key={cat.id}
             onClick={() => onCategoryChange(cat.id)}
             className={`flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-wider transition-all border
               ${selectedCategory === cat.id 
                 ? 'bg-red-600 border-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]' 
                 : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20'}`}
           >
             <cat.icon size={14} />
             {cat.name}
           </button>
         ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 w-full max-w-4xl mb-10 md:mb-16 px-4">
         {stats.map((stat, i) => (
           <div key={i} className={`bg-gray-900/40 border border-white/5 rounded-2xl md:rounded-3xl p-4 md:p-6 text-center hover:border-white/20 transition-all hover:-translate-y-1 ${stat.hideOnMobile ? 'hidden md:block' : ''}`}>
              <div className={`w-10 h-10 md:w-12 md:h-12 ${stat.bg} rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4`}>
                 <stat.icon className={stat.color} size={20} />
              </div>
              <h3 className="text-[8px] md:text-[10px] font-black uppercase text-gray-500 mb-1 tracking-widest">{stat.label}</h3>
              <p className="text-xl md:text-2xl font-black text-white">{stat.val}</p>
           </div>
         ))}
      </div>

      <button 
         onClick={onStart}
         className="group relative px-10 py-5 md:px-16 md:py-6 bg-white text-black rounded-[2rem] md:rounded-[2.5rem] font-black text-lg md:text-2xl hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-4 overflow-hidden mb-12 sm:mb-16 shrink-0"
      >
         <span className="relative z-10 flex items-center gap-3">
           <Swords size={28} className="hidden md:block" />
           ENTER COMBAT
         </span>
         <ChevronRight size={24} className="relative z-10 group-hover:translate-x-2 transition-transform" />
      </button>

      {/* Recent Battles */}
      {recentMatches?.length > 0 && (
        <div className="w-full max-w-2xl px-4 animate-in fade-in slide-in-from-bottom-5 duration-700">
           <div className="flex items-center gap-2 mb-4 px-2">
              <History size={14} className="text-gray-500" />
              <h4 className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Recent Engagements</h4>
           </div>
           <div className="space-y-2">
              {recentMatches.map((match, i) => {
                const category = match.category.replace('arena_', '').toUpperCase();
                const isWin = match.score >= match.total_questions / 2;
                return (
                  <div key={i} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center justify-between group hover:bg-white/[0.04] transition-colors">
                     <div className="flex items-center gap-4">
                        <div className={`w-2 h-2 rounded-full ${isWin ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
                        <div>
                           <div className="text-[10px] font-black text-white italic">{category} SECTOR</div>
                           <div className="text-[8px] font-bold text-gray-500 uppercase tracking-tighter">
                             {new Date(match.completed_at).toLocaleDateString()}
                           </div>
                        </div>
                     </div>
                     <div className="text-right">
                        <div className={`text-sm font-black ${isWin ? 'text-emerald-400' : 'text-red-400'}`}>
                           {match.score}/{match.total_questions}
                        </div>
                        <div className="text-[8px] font-bold text-gray-600 uppercase">Correct</div>
                     </div>
                  </div>
                );
              })}
           </div>
        </div>
      )}
    </motion.div>
  );
}
