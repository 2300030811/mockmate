"use client";

import { useState } from "react";
import { m } from "framer-motion";
import {
  Flame,
  AlertCircle,
  Trophy,
  Target,
  Hammer,
  Check,
  Copy,
  RotateCcw,
  ArrowRight,
  Trash2,
  Sparkles,
  Bookmark,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { ScoreCard } from "./ScoreCard";
import { RoastData } from "../types";

const DIMENSION_META: Record<string, { label: string; desc: string }> = {
  clarity: { label: "Clarity", desc: "ATS readability & brevity" },
  impact: { label: "Impact", desc: "Metrics & quantifiable outcomes" },
  technical: { label: "Technical", desc: "Stack depth & architecture signal" },
  layout: { label: "Layout", desc: "Hierarchy, density & spacing" },
};

interface RoastResultsProps {
  roastData: RoastData;
  selectedTone: string;
  isSpeaking: boolean;
  onSpeak: () => void;
  completedSuggestions: number[];
  onToggleSuggestion: (idx: number) => void;
  onCopy: () => void;
  copied: boolean;
  onReset: () => void;
  onClearHistory: () => void;
  onTrack?: () => void;
  isTracking?: boolean;
  trackerFeedback?: string | null;
}

export function RoastResults({
  roastData,
  selectedTone,
  isSpeaking,
  onSpeak,
  completedSuggestions,
  onToggleSuggestion,
  onCopy,
  copied,
  onReset,
  onClearHistory,
  onTrack,
  isTracking,
  trackerFeedback,
}: RoastResultsProps) {
  const [copiedSkill, setCopiedSkill] = useState<string | null>(null);

  const handleCopySkill = (skill: string) => {
    navigator.clipboard.writeText(skill);
    setCopiedSkill(skill);
    setTimeout(() => setCopiedSkill(null), 1500);
  };

  const flawCount = roastData.criticalFlaws.length;
  const winCount = roastData.winningPoints.length;
  const totalSuggestions = roastData.suggestions.length;
  const completedCount = completedSuggestions.length;
  const roadmapProgress =
    totalSuggestions > 0 ? Math.round((completedCount / totalSuggestions) * 100) : 0;

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 text-left pb-16"
    >
      {/* ── 1. TOP SCORE & VERDICT SUMMARY (Unified 8 / 4 Column Grid) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch">
        {/* The Diagnostic Verdict Card (8 Cols) */}
        <m.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-8 rounded-lg border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] p-5 sm:p-6 shadow-surface flex flex-col justify-between relative overflow-hidden"
        >
          {/* Subtle Decorative Watermark Glyph */}
          <div
            aria-hidden="true"
            className="absolute -top-3 right-3 text-7xl font-serif text-zinc-100 dark:text-[#181824] select-none pointer-events-none -z-0 opacity-80"
          >
            &rdquo;
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between gap-2 border-b border-zinc-200/80 dark:border-[#1a1a26] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-900 dark:text-[#ebebef] flex items-center gap-1.5">
                  <Flame size={13} className="text-orange-500" />
                  <span>The Diagnostic Verdict</span>
                  <span className="text-[10px] font-mono font-medium text-orange-600 dark:text-orange-400 bg-orange-500/10 px-1.5 py-0.2 rounded border border-orange-500/20">
                    {selectedTone}
                  </span>
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onCopy}
                  className="px-2.5 py-1 rounded text-[11px] font-mono flex items-center gap-1.5 transition-all border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50 dark:bg-[#101017] text-zinc-600 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-[#ebebef] hover:border-zinc-300 dark:hover:border-[#3a3a52] active:scale-95"
                  title="Copy verdict text"
                >
                  {copied ? (
                    <Check size={12} className="text-emerald-500" />
                  ) : (
                    <Copy size={12} />
                  )}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            <blockquote className="text-sm sm:text-base md:text-lg font-medium italic text-zinc-900 dark:text-[#ebebef] leading-relaxed mb-6">
              &quot;{roastData.brutalRoast}&quot;
            </blockquote>
          </div>

          {/* Skill Breakdown Strip */}
          <div className="pt-4 border-t border-zinc-100 dark:border-[#1a1a26] relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-zinc-400 dark:text-[#6e6e84] uppercase tracking-wider">
                Heuristic Dimension Analysis
              </span>
              <span className="text-[10px] font-mono text-zinc-400 dark:text-[#6e6e84]">
                Target: &gt;70%
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {Object.entries(roastData.skillBreakdown || {}).map(([skill, score]: [string, number], idx) => {
                const statusTag =
                  score >= 70 ? "Strong" : score >= 50 ? "Moderate" : "Deficit";
                const statusColor =
                  score >= 70
                    ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                    : score >= 50
                    ? "text-[#5e6ad2] bg-[#5e6ad2]/10 border-[#5e6ad2]/20"
                    : "text-rose-500 bg-rose-500/10 border-rose-500/20";
                const meta = DIMENSION_META[skill.toLowerCase()];

                return (
                  <div
                    key={skill}
                    title={meta ? `${meta.label}: ${meta.desc}` : `${skill} rubric score`}
                    className="p-2.5 rounded bg-zinc-50 dark:bg-[#0f0f16] border border-zinc-200/60 dark:border-[#1a1a26] space-y-1.5 hover:border-zinc-300 dark:hover:border-[#3a3a52] hover:-translate-y-0.5 transition-all duration-150 cursor-help"
                  >
                    <div className="flex justify-between items-baseline text-[10px] font-mono">
                      <span className="text-zinc-500 dark:text-[#8b8b9e] uppercase truncate">
                        {skill}
                      </span>
                      <span className="font-semibold text-zinc-900 dark:text-[#ebebef]">
                        {score}%
                      </span>
                    </div>

                    <div
                      className="h-1.5 w-full bg-zinc-200/80 dark:bg-[#1a1a26] rounded-full overflow-hidden"
                      role="progressbar"
                      aria-valuenow={score}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <m.div
                        initial={{ width: 0 }}
                        animate={{ width: `${score}%` }}
                        transition={{ delay: 0.3 + idx * 0.1, duration: 0.8 }}
                        className={`h-full rounded-full ${
                          score >= 70
                            ? "bg-emerald-500"
                            : score >= 50
                            ? "bg-[#5e6ad2]"
                            : "bg-rose-500"
                        }`}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[9px] font-mono">
                      <span className={`px-1.5 py-0.2 rounded border ${statusColor} font-semibold uppercase`}>
                        {statusTag}
                      </span>
                      {meta && (
                        <span className="text-[8.5px] text-zinc-400 dark:text-[#5a5a6e] hidden sm:inline truncate ml-1">
                          {meta.desc.split("&")[0]}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </m.div>

        {/* ScoreCard (4 Cols) */}
        <ScoreCard
          score={roastData.professionalScore}
          isSpeaking={isSpeaking}
          onSpeak={onSpeak}
        />
      </div>

      {/* ── 2. DEEP AUDIT MATRIX & ATS COMPATIBILITY (Synchronized 8 / 4 Column Grid) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        {/* Left Column (8 Cols): Flaws, Wins & Interactive Roadmap */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 items-start">
            {/* Critical Flaws Card */}
            <m.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-lg border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] p-5 shadow-surface hover:border-zinc-300 dark:hover:border-[#3a3a52] transition-colors"
            >
              <div className="flex items-center justify-between gap-2 border-b border-zinc-200/80 dark:border-[#1a1a26] pb-3 mb-3.5">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-[4px] bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
                    <AlertCircle size={12} />
                  </div>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-900 dark:text-[#ebebef]">
                    Critical Flaws
                  </h3>
                </div>
                <span className="text-[9.5px] font-mono font-medium px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  {flawCount} flagged
                </span>
              </div>

              <ul className="space-y-2.5">
                {roastData.criticalFlaws.length > 0 ? (
                  roastData.criticalFlaws.map((flaw: string, i: number) => (
                    <li
                      key={i}
                      className="group p-2.5 rounded-[5px] bg-zinc-50 dark:bg-[#0f0f16] border border-zinc-200/70 dark:border-[#1a1a26] text-xs text-zinc-700 dark:text-[#c0c0d4] leading-relaxed flex items-start gap-2.5 hover:border-zinc-300 dark:hover:border-[#3a3a52] hover:bg-zinc-100/60 dark:hover:bg-[#13131f] transition-all duration-150"
                    >
                      <span className="text-[10px] font-mono font-bold text-rose-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span>{flaw}</span>
                    </li>
                  ))
                ) : (
                  <li className="p-3 rounded-[5px] bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                    <Check size={14} className="shrink-0" />
                    <span>No critical formatting or content flaws detected.</span>
                  </li>
                )}
              </ul>
            </m.div>

            {/* Winning Points Card */}
            <m.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-lg border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] p-5 shadow-surface hover:border-zinc-300 dark:hover:border-[#3a3a52] transition-colors"
            >
              <div className="flex items-center justify-between gap-2 border-b border-zinc-200/80 dark:border-[#1a1a26] pb-3 mb-3.5">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-[4px] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                    <Trophy size={12} />
                  </div>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-900 dark:text-[#ebebef]">
                    Winning Points
                  </h3>
                </div>
                <span className="text-[9.5px] font-mono font-medium px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {winCount} strengths
                </span>
              </div>

              <ul className="space-y-2.5">
                {roastData.winningPoints.length > 0 ? (
                  roastData.winningPoints.map((win: string, i: number) => (
                    <li
                      key={i}
                      className="group p-2.5 rounded-[5px] bg-zinc-50 dark:bg-[#0f0f16] border border-zinc-200/70 dark:border-[#1a1a26] text-xs text-zinc-700 dark:text-[#c0c0d4] leading-relaxed flex items-start gap-2.5 hover:border-zinc-300 dark:hover:border-[#3a3a52] hover:bg-zinc-100/60 dark:hover:bg-[#13131f] transition-all duration-150"
                    >
                      <span className="text-[10px] font-mono font-bold text-emerald-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span>{win}</span>
                    </li>
                  ))
                ) : (
                  <li className="p-3 rounded-[5px] bg-blue-500/10 border border-blue-500/20 text-xs text-blue-600 dark:text-blue-400 flex items-center gap-2">
                    <Sparkles size={14} className="shrink-0" />
                    <span>Focus on the action items below to establish competitive strengths.</span>
                  </li>
                )}
              </ul>
            </m.div>
          </div>

          {/* Actionable Suggestions / Roadmap */}
          <m.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-lg border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] p-5 sm:p-6 shadow-surface"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200/80 dark:border-[#1a1a26] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-[5px] bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 flex items-center justify-center text-[#5e6ad2]">
                  <Hammer size={13} />
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-900 dark:text-[#ebebef]">
                    Actionable Roadmap to Redemption
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-[#8b8b9e]">
                    Click items to track your revisions
                  </p>
                </div>
              </div>

              {/* Live Roadmap Completion Progress */}
              <div className="flex items-center gap-2.5 self-start sm:self-auto">
                <div className="w-24 h-1.5 bg-zinc-100 dark:bg-[#0f0f16] rounded-full overflow-hidden border border-zinc-200 dark:border-[#1e1e2a]">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${roadmapProgress}%` }}
                  />
                </div>
                <div className="text-[10px] font-mono text-zinc-500 dark:text-[#8b8b9e] px-2 py-0.5 rounded bg-zinc-100 dark:bg-[#101017] border border-zinc-200 dark:border-[#1e1e2a]">
                  {completedCount} / {totalSuggestions} Fixed ({roadmapProgress}%)
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {roastData.suggestions.map((suggestion: string, i: number) => {
                const isDone = completedSuggestions.includes(i);
                return (
                  <m.button
                    key={i}
                    whileHover={{ scale: 1.008 }}
                    whileTap={{ scale: 0.995 }}
                    onClick={() => onToggleSuggestion(i)}
                    role="checkbox"
                    aria-checked={isDone}
                    className={`p-3 rounded-md border text-left flex items-start gap-2.5 transition-colors cursor-pointer select-none ${
                      isDone
                        ? "bg-emerald-500/5 border-emerald-500/30 text-zinc-400 dark:text-[#6e6e84] line-through"
                        : "bg-zinc-50 dark:bg-[#0f0f16] border-zinc-200/80 dark:border-[#1a1a26] hover:border-[#5e6ad2]/50 hover:bg-zinc-100/60 dark:hover:bg-[#141420] text-zinc-800 dark:text-[#ebebef]"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-[4px] border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isDone
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-zinc-300 dark:border-[#3a3a52] bg-white dark:bg-[#14141e]"
                      }`}
                    >
                      {isDone && <Check size={11} strokeWidth={3} />}
                    </div>
                    <span className="text-xs leading-relaxed">{suggestion}</span>
                  </m.button>
                );
              })}
            </div>

            {/* 100% Roadmap Completion Delight Banner */}
            {roadmapProgress === 100 && totalSuggestions > 0 && (
              <m.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="mt-4 p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 text-emerald-700 dark:text-emerald-400 font-medium">
                  <CheckCircle2 size={16} className="shrink-0 text-emerald-500" />
                  <span>All identified red flags addressed! Ready to test your updated resume score.</span>
                </div>
                <button
                  onClick={onReset}
                  className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[11px] font-semibold flex items-center gap-1.5 shrink-0 transition-colors shadow-sm"
                >
                  <span>Re-Scan Resume</span>
                  <ArrowRight size={12} />
                </button>
              </m.div>
            )}
          </m.div>
        </div>

        {/* Right Column (4 Cols): ATS Compatibility Sidebar */}
        <m.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="lg:col-span-4 rounded-lg border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] p-5 shadow-surface space-y-4 lg:sticky lg:top-20"
        >
          <div className="flex items-center justify-between gap-2 border-b border-zinc-200/80 dark:border-[#1a1a26] pb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-[5px] bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 flex items-center justify-center text-[#5e6ad2]">
                <Target size={13} />
              </div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-900 dark:text-[#ebebef]">
                ATS Compatibility
              </h3>
            </div>

            {onTrack && (
              <button
                onClick={onTrack}
                disabled={isTracking}
                className="px-2 py-1 rounded text-[10px] font-mono flex items-center gap-1.5 transition-colors border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50 dark:bg-[#101017] text-[#5e6ad2] hover:border-[#5e6ad2]/40"
              >
                <Bookmark size={11} />
                <span>{isTracking ? "Saving..." : "Track Role"}</span>
              </button>
            )}
          </div>

          {trackerFeedback && (
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-emerald-600 dark:text-emerald-400 text-xs font-mono flex items-center gap-2">
              <Check size={12} />
              <span>{trackerFeedback}</span>
            </div>
          )}

          {!roastData.atsAnalysis.jobDescriptionProvided && (
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-md text-amber-700 dark:text-amber-400 text-[11px] leading-relaxed flex items-start gap-2 font-mono">
              <AlertCircle size={13} className="shrink-0 mt-0.5" />
              <span>No JD provided — ATS score evaluated against generalized industry heuristics.</span>
            </div>
          )}

          {/* ATS Metric Strip with Mini Subscore Gauges */}
          <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-[#0f0f16] border border-zinc-200/80 dark:border-[#1a1a26] space-y-3">
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-[10px] font-mono text-zinc-400 dark:text-[#6e6e84] uppercase">
                  ATS Match Score
                </div>
                <div className="text-3xl font-bold font-mono text-zinc-900 dark:text-[#ebebef] mt-0.5">
                  {roastData.atsAnalysis.atsScore}
                  <span className="text-sm font-normal text-zinc-400 dark:text-[#5a5a6e]"> / 100</span>
                </div>
              </div>
              <span
                className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                  roastData.atsAnalysis.matchRating === "High"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : roastData.atsAnalysis.matchRating === "Medium"
                    ? "bg-[#5e6ad2]/10 text-[#5e6ad2] border-[#5e6ad2]/20"
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                }`}
              >
                {roastData.atsAnalysis.matchRating} Match
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-[10px] font-mono text-center">
              <div className="p-2 rounded bg-white dark:bg-[#14141e] border border-zinc-200/60 dark:border-[#1e1e2a] space-y-1">
                <div className="text-zinc-400 dark:text-[#5a5a6e]">FORMAT</div>
                <div className="font-semibold text-zinc-800 dark:text-[#ebebef]">
                  {roastData.atsAnalysis.formatScore}
                </div>
                <div className="w-full h-1 bg-zinc-100 dark:bg-[#0f0f16] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${roastData.atsAnalysis.formatScore}%` }}
                  />
                </div>
              </div>

              <div className="p-2 rounded bg-white dark:bg-[#14141e] border border-zinc-200/60 dark:border-[#1e1e2a] space-y-1">
                <div className="text-zinc-400 dark:text-[#5a5a6e]">CONTENT</div>
                <div className="font-semibold text-zinc-800 dark:text-[#ebebef]">
                  {roastData.atsAnalysis.contentScore}
                </div>
                <div className="w-full h-1 bg-zinc-100 dark:bg-[#0f0f16] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      roastData.atsAnalysis.contentScore >= 60 ? "bg-[#5e6ad2]" : "bg-rose-500"
                    }`}
                    style={{ width: `${roastData.atsAnalysis.contentScore}%` }}
                  />
                </div>
              </div>

              <div className="p-2 rounded bg-white dark:bg-[#14141e] border border-zinc-200/60 dark:border-[#1e1e2a] space-y-1">
                <div className="text-zinc-400 dark:text-[#5a5a6e]">KEYWORD</div>
                <div className="font-semibold text-zinc-800 dark:text-[#ebebef]">
                  {roastData.atsAnalysis.keywordScore}
                </div>
                <div className="w-full h-1 bg-zinc-100 dark:bg-[#0f0f16] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      roastData.atsAnalysis.keywordScore >= 60 ? "bg-[#5e6ad2]" : "bg-amber-500"
                    }`}
                    style={{ width: `${roastData.atsAnalysis.keywordScore}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Keywords Present */}
          {roastData.atsAnalysis.presentKeywords?.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-[#6e6e84]">
                Detected Keywords
              </div>
              <div className="flex flex-wrap gap-1">
                {roastData.atsAnalysis.presentKeywords.map((tag: string, i: number) => (
                  <span
                    key={i}
                    className="px-1.5 py-0.5 rounded text-[9.5px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Missing Hard Skills */}
          {roastData.atsAnalysis.missingHardSkills?.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-rose-500/80">
                <span>Missing Hard Skills</span>
                <span className="text-[9px] text-zinc-400 dark:text-[#5a5a6e] lowercase font-normal">
                  (click to copy)
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {roastData.atsAnalysis.missingHardSkills.map((tag: string, i: number) => {
                  const isCopied = copiedSkill === tag;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleCopySkill(tag)}
                      title={`Click to copy "${tag}"`}
                      className={`px-2 py-0.5 rounded text-[9.5px] font-mono border transition-all cursor-pointer flex items-center gap-1 group ${
                        isCopied
                          ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40 scale-105 shadow-sm"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 hover:border-rose-500/40 hover:bg-rose-500/15 active:scale-95"
                      }`}
                    >
                      <span>{isCopied ? "✓ Copied" : tag}</span>
                      {!isCopied && (
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[8px] text-rose-400">
                          +
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ATS Tips */}
          {roastData.atsAnalysis.atsTips?.length > 0 && (
            <div className="pt-2 border-t border-zinc-100 dark:border-[#1a1a26] space-y-1.5">
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-[#6e6e84]">
                ATS Parsing Recommendations
              </div>
              <ul className="space-y-1.5 text-xs text-zinc-600 dark:text-[#a0a0b8] leading-relaxed">
                {roastData.atsAnalysis.atsTips.map((tip: string, i: number) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-[#5e6ad2] font-mono text-[10px] shrink-0">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </m.div>
      </div>

      {/* ── FOOTER ACTIONS TOOLBAR ── */}
      <div className="pt-6 border-t border-zinc-200 dark:border-[#1e1e2a] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="px-4 py-2 rounded-md font-medium text-xs bg-orange-600 hover:bg-orange-500 text-white flex items-center gap-1.5 transition-colors shadow-subtle"
          >
            <RotateCcw size={13} />
            <span>Roast Another Resume</span>
          </button>

          <Link
            href="/arena"
            className="px-4 py-2 rounded-md font-medium text-xs border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-100 hover:bg-zinc-200 dark:bg-[#1e1e2a] dark:hover:bg-[#28283a] text-zinc-800 dark:text-[#ebebef] flex items-center gap-1.5 transition-colors"
          >
            <span>Practice Interview Arena</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <button
          onClick={onClearHistory}
          className="text-[11px] font-mono text-zinc-400 hover:text-rose-500 flex items-center gap-1 transition-colors"
        >
          <Trash2 size={12} />
          <span>Clear Cached Report</span>
        </button>
      </div>
    </m.div>
  );
}
