"use client";

import { m } from "framer-motion";
import { DeepEvalResult, deriveDeepEvalGrade } from "@/types/deep-eval";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DeepEvalDashboardProps {
  data: DeepEvalResult;
}

const CATEGORY_META = [
  {
    key: "open_source" as const,
    label: "Open Source",
    icon: GitBranch,
    color: "emerald",
    desc: "Contributions to community projects",
  },
  {
    key: "self_projects" as const,
    label: "Self Projects",
    icon: Rocket,
    color: "blue",
    desc: "Personal project complexity & impact",
  },
  {
    key: "production" as const,
    label: "Production",
    icon: Building2,
    color: "purple",
    desc: "Real-world & internship experience",
  },
  {
    key: "technical_skills" as const,
    label: "Technical Skills",
    icon: Cpu,
    color: "orange",
    desc: "Breadth & depth of tech stack",
  },
];

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; bar: string; badge: string }> = {
  emerald: {
    bg: "bg-emerald-500/5",
    border: "border-emerald-500/10",
    text: "text-emerald-400",
    bar: "bg-emerald-400",
    badge: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  },
  blue: {
    bg: "bg-blue-500/5",
    border: "border-blue-500/10",
    text: "text-blue-400",
    bar: "bg-blue-400",
    badge: "bg-blue-500/10 border-blue-500/20 text-blue-400",
  },
  purple: {
    bg: "bg-purple-500/5",
    border: "border-purple-500/10",
    text: "text-purple-400",
    bar: "bg-purple-400",
    badge: "bg-purple-500/10 border-purple-500/20 text-purple-400",
  },
  orange: {
    bg: "bg-orange-500/5",
    border: "border-orange-500/10",
    text: "text-orange-400",
    bar: "bg-orange-400",
    badge: "bg-orange-500/10 border-orange-500/20 text-orange-400",
  },
};

function getGradeColor(grade: string) {
  switch (grade) {
    case "Exceptional":
      return "text-emerald-400";
    case "Strong":
      return "text-blue-400";
    case "Average":
      return "text-orange-400";
    case "Below Average":
      return "text-red-400";
    case "Weak":
      return "text-red-500";
    default:
      return "text-gray-400";
  }
}

function getGradeBg(grade: string) {
  switch (grade) {
    case "Exceptional":
      return "bg-emerald-500/10 border-emerald-500/20";
    case "Strong":
      return "bg-blue-500/10 border-blue-500/20";
    case "Average":
      return "bg-orange-500/10 border-orange-500/20";
    default:
      return "bg-red-500/10 border-red-500/20";
  }
}

function getScoreArcColor(score: number, max: number) {
  const pct = (score / max) * 100;
  if (pct >= 70) return "text-emerald-400";
  if (pct >= 40) return "text-orange-400";
  return "text-red-400";
}

export function DeepEvalDashboard({ data }: DeepEvalDashboardProps) {
  const grade = deriveDeepEvalGrade(data.totalScore);

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <m.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full">
          <Sparkles size={14} className="text-purple-400" />
          <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">
            Hiring Agent Resume Score
          </span>
        </div>
        {data.hasGitHubData && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800/50 border border-white/5 rounded-full">
            <Github size={12} className="text-gray-400" />
            <span className="text-[10px] font-bold text-gray-400">GitHub Enriched</span>
          </div>
        )}
      </m.div>

      {/* Total Score Card + Category Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Total Score Gauge */}
        <m.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-4 bg-gray-900/60 border border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-10 transition-opacity">
            <Award size={200} />
          </div>

          <div className="relative w-44 h-44 mb-6">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="88"
                cy="88"
                r="80"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="10"
                className="text-white/5"
              />
              <m.circle
                cx="88"
                cy="88"
                r="80"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="10"
                strokeDasharray={502.65}
                initial={{ strokeDashoffset: 502.65 }}
                animate={{
                  strokeDashoffset: 502.65 - (502.65 * data.totalScore) / 120,
                }}
                transition={{ duration: 1.8, ease: "easeOut" }}
                className={getGradeColor(grade)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className={cn(
                  "text-5xl font-black tabular-nums tracking-tighter",
                  getGradeColor(grade)
                )}
              >
                {data.totalScore}
              </span>
              <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">
                / 120
              </span>
            </div>
          </div>

          <div
            className={cn(
              "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border",
              getGradeBg(grade),
              getGradeColor(grade)
            )}
          >
            {grade}
          </div>
        </m.div>

        {/* Category Score Cards */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CATEGORY_META.map((cat, i) => {
            const score = data.scores[cat.key];
            const colors = COLOR_MAP[cat.color];
            const pct = Math.min(100, Math.max(0, (score.score / score.max) * 100));
            const Icon = cat.icon;

            return (
              <m.div
                key={cat.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                className={cn(
                  "rounded-2xl border p-5 space-y-3",
                  colors.bg,
                  colors.border
                )}
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon size={16} className={colors.text} />
                    <span className="text-xs font-bold text-gray-300">
                      {cat.label}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-0.5">
                    <span className={cn("text-xl font-black tabular-nums", colors.text)}>
                      {score.score}
                    </span>
                    <span className="text-gray-500 text-[10px] font-bold">
                      /{score.max}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <m.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: 0.4 + i * 0.1, duration: 0.8 }}
                    className={cn("h-full rounded-full", colors.bar)}
                  />
                </div>

                {/* Evidence */}
                <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-3">
                  {score.evidence}
                </p>
              </m.div>
            );
          })}
        </div>
      </div>

      {/* Bonus + Deductions Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bonus Points */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-2">
              <TrendingUp size={14} />
              Bonus Points
            </h3>
            <span className="text-lg font-black text-emerald-400 tabular-nums">
              +{data.bonus_points.total}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            {data.bonus_points.breakdown}
          </p>
        </m.div>

        {/* Deductions */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-red-400 flex items-center gap-2">
              <Minus size={14} />
              Deductions
            </h3>
            <span className="text-lg font-black text-red-400 tabular-nums">
              {data.deductions.total > 0 ? `-${data.deductions.total}` : "0"}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            {data.deductions.reasons || "No deductions applied."}
          </p>
        </m.div>
      </div>

      {/* Strengths + Improvements Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Key Strengths */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-900/40 border border-white/5 rounded-2xl p-6"
        >
          <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-4 flex items-center gap-2">
            <CheckCircle2 size={14} />
            Key Strengths
          </h3>
          <ul className="space-y-2.5">
            {data.key_strengths.map((strength, i) => (
              <m.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.05 }}
                className="flex gap-2 text-xs text-gray-300 leading-relaxed"
              >
                <CheckCircle2
                  size={14}
                  className="text-emerald-400 shrink-0 mt-0.5"
                />
                {strength}
              </m.li>
            ))}
          </ul>
        </m.div>

        {/* Areas for Improvement */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="bg-gray-900/40 border border-white/5 rounded-2xl p-6"
        >
          <h3 className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-4 flex items-center gap-2">
            <AlertTriangle size={14} />
            Areas for Improvement
          </h3>
          <ul className="space-y-2.5">
            {data.areas_for_improvement.map((area, i) => (
              <m.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.75 + i * 0.05 }}
                className="flex gap-2 text-xs text-gray-300 leading-relaxed"
              >
                <AlertTriangle
                  size={14}
                  className="text-orange-400 shrink-0 mt-0.5"
                />
                {area}
              </m.li>
            ))}
          </ul>
        </m.div>
      </div>

      {/* Missing Keywords Row */}
      {data.missing_keywords && data.missing_keywords.length > 0 && (
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6"
        >
          <h3 className="text-xs font-bold uppercase tracking-widest text-red-400 mb-4 flex items-center gap-2">
            <AlertTriangle size={14} />
            Missing Job Description Keywords
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            The ATS system did not find these important keywords from the Job Description in your resume. Consider adding them if you possess these skills.
          </p>
          <div className="flex flex-wrap gap-2">
            {data.missing_keywords.map((kw, i) => (
              <span
                key={i}
                className="px-3 py-1.5 bg-red-500/10 text-red-400 text-xs font-bold rounded-lg border border-red-500/20"
              >
                {kw}
              </span>
            ))}
          </div>
        </m.div>
      )}
    </div>
  );
}
