"use client";

import React from "react";
import { Sparkles, CheckCircle2, ShieldCheck, Quote } from "lucide-react";
import { StrengthsSectionProps } from "../types";

export const StrengthsSection = React.memo(({ strengths }: StrengthsSectionProps) => {
  if (!strengths || strengths.length === 0) return null;

  const getLevelBadgeClass = (level: string) => {
    switch (level.toLowerCase()) {
      case "expert":
        return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
      case "proficient":
        return "bg-[#5e6ad2]/15 text-[#5e6ad2] dark:text-[#8c97ff] border-[#5e6ad2]/30";
      default:
        return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30";
    }
  };

  return (
    <div className="w-full bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] rounded-2xl p-5 sm:p-6 shadow-subtle space-y-4 relative overflow-hidden">
      {/* Subtle Indigo Glow */}
      <div className="absolute top-0 right-0 w-64 h-32 bg-[#5e6ad2]/[0.04] blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-[#1e1e2a] pb-3">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-[#5e6ad2]/10 text-[#5e6ad2] flex items-center justify-center">
            <Sparkles size={15} />
          </span>
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-900 dark:text-[#ebebef]">
            Verified Resume Anchors
          </h3>
        </div>

        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
          <ShieldCheck size={11} />
          <span>{strengths.length} Core Strengths</span>
        </span>
      </div>

      {/* Strengths List */}
      <div className="space-y-3">
        {strengths.map((strength, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-zinc-50 dark:bg-[#0d0d12] border border-zinc-200/80 dark:border-[#1e1e2a] space-y-2 hover:border-[#5e6ad2]/30 transition-colors"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-[#ebebef] flex items-center gap-1.5 truncate">
                <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                <span className="truncate">{strength.skill}</span>
              </span>

              <span
                className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border font-bold shrink-0 ${getLevelBadgeClass(
                  strength.level
                )}`}
              >
                {strength.level}
              </span>
            </div>

            <p className="text-xs text-zinc-600 dark:text-[#a0a0b2] leading-relaxed italic bg-white/50 dark:bg-[#14141e]/50 p-2.5 rounded-lg border border-zinc-200/50 dark:border-[#1e1e2a]/50">
              &ldquo;{strength.evidence}&rdquo;
            </p>
          </div>
        ))}
      </div>
    </div>
  );
});

StrengthsSection.displayName = "StrengthsSection";
