"use client";

import React, { useState, useMemo } from "react";
import { m, AnimatePresence } from "framer-motion";
import {
  Target,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Sparkles,
  ArrowRight,
  BookOpen,
  Award,
  Zap,
  ShieldCheck,
  Filter,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  GraduationCap
} from "lucide-react";
import Link from "next/link";
import { CareerAnalysisResult, SkillGap, Skill, Strength, LearningStep } from "@/types/career";
import { resolveCategory } from "@/lib/quiz-registry";

interface SkillGapSectionProps {
  missingSkills: SkillGap[];
  extractedSkills: Skill[];
  strengths?: Strength[];
  roadmap: LearningStep[];
  jobRole: string;
  matchScore: number;
  getQuizLink: (quizType: SkillGap["recommendedQuiz"]) => string | null;
  onNavigateToRoadmap?: () => void;
}

type StatusFilter = "all" | "blockers" | "growth" | "matched";
type CategoryFilter = "all" | "technical" | "soft" | "domain";

export const SkillGapSection: React.FC<SkillGapSectionProps> = ({
  missingSkills,
  extractedSkills,
  strengths = [],
  roadmap,
  jobRole,
  matchScore,
  getQuizLink,
  onNavigateToRoadmap,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [expandedStrengthSkill, setExpandedStrengthSkill] = useState<string | null>(null);

  // Strength map by lowercase skill name for quick lookup
  const strengthMap = useMemo(() => {
    const map = new Map<string, Strength>();
    strengths.forEach((s) => {
      map.set(s.skill.toLowerCase().trim(), s);
    });
    return map;
  }, [strengths]);

  // Derived counts
  const highPriorityGaps = useMemo(
    () => missingSkills.filter((s) => s.importance === "high"),
    [missingSkills]
  );
  const secondaryGaps = useMemo(
    () => missingSkills.filter((s) => s.importance !== "high"),
    [missingSkills]
  );

  const totalCompetencies = extractedSkills.length + missingSkills.length;
  const coveragePercent = totalCompetencies > 0
    ? Math.round((extractedSkills.length / totalCompetencies) * 100)
    : matchScore;

  // Filter missing skills
  const filteredMissingSkills = useMemo(() => {
    if (statusFilter === "matched") return [];

    return missingSkills.filter((gap) => {
      // Status filter
      if (statusFilter === "blockers" && gap.importance !== "high") return false;
      if (statusFilter === "growth" && gap.importance === "high") return false;

      // Category filter
      if (categoryFilter !== "all" && gap.category !== categoryFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = gap.skill.toLowerCase().includes(query);
        const matchesCategory = gap.category.toLowerCase().includes(query);
        const matchesImportance = gap.importance.toLowerCase().includes(query);
        if (!matchesName && !matchesCategory && !matchesImportance) return false;
      }

      return true;
    });
  }, [missingSkills, statusFilter, categoryFilter, searchQuery]);

  // Filter matched skills
  const filteredExtractedSkills = useMemo(() => {
    if (statusFilter === "blockers" || statusFilter === "growth") return [];

    return extractedSkills.filter((skill) => {
      // Category filter
      if (categoryFilter !== "all" && skill.category !== categoryFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = skill.name.toLowerCase().includes(query);
        const matchesCategory = skill.category.toLowerCase().includes(query);
        if (!matchesName && !matchesCategory) return false;
      }

      return true;
    });
  }, [extractedSkills, statusFilter, categoryFilter, searchQuery]);

  const totalVisibleCount = filteredMissingSkills.length + filteredExtractedSkills.length;

  // Helper to find roadmap step that addresses a skill
  const findRoadmapStepForSkill = (skillName: string): LearningStep | null => {
    const lower = skillName.toLowerCase().trim();
    for (const step of roadmap) {
      if (
        step.title.toLowerCase().includes(lower) ||
        step.description.toLowerCase().includes(lower) ||
        step.milestone.toLowerCase().includes(lower) ||
        step.resources.some((r) => r.name.toLowerCase().includes(lower))
      ) {
        return step;
      }
    }
    return null;
  };

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setCategoryFilter("all");
  };

  return (
    <div className="space-y-6">
      {/* ─────────────────────────────────────────────────────────────
          1. STRATEGIC GAP HEALTH & EXECUTIVE MATRIX BANNER
         ───────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] p-5 sm:p-6 shadow-subtle space-y-6 relative overflow-hidden">
        {/* Subtle Horizon Glow */}
        <div className="absolute top-0 right-0 w-80 h-32 bg-[#5e6ad2]/5 blur-2xl pointer-events-none" />

        {/* Header Title & Coverage Gauge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-[#1e1e2a] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#5e6ad2]/10 text-[#5e6ad2] flex items-center justify-center">
                <Target size={15} />
              </span>
              <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-[#ebebef]">
                Competency Gap Matrix
              </h3>
            </div>
            <p className="text-xs text-zinc-500 dark:text-[#8b8b9e]">
              Rigorous breakdown of required proficiencies, critical screening blockers, and verified resume strengths for{" "}
              <span className="font-semibold text-zinc-800 dark:text-[#ebebef] capitalize">{jobRole}</span>.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-zinc-50 dark:bg-[#0d0d12] border border-zinc-200/80 dark:border-[#1e1e2a] px-3.5 py-2 rounded-xl self-start sm:self-auto shrink-0">
            <div className="text-right">
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 dark:text-[#8b8b9e]">
                Competency Coverage
              </div>
              <div className="text-xs font-semibold text-zinc-800 dark:text-[#ebebef]">
                {extractedSkills.length} of {totalCompetencies} Verified
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              {coveragePercent}%
            </div>
          </div>
        </div>

        {/* Dual-Tone Segmented Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-500 dark:text-[#8b8b9e]">
            <span>Profile Capability Balance</span>
            <span>{extractedSkills.length} Matched • {missingSkills.length} Gaps</span>
          </div>
          <div className="w-full h-2.5 rounded-full overflow-hidden bg-zinc-100 dark:bg-[#0d0d12] flex gap-1 p-0.5 border border-zinc-200/80 dark:border-[#1e1e2a]">
            {/* Matched green segment */}
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-700"
              style={{ width: `${(extractedSkills.length / Math.max(1, totalCompetencies)) * 100}%` }}
              title={`${extractedSkills.length} Matched Competencies`}
            />
            {/* High priority gap rose segment */}
            <div
              className="h-full bg-rose-500 rounded-full transition-all duration-700"
              style={{ width: `${(highPriorityGaps.length / Math.max(1, totalCompetencies)) * 100}%` }}
              title={`${highPriorityGaps.length} Critical Blockers`}
            />
            {/* Secondary gap amber segment */}
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-700"
              style={{ width: `${(secondaryGaps.length / Math.max(1, totalCompetencies)) * 100}%` }}
              title={`${secondaryGaps.length} Growth Opportunities`}
            />
          </div>
        </div>

        {/* Interactive 3-Metric Health Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Tile 1: Critical Blockers */}
          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === "blockers" ? "all" : "blockers")}
            className={`p-4 rounded-xl text-left transition-all cursor-pointer border ${
              statusFilter === "blockers"
                ? "bg-rose-500/15 border-rose-500/40 shadow-sm"
                : "bg-zinc-50 dark:bg-[#0d0d12] border-zinc-200/80 dark:border-[#1e1e2a] hover:border-rose-500/30"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <AlertTriangle size={13} />
                <span>Critical Blockers</span>
              </span>
              <span className="text-lg font-bold font-mono text-rose-600 dark:text-rose-400">
                {highPriorityGaps.length}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-[#8b8b9e] mt-1.5 leading-snug">
              Essential screening gates. Must be closed to pass primary recruiter evaluations.
            </p>
          </button>

          {/* Tile 2: Growth Competencies */}
          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === "growth" ? "all" : "growth")}
            className={`p-4 rounded-xl text-left transition-all cursor-pointer border ${
              statusFilter === "growth"
                ? "bg-amber-500/15 border-amber-500/40 shadow-sm"
                : "bg-zinc-50 dark:bg-[#0d0d12] border-zinc-200/80 dark:border-[#1e1e2a] hover:border-amber-500/30"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <Zap size={13} />
                <span>Growth & Polish</span>
              </span>
              <span className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400">
                {secondaryGaps.length}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-[#8b8b9e] mt-1.5 leading-snug">
              Competitive differentiators that elevate seniority banding and offer compensation.
            </p>
          </button>

          {/* Tile 3: Verified Capabilities */}
          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === "matched" ? "all" : "matched")}
            className={`p-4 rounded-xl text-left transition-all cursor-pointer border ${
              statusFilter === "matched"
                ? "bg-emerald-500/15 border-emerald-500/40 shadow-sm"
                : "bg-zinc-50 dark:bg-[#0d0d12] border-zinc-200/80 dark:border-[#1e1e2a] hover:border-emerald-500/30"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 size={13} />
                <span>Resume Verified</span>
              </span>
              <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {extractedSkills.length}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-[#8b8b9e] mt-1.5 leading-snug">
              Demonstrated proficiencies extracted with direct experience proof from your resume.
            </p>
          </button>
        </div>

        {/* AI Strategic Action Synthesis */}
        <div className="p-3.5 rounded-xl bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 flex items-start gap-3 text-xs leading-relaxed text-zinc-700 dark:text-[#d0d0e0]">
          <Sparkles size={16} className="text-[#5e6ad2] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold text-zinc-900 dark:text-[#ebebef]">
              Targeted Progression Vector:
            </span>{" "}
            {highPriorityGaps.length > 0 ? (
              <span>
                Resolving your <strong>{highPriorityGaps.length} critical blocker{highPriorityGaps.length > 1 ? "s" : ""}</strong> (
                {highPriorityGaps.slice(0, 3).map((g) => g.skill).join(", ")}
                {highPriorityGaps.length > 3 ? "..." : ""}) removes immediate screening hurdles for{" "}
                <span className="capitalize font-medium">{jobRole}</span>, projecting your readiness score to{" "}
                <strong className="text-emerald-600 dark:text-emerald-400 font-mono">
                  {Math.min(95, matchScore + highPriorityGaps.length * 7)}%
                </strong>.
              </span>
            ) : (
              <span>
                All foundational technical prerequisites for <span className="capitalize font-medium">{jobRole}</span> are verified in your resume. Focus on the secondary growth milestones to solidify upper-band leveling.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. SEARCH & MULTI-DIMENSIONAL FILTER TOOLBAR
         ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-[#8b8b9e]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search competencies (e.g., Python, Kubernetes, System Design)..."
            className="w-full pl-9 pr-8 py-2 rounded-xl text-xs bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] text-zinc-900 dark:text-[#ebebef] placeholder:text-zinc-400 dark:placeholder:text-[#6a6a80] focus:outline-none focus:border-[#5e6ad2] transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-[#ebebef] p-1 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Segmented Controls: Status & Category */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tabs */}
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-[#0d0d12] border border-zinc-200 dark:border-[#1e1e2a] text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                statusFilter === "all"
                  ? "bg-white dark:bg-[#1e1e2a] text-zinc-900 dark:text-[#ebebef] shadow-subtle"
                  : "text-zinc-500 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-[#ebebef]"
              }`}
            >
              All ({totalCompetencies})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("blockers")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                statusFilter === "blockers"
                  ? "bg-white dark:bg-[#1e1e2a] text-rose-600 dark:text-rose-400 shadow-subtle font-semibold"
                  : "text-zinc-500 dark:text-[#8b8b9e] hover:text-rose-600 dark:hover:text-rose-400"
              }`}
            >
              Blockers ({highPriorityGaps.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("growth")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                statusFilter === "growth"
                  ? "bg-white dark:bg-[#1e1e2a] text-amber-600 dark:text-amber-400 shadow-subtle font-semibold"
                  : "text-zinc-500 dark:text-[#8b8b9e] hover:text-amber-600 dark:hover:text-amber-400"
              }`}
            >
              Growth ({secondaryGaps.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("matched")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                statusFilter === "matched"
                  ? "bg-white dark:bg-[#1e1e2a] text-emerald-600 dark:text-emerald-400 shadow-subtle font-semibold"
                  : "text-zinc-500 dark:text-[#8b8b9e] hover:text-emerald-600 dark:hover:text-emerald-400"
              }`}
            >
              Matched ({extractedSkills.length})
            </button>
          </div>

          {/* Category Filter Dropdown / Pills */}
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-[#0d0d12] border border-zinc-200 dark:border-[#1e1e2a] text-xs">
            {(["all", "technical", "soft", "domain"] as CategoryFilter[]).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-lg font-medium capitalize transition-all cursor-pointer ${
                  categoryFilter === cat
                    ? "bg-white dark:bg-[#1e1e2a] text-zinc-900 dark:text-[#ebebef] shadow-subtle font-semibold"
                    : "text-zinc-500 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-[#ebebef]"
                }`}
              >
                {cat === "all" ? "All Types" : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active filter summary pill if filtered */}
      {(statusFilter !== "all" || categoryFilter !== "all" || searchQuery) && (
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-[#8b8b9e] px-1">
          <div className="flex items-center gap-1.5">
            <Filter size={12} className="text-[#5e6ad2]" />
            <span>
              Showing {totalVisibleCount} of {totalCompetencies} competencies
              {searchQuery && ` matching "${searchQuery}"`}
            </span>
          </div>
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-1 text-[#5e6ad2] hover:underline cursor-pointer font-medium"
          >
            <RotateCcw size={11} />
            <span>Reset filters</span>
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. MISSING SKILL GAP CARDS (Actionable & High-Density)
         ───────────────────────────────────────────────────────────── */}
      {filteredMissingSkills.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <span>Identified Competency Gaps ({filteredMissingSkills.length})</span>
            </span>
            <span className="text-[11px] text-zinc-400 font-mono">
              Actionable milestones & verification tests
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {filteredMissingSkills.map((gap, idx) => {
              const isHigh = gap.importance === "high";
              const isMedium = gap.importance === "medium";
              const mappedStep = findRoadmapStepForSkill(gap.skill);
              const quizCategory = gap.recommendedQuiz ? resolveCategory(gap.recommendedQuiz) : null;
              const quizRoute = gap.recommendedQuiz ? getQuizLink(gap.recommendedQuiz) : null;

              return (
                <m.div
                  key={`${gap.skill}-${idx}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className={`rounded-2xl bg-white dark:bg-[#14141e] border transition-all p-5 sm:p-6 shadow-subtle ${
                    isHigh
                      ? "border-rose-500/30 hover:border-rose-500/60 dark:bg-gradient-to-r dark:from-[#14141e] dark:to-rose-950/10"
                      : isMedium
                      ? "border-amber-500/30 hover:border-amber-500/60"
                      : "border-zinc-200 dark:border-[#1e1e2a] hover:border-zinc-300 dark:hover:border-[#2a2a3c]"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    {/* Left: Skill Identity, Severity, Context */}
                    <div className="space-y-2.5 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Priority Badge */}
                        {isHigh ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                            <AlertTriangle size={11} />
                            <span>Critical Screening Blocker</span>
                          </span>
                        ) : isMedium ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                            <Zap size={11} />
                            <span>Competitive Advantage</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-zinc-100 dark:bg-[#1e1e2a] text-zinc-600 dark:text-[#8b8b9e] border border-zinc-200 dark:border-[#2a2a3c]">
                            <span>Supplementary Growth</span>
                          </span>
                        )}

                        {/* Category Badge */}
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono capitalize bg-zinc-100 dark:bg-[#1a1a28] text-zinc-600 dark:text-[#8b8b9e] border border-zinc-200 dark:border-[#26263a]">
                          {gap.category} Competency
                        </span>
                      </div>

                      {/* Skill Name */}
                      <div className="space-y-1">
                        <h4 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-[#ebebef] tracking-tight">
                          {gap.skill}
                        </h4>
                        <p className="text-xs text-zinc-600 dark:text-[#8b8b9e] leading-relaxed">
                          {isHigh
                            ? `Frequently evaluated in primary technical filters and live rounds for ${jobRole}. Lack of verified background in this area represents a direct gating obstacle.`
                            : isMedium
                            ? `Expected for upper-band execution and autonomy in this role. Demonstrating proficiency during interviews accelerates leveling decisions.`
                            : `Helpful auxiliary tool in the broader engineering stack that expands day-to-day productivity.`}
                        </p>
                      </div>

                      {/* Bridge to Roadmap Phase if mapped */}
                      {mappedStep && (
                        <div className="flex flex-wrap items-center gap-2 pt-0.5">
                          <span className="text-[11px] font-mono text-zinc-400">Target Resolution:</span>
                          <button
                            type="button"
                            onClick={onNavigateToRoadmap}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#5e6ad2]/10 hover:bg-[#5e6ad2]/20 border border-[#5e6ad2]/20 text-[11px] font-medium text-[#5e6ad2] transition-colors cursor-pointer group"
                          >
                            <BookOpen size={12} />
                            <span>{mappedStep.title} ({mappedStep.duration})</span>
                            <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Right: Direct Assessment or Action Callout */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-center gap-2.5 shrink-0 border-t lg:border-t-0 border-zinc-100 dark:border-[#1e1e2a] pt-3 lg:pt-0">
                      {quizRoute ? (
                        <Link
                          href={quizRoute}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5e6ad2] hover:bg-[#4f5ac4] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer whitespace-nowrap active:scale-95 shadow-[#5e6ad2]/20"
                        >
                          <GraduationCap size={14} />
                          <span>Practice {quizCategory?.name || gap.skill} Quiz</span>
                          <ExternalLink size={12} />
                        </Link>
                      ) : onNavigateToRoadmap ? (
                        <button
                          type="button"
                          onClick={onNavigateToRoadmap}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-[#1e1e2a] hover:bg-zinc-200 dark:hover:bg-[#28283c] border border-zinc-200 dark:border-[#2a2a3c] text-xs font-medium text-zinc-800 dark:text-[#ebebef] transition-all cursor-pointer"
                        >
                          <BookOpen size={13} className="text-[#5e6ad2]" />
                          <span>View Learning Plan</span>
                        </button>
                      ) : null}

                      <span className="text-[10px] font-mono text-zinc-400 dark:text-[#6a6a80]">
                        {isHigh ? "Priority: Critical Screening" : isMedium ? "Priority: Recommended" : "Priority: Elective"}
                      </span>
                    </div>
                  </div>
                </m.div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. VERIFIED MATCHED COMPETENCIES DOSSIER
         ───────────────────────────────────────────────────────────── */}
      {filteredExtractedSkills.length > 0 && (
        <div className="rounded-2xl bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] p-5 sm:p-6 shadow-subtle space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 dark:border-[#1e1e2a] pb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 size={14} />
              </span>
              <h4 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-[#ebebef]">
                Verified Competencies from Resume ({filteredExtractedSkills.length})
              </h4>
            </div>
            <span className="text-xs font-mono text-zinc-400">
              Validated against target role requirements
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredExtractedSkills.map((skill, idx) => {
              const strength = strengthMap.get(skill.name.toLowerCase().trim());
              const isExpanded = expandedStrengthSkill === skill.name;

              return (
                <div
                  key={`${skill.name}-${idx}`}
                  className={`p-3.5 rounded-xl border transition-all ${
                    strength
                      ? "bg-emerald-500/[0.04] border-emerald-500/20 hover:border-emerald-500/40"
                      : "bg-zinc-50 dark:bg-[#0d0d12] border-zinc-200/80 dark:border-[#1e1e2a] hover:border-zinc-300 dark:hover:border-[#2a2a3c]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-xs text-zinc-900 dark:text-[#ebebef] flex items-center gap-1.5 truncate">
                      <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                      <span className="truncate">{skill.name}</span>
                    </span>

                    {strength ? (
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 font-bold shrink-0">
                        {strength.level}
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono capitalize px-1.5 py-0.5 rounded bg-zinc-200/60 dark:bg-[#1e1e2a] text-zinc-500 dark:text-[#8b8b9e] shrink-0">
                        {skill.category}
                      </span>
                    )}
                  </div>

                  {/* Resume Evidence Spotlight if candidate strength has evidence */}
                  {strength && (
                    <div className="mt-2 pt-2 border-t border-emerald-500/10">
                      <button
                        type="button"
                        onClick={() => setExpandedStrengthSkill(isExpanded ? null : skill.name)}
                        className="text-[11px] text-[#5e6ad2] hover:underline flex items-center justify-between w-full cursor-pointer"
                      >
                        <span className="font-medium">Resume Evidence</span>
                        {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <m.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-[11px] text-zinc-600 dark:text-[#8b8b9e] mt-1.5 leading-relaxed italic bg-emerald-500/[0.06] p-2 rounded-lg"
                          >
                            &ldquo;{strength.evidence}&rdquo;
                          </m.p>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. EMPTY STATE WHEN FILTERS PRODUCE ZERO RESULTS
         ───────────────────────────────────────────────────────────── */}
      {totalVisibleCount === 0 && (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] shadow-subtle space-y-3">
          <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-[#0d0d12] text-zinc-400 flex items-center justify-center mx-auto">
            <Search size={18} />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-[#ebebef]">
              No matching competencies found
            </h4>
            <p className="text-xs text-zinc-500 dark:text-[#8b8b9e] max-w-sm mx-auto">
              No skills match your current search query or active filter selections.
            </p>
          </div>
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#5e6ad2] text-white hover:bg-[#4f5ac4] transition-all cursor-pointer"
          >
            <RotateCcw size={12} />
            <span>Reset All Filters</span>
          </button>
        </div>
      )}
    </div>
  );
};
