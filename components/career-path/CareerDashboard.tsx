"use client";

import React from "react";
import { m, AnimatePresence } from "framer-motion";
import {
  Award,
  Target,
  TrendingUp,
  Download,
  ArrowRight,
  Compass,
  MessageSquare,
  FileText,
  CheckCircle,
  XCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
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
import { SkillGapCard } from "@/components/career-path/sections/SkillGapCard";
import { RoadmapTab } from "@/components/career-path/sections/RoadmapTab";
import { exportRoadmapToMarkdown } from "@/lib/career-path/export-markdown";

interface CareerDashboardProps {
  data: CareerAnalysisResult;
  atsData?: AtsScoreResult;
}

type TabId = "overview" | "skills" | "roles" | "roadmap" | "prep" | "ats";

const TABS: { id: TabId; label: string; shortLabel: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", shortLabel: "Overview", icon: Sparkles },
  { id: "skills", label: "Skill Analysis", shortLabel: "Skills", icon: Target },
  { id: "roles", label: "Role Explorer", shortLabel: "Roles", icon: Compass },
  { id: "roadmap", label: "Learning Roadmap", shortLabel: "Roadmap", icon: BookOpen },
  { id: "prep", label: "Interview & Resume", shortLabel: "Prep", icon: MessageSquare },
  { id: "ats", label: "ATS Score", shortLabel: "ATS Score", icon: FileText },
];

// Helper to keep BookOpen local or fallback since it is only in tabs
import { BookOpen } from "lucide-react";

export const CareerDashboard: React.FC<CareerDashboardProps> = ({ data, atsData }) => {
  const [activeTab, setActiveTab] = React.useState<TabId>("overview");
  const [expandedSteps, setExpandedSteps] = React.useState<number[]>([0]);

  const toggleStep = React.useCallback((idx: number) => {
    setExpandedSteps((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  }, []);

  const container = React.useMemo(() => ({
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }), []);

  const item = React.useMemo(() => ({
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }), []);

  const getQuizLink = React.useCallback((quizType: SkillGap["recommendedQuiz"]) => {
    if (!quizType) return null;
    return resolveCategory(quizType)?.route ?? null;
  }, []);

  const handleDownloadMarkdown = React.useCallback(() => {
    exportRoadmapToMarkdown(data);
  }, [data]);



  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-20 px-4 sm:px-6 lg:px-8">
      {data.wasTruncated && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-xs font-medium">
          <span>⚠</span>
          Your resume was over 15,000 characters — only the first portion was analyzed. Consider trimming it for best results.
        </div>
      )}

      
      {/* Header Stats */}
      <m.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
      >
        <m.div variants={item}>
            <StatCard 
              title="Target Role"
              value={data.jobRole}
              icon={Target}
              subtitle={data.company}
            />
        </m.div>

        <m.div variants={item}>
            <StatCard 
              title="Readiness Power"
              value={`${data.matchScore}%`}
              icon={Award}
              subtitle={data.matchScore >= 80 ? 'Elite Applicant Status' : data.matchScore >= 60 ? 'Competitive Match' : 'High Growth Needed'}
              benchmark={React.useMemo(() => (
                [...Array(10)].map((_, i) => (
                  <div 
                    key={i}
                    className={`flex-1 rounded-sm transition-all duration-700 ${
                        i < data.matchScore / 10 
                        ? (data.matchScore >= 80 ? 'bg-green-500' : data.matchScore >= 60 ? 'bg-yellow-500' : 'bg-red-500')
                        : 'bg-gray-200 dark:bg-white/5'
                    }`}
                    style={{ height: `${20 + (i * 8)}%` }}
                  />
                ))
              ), [data.matchScore])}
            />
        </m.div>

        <m.div variants={item}>
            <StatCard 
              title="Skills Analyzed"
              value={data.extractedSkills.length + data.missingSkills.length}
              icon={TrendingUp}
              subtitle={`${data.extractedSkills.length} Caught • ${data.missingSkills.length} Missing`}
            />
        </m.div>
      </m.div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 sm:gap-0 justify-between">
        <div className="flex overflow-x-auto no-scrollbar">
          <div className="flex bg-gray-100 dark:bg-white/5 rounded-xl p-1 border border-gray-200 dark:border-white/10 gap-1">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-white/10'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white/50 dark:hover:bg-white/5'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-blue-600 dark:text-blue-400' : ''} />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleDownloadMarkdown}
          className="flex items-center gap-2 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-xs sm:text-sm flex-shrink-0"
        >
          <Download size={14} />
          <span className="hidden sm:inline">Export</span>
        </Button>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <m.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
        >

          {/* ─── OVERVIEW TAB ─── */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Competitive Edge - Full Width Hero */}
              {data.competitiveEdge && (
                <CompetitiveEdgeCard competitiveEdge={data.competitiveEdge} />
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                {/* Market Insights */}
                {data.marketInsights && (
                  <MarketPulseSection marketInsights={data.marketInsights} />
                )}

                {/* Strengths Spotlight */}
                {data.strengths && data.strengths.length > 0 && (
                  <StrengthsSection strengths={data.strengths} />
                )}
              </div>

              {/* Quick Skill Summary */}
              <Card className="p-6 bg-white dark:bg-white/5 border-gray-200 dark:border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Skill Snapshot</h3>
                  <button onClick={() => setActiveTab('skills')} className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                    View Full Analysis <ArrowRight size={12} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {data.extractedSkills.slice(0, 8).map((skill, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-300 text-xs font-semibold flex items-center gap-1">
                      <CheckCircle size={10} /> {skill.name}
                    </span>
                  ))}
                  {data.missingSkills.slice(0, 4).map((gap, idx) => (
                    <span key={`m-${idx}`} className="px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-1">
                      <XCircle size={10} /> {gap.skill}
                    </span>
                  ))}
                  {(data.extractedSkills.length > 8 || data.missingSkills.length > 4) && (
                    <span className="px-2.5 py-1 text-xs font-bold text-gray-400">+{Math.max(0, data.extractedSkills.length - 8) + Math.max(0, data.missingSkills.length - 4)} more</span>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* ─── SKILLS TAB ─── */}
          {activeTab === 'skills' && (
            <div className="space-y-8">
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Target className="text-purple-600 dark:text-purple-400" size={20} />
                  <span className="hidden sm:inline">Skill Gap Analysis</span>
                  <span className="sm:hidden">Skills</span>
                </h2>
              </div>

              <div className="space-y-4">
                {data.missingSkills.map((gap, idx) => (
                  <SkillGapCard 
                    key={idx}
                    gap={gap}
                    idx={idx}
                    getQuizLink={getQuizLink}
                  />
                ))}

                <div className="pt-4">
                  <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-300 mb-4">Matched Skills</h3>
                  <div className="flex flex-wrap gap-3">
                    {data.extractedSkills.map((skill, idx) => (
                      <span 
                        key={idx} 
                        className="px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-300 text-sm flex items-center gap-2"
                      >
                        <CheckCircle size={14} />
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── ROLES TAB ─── */}
          {activeTab === 'roles' && (
            <div className="space-y-8">
              {data.suggestedRoles && data.suggestedRoles.length > 0 ? (
                <RoleSuggestionsSection suggestedRoles={data.suggestedRoles} />
              ) : (
                <Card className="p-12 text-center bg-white dark:bg-white/5 border-gray-200 dark:border-white/10">
                  <Compass className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">Role suggestions will appear here after analysis.</p>
                </Card>
              )}
            </div>
          )}

          {/* ─── ROADMAP TAB ─── */}
          {activeTab === 'roadmap' && (
            <RoadmapTab 
              roadmap={data.roadmap} 
              expandedSteps={expandedSteps} 
              toggleStep={toggleStep} 
            />
          )}

          {/* ─── PREP TAB ─── */}
          {activeTab === 'prep' && (
            <div className="space-y-8">
              {data.levelStrategy && (
                <LevelStrategyCard levelStrategy={data.levelStrategy} />
              )}
              {data.interviewPrep && (
                <InterviewPrepSection interviewPrep={data.interviewPrep} />
              )}
              {data.resumeSuggestions && data.resumeSuggestions.length > 0 && (
                <ResumeSection suggestions={data.resumeSuggestions} />
              )}
              {!data.levelStrategy && !data.interviewPrep && (!data.resumeSuggestions || data.resumeSuggestions.length === 0) && (
                <Card className="p-12 text-center bg-white dark:bg-white/5 border-gray-200 dark:border-white/10">
                  <MessageSquare className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">Interview and resume preparation content will appear here.</p>
                </Card>
              )}
            </div>
          )}

          {/* ─── ATS SCORE TAB ─── */}
          {activeTab === 'ats' && (
            <div className="space-y-8">
              {atsData ? (
                <>
                  <AtsScoreDashboard data={atsData} />
                  {atsData.fixSuggestions && atsData.fixSuggestions.length > 0 && (
                    <FixSuggestions suggestions={atsData.fixSuggestions} />
                  )}
                </>
              ) : (
                <Card className="p-12 text-center bg-white dark:bg-white/5 border-gray-200 dark:border-white/10">
                  <FileText className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">ATS Score data is not available for this analysis.</p>
                </Card>
              )}
            </div>
          )}

        </m.div>
      </AnimatePresence>
    </div>
  );
};
