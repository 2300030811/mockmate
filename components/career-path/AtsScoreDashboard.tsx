"use client";

import { m } from "framer-motion";
import { AtsScoreResult } from "@/types/ats-score";
import { CheckCircle2, XCircle, AlertTriangle, Cpu, Layout, Type, Search, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface AtsScoreDashboardProps {
  data: AtsScoreResult;
}

export function AtsScoreDashboard({ data }: AtsScoreDashboardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-emerald-500 dark:text-emerald-400";
    if (score >= 45) return "text-amber-500 dark:text-amber-400";
    return "text-rose-500 dark:text-rose-400";
  };

  const getScoreStroke = (score: number) => {
    if (score >= 75) return "text-emerald-500 dark:text-emerald-400";
    if (score >= 45) return "text-amber-500 dark:text-amber-400";
    return "text-rose-500 dark:text-rose-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 75) return "bg-emerald-500";
    if (score >= 45) return "bg-amber-500";
    return "bg-rose-500";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Main Stats Card */}
      <m.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="lg:col-span-8 bg-white dark:bg-[#14141e] border border-zinc-200/80 dark:border-[#1e1e2a] rounded-2xl p-6 sm:p-8 shadow-subtle relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity pointer-events-none">
          <Cpu size={200} />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          {/* Main Score Gauge */}
          <div className="relative w-40 h-40 shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="10"
                className="text-zinc-100 dark:text-[#1e1e2a]"
              />
              <m.circle
                cx="80"
                cy="80"
                r="70"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="10"
                strokeDasharray={439.82}
                initial={{ strokeDashoffset: 439.82 }}
                animate={{ strokeDashoffset: 439.82 - (439.82 * data.atsScore) / 100 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className={getScoreStroke(data.atsScore)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn("text-4xl font-extrabold font-mono tabular-nums tracking-tight", getScoreColor(data.atsScore))}>
                {data.atsScore}
              </span>
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-400 dark:text-[#8b8b9e] mt-0.5">
                ATS Score
              </span>
            </div>
          </div>

          <div className="flex-1 space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={cn(
                    "px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border",
                    data.matchRating === "High"
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                      : data.matchRating === "Medium"
                      ? "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
                      : "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
                  )}
                >
                  {data.matchRating} Match Rating
                </span>
                <span className="text-xs text-zinc-400 font-mono">• Resume Telemetry</span>
              </div>
              <p className="text-sm sm:text-base text-zinc-700 dark:text-[#c4c4d4] font-medium leading-relaxed">
                &ldquo;{data.overallFeedback}&rdquo;
              </p>
            </div>

            {/* Sub-scores */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-zinc-100 dark:border-[#1e1e2a]">
              {[
                {
                  label: "Formatting",
                  score: data.formatScore,
                  icon: Layout,
                  desc: "Layout simplicity & parsing",
                },
                {
                  label: "Content",
                  score: data.contentScore,
                  icon: Type,
                  desc: "Metric density & impact verbs",
                },
                {
                  label: "Keywords",
                  score: data.keywordScore,
                  icon: Search,
                  desc: "Job spec keyword density",
                },
              ].map((sub, i) => (
                <div key={sub.label} className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono font-semibold text-zinc-500 dark:text-[#8b8b9e]">
                    <div className="flex items-center gap-1.5">
                      <sub.icon size={12} className="text-[#5e6ad2]" />
                      <span>{sub.label}</span>
                    </div>
                    <span className="text-zinc-900 dark:text-[#ebebef] font-bold">{sub.score}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-100 dark:bg-[#0d0d12] border border-zinc-200/60 dark:border-[#1e1e2a] rounded-full overflow-hidden">
                    <m.div
                      initial={{ width: 0 }}
                      animate={{ width: `${sub.score}%` }}
                      transition={{ delay: 0.3 + i * 0.1, duration: 0.8 }}
                      className={cn("h-full rounded-full", getScoreBg(sub.score))}
                    />
                  </div>
                  <span className="block text-[10px] text-zinc-400 dark:text-zinc-500 leading-tight">
                    {sub.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </m.div>

      {/* Side Panel Analysis */}
      <m.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="lg:col-span-4 space-y-4"
      >
        {/* Section Checklist */}
        <div className="bg-white dark:bg-[#14141e] border border-zinc-200/80 dark:border-[#1e1e2a] rounded-2xl p-5 shadow-subtle">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-[#8b8b9e] mb-4 flex items-center gap-2">
            <ShieldCheck size={14} className="text-[#5e6ad2]" />
            Section Completeness
          </h3>
          <div className="grid grid-cols-2 gap-y-3 gap-x-2">
            {Object.entries(data.sectionAnalysis).map(([section, present]) => (
              <div key={section} className="flex items-center gap-2">
                {present ? (
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                ) : (
                  <XCircle size={14} className="text-rose-500 shrink-0" />
                )}
                <span
                  className={cn(
                    "text-xs font-medium capitalize truncate",
                    present ? "text-zinc-700 dark:text-[#ebebef]" : "text-zinc-400 dark:text-zinc-500 line-through"
                  )}
                >
                  {section}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Structure Issues */}
        <div className="bg-white dark:bg-[#14141e] border border-zinc-200/80 dark:border-[#1e1e2a] rounded-2xl p-5 shadow-subtle">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-3 flex items-center gap-1.5">
            <AlertTriangle size={13} />
            Structure & Formatting Flags
          </h3>
          <ul className="space-y-2">
            {data.structureIssues.length > 0 ? (
              data.structureIssues.map((issue, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-zinc-600 dark:text-[#a0a0b2] leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                  <span>{issue}</span>
                </li>
              ))
            ) : (
              <li className="text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-1.5">
                <CheckCircle2 size={13} />
                No structural red flags detected.
              </li>
            )}
          </ul>
        </div>
      </m.div>

      {/* Keywords Panel */}
      <m.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="bg-white dark:bg-[#14141e] border border-zinc-200/80 dark:border-[#1e1e2a] rounded-2xl p-5 shadow-subtle">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 size={13} />
              Detected Target Keywords ({data.presentKeywords.length})
            </h3>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {data.presentKeywords.length > 0 ? (
              data.presentKeywords.map((kw, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-mono font-medium rounded-lg"
                >
                  {kw}
                </span>
              ))
            ) : (
              <p className="text-xs text-zinc-400">No primary keywords matched yet.</p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-[#14141e] border border-zinc-200/80 dark:border-[#1e1e2a] rounded-2xl p-5 shadow-subtle">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <XCircle size={13} />
              High-Impact Missing Keywords ({data.missingKeywords.length})
            </h3>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {data.missingKeywords.length > 0 ? (
              data.missingKeywords.map((kw, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-mono font-medium rounded-lg"
                >
                  {kw}
                </span>
              ))
            ) : (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 size={13} />
                All high-priority job keywords detected.
              </p>
            )}
          </div>
        </div>
      </m.div>
    </div>
  );
}
