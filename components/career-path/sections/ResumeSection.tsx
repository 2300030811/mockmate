"use client";

import React from "react";
import { Award, Lightbulb, Zap } from "lucide-react";
import { ResumeSectionProps } from "../types";

export const ResumeSection = React.memo(({ suggestions }: ResumeSectionProps) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between border-b border-zinc-100 dark:border-[#1e1e2a] pb-3">
      <div className="flex items-center gap-2">
        <span className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
          <Lightbulb size={15} />
        </span>
        <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-[#ebebef]">
          Resume Alignment Intel
        </h2>
      </div>
      <span className="text-xs font-mono text-zinc-400">
        {suggestions.length} Strategic Tweaks
      </span>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {suggestions.map((sug, idx) => (
        <div
          key={idx}
          className="p-5 rounded-2xl bg-white dark:bg-[#14141e] border border-zinc-200/80 dark:border-[#1e1e2a] hover:border-[#5e6ad2]/40 transition-all shadow-subtle group space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 dark:text-[#8b8b9e]">
              {sug.category}
            </span>
            {sug.impact === "high" ? (
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded border border-rose-500/20 flex items-center gap-1">
                <Zap size={10} /> Critical Impact
              </span>
            ) : (
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 bg-[#5e6ad2]/10 text-[#5e6ad2] rounded border border-[#5e6ad2]/20">
                Recommended
              </span>
            )}
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-zinc-100 dark:bg-[#1e1e2a] text-[#5e6ad2] shrink-0 mt-0.5">
              <Award size={16} />
            </div>
            <p className="text-xs sm:text-sm text-zinc-700 dark:text-[#c4c4d4] font-medium leading-relaxed">
              &ldquo;{sug.suggestion}&rdquo;
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
));

ResumeSection.displayName = "ResumeSection";
