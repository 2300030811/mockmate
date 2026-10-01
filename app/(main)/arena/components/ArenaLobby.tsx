"use client";

import React from "react";
import { m } from "framer-motion";
import { ChevronRight, History, Swords, Globe, Database, Cloud, Terminal, Shield, Trophy, Flame, Activity, Sparkles, ArrowRight } from "lucide-react";
import { StatItem, RecentMatch } from "../types";
import { getAvatarIcon } from "@/lib/icons";
import { Button } from "@/components/ui/Button";
import { ClientDate } from "@/components/ui/ClientDate";
import { getAllCategories } from "@/lib/quiz-registry";

// Icon mapping for known category IDs; falls back to Database for new ones
const CATEGORY_ICON_MAP: Record<string, React.ElementType> = {
  aws: Cloud,
  azure: Shield,
  salesforce: Database,
  mongodb: Database,
  pcap: Terminal,
  oracle: Database,
};

// Build category list dynamically — "Random" is always first
const CATEGORIES = [
  { id: "random", name: "Random", icon: Globe },
  ...getAllCategories().map((c) => ({
    id: c.id,
    name: c.name.split(" ")[0], // First word of the full name (e.g. "AWS", "MongoDB")
    icon: CATEGORY_ICON_MAP[c.id] ?? Database,
  })),
];

interface ArenaLobbyProps {
  stats: StatItem[];
  recentMatches: RecentMatch[];
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  onStart: () => void;
  userAvatar?: string;
  statsLoading?: boolean;
  statsError?: string | null;
  isAuthenticated?: boolean;
}

export const ArenaLobby = React.memo(function ArenaLobby({ 
  stats, 
  recentMatches, 
  selectedCategory, 
  onCategoryChange, 
  onStart,
  userAvatar,
  statsLoading = false,
  statsError = null,
  isAuthenticated = false,
}: ArenaLobbyProps) {
  const UserIcon = getAvatarIcon(userAvatar);

  return (
    <m.div 
      key="lobby"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.35 }}
      className="flex-1 flex flex-col items-center justify-start py-8 md:py-14 px-4 sm:px-6 relative z-10 overflow-y-auto custom-scrollbar max-w-5xl mx-auto w-full"
    >
      {/* ── Top Category Tag & Avatar ── */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono tracking-wide uppercase bg-[#5e6ad2]/10 text-[#5e6ad2] border border-[#5e6ad2]/20">
          <span className="w-1.5 h-1.5 rounded-full bg-[#5e6ad2] animate-pulse" />
          MULTIPLAYER ENGINE // 1V1 RANKED COMBAT
        </div>
      </div>

      {/* ── Header Title & Subtitle ── */}
      <div className="text-center max-w-2xl mb-8">
        <div className="relative inline-flex items-center justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] shadow-subtle flex items-center justify-center text-[#5e6ad2]">
            <UserIcon className="w-8 h-8" />
          </div>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-[#ebebef] mb-3">
          Engineering Combat <span className="text-[#5e6ad2]">Arena</span>
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-[#8b8b9e] leading-relaxed">
          Challenge engineers worldwide in real-time 1v1 technical quiz duels. Test algorithm precision, cloud architecture, and speed to climb the global leaderboard.
        </p>
      </div>

      {/* ── Category Chips ── */}
      <div className="w-full max-w-3xl mb-8">
        <div className="text-center mb-2.5">
          <span className="text-[10.5px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            CHOOSE COMBAT SECTOR
          </span>
        </div>
        <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Quiz categories">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                aria-pressed={isSelected}
                aria-label={`Select ${cat.name} category`}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all border cursor-pointer
                  ${isSelected 
                    ? 'bg-[#5e6ad2] border-[#5e6ad2] text-white shadow-subtle' 
                    : 'bg-white dark:bg-[#14141e] border-zinc-200 dark:border-[#1e1e2a] text-zinc-600 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-[#ebebef] hover:bg-zinc-100 dark:hover:bg-[#181824]'}`}
              >
                <cat.icon size={13} aria-hidden="true" />
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── KPI Telemetry Stats Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 w-full max-w-3xl mb-8">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            className={`bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] rounded-xl p-4 sm:p-5 text-center shadow-subtle transition-all hover:border-zinc-300 dark:hover:border-[#2e2e42] ${stat.hideOnMobile ? 'hidden sm:block' : ''}`}
            aria-label={`${stat.label}: ${stat.val}`}
          >
            <div className="flex items-center justify-center gap-2 text-zinc-400 dark:text-zinc-500 text-[10.5px] font-mono uppercase tracking-wider mb-2">
              <stat.icon className={stat.color} size={14} aria-hidden="true" />
              <span>{stat.label}</span>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-[#ebebef] tracking-tight">
              {stat.val}
            </p>
          </div>
        ))}
      </div>

      {/* ── Unauthenticated Notice ── */}
      {!isAuthenticated && !statsLoading && (
        <m.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl mb-8 p-5 bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] rounded-xl text-center shadow-subtle"
        >
          <div className="flex items-center justify-center gap-2 mb-1.5 text-zinc-900 dark:text-[#ebebef] font-bold text-sm">
            <Shield className="text-[#5e6ad2]" size={16} />
            <span>Ranked Matchmaking Access</span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-[#8b8b9e] mb-4">
            Sign in to record your Elo rating, climb the seasonal leaderboard, and save match history.
          </p>
          <Button 
            onClick={() => window.location.href = '/login?redirect=/arena'} 
            variant="primary" 
            className="rounded-lg px-6 py-2 text-xs font-semibold bg-[#5e6ad2] hover:bg-[#4f5ac4] text-white"
          >
            Sign In to Compete
          </Button>
        </m.div>
      )}

      {statsError && (
        <div className="w-full max-w-3xl mb-6 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-center">
          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">{statsError}</p>
        </div>
      )}

      {/* ── Enter Combat Action Button ── */}
      <button 
        onClick={onStart}
        aria-label={`Enter combat with ${selectedCategory} category`}
        className="group relative px-8 py-3.5 bg-[#5e6ad2] hover:bg-[#4f5ac4] text-white rounded-xl font-bold text-sm sm:text-base transition-all shadow-subtle hover:shadow-md flex items-center gap-3 active:scale-95 mb-10 shrink-0 cursor-pointer"
      >
        <Swords size={18} aria-hidden="true" />
        <span>ENTER COMBAT</span>
        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
      </button>

      {/* ── Recent Engagements Feed ── */}
      {recentMatches?.length > 0 && (
        <div className="w-full max-w-2xl px-2">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-1.5 text-zinc-500 dark:text-[#8b8b9e] text-xs font-mono uppercase tracking-wider">
              <History size={13} aria-hidden="true" />
              <span>Recent Engagements</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">PAST DUELS</span>
          </div>

          <div className="space-y-2" role="list">
            {recentMatches.map((match, i) => {
              const categoryName = match.category.replace('arena_', '').toUpperCase();
              const isWin = match.winStatus === 'win' || (!match.winStatus && match.score >= match.total_questions / 2);
              const isTie = match.winStatus === 'tie';
              return (
                <div 
                  key={i} 
                  className="bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] rounded-xl p-3 sm:p-4 flex items-center justify-between shadow-subtle hover:border-zinc-300 dark:hover:border-[#2e2e42] transition-colors"
                  role="listitem"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${isWin ? 'bg-emerald-500' : isTie ? 'bg-amber-500' : 'bg-rose-500'}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-900 dark:text-[#ebebef]">
                          {categoryName} SECTOR
                        </span>
                        <span className={`text-[9.5px] font-mono uppercase px-1.5 py-0.2 rounded font-semibold ${
                          isWin ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
                          isTie ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 
                          'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                        }`}>
                          {isWin ? "Victory" : isTie ? "Draw" : "Defeat"}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-zinc-400 mt-0.5">
                        <ClientDate date={match.completed_at} />
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`text-sm font-extrabold ${isWin ? 'text-emerald-500' : isTie ? 'text-amber-500' : 'text-rose-500'}`}>
                      {match.score}/{match.total_questions}
                    </div>
                    <div className="text-[9.5px] font-mono text-zinc-400 uppercase">Correct</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </m.div>
  );
});
