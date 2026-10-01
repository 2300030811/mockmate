"use client";

import { memo } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Target, Shield, Zap, X, Trophy, ChevronRight, ArrowLeft } from "lucide-react";
import { CHALLENGES } from "../challenges";

interface ChallengePanelProps {
  activeChallengeId: string | null;
  onSelectChallenge: (id: string | null) => void;
  theme: "dark" | "light" | "neo";
}

export const ChallengePanel = memo(({
  activeChallengeId,
  onSelectChallenge,
  theme
}: ChallengePanelProps) => {
  const activeChallenge = CHALLENGES.find((c) => c.id === activeChallengeId);
  const isLight = theme === "light";

  return (
    <div
      className="w-80 border-r border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#0d0d12] text-zinc-900 dark:text-[#ebebef] flex flex-col z-30 select-none transition-colors"
    >
      {/* Header */}
      <div className="h-12 px-4 border-b border-zinc-200 dark:border-[#1e1e2a] flex items-center justify-between shrink-0 bg-zinc-50/50 dark:bg-[#14141e]/50">
        <div className="flex items-center gap-2">
          <Trophy size={13} className="text-amber-500" />
          <h2 className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-[#8b8b9e]">
            Architecture Challenges
          </h2>
        </div>
        {activeChallenge && (
          <button
            onClick={() => onSelectChallenge(null)}
            className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-900 dark:hover:text-white px-1.5 py-0.5 rounded hover:bg-zinc-100 dark:hover:bg-[#1e1e2a] transition-colors"
          >
            <ArrowLeft size={12} />
            <span>All</span>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        <AnimatePresence mode="wait">
          {!activeChallenge ? (
            <m.div
              key="list"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-2.5"
            >
              {CHALLENGES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onSelectChallenge(c.id)}
                  className="w-full text-left p-3 rounded-lg border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50 dark:bg-[#14141e] hover:border-[#5e6ad2]/50 hover:bg-zinc-100/50 dark:hover:bg-[#181824] transition-all group"
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span
                      className={`text-[9.5px] font-mono font-semibold px-1.5 py-0.5 rounded ${
                        c.difficulty === "Easy"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : c.difficulty === "Medium"
                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {c.difficulty}
                    </span>
                    <ChevronRight
                      size={13}
                      className="text-zinc-400 group-hover:text-[#5e6ad2] transition-colors"
                    />
                  </div>
                  <h3 className="text-xs font-semibold text-zinc-900 dark:text-[#ebebef] mb-1">
                    {c.title}
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-[#8b8b9e] line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>
                </button>
              ))}
            </m.div>
          ) : (
            <m.div
              key="detail"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4"
            >
              <div>
                <span
                  className={`text-[9.5px] font-mono font-semibold px-1.5 py-0.5 rounded inline-block mb-2 ${
                    activeChallenge.difficulty === "Easy"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      : activeChallenge.difficulty === "Medium"
                      ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                  }`}
                >
                  {activeChallenge.difficulty}
                </span>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-[#ebebef] mb-1.5">
                  {activeChallenge.title}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-[#8b8b9e] leading-relaxed">
                  {activeChallenge.description}
                </p>
              </div>

              {activeChallenge.metrics && (
                <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-[#1e1e2a]">
                  <div className="flex items-center gap-1.5 text-zinc-500 dark:text-[#8b8b9e]">
                    <Zap size={12} className="text-[#5e6ad2]" />
                    <span className="text-[9.5px] font-mono font-bold uppercase tracking-wider">
                      Expected Scale Telemetry
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { label: "Active Users", val: activeChallenge.metrics.users },
                      { label: "Daily Writes", val: activeChallenge.metrics.writesPerDay },
                      { label: "Daily Reads", val: activeChallenge.metrics.readsPerDay },
                      { label: "Target Latency", val: activeChallenge.metrics.latency },
                      { label: "Storage Footprint", val: activeChallenge.metrics.storage, colSpan: true }
                    ].map((metric, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded-md border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50 dark:bg-[#14141e] ${
                          metric.colSpan ? "col-span-2" : ""
                        }`}
                      >
                        <span className="text-[8.5px] font-mono uppercase text-zinc-400 dark:text-[#5a5a6e] block">
                          {metric.label}
                        </span>
                        <span className="text-xs font-mono font-semibold text-zinc-900 dark:text-[#ebebef]">
                          {metric.val}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-[#1e1e2a]">
                <div className="flex items-center gap-1.5 text-zinc-500 dark:text-[#8b8b9e]">
                  <Target size={12} className="text-[#5e6ad2]" />
                  <span className="text-[9.5px] font-mono font-bold uppercase tracking-wider">
                    Core Objectives
                  </span>
                </div>
                <div className="space-y-1.5">
                  {activeChallenge.objectives.map((obj, i) => (
                    <div
                      key={i}
                      className="flex gap-2 text-xs p-2 rounded-md border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50 dark:bg-[#14141e] leading-snug"
                    >
                      <span className="font-mono text-[#5e6ad2] font-semibold">
                        {i + 1}.
                      </span>
                      <span className="text-zinc-700 dark:text-zinc-300">{obj}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-[#1e1e2a]">
                <div className="flex items-center gap-1.5 text-zinc-500 dark:text-[#8b8b9e]">
                  <Shield size={12} className="text-emerald-500" />
                  <span className="text-[9.5px] font-mono font-bold uppercase tracking-wider">
                    Production Constraints
                  </span>
                </div>
                <ul className="space-y-1">
                  {activeChallenge.constraints.map((con, i) => (
                    <li
                      key={i}
                      className="flex gap-2 text-xs text-zinc-600 dark:text-[#8b8b9e] leading-relaxed"
                    >
                      <span className="text-emerald-500 font-bold shrink-0">•</span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});

ChallengePanel.displayName = "ChallengePanel";
