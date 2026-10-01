"use client";

import React from "react";
import { Zap, Sparkles } from "lucide-react";
import { CompetitiveEdgeCardProps } from "../types";

export const CompetitiveEdgeCard = React.memo(({ competitiveEdge }: CompetitiveEdgeCardProps) => {
  if (!competitiveEdge) return null;

  return (
    <div className="w-full bg-white dark:bg-[#14141e] border border-amber-500/30 dark:border-amber-500/25 rounded-2xl p-5 sm:p-6 shadow-subtle space-y-3 relative overflow-hidden dark:bg-gradient-to-r dark:from-[#14141e] dark:via-[#17161b] dark:to-amber-950/10">
      {/* Subtle Warm Glow Accent */}
      <div className="absolute top-0 right-0 w-80 h-32 bg-amber-500/[0.04] blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between border-b border-amber-500/15 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/25 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Zap size={15} />
          </span>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
            <span>Executive Competitive Differentiator</span>
          </span>
        </div>

        <span className="text-[10px] font-mono text-amber-600/80 dark:text-amber-400/80 flex items-center gap-1">
          <Sparkles size={11} /> Candidate Signature
        </span>
      </div>

      <p className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-[#ebebef] leading-relaxed">
        {competitiveEdge}
      </p>
    </div>
  );
});

CompetitiveEdgeCard.displayName = "CompetitiveEdgeCard";
