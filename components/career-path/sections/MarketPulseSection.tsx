"use client";

import React from "react";
import { TrendingUp, Banknote, ShieldCheck, Compass, Zap } from "lucide-react";
import { MarketPulseSectionProps } from "../types";

export const MarketPulseSection = React.memo(({ marketInsights }: MarketPulseSectionProps) => {
  if (!marketInsights) return null;

  const confidence = marketInsights.confidence || "medium";
  const isHighConfidence = confidence === "high";

  return (
    <div className="w-full bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] rounded-2xl p-5 sm:p-6 shadow-subtle space-y-4 relative overflow-hidden">
      {/* Subtle Green Horizon Glow */}
      <div className="absolute top-0 right-0 w-64 h-32 bg-emerald-500/[0.04] blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-zinc-100 dark:border-[#1e1e2a] pb-3">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <TrendingUp size={15} />
          </span>
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-900 dark:text-[#ebebef]">
            Market Pulse & Economics
          </h3>
        </div>

        <span
          className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border font-bold uppercase tracking-wider flex items-center gap-1 ${
            isHighConfidence
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
              : "bg-zinc-100 dark:bg-[#0d0d12] border-zinc-200 dark:border-[#1e1e2a] text-zinc-500 dark:text-[#8b8b9e]"
          }`}
        >
          <ShieldCheck size={11} />
          <span>{confidence} Confidence</span>
        </span>
      </div>

      <div className="space-y-4">
        {/* Salary Benchmark Card */}
        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-[#0d0d12] border border-zinc-200/80 dark:border-[#1e1e2a] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1">
              <Banknote size={12} className="text-emerald-500" />
              <span>Target Salary Benchmark</span>
            </span>
            <span className="text-[10px] font-mono text-zinc-400">Annual CTC</span>
          </div>

          <div className="flex items-baseline gap-2">
            <p className="text-xl sm:text-2xl font-extrabold font-mono text-zinc-900 dark:text-[#ebebef] truncate">
              {marketInsights.salaryRange || "Industry Standard"}
            </p>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-[#8b8b9e] leading-snug">
            Aggregated across verified hiring loops and placement tier distributions.
          </p>
        </div>

        {/* Demand Heat Meter */}
        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-[#0d0d12] border border-zinc-200/80 dark:border-[#1e1e2a] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1">
              <Zap size={12} className="text-amber-500" />
              <span>Hiring Volume & Demand Heat</span>
            </span>
            <span className="text-xs font-mono font-bold capitalize text-emerald-600 dark:text-emerald-400">
              {marketInsights.demand} Demand
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((lvl) => (
              <div
                key={lvl}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  (marketInsights.demand === "high" && lvl <= 5) ||
                  (marketInsights.demand === "medium" && lvl <= 3) ||
                  lvl <= 2
                    ? "bg-emerald-500"
                    : "bg-zinc-200 dark:bg-zinc-800"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Outlook Statement */}
        {marketInsights.outlook && (
          <div className="p-3.5 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/15 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
              <Compass size={11} /> Trajectory Forecast
            </span>
            <p className="text-xs text-zinc-600 dark:text-[#a0a0b2] leading-relaxed">
              {marketInsights.outlook}
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

MarketPulseSection.displayName = "MarketPulseSection";
