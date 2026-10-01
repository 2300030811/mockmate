"use client";

import React, { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Compass,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Zap,
  Target
} from "lucide-react";
import { RoleSuggestionsSectionProps } from "../types";

export const RoleSuggestionsSection = React.memo(
  ({ suggestedRoles }: RoleSuggestionsSectionProps) => {
    const [expandedRole, setExpandedRole] = useState<number | null>(0);

    const getMatchColor = (pct: number) => {
      if (pct >= 80)
        return {
          stroke: "text-emerald-500",
          text: "text-emerald-600 dark:text-emerald-400",
          bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
          label: "Direct Lateral Move",
        };
      if (pct >= 60)
        return {
          stroke: "text-[#5e6ad2]",
          text: "text-[#5e6ad2]",
          bg: "bg-[#5e6ad2]/10 text-[#5e6ad2] border-[#5e6ad2]/20",
          label: "Fast-Track Upskill",
        };
      return {
        stroke: "text-amber-500",
        text: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        label: "Strategic Pivot",
      };
    };

    return (
      <div className="space-y-5">
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-[#1e1e2a] pb-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#5e6ad2]/10 text-[#5e6ad2] flex items-center justify-center">
                <Compass size={15} />
              </span>
              <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-[#ebebef]">
                Adjacent Career Vectors & Lateral Roles
              </h3>
            </div>
            <p className="text-xs text-zinc-500 dark:text-[#8b8b9e]">
              High-affinity job roles calibrated against your existing competencies with estimated transition feasibility.
            </p>
          </div>

          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-xl bg-zinc-100 dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] text-zinc-600 dark:text-[#8b8b9e] self-start sm:self-auto shrink-0">
            {suggestedRoles.length} Alternative Paths
          </span>
        </div>

        {/* Roles List */}
        <div className="space-y-3.5">
          {suggestedRoles.map((role, idx) => {
            const colors = getMatchColor(role.matchPercentage);
            const isExpanded = expandedRole === idx;

            return (
              <m.div
                key={idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setExpandedRole(isExpanded ? null : idx)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setExpandedRole(isExpanded ? null : idx);
                    }
                  }}
                  className={`w-full p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#14141e] border transition-all cursor-pointer shadow-subtle ${
                    isExpanded
                      ? "border-[#5e6ad2]/60 ring-1 ring-[#5e6ad2]/20"
                      : "border-zinc-200 dark:border-[#1e1e2a] hover:border-zinc-300 dark:hover:border-[#2a2a3c]"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* SVG Radial Match Gauge */}
                    <div className="relative flex-shrink-0 w-14 h-14">
                      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 48 48">
                        <circle
                          cx="24"
                          cy="24"
                          r="20"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3.5"
                          className="text-zinc-100 dark:text-[#1e1e2a]"
                        />
                        <circle
                          cx="24"
                          cy="24"
                          r="20"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3.5"
                          className={colors.stroke}
                          strokeDasharray={`${(role.matchPercentage / 100) * 125.6} 125.6`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-xs font-mono font-extrabold ${colors.text}`}>
                          {role.matchPercentage}%
                        </span>
                        <span className="text-[8px] font-mono text-zinc-400">Match</span>
                      </div>
                    </div>

                    {/* Role Info & Feasibility */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-[#ebebef] truncate capitalize">
                          {role.role}
                        </h4>
                        <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border font-bold ${colors.bg}`}>
                          {colors.label}
                        </span>
                      </div>

                      {role.reasoning && (
                        <p className="text-xs text-zinc-500 dark:text-[#8b8b9e] line-clamp-1 leading-relaxed">
                          {role.reasoning}
                        </p>
                      )}
                    </div>

                    {/* Expand Toggle */}
                    <div className="flex-shrink-0 text-zinc-400 p-1">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>

                  {/* Expandable Deep Breakdown */}
                  <AnimatePresence>
                    {isExpanded && (
                      <m.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-[#1e1e2a] space-y-4">
                          {/* Full Rationale */}
                          {role.reasoning && (
                            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-[#0d0d12] border border-zinc-200/80 dark:border-[#1e1e2a] space-y-1">
                              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#5e6ad2] flex items-center gap-1">
                                <Sparkles size={11} /> AI Fit Rationale
                              </span>
                              <p className="text-xs text-zinc-700 dark:text-[#c4c4d4] leading-relaxed">
                                {role.reasoning}
                              </p>
                            </div>
                          )}

                          {/* 2-Column: Overlapping Strengths vs Transition Gaps */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                            {/* Overlapping Strengths */}
                            <div className="p-3.5 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/20 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                  <CheckCircle2 size={11} /> Overlapping Strengths
                                </span>
                                <span className="text-[10px] font-mono text-emerald-600 font-bold">
                                  {role.keyMatchingSkills.length} Verified
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {role.keyMatchingSkills.map((skill, sIdx) => (
                                  <span
                                    key={sIdx}
                                    className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-mono font-medium"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Missing Skills Required to Transition */}
                            <div className="p-3.5 rounded-xl bg-amber-500/[0.04] border border-amber-500/20 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                  <AlertCircle size={11} /> Bridge Skills to Learn
                                </span>
                                <span className="text-[10px] font-mono text-amber-600 font-bold">
                                  {role.missingSkills.length} Needed
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {role.missingSkills.length > 0 ? (
                                  role.missingSkills.map((skill, sIdx) => (
                                    <span
                                      key={sIdx}
                                      className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-mono font-medium"
                                    >
                                      {skill}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                    No major technical skill gaps identified!
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </m.div>
                    )}
                  </AnimatePresence>
                </div>
              </m.div>
            );
          })}
        </div>
      </div>
    );
  }
);

RoleSuggestionsSection.displayName = "RoleSuggestionsSection";
