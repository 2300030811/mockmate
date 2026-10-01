"use client";

import { useState } from "react";
import Link from "next/link";
import { m } from "framer-motion";
import { DeepEvalResult } from "@/types/deep-eval";
import { deriveDeepEvalGrade } from "@/lib/deep-eval-scoring";
import {
  GitBranch,
  Rocket,
  Building2,
  Cpu,
  Award,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Github,
  Sparkles,
  Minus,
  ArrowRight,
  FileEdit,
  Zap,
  Target,
  Copy,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DeepEvalDashboardProps {
  data: DeepEvalResult;
}

const CATEGORY_META = [
  {
    key: "self_projects" as const,
    label: "Engineering Projects",
    icon: Rocket,
    color: "blue",
    desc: "Architecture, system complexity & deployment",
    max: 30,
  },
  {
    key: "open_source" as const,
    label: "Open Source Telemetry",
    icon: GitBranch,
    color: "emerald",
    desc: "Community contributions & public repository impact",
    max: 35,
  },
  {
    key: "production" as const,
    label: "Production Impact",
    icon: Building2,
    color: "purple",
    desc: "Work experience & metric-backed delivery",
    max: 25,
  },
  {
    key: "technical_skills" as const,
    label: "Technical Stack Depth",
    icon: Cpu,
    color: "orange",
    desc: "Proficiency across languages, DBs, and clouds",
    max: 10,
  },
];

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; bar: string; badge: string }> = {
  emerald: {
    bg: "bg-emerald-500/5 dark:bg-emerald-500/10",
    border: "border-emerald-500/20 dark:border-emerald-500/30",
    text: "text-emerald-600 dark:text-emerald-400",
    bar: "bg-emerald-500 dark:bg-emerald-400",
    badge: "bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-400",
  },
  blue: {
    bg: "bg-[#5e6ad2]/5 dark:bg-[#5e6ad2]/10",
    border: "border-[#5e6ad2]/20 dark:border-[#5e6ad2]/30",
    text: "text-[#5e6ad2] dark:text-[#7d88e8]",
    bar: "bg-[#5e6ad2]",
    badge: "bg-[#5e6ad2]/10 border-[#5e6ad2]/25 text-[#5e6ad2] dark:text-[#7d88e8]",
  },
  purple: {
    bg: "bg-purple-500/5 dark:bg-purple-500/10",
    border: "border-purple-500/20 dark:border-purple-500/30",
    text: "text-purple-600 dark:text-purple-400",
    bar: "bg-purple-500 dark:bg-purple-400",
    badge: "bg-purple-500/10 border-purple-500/25 text-purple-600 dark:text-purple-400",
  },
  orange: {
    bg: "bg-amber-500/5 dark:bg-amber-500/10",
    border: "border-amber-500/20 dark:border-amber-500/30",
    text: "text-amber-600 dark:text-amber-400",
    bar: "bg-amber-500 dark:bg-amber-400",
    badge: "bg-amber-500/10 border-amber-500/25 text-amber-600 dark:text-amber-400",
  },
};

function getGradeColor(grade: string) {
  switch (grade) {
    case "Exceptional":
      return "text-emerald-600 dark:text-emerald-400";
    case "Strong":
      return "text-[#5e6ad2] dark:text-[#7d88e8]";
    case "Average":
      return "text-amber-600 dark:text-amber-400";
    case "Below Average":
      return "text-rose-600 dark:text-rose-400";
    case "Weak":
      return "text-rose-700 dark:text-rose-500";
    default:
      return "text-zinc-500 dark:text-[#8b8b9e]";
  }
}

function getGradeBg(grade: string) {
  switch (grade) {
    case "Exceptional":
      return "bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-400";
    case "Strong":
      return "bg-[#5e6ad2]/10 border-[#5e6ad2]/25 text-[#5e6ad2] dark:text-[#7d88e8]";
    case "Average":
      return "bg-amber-500/10 border-amber-500/25 text-amber-600 dark:text-amber-400";
    default:
      return "bg-rose-500/10 border-rose-500/25 text-rose-600 dark:text-rose-400";
  }
}

export function DeepEvalDashboard({ data }: DeepEvalDashboardProps) {
  const grade = deriveDeepEvalGrade(data.totalScore);
  const [copiedKeywords, setCopiedKeywords] = useState(false);

  const handleCopyKeywords = () => {
    if (data.missing_keywords && data.missing_keywords.length > 0) {
      navigator.clipboard.writeText(data.missing_keywords.join(", "));
      setCopiedKeywords(true);
      setTimeout(() => setCopiedKeywords(false), 2000);
    }
  };

  const projectPct = Math.round((data.scores.self_projects.score / 30) * 100);
  const openSourcePct = Math.round((data.scores.open_source.score / 35) * 100);
  const productionPct = Math.round((data.scores.production.score / 25) * 100);
  const techStackPct = Math.round((data.scores.technical_skills.score / 10) * 100);

  // Target Tier-1 cutoff is 85
  const gapToTier1 = Math.max(0, 85 - data.totalScore);

  return (
    <div className="space-y-6 text-left">
      {/* ── 1. EXECUTIVE KPI SUMMARY STRIP (4-KPI Ribbon) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI 1: Overall Score */}
        <div className="rounded-lg border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] px-4 py-3 flex flex-col justify-between shadow-subtle">
          <div className="text-[10px] text-zinc-500 dark:text-[#6e6e84] font-mono uppercase tracking-[0.06em] flex items-center justify-between">
            <span>Overall Score</span>
            <Award className="w-3.5 h-3.5 text-[#5e6ad2]" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className={cn("text-2xl font-bold font-mono tracking-tight tabular-nums", getGradeColor(grade))}>
              {data.totalScore}
            </span>
            <span className="text-xs text-zinc-400 font-mono">/ 120</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] font-medium">
            <span className={cn("w-1.5 h-1.5 rounded-full", data.totalScore >= 75 ? "bg-emerald-500" : data.totalScore >= 55 ? "bg-amber-500" : "bg-rose-500")} />
            <span className={getGradeColor(grade)}>{grade} Rating</span>
          </div>
        </div>

        {/* KPI 2: Project Architecture */}
        <div className="rounded-lg border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] px-4 py-3 flex flex-col justify-between shadow-subtle">
          <div className="text-[10px] text-zinc-500 dark:text-[#6e6e84] font-mono uppercase tracking-[0.06em] flex items-center justify-between">
            <span>Projects Architecture</span>
            <Rocket className="w-3.5 h-3.5 text-[#5e6ad2]" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono tracking-tight text-zinc-900 dark:text-[#ebebef] tabular-nums">
              {data.scores.self_projects.score}
            </span>
            <span className="text-xs text-zinc-400 font-mono">/ 30 ({projectPct}%)</span>
          </div>
          <span className="mt-1 text-[11px] text-zinc-500 dark:text-[#8b8b9e]">
            {projectPct >= 70 ? "Strong engineering complexity" : "Moderate system scope"}
          </span>
        </div>

        {/* KPI 3: Open Source Telemetry */}
        <div className="rounded-lg border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] px-4 py-3 flex flex-col justify-between shadow-subtle">
          <div className="text-[10px] text-zinc-500 dark:text-[#6e6e84] font-mono uppercase tracking-[0.06em] flex items-center justify-between">
            <span>Open Source Telemetry</span>
            <GitBranch className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono tracking-tight text-zinc-900 dark:text-[#ebebef] tabular-nums">
              {data.scores.open_source.score}
            </span>
            <span className="text-xs text-zinc-400 font-mono">/ 35 ({openSourcePct}%)</span>
          </div>
          <span className="mt-1 text-[11px] text-zinc-500 dark:text-[#8b8b9e]">
            {openSourcePct >= 50 ? "Active public contributions" : "Needs external repository PRs"}
          </span>
        </div>

        {/* KPI 4: Production Impact */}
        <div className="rounded-lg border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] px-4 py-3 flex flex-col justify-between shadow-subtle">
          <div className="text-[10px] text-zinc-500 dark:text-[#6e6e84] font-mono uppercase tracking-[0.06em] flex items-center justify-between">
            <span>Production Impact</span>
            <Building2 className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono tracking-tight text-zinc-900 dark:text-[#ebebef] tabular-nums">
              {data.scores.production.score}
            </span>
            <span className="text-xs text-zinc-400 font-mono">/ 25 ({productionPct}%)</span>
          </div>
          <span className="mt-1 text-[11px] text-zinc-500 dark:text-[#8b8b9e]">
            {productionPct >= 60 ? "Verified work metrics" : "Needs quantified impact metrics"}
          </span>
        </div>
      </div>

      {/* ── 2. BALANCED 2-COLUMN DEEP-DIVE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Column (5 cols): Score Overview & Diagnostic Gap Analysis */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div className="h-full rounded-xl border border-zinc-200/80 dark:border-[#1e1e2a] bg-zinc-100/90 dark:bg-[#101017] p-1.5 shadow-surface dark:shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
            <div className="h-full rounded-[9px] border border-zinc-200 dark:border-[#1a1a24] bg-white dark:bg-[#14141e] p-5 sm:p-6 flex flex-col justify-between space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-[#1c1c28] pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-[#2a2a38]" />
                    <span className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-[#2a2a38]" />
                    <span className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-[#2a2a38]" />
                  </div>
                  <span className="text-[11px] font-mono text-zinc-500 dark:text-[#8b8b9e] ml-1">
                    ats_score_gauge.sys
                  </span>
                </div>
                <div className={cn("px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border", getGradeBg(grade))}>
                  {grade}
                </div>
              </div>

              {/* Circular Score Gauge */}
              <div className="flex flex-col items-center justify-center py-2">
                <div className="relative w-36 h-36">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="72"
                      cy="72"
                      r="62"
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="9"
                      className="text-zinc-100 dark:text-[#1e1e2a]"
                    />
                    <m.circle
                      cx="72"
                      cy="72"
                      r="62"
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="9"
                      strokeDasharray={389.56}
                      initial={{ strokeDashoffset: 389.56 }}
                      animate={{
                        strokeDashoffset: 389.56 - (389.56 * data.totalScore) / 120,
                      }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className={getGradeColor(grade)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={cn("text-4xl font-extrabold font-mono tabular-nums tracking-tight", getGradeColor(grade))}>
                      {data.totalScore}
                    </span>
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-400 dark:text-[#8b8b9e]">
                      / 120 MAX
                    </span>
                  </div>
                </div>

                <div className="mt-3 text-center">
                  <div className="text-xs font-semibold text-zinc-900 dark:text-[#ebebef]">
                    Hiring-Agent Resume Index
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-[#8b8b9e] mt-0.5 max-w-[220px]">
                    Evaluated against multi-tier algorithmic screening rubrics
                  </p>
                </div>
              </div>

              {/* Benchmark Target Gap Bar */}
              <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-[#101017] border border-zinc-200 dark:border-[#1e1e2a] space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-zinc-500 dark:text-[#8b8b9e]">Target Tier-1 Cutoff:</span>
                  <span className="font-semibold text-zinc-800 dark:text-[#ebebef]">85+ Pts</span>
                </div>

                <div className="h-2 w-full bg-zinc-200 dark:bg-[#1e1e2a] rounded-full overflow-hidden relative">
                  <div
                    className={cn("h-full rounded-full transition-all duration-1000", data.totalScore >= 85 ? "bg-emerald-500" : "bg-[#5e6ad2]")}
                    style={{ width: `${Math.min(100, Math.round((data.totalScore / 120) * 100))}%` }}
                  />
                  {/* Tier 1 Marker Line at 85/120 = 70.8% */}
                  <div className="absolute top-0 bottom-0 left-[70.8%] w-[2px] bg-amber-500" title="Tier-1 Cutoff (85 pts)" />
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 dark:text-[#6e6e84]">
                  <span>Current: {data.totalScore} pts</span>
                  {gapToTier1 > 0 ? (
                    <span className="text-amber-600 dark:text-amber-400 font-semibold">
                      Gap: {gapToTier1} pts to Tier-1
                    </span>
                  ) : (
                    <span className="text-emerald-500 font-semibold">
                      Tier-1 Benchmark Met
                    </span>
                  )}
                </div>
              </div>

              {/* Diagnostic Key Takeaways */}
              <div className="space-y-2 text-xs">
                <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b8b9e]">
                  Diagnostic Synopsis
                </div>
                <div className="space-y-1.5 text-[11.5px] text-zinc-600 dark:text-[#a0a0b8]">
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5e6ad2] mt-1.5 shrink-0" />
                    <span>Projects score strong ({projectPct}%), demonstrating sound full-stack and architecture patterns.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span>Open source ({openSourcePct}%) lacks external multi-contributor pull requests.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                    <span>Bullet points need quantifiable impact metrics to unlock full production scoring.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): The 4 Core Evaluation Pillars */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div className="h-full rounded-xl border border-zinc-200/80 dark:border-[#1e1e2a] bg-zinc-100/90 dark:bg-[#101017] p-1.5 shadow-surface dark:shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
            <div className="h-full rounded-[9px] border border-zinc-200 dark:border-[#1a1a24] bg-white dark:bg-[#14141e] p-5 sm:p-6 space-y-4 flex flex-col justify-between">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-[#1c1c28] pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-[#2a2a38]" />
                    <span className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-[#2a2a38]" />
                    <span className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-[#2a2a38]" />
                  </div>
                  <span className="text-[11px] font-mono text-zinc-500 dark:text-[#8b8b9e] ml-1">
                    rubric_matrix_breakdown.eval
                  </span>
                </div>
                <span className="text-[10px] font-mono font-medium text-zinc-400 dark:text-[#8b8b9e]">
                  4 EVALUATION DOMAINS
                </span>
              </div>

              {/* 4 Category Cards in 2x2 Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {CATEGORY_META.map((cat) => {
                  const score = data.scores[cat.key];
                  const colors = COLOR_MAP[cat.color];
                  const pct = Math.min(100, Math.max(0, Math.round((score.score / score.max) * 100)));
                  const Icon = cat.icon;

                  return (
                    <div
                      key={cat.key}
                      className={cn(
                        "rounded-lg border p-4 space-y-2.5 bg-zinc-50/50 dark:bg-[#101017] hover:border-zinc-300 dark:hover:border-[#2e2e42] transition-colors flex flex-col justify-between",
                        colors.border
                      )}
                    >
                      {/* Category Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className={cn("p-1.5 rounded-[5px] border shrink-0", colors.badge)}>
                            <Icon size={13} />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-zinc-900 dark:text-[#ebebef]">
                              {cat.label}
                            </div>
                            <div className="text-[9.5px] text-zinc-400 dark:text-[#6e6e84] line-clamp-1">
                              {cat.desc}
                            </div>
                          </div>
                        </div>

                        <div className="text-right font-mono shrink-0">
                          <span className={cn("text-base font-bold", colors.text)}>
                            {score.score}
                          </span>
                          <span className="text-[10px] text-zinc-400">/{score.max}</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="h-1.5 w-full bg-zinc-200 dark:bg-[#1e1e2a] rounded-full overflow-hidden">
                          <div
                            style={{ width: `${pct}%` }}
                            className={cn("h-full rounded-full transition-all duration-700", colors.bar)}
                          />
                        </div>
                        <div className="flex justify-between text-[9px] font-mono text-zinc-400 dark:text-[#6e6e84]">
                          <span>Domain Score</span>
                          <span>{pct}%</span>
                        </div>
                      </div>

                      {/* Evidence Snippet */}
                      <div className="pt-1 border-t border-zinc-200/60 dark:border-[#1e1e2a]">
                        <p className="text-[11px] text-zinc-600 dark:text-[#a0a0b8] leading-relaxed line-clamp-3">
                          {score.evidence}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bonus / Deduction Indicator Pill */}
              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-[#101017] border border-zinc-200 dark:border-[#1e1e2a] flex flex-wrap items-center justify-between text-xs font-mono gap-2">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <TrendingUp size={13} />
                  <span>Bonus Credits: +{data.bonus_points.total} pts</span>
                </div>
                <span className="text-zinc-300 dark:text-zinc-700">•</span>
                <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                  <Minus size={13} />
                  <span>Deductions: {data.deductions.total > 0 ? `-${data.deductions.total} pts` : "0 pts"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. SYMMETRICAL AUDIT FINDINGS (Strengths vs Improvement Vectors) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Card: Verified Strengths & Bonus Credits */}
        <div className="rounded-xl border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] p-5 sm:p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-[#1c1c28] pb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <CheckCircle2 size={15} />
              <span>Verified Candidate Strengths</span>
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              +{data.bonus_points.total} Bonus Pts
            </span>
          </div>

          {/* Bonus Breakdown Strip */}
          {data.bonus_points.breakdown && (
            <div className="p-2.5 rounded bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 text-xs text-zinc-600 dark:text-[#a0a0b8]">
              <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">Bonus Credit Reason: </strong>
              {data.bonus_points.breakdown}
            </div>
          )}

          {/* Strengths List */}
          <ul className="space-y-2.5">
            {data.key_strengths.map((strength, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-xs text-zinc-700 dark:text-[#c4c4d4] leading-relaxed"
              >
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Card: Target Improvement Vectors & Deductions */}
        <div className="rounded-xl border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] p-5 sm:p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-[#1c1c28] pb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-2">
              <AlertTriangle size={15} />
              <span>Critical Optimization Vectors</span>
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              {data.deductions.total > 0 ? `-${data.deductions.total} Deductions` : "0 Deductions"}
            </span>
          </div>

          {/* Deduction Explanation Strip */}
          <div className="p-2.5 rounded bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-xs text-zinc-600 dark:text-[#a0a0b8]">
            <strong className="text-amber-600 dark:text-amber-400 font-semibold">Deduction Status: </strong>
            {data.deductions.reasons || "Clean format! No structural parser penalties applied."}
          </div>

          {/* Improvements List */}
          <ul className="space-y-2.5">
            {data.areas_for_improvement.map((area, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-xs text-zinc-700 dark:text-[#c4c4d4] leading-relaxed"
              >
                <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                <span>{area}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── 4. MISSING JOB DESCRIPTION KEYWORDS (If Any) ── */}
      {data.missing_keywords && data.missing_keywords.length > 0 && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 dark:bg-rose-500/10 p-5 sm:p-6 shadow-subtle space-y-3">
          <div className="flex items-center justify-between border-b border-rose-500/20 pb-2.5">
            <div className="flex items-center gap-2">
              <AlertTriangle size={15} className="text-rose-600 dark:text-rose-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Missing Job Description Keywords ({data.missing_keywords.length} Detected)
              </h3>
            </div>
            <button
              onClick={handleCopyKeywords}
              className="inline-flex items-center gap-1.5 text-[11px] font-mono text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors cursor-pointer"
            >
              {copiedKeywords ? (
                <>
                  <Check size={12} />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Copy Keywords</span>
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-zinc-600 dark:text-[#8b8b9e]">
            These skills or technologies were specified in the target role taxonomy but were not detected by the parser in your resume. Incorporate them into your project bullets to pass vector similarity filters:
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {data.missing_keywords.map((kw, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded bg-white dark:bg-[#14141e] text-rose-600 dark:text-rose-400 text-xs font-mono font-medium border border-rose-500/25 shadow-xs"
              >
                + {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── 5. ACTIONABLE RESUME BUILDER BRIDGE ── */}
      <div className="rounded-xl border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50 dark:bg-[#101017] p-6 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-subtle">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5e6ad2] animate-pulse" />
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-[#ebebef]">
              Ready to lift your score from {data.totalScore} to 85+?
            </h4>
          </div>
          <p className="text-xs text-zinc-500 dark:text-[#8b8b9e] max-w-xl">
            Launch MockMate AI Resume Builder to automatically rewrite bullet points with the Google X-Y-Z formula, inject missing keywords, and export an ATS-certified PDF.
          </p>
        </div>

        <Link
          href="/resume-builder"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#5e6ad2] hover:bg-[#4f5ac4] text-white text-xs font-semibold transition-all shadow-md shadow-[#5e6ad2]/25 shrink-0"
        >
          <FileEdit size={14} />
          <span>Launch AI Resume Builder</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
