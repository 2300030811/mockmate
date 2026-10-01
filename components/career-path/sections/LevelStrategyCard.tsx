"use client";

import React from "react";
import { Award, ShieldAlert, Target, Sparkles, CheckCircle2, ChevronRight } from "lucide-react";
import { LevelStrategyCardProps } from "../types";

export const LevelStrategyCard = React.memo(({ levelStrategy }: LevelStrategyCardProps) => {
  if (!levelStrategy) return null;

  return (
    <div className="rounded-2xl bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] p-5 sm:p-6 shadow-subtle space-y-5 relative overflow-hidden">
      {/* Subtle Indigo Horizon Glow */}
      <div className="absolute top-0 right-0 w-80 h-32 bg-[#5e6ad2]/5 blur-2xl pointer-events-none" />

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-[#1e1e2a] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-[#5e6ad2]/10 text-[#5e6ad2] flex items-center justify-center">
              <Award size={15} />
            </span>
            <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-[#ebebef]">
              Seniority Calibration & Leveling Playbook
            </h3>
          </div>
          <p className="text-xs text-zinc-500 dark:text-[#8b8b9e]">
            Strategic interview positioning designed to secure top-of-band leveling and defend against downleveling.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-[#0d0d12] border border-zinc-200/80 dark:border-[#1e1e2a] self-start sm:self-auto shrink-0">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 dark:text-[#8b8b9e]">
            Detected Band:
          </span>
          <span className="text-xs font-mono font-bold text-[#5e6ad2]">
            {levelStrategy.detectedLevel}
          </span>
        </div>
      </div>

      {/* Strategic 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Card 1: Executive Scope & Pitch Strategy */}
        <div className="rounded-xl bg-zinc-50/80 dark:bg-[#0d0d12] border border-zinc-200/80 dark:border-[#1e1e2a] p-5 space-y-3 flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#5e6ad2] flex items-center gap-1.5">
                <Target size={13} />
                <span>Scope Pitch Formula</span>
              </span>
              <span className="text-[10px] font-mono text-zinc-400">Leveling Anchor</span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-700 dark:text-[#d0d0e0] leading-relaxed">
              {levelStrategy.pitchStrategy}
            </p>
          </div>

          <div className="pt-3 border-t border-zinc-200/60 dark:border-[#1e1e2a] flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-[#8b8b9e]">
            <Sparkles size={11} className="text-[#5e6ad2]" />
            <span>Demonstrates cross-team influence and architectural autonomy</span>
          </div>
        </div>

        {/* Card 2: Downlevel Defense Shield */}
        <div className="rounded-xl bg-amber-500/[0.04] border border-amber-500/20 p-5 space-y-3 flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <ShieldAlert size={13} />
                <span>Downlevel Defense Protocol</span>
              </span>
              <span className="text-[10px] font-mono text-amber-600/80 dark:text-amber-400/80">Debrief Protection</span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-700 dark:text-[#d0d0e0] leading-relaxed">
              {levelStrategy.downlevelMitigation}
            </p>
          </div>

          <div className="pt-3 border-t border-amber-500/15 flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-[#8b8b9e]">
            <CheckCircle2 size={11} className="text-emerald-500" />
            <span>Preempts common interviewer downleveling pushback</span>
          </div>
        </div>
      </div>
    </div>
  );
});

LevelStrategyCard.displayName = "LevelStrategyCard";
