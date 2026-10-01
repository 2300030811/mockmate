"use client";

import React from "react";
import { m, AnimatePresence } from "framer-motion";
import {
  Award,
  Target,
  TrendingUp,
  ArrowRight,
  Compass,
  MessageSquare,
  FileText,
  CheckCircle2,
  XCircle,
  Sparkles,
  BookOpen,
  BriefcaseBusiness,
  Loader2,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { CareerAnalysisResult, SkillGap } from "@/types/career";
import { AtsScoreResult } from "@/types/ats-score";
import { AtsScoreDashboard } from "@/components/career-path/AtsScoreDashboard";
import { FixSuggestions } from "@/components/career-path/FixSuggestions";
import { resolveCategory } from "@/lib/quiz-registry";

import { StatCard } from "@/components/career-path/sections/StatCard";
import { ResumeSection } from "@/components/career-path/sections/ResumeSection";
import { InterviewPrepSection } from "@/components/career-path/sections/InterviewPrepSection";
import { MarketPulseSection } from "@/components/career-path/sections/MarketPulseSection";
import { StrengthsSection } from "@/components/career-path/sections/StrengthsSection";
import { RoleSuggestionsSection } from "@/components/career-path/sections/RoleSuggestionsSection";
import { CompetitiveEdgeCard } from "@/components/career-path/sections/CompetitiveEdgeCard";
import { LevelStrategyCard } from "@/components/career-path/sections/LevelStrategyCard";
import { SkillGapSection } from "@/components/career-path/sections/SkillGapSection";
import { RoadmapTab } from "@/components/career-path/sections/RoadmapTab";
import { CareerOpsPanel } from "@/components/career-path/CareerOpsPanel";

interface CareerDashboardProps {
  data: CareerAnalysisResult;
  atsData?: AtsScoreResult;
  trackerRefreshSignal?: number;
  isAnalyzingAts?: boolean;
  atsError?: string | null;
  onRetryAts?: (jobDescription?: string) => Promise<void>;
  hasJobDescription?: boolean;
}

type TabId = "overview" | "skills" | "roadmap" | "prep" | "ats" | "roles" | "tracker";

export const CareerDashboard: React.FC<CareerDashboardProps> = ({
  data,
  atsData,
  trackerRefreshSignal,
  isAnalyzingAts,
  atsError,
  onRetryAts,
  hasJobDescription,
}) => {
  const [activeTab, setActiveTab] = React.useState<TabId>("overview");
  const [expandedSteps, setExpandedSteps] = React.useState<number[]>([0]);
  const [manualJobDesc, setManualJobDesc] = React.useState<string>("");

  const tabs = React.useMemo(() => [
    { id: "overview" as TabId, label: "Overview", icon: Sparkles },
    {
      id: "skills" as TabId,
      label: "Skill Gaps",
      icon: Target,
      badge: data.missingSkills.length > 0 ? data.missingSkills.length : undefined,
      badgeTone: "amber" as const,
    },
    {
      id: "roadmap" as TabId,
      label: "Milestone Roadmap",
      icon: BookOpen,
      badge: data.roadmap.length > 0 ? data.roadmap.length : undefined,
      badgeTone: "indigo" as const,
    },
    { id: "prep" as TabId, label: "Interview Prep", icon: MessageSquare },
    {
      id: "ats" as TabId,
      label: "ATS Diagnostics",
      icon: FileText,
      badge: atsData?.atsScore ? `${atsData.atsScore}%` : undefined,
      badgeTone: "emerald" as const,
    },
    { id: "roles" as TabId, label: "Alternative Roles", icon: Compass },
    { id: "tracker" as TabId, label: "Pipeline Tracker", icon: BriefcaseBusiness },
  ], [data.missingSkills.length, data.roadmap.length, atsData]);

  const toggleStep = React.useCallback((idx: number) => {
    setExpandedSteps((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  }, []);

  const getQuizLink = React.useCallback((quizType: SkillGap["recommendedQuiz"]) => {
    if (!quizType) return null;
    return resolveCategory(quizType)?.route ?? null;
  }, []);

  return (
    <div className="w-full space-y-6">
      {/* Truncation Notice */}
      {data.wasTruncated && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-600 dark:text-amber-400 text-xs font-mono">
          <span>⚠</span>
          <span>
            Resume exceeded 15,000 characters — prioritized first portion for high-density analysis.
          </span>
        </div>
      )}

      {/* Header Bento Stat Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Target Role"
          value={data.jobRole}
          icon={Target}
          subtitle={data.company ? `@ ${data.company}` : "Market Standard Benchmark"}
        />

        <StatCard
          title="Readiness Score"
          value={`${data.matchScore}%`}
          icon={Award}
          subtitle={
            data.matchScore >= 80
              ? "Elite Applicant Status"
              : data.matchScore >= 60
              ? "Competitive Match"
              : "High Growth Trajectory"
          }
          benchmark={
            <div className="flex items-center gap-1 w-full h-2 rounded-full overflow-hidden bg-zinc-100 dark:bg-[#0d0d12] border border-zinc-200/80 dark:border-[#1e1e2a]">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  data.matchScore >= 80
                    ? "bg-emerald-500"
                    : data.matchScore >= 60
                    ? "bg-[#5e6ad2]"
                    : "bg-amber-500"
                }`}
                style={{ width: `${data.matchScore}%` }}
              />
            </div>
          }
        />

        <StatCard
          title="Competencies Analyzed"
          value={data.extractedSkills.length + data.missingSkills.length}
          icon={TrendingUp}
          subtitle={`${data.extractedSkills.length} Matched • ${data.missingSkills.length} Critical Gaps`}
        />
      </div>

      {/* Tab Navigation Strip */}
      <div className="w-full overflow-x-auto no-scrollbar pt-1 pb-1">
        <div role="tablist" aria-label="Career synthesis sections" className="inline-flex items-center gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-[#0d0d12] border border-zinc-200 dark:border-[#1e1e2a] w-full sm:w-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-white dark:bg-[#1e1e2a] text-zinc-900 dark:text-[#ebebef] shadow-subtle border border-zinc-200/80 dark:border-[#2a2a3c]"
                    : "text-zinc-500 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-[#ebebef] hover:bg-zinc-200/50 dark:hover:bg-[#14141e]"
                }`}
              >
                <Icon size={14} className={isActive ? "text-[#5e6ad2]" : ""} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono leading-none font-bold ${
                      isActive
                        ? "bg-[#5e6ad2]/20 text-[#5e6ad2] dark:text-[#8c97ff]"
                        : tab.badgeTone === "amber"
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                        : tab.badgeTone === "emerald"
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : "bg-zinc-200 dark:bg-[#1e1e2a] text-zinc-600 dark:text-[#8b8b9e]"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Panes */}
      <AnimatePresence mode="wait">
        <m.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {/* ─── OVERVIEW TAB ─── */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {data.competitiveEdge && (
                <CompetitiveEdgeCard competitiveEdge={data.competitiveEdge} />
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <div className="space-y-6">
                  {data.marketInsights && (
                    <MarketPulseSection marketInsights={data.marketInsights} />
                  )}
                  {data.levelStrategy && (
                    <LevelStrategyCard levelStrategy={data.levelStrategy} />
                  )}
                </div>

                {data.strengths && data.strengths.length > 0 && (
                  <StrengthsSection strengths={data.strengths} />
                )}
              </div>

              {/* Quick Skill Snapshot & Roadmap Phase 1 Kickstarter */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Competency Snapshot */}
                <div className="w-full bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] rounded-2xl p-5 sm:p-6 shadow-subtle space-y-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-zinc-100 dark:border-[#1e1e2a] pb-3">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-[#8b8b9e]">
                      Competency Balance
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab("skills")}
                      className="text-xs font-semibold text-[#5e6ad2] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Explore All {data.extractedSkills.length + data.missingSkills.length}</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">
                        Top Matched Competencies ({data.extractedSkills.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {data.extractedSkills.slice(0, 6).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1.5"
                          >
                            <CheckCircle2 size={11} /> {skill.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    {data.missingSkills.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-rose-600 dark:text-rose-400 font-bold">
                          Critical Gaps to Bridge ({data.missingSkills.length})
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {data.missingSkills.slice(0, 4).map((gap, idx) => (
                            <span
                              key={`m-${idx}`}
                              className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-1.5"
                            >
                              <XCircle size={11} /> {gap.skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab("skills")}
                    className="w-full py-2 rounded-xl bg-zinc-50 dark:bg-[#0d0d12] hover:bg-zinc-100 dark:hover:bg-[#1a1a26] border border-zinc-200 dark:border-[#1e1e2a] text-xs font-semibold text-zinc-700 dark:text-[#ebebef] transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                  >
                    <span>Inspect Skill Gap Matrix</span>
                    <ArrowRight size={12} />
                  </button>
                </div>

                {/* Immediate Milestone Kickstarter */}
                {data.roadmap.length > 0 && (
                  <div className="w-full bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] rounded-2xl p-5 sm:p-6 shadow-subtle space-y-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between border-b border-zinc-100 dark:border-[#1e1e2a] pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-[#5e6ad2]/10 text-[#5e6ad2] flex items-center justify-center">
                          <BookOpen size={13} />
                        </span>
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-900 dark:text-[#ebebef]">
                          Roadmap Milestone 1
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#5e6ad2]/10 text-[#5e6ad2] border border-[#5e6ad2]/20 font-bold uppercase">
                        {data.roadmap[0].duration}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-[#ebebef] leading-snug">
                        {data.roadmap[0].title}
                      </h4>
                      <p className="text-xs text-zinc-600 dark:text-[#8b8b9e] leading-relaxed line-clamp-2">
                        {data.roadmap[0].description}
                      </p>

                      {data.roadmap[0].milestone && (
                        <div className="p-3 rounded-xl bg-amber-500/[0.06] border border-amber-500/20 text-xs text-zinc-800 dark:text-[#d0d0e0]">
                          <span className="font-bold text-amber-700 dark:text-amber-400 font-mono text-[10px] uppercase block mb-0.5">
                            🎯 Checkpoint Deliverable:
                          </span>
                          {data.roadmap[0].milestone}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab("roadmap")}
                      className="w-full py-2 rounded-xl bg-[#5e6ad2] hover:bg-[#4f5ac4] text-xs font-semibold text-white transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-98 cursor-pointer mt-2"
                    >
                      <span>Launch Full Milestone Plan ({data.roadmap.length} Phases)</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── SKILLS TAB ─── */}
          {activeTab === "skills" && (
            <SkillGapSection
              missingSkills={data.missingSkills}
              extractedSkills={data.extractedSkills}
              strengths={data.strengths}
              roadmap={data.roadmap}
              jobRole={data.jobRole}
              matchScore={data.matchScore}
              getQuizLink={getQuizLink}
              onNavigateToRoadmap={() => setActiveTab("roadmap")}
            />
          )}

          {/* ─── ROADMAP TAB ─── */}
          {activeTab === "roadmap" && (
            <RoadmapTab
              roadmap={data.roadmap}
              expandedSteps={expandedSteps}
              toggleStep={toggleStep}
            />
          )}

          {/* ─── PREP TAB ─── */}
          {activeTab === "prep" && (
            <div className="space-y-6">
              {data.levelStrategy && (
                <LevelStrategyCard levelStrategy={data.levelStrategy} />
              )}
              {data.interviewPrep && (
                <InterviewPrepSection interviewPrep={data.interviewPrep} />
              )}
              {data.resumeSuggestions && data.resumeSuggestions.length > 0 && (
                <ResumeSection suggestions={data.resumeSuggestions} />
              )}
            </div>
          )}

          {/* ─── ATS TAB ─── */}
          {activeTab === "ats" && (
            <div className="space-y-6">
              {atsData ? (
                <>
                  <AtsScoreDashboard data={atsData} />
                  {atsData.fixSuggestions && atsData.fixSuggestions.length > 0 && (
                    <FixSuggestions suggestions={atsData.fixSuggestions} />
                  )}
                </>
              ) : isAnalyzingAts ? (
                <div className="p-10 text-center rounded-2xl bg-white dark:bg-[#14141e] border border-zinc-200/80 dark:border-[#1e1e2a] shadow-subtle space-y-3">
                  <Loader2 className="mx-auto text-[#5e6ad2] animate-spin" size={30} />
                  <p className="text-sm font-bold text-zinc-900 dark:text-[#ebebef]">
                    Calibrating ATS Keyword Alignment & Scoring...
                  </p>
                  <p className="text-xs text-zinc-500 font-mono">
                    Benchmarking formatting, quantifiable metrics, and job specification keywords.
                  </p>
                </div>
              ) : atsError ? (
                <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#14141e] border border-amber-500/30 dark:border-amber-500/20 shadow-subtle space-y-4">
                  <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
                    <AlertTriangle size={15} />
                    <span>ATS Keyword Diagnostics Temporarily Delayed</span>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-[#a0a0b2] leading-relaxed">
                    {atsError}
                  </p>
                  {onRetryAts && (
                    <button
                      type="button"
                      disabled={isAnalyzingAts}
                      onClick={() => onRetryAts()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#5e6ad2] hover:bg-[#505bc0] text-white text-xs font-semibold shadow-subtle transition-all cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw size={13} className={isAnalyzingAts ? "animate-spin" : ""} />
                      <span>Retry ATS Calibration</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#14141e] border border-zinc-200/80 dark:border-[#1e1e2a] shadow-subtle space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 flex items-center justify-center text-[#5e6ad2] shrink-0">
                      <FileText size={18} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-[#ebebef]">
                        Run ATS Keyword Optimization Scan
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-[#8b8b9e] leading-relaxed">
                        {hasJobDescription
                          ? "Target job description is attached. Click below to benchmark formatting integrity, bullet metric density, and keyword match."
                          : `Paste a target job description below (or scan against industry standards for ${data.jobRole}) to compute your ATS match score.`}
                      </p>
                    </div>
                  </div>

                  {!hasJobDescription && (
                    <textarea
                      value={manualJobDesc}
                      onChange={(e) => setManualJobDesc(e.target.value)}
                      placeholder="Paste target job description text here (e.g. required skills, responsibilities)..."
                      className="w-full h-28 px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#0d0d12] border border-zinc-200 dark:border-[#1e1e2a] text-xs text-zinc-900 dark:text-[#ebebef] placeholder:text-zinc-400 focus:outline-none focus:border-[#5e6ad2] transition-colors resize-none font-mono"
                    />
                  )}

                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="button"
                      disabled={isAnalyzingAts}
                      onClick={() => onRetryAts?.(manualJobDesc || undefined)}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#5e6ad2] hover:bg-[#505bc0] text-white text-xs font-semibold shadow-subtle transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isAnalyzingAts ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                      <span>{isAnalyzingAts ? "Calibrating ATS..." : "Analyze ATS Keyword Match"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── ROLES TAB ─── */}
          {activeTab === "roles" && (
            <div className="space-y-6">
              {data.suggestedRoles && data.suggestedRoles.length > 0 ? (
                <RoleSuggestionsSection suggestedRoles={data.suggestedRoles} />
              ) : (
                <div className="p-10 text-center rounded-2xl bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] shadow-subtle space-y-2">
                  <Compass className="mx-auto text-zinc-400" size={32} />
                  <p className="text-sm font-semibold text-zinc-900 dark:text-[#ebebef]">
                    No Alternative Roles Generated
                  </p>
                  <p className="text-xs text-zinc-500">
                    Alternative role recommendations will appear after deeper career profile calibration.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ─── TRACKER TAB (De-Clustered Architecture) ─── */}
          {activeTab === "tracker" && (
            <CareerOpsPanel refreshSignal={trackerRefreshSignal} />
          )}
        </m.div>
      </AnimatePresence>
    </div>
  );
};
