"use client";

import React from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { CheckCircle, BookOpen, ExternalLink, ArrowRight, Award, Target, TrendingUp, Briefcase, MessageSquare, Download, Lightbulb, ChevronDown, ChevronUp, Zap, Sparkles, XCircle, Clock, Flag, Trophy, Play, FileText, Wrench, Compass } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CareerAnalysisResult, SkillGap, RoleSuggestion } from '@/types/career';
import Link from 'next/link';
import { QUIZ_ROUTES } from '@/lib/constants';

interface CareerDashboardProps {
  data: CareerAnalysisResult;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  subtitle?: string;
  gradient?: string;
  benchmark?: React.ReactNode;
}

const StatCard = React.memo(({ title, value, icon: Icon, subtitle, benchmark }: StatCardProps) => (
  <Card className="p-4 sm:p-6 bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 relative overflow-hidden group">
    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
      <Icon size={60} className="text-gray-900 dark:text-white sm:size-80" />
    </div>
    <h3 className="text-[9px] sm:text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">{title}</h3>
    <div className="flex items-center gap-3">
      <p className={`text-2xl sm:text-3xl font-black italic tracking-tighter text-gray-900 dark:text-white truncate`}>
        {value}
      </p>
      {benchmark && (
        <div className="flex-1 flex gap-1 items-end h-6">
          {benchmark}
        </div>
      )}
    </div>
    {subtitle && <p className="text-[8px] sm:text-[10px] font-bold text-gray-500 mt-2 uppercase tracking-widest truncate">{subtitle}</p>}
  </Card>
));

StatCard.displayName = "StatCard";

interface ResumeSuggestion { category: string; suggestion: string; impact: string; }
const ResumeSection = React.memo(({ suggestions }: { suggestions: ResumeSuggestion[] }) => (
    <div className="pt-8 space-y-6">
        <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2 uppercase tracking-tighter italic">
            <Lightbulb className="text-yellow-500" size={20} />
            Resume Intel
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestions.map((sug, idx) => (
                <Card key={idx} className="p-5 bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 hover:border-yellow-500/30 transition-all shadow-sm group">
                    <div className="flex items-start gap-4">
                        <div className={`mt-1 p-2 rounded-xl transition-transform group-hover:scale-110 ${
                            sug.impact === 'high' ? 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400' :
                            'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
                        }`}>
                            <Award size={18} />
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-400">{sug.category}</span>
                                {sug.impact === 'high' && <span className="text-[8px] uppercase font-black tracking-widest px-1.5 py-0.5 bg-orange-500/10 text-orange-500 rounded border border-orange-500/20">Critical</span>}
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-bold italic tracking-tight">
                                &quot;{sug.suggestion}&quot;
                            </p>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    </div>
));

ResumeSection.displayName = "ResumeSection";

const InterviewPrepSection = React.memo(({ interviewPrep }: { interviewPrep: CareerAnalysisResult['interviewPrep'] & { topQuestions: any[] } }) => (
    <div className="pt-8 space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="text-blue-500 dark:text-blue-400" />
            Interview Prep
        </h2>
        <div className="space-y-4">
            {interviewPrep.topQuestions.map((q: any, idx: number) => {
                const difficultyColor: Record<string, string> = {
                  easy: 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-500/20',
                  medium: 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-500/20',
                  hard: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/20'
                };

                const categoryIcon: Record<string, string> = {
                  technical: '⚙️',
                  behavioral: '💬',
                  'system-design': '🏗️'
                };

                return (
                  <Card key={idx} className="p-5 border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-500/5 border-gray-200 dark:border-white/10">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex-1">&quot;{q.question}&quot;</h4>
                        <div className="flex gap-2 ml-3">
                          {q.difficulty && (
                            <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded border ${difficultyColor[q.difficulty as string] || ''}`}>
                              {q.difficulty}
                            </span>
                          )}
                          {q.category && (
                            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">
                              {categoryIcon[q.category as string] || ''} {q.category}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                          <span className="font-semibold text-blue-600 dark:text-blue-400 not-italic mr-2">Why this?</span>
                          {q.reason}
                      </p>
                  </Card>
                );
            })}
        </div>
    </div>
));

InterviewPrepSection.displayName = "InterviewPrepSection";

const MarketPulseSection = React.memo(({ marketInsights }: { marketInsights: NonNullable<CareerAnalysisResult['marketInsights']> }) => {
  const confidence = marketInsights?.confidence || 'medium';
  
  const confidenceColor: Record<string, string> = {
    high: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20',
    medium: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/20',
    low: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20'
  };

  return (
    <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2 uppercase tracking-tighter italic">
              <Briefcase className="text-emerald-500" size={20} />
              Market Pulse
          </h2>
          <span className={`text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded-md border ${confidenceColor[confidence]}`}>
            {confidence === 'high' ? '🎯 High Confidence' : confidence === 'medium' ? '⚡ Medium Confidence' : '📊 Estimated'}
          </span>
        </div>
        <Card className="p-6 bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Demand Heat</span>
                    <div className="flex gap-1 h-3 items-center">
                        {[1, 2, 3, 4, 5].map((lvl) => (
                            <div 
                                key={lvl}
                                className={`w-2 h-full rounded-full transition-colors ${
                                    (marketInsights?.demand === 'high' && lvl <= 5) || 
                                    (marketInsights?.demand === 'medium' && lvl <= 3) ||
                                    (lvl <= 2)
                                    ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                                    : 'bg-emerald-200 dark:bg-emerald-950'
                                }`}
                            />
                        ))}
                    </div>
                </div>
                <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 block mb-1">Salary Benchmark</span>
                    <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter italic">{marketInsights.salaryRange}</p>
                </div>
                <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 block mb-2">Trend Velocity</span>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium selection:bg-emerald-500/20">
                        {marketInsights.outlook}
                    </p>
                </div>
            </div>
        </Card>
    </div>
  );
});

MarketPulseSection.displayName = "MarketPulseSection";

const StrengthsSection = React.memo(({ strengths }: { strengths: NonNullable<CareerAnalysisResult['strengths']> }) => {
  if (!strengths || strengths.length === 0) return null;

  const levelColor: Record<string, string> = {
    expert: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20',
    proficient: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20',
    intermediate: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20'
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2 uppercase tracking-tighter italic">
        <Sparkles className="text-purple-500" size={20} />
        Strengths Spotlight
      </h2>
      <Card className="p-6 bg-purple-50/50 dark:bg-purple-500/5 border-purple-200 dark:border-purple-500/10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
        <div className="space-y-4">
          {strengths.map((strength, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-gray-900 dark:text-white text-sm">{strength.skill}</span>
                <span className={`text-[9px] uppercase font-black tracking-widest px-2 py-0.5 rounded border ${levelColor[strength.level] || levelColor.intermediate}`}>
                  {strength.level}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 italic">&quot;{strength.evidence}&quot;</p>
              {idx < strengths.length - 1 && <div className="h-px bg-gradient-to-r from-purple-200 to-transparent dark:from-purple-500/20 mt-3" />}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
});

StrengthsSection.displayName = "StrengthsSection";

const RoleSuggestionsSection = React.memo(({ suggestedRoles }: { suggestedRoles: RoleSuggestion[] }) => {
  const [expandedRole, setExpandedRole] = React.useState<number | null>(0);

  const getMatchColor = (pct: number) => {
    if (pct >= 80) return { ring: 'text-green-500', bg: 'bg-green-500', label: 'text-green-600 dark:text-green-400', bgLight: 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20' };
    if (pct >= 60) return { ring: 'text-yellow-500', bg: 'bg-yellow-500', label: 'text-yellow-600 dark:text-yellow-400', bgLight: 'bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/20' };
    return { ring: 'text-red-500', bg: 'bg-red-500', label: 'text-red-600 dark:text-red-400', bgLight: 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20' };
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <Compass className="text-indigo-600 dark:text-indigo-400" size={20} />
        <span className="hidden sm:inline">Role Suggestions</span>
        <span className="sm:hidden">Roles</span>
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2 py-1 bg-gray-100 dark:bg-white/5 rounded-md border border-gray-200 dark:border-white/10 ml-auto">
          {suggestedRoles.length} Roles
        </span>
      </h2>

      <div className="space-y-3">
        {suggestedRoles.map((role, idx) => {
          const colors = getMatchColor(role.matchPercentage);
          const isExpanded = expandedRole === idx;
          return (
            <m.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
            >
              <Card
                className={`p-4 sm:p-5 bg-white dark:bg-white/5 border transition-all cursor-pointer hover:shadow-md ${
                  isExpanded ? 'border-indigo-300 dark:border-indigo-500/30 shadow-md' : 'border-gray-200 dark:border-white/10'
                }`}
                onClick={() => setExpandedRole(isExpanded ? null : idx)}
              >
                <div className="flex items-center gap-4">
                  {/* Match Percentage Circle */}
                  <div className="relative flex-shrink-0 w-14 h-14">
                    <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                      <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" strokeWidth="4" className="text-gray-200 dark:text-white/10" />
                      <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" strokeWidth="4"
                        className={colors.ring}
                        strokeDasharray={`${(role.matchPercentage / 100) * 150.8} 150.8`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className={`absolute inset-0 flex items-center justify-center text-sm font-black ${colors.label}`}>
                      {role.matchPercentage}%
                    </span>
                  </div>

                  {/* Role Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">{role.role}</h3>
                    {role.reasoning && (
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{role.reasoning}</p>
                    )}
                  </div>

                  {/* Expand Toggle */}
                  <div className="flex-shrink-0">
                    {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <m.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 mt-4 border-t border-gray-100 dark:border-white/5 space-y-4">
                        {/* Matching Skills */}
                        {role.keyMatchingSkills.length > 0 && (
                          <div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-green-600 dark:text-green-400 flex items-center gap-1 mb-2">
                              <CheckCircle size={10} /> Matching Skills
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {role.keyMatchingSkills.map((skill, sIdx) => (
                                <span key={sIdx} className="px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-300 text-xs font-semibold flex items-center gap-1">
                                  <CheckCircle size={10} /> {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Missing Skills */}
                        {role.missingSkills.length > 0 && (
                          <div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-orange-600 dark:text-orange-400 flex items-center gap-1 mb-2">
                              <XCircle size={10} /> Skills to Learn
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {role.missingSkills.map((skill, sIdx) => (
                                <span key={sIdx} className="px-2.5 py-1 rounded-full bg-orange-100 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 text-orange-700 dark:text-orange-300 text-xs font-semibold flex items-center gap-1">
                                  <XCircle size={10} /> {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Summary bar */}
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 dark:text-gray-500 pt-1">
                          <span className="text-green-600 dark:text-green-400">{role.keyMatchingSkills.length} matched</span>
                          <span>&bull;</span>
                          <span className="text-orange-600 dark:text-orange-400">{role.missingSkills.length} to learn</span>
                        </div>
                      </div>
                    </m.div>
                  )}
                </AnimatePresence>
              </Card>
            </m.div>
          );
        })}
      </div>
    </div>
  );
});

RoleSuggestionsSection.displayName = "RoleSuggestionsSection";

const CompetitiveEdgeCard = React.memo(({ competitiveEdge }: { competitiveEdge?: string }) => {
  if (!competitiveEdge) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2 uppercase tracking-tighter italic">
        <Zap className="text-yellow-500" size={20} />
        Competitive Edge
      </h2>
      <Card className="p-6 bg-yellow-50/50 dark:bg-yellow-500/5 border-yellow-200 dark:border-yellow-500/10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-semibold italic">
          {competitiveEdge}
        </p>
      </Card>
    </div>
  );
});

CompetitiveEdgeCard.displayName = "CompetitiveEdgeCard";

interface SkillGapCardProps {
  gap: SkillGap;
  idx: number;
  getQuizLink: (quizType: SkillGap['recommendedQuiz']) => string | null;
}

const SkillGapCard = React.memo(({ gap, idx, getQuizLink }: SkillGapCardProps) => (
  <m.div 
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: idx * 0.05 }}
  >
    <Card className="p-5 bg-red-50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/10 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-1">
            <XCircle className="text-red-500 dark:text-red-400" size={20} />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{gap.skill}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-500/20 uppercase tracking-wider">
                Missing
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 capitalize font-medium">{gap.importance} Priority</span>
            </div>
          </div>
        </div>

        {gap.recommendedQuiz && (
          <Link href={getQuizLink(gap.recommendedQuiz) || '#'} target="_blank" rel="noopener noreferrer">
            <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 border-none shadow-lg shadow-purple-900/20 text-white whitespace-nowrap">
              Take {gap.recommendedQuiz.toUpperCase()} Quiz
              <ArrowRight size={16} className="ml-2" />
            </Button>
          </Link>
        )}
      </div>
    </Card>
  </m.div>
));

SkillGapCard.displayName = "SkillGapCard";

type TabId = 'overview' | 'skills' | 'roles' | 'roadmap' | 'prep';

const TABS: { id: TabId; label: string; shortLabel: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', shortLabel: 'Overview', icon: Sparkles },
  { id: 'skills', label: 'Skill Analysis', shortLabel: 'Skills', icon: Target },
  { id: 'roles', label: 'Role Explorer', shortLabel: 'Roles', icon: Compass },
  { id: 'roadmap', label: 'Learning Roadmap', shortLabel: 'Roadmap', icon: BookOpen },
  { id: 'prep', label: 'Interview & Resume', shortLabel: 'Prep', icon: MessageSquare },
];

interface RoadmapTabProps {
  roadmap: CareerAnalysisResult['roadmap'];
  expandedSteps: number[];
  toggleStep: (idx: number) => void;
}

const RoadmapTab = React.memo(function RoadmapTab({ roadmap, expandedSteps, toggleStep }: RoadmapTabProps) {
  const priorityStyles: Record<string, string> = {
    critical: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-500/30',
    important: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-500/30',
    'nice-to-have': 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400 border-gray-200 dark:border-white/10',
  };
  const resourceIcons: Record<string, React.ReactNode> = {
    course: <BookOpen size={13} />,
    video: <Play size={13} />,
    article: <FileText size={13} />,
    project: <Wrench size={13} />,
    documentation: <ExternalLink size={13} />,
  };

  const completedCount = expandedSteps.length > 0
    ? Math.max(...expandedSteps) + 1
    : 0;
  const progressPct = Math.round((completedCount / Math.max(roadmap.length, 1)) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2 uppercase tracking-tighter italic">
          <BookOpen className="text-blue-500 dark:text-blue-400" size={20} />
          Mission Roadmap
        </h2>
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2 py-1 bg-gray-100 dark:bg-white/5 rounded-md border border-gray-200 dark:border-white/10">
          {roadmap.length} Phases
        </span>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
            Progress
          </span>
          <span className="text-[10px] text-blue-500 font-black">
            {completedCount}/{roadmap.length} phases explored
          </span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full h-2 border border-gray-200 dark:border-white/10 overflow-hidden">
          <m.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-500" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {roadmap.map((step, idx) => {
          const isExpanded = expandedSteps.includes(idx);
          return (
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + (idx * 0.1) }}
              key={idx}
            >
              <Card className={`p-5 h-full transition-all cursor-pointer group ${
                isExpanded
                  ? 'bg-blue-50/50 dark:bg-blue-500/5 border-blue-300 dark:border-blue-500/30 shadow-lg'
                  : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 hover:border-blue-200 dark:hover:border-blue-500/20 hover:shadow-md'
              }`} onClick={() => toggleStep(idx)}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em]">
                        PHASE {idx + 1} &bull; {step.duration.toUpperCase()}
                      </span>
                      {step.priority && (
                        <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${priorityStyles[step.priority] || priorityStyles['important']}`}>
                          <Flag size={9} className="inline mr-0.5 -mt-px" />{step.priority}
                        </span>
                      )}
                      {step.estimatedHours && step.estimatedHours > 0 && (
                        <span className="text-[9px] font-bold text-gray-500 dark:text-gray-500 flex items-center gap-0.5">
                          <Clock size={9} />~{step.estimatedHours}h
                        </span>
                      )}
                    </div>
                    {isExpanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400 group-hover:text-blue-400" />}
                  </div>

                  <h4 className={`text-lg font-black tracking-tight transition-colors ${isExpanded ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-300'}`}>
                    {step.title}
                  </h4>

                  <AnimatePresence>
                    {isExpanded && (
                      <m.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-4 pt-1">
                          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium selection:bg-blue-500/20">
                            {step.description}
                          </p>

                          {step.milestone && (
                            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-500/10 dark:to-yellow-500/10 border border-amber-200 dark:border-amber-500/20">
                              <Trophy size={15} className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-400">Milestone</span>
                                <p className="text-sm font-semibold text-amber-900 dark:text-amber-200 mt-0.5">{step.milestone}</p>
                              </div>
                            </div>
                          )}

                          {step.resources.length > 0 && (
                            <div className="grid grid-cols-1 gap-2 pt-1">
                              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Resources</span>
                              {step.resources.map((res, rIdx) => (
                                <a
                                  key={rIdx}
                                  href={res.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-3 text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-all group/link p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-blue-500/30 shadow-sm"
                                >
                                  <div className="p-2 bg-white dark:bg-gray-900 rounded-lg group-hover/link:shadow-md transition-all text-gray-500 group-hover/link:text-blue-500">
                                    {resourceIcons[res.type] || <ExternalLink size={13} />}
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                    <span className="font-bold truncate">{res.name}</span>
                                    <span className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-600">{res.type}</span>
                                  </div>
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </m.div>
                    )}
                  </AnimatePresence>
                </div>
              </Card>
            </m.div>
          );
        })}
      </div>
    </div>
  );
});

export const CareerDashboard: React.FC<CareerDashboardProps> = ({ data }) => {
  const [activeTab, setActiveTab] = React.useState<TabId>('overview');
  const [expandedSteps, setExpandedSteps] = React.useState<number[]>([0]);

  const toggleStep = React.useCallback((idx: number) => {
    setExpandedSteps(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  }, []);

  const container = React.useMemo(() => ({
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }), []);

  const item = React.useMemo(() => ({
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }), []);

  const getQuizLink = React.useCallback((quizType: SkillGap['recommendedQuiz']) => {
    switch (quizType) {
      case 'aws': return QUIZ_ROUTES.aws;
      case 'azure': return QUIZ_ROUTES.azure;
      case 'mongodb': return QUIZ_ROUTES.mongodb;
      case 'salesforce': return QUIZ_ROUTES.salesforce;
      case 'pcap': return QUIZ_ROUTES.pcap;
      case 'java': return QUIZ_ROUTES.oracle;
      default: return null;
    }
  }, []);

  const handleDownloadMarkdown = React.useCallback(() => {
    let md = `# Career Roadmap: ${data.jobRole}${data.company ? ` at ${data.company}` : ''}\n\n`;
    md += `**Generated On:** ${new Date().toLocaleDateString()}\n\n`;
    
    md += `## Readiness Score: ${data.matchScore}%\n\n`;
    
    md += `## Market Insights\n`;
    md += `- **Demand:** ${data.marketInsights?.demand.toUpperCase() || 'N/A'}\n`;
    md += `- **Salary Range:** ${data.marketInsights?.salaryRange || 'N/A'}\n`;
    md += `- **Confidence:** ${data.marketInsights?.confidence || 'Medium'}\n`;
    md += `- **Outlook:** ${data.marketInsights?.outlook || 'N/A'}\n\n`;

    if (data.strengths && data.strengths.length > 0) {
      md += `## Your Strengths\n`;
      data.strengths.forEach(s => md += `- **${s.skill}** (${s.level}): ${s.evidence}\n`);
      md += `\n`;
    }

    if (data.competitiveEdge) {
      md += `## Competitive Edge\n${data.competitiveEdge}\n\n`;
    }

    if (data.suggestedRoles && data.suggestedRoles.length > 0) {
      md += `## Role Suggestions\n`;
      data.suggestedRoles.forEach(r => {
        md += `### ${r.role} — ${r.matchPercentage}% Match\n`;
        if (r.reasoning) md += `*${r.reasoning}*\n\n`;
        if (r.keyMatchingSkills.length > 0) md += `**Matching Skills:** ${r.keyMatchingSkills.join(', ')}\n`;
        if (r.missingSkills.length > 0) md += `**Skills to Learn:** ${r.missingSkills.join(', ')}\n`;
        md += `\n`;
      });
    }

    md += `## Matched Skills\n`;
    data.extractedSkills.forEach(s => md += `- [x] ${s.name} (${s.category})\n`);
    md += `\n## Missing Skills\n`;
    data.missingSkills.forEach(s => md += `- [ ] ${s.skill} (Priority: ${s.importance})\n`);
    
    md += `\n## Learning Roadmap\n`;
    data.roadmap.forEach(step => {
      md += `### ${step.title} (${step.duration})\n`;
      if (step.priority) md += `**Priority:** ${step.priority} | `;
      if (step.estimatedHours) md += `**Estimated:** ~${step.estimatedHours} hours\n`;
      md += `\n${step.description}\n`;
      if (step.milestone) md += `\n> 🎯 **Milestone:** ${step.milestone}\n`;
      step.resources.forEach(res => md += `- [${res.name}](${res.url}) *(${res.type})*\n`);
      md += `\n`;
    });

    if (data.interviewPrep) {
      md += `## Interview Preparation\n`;
      data.interviewPrep.topQuestions.forEach(q => {
        md += `### ${q.question}\n`;
        if (q.difficulty) md += `*Difficulty: ${q.difficulty}*\n`;
        if (q.category) md += `*Category: ${q.category}*\n`;
        md += `*Reason: ${q.reason}*\n\n`;
      });
    }

    md += `---\n*Disclaimer: Salary data is aggregated from public job listings. Actual salaries may vary based on experience, location, and company factors.*`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `career-roadmap-${data.jobRole.toLowerCase().replace(/\s+/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
              {data.interviewPrep && (
                <InterviewPrepSection interviewPrep={data.interviewPrep} />
              )}
              {data.resumeSuggestions && data.resumeSuggestions.length > 0 && (
                <ResumeSection suggestions={data.resumeSuggestions} />
              )}
              {!data.interviewPrep && (!data.resumeSuggestions || data.resumeSuggestions.length === 0) && (
                <Card className="p-12 text-center bg-white dark:bg-white/5 border-gray-200 dark:border-white/10">
                  <MessageSquare className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">Interview and resume preparation content will appear here.</p>
                </Card>
              )}
            </div>
          )}

        </m.div>
      </AnimatePresence>
    </div>
  );
};
