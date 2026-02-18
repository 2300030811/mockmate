"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, BookOpen, ExternalLink, ArrowRight, Award, Target, TrendingUp, Briefcase, MessageSquare, ListChecks, Download, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CareerAnalysisResult, SkillGap } from '@/types/career';
import Link from 'next/link';
import { QUIZ_ROUTES } from '@/lib/constants';
import { useTheme } from '@/components/providers/providers';

interface CareerDashboardProps {
  data: CareerAnalysisResult;
}

const StatCard = React.memo(({ title, value, icon: Icon, subtitle, gradient, benchmark }: any) => (
  <Card className="p-6 bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 relative overflow-hidden group">
    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
      <Icon size={80} className="text-gray-900 dark:text-white" />
    </div>
    <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">{title}</h3>
    <div className="flex items-center gap-3">
      <p className={`text-3xl font-black italic tracking-tighter text-gray-900 dark:text-white truncate`}>
        {value}
      </p>
      {benchmark && (
        <div className="flex-1 flex gap-1 items-end h-6">
          {benchmark}
        </div>
      )}
    </div>
    {subtitle && <p className="text-[10px] font-bold text-gray-500 mt-2 uppercase tracking-widest truncate">{subtitle}</p>}
  </Card>
));

StatCard.displayName = "StatCard";

const ResumeSection = React.memo(({ suggestions }: { suggestions: any[] }) => (
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
                                "{sug.suggestion}"
                            </p>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    </div>
));

ResumeSection.displayName = "ResumeSection";

const InterviewPrepSection = React.memo(({ interviewPrep, isDark }: { interviewPrep: any, isDark: boolean }) => (
    <div className="pt-8 space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="text-blue-500 dark:text-blue-400" />
            Interview Prep
        </h2>
        <div className="space-y-4">
            {interviewPrep.topQuestions.map((q: any, idx: number) => (
                <Card key={idx} className="p-5 border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-500/5 border-gray-200 dark:border-white/10">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">&quot;{q.question}&quot;</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                        <span className="font-semibold text-blue-600 dark:text-blue-400 not-italic mr-2">Why this?</span>
                        {q.reason}
                    </p>
                </Card>
            ))}
        </div>
    </div>
));

InterviewPrepSection.displayName = "InterviewPrepSection";

const MarketPulseSection = React.memo(({ marketInsights }: { marketInsights: any }) => (
    <div className="space-y-4">
        <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2 uppercase tracking-tighter italic">
            <Briefcase className="text-emerald-500" size={20} />
            Market Pulse
        </h2>
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
));

MarketPulseSection.displayName = "MarketPulseSection";

const SkillGapCard = React.memo(({ gap, idx, getQuizLink }: any) => (
  <motion.div 
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
  </motion.div>
));

SkillGapCard.displayName = "SkillGapCard";

export const CareerDashboard: React.FC<CareerDashboardProps> = ({ data }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
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
    md += `## Readiness Score: ${data.matchScore}%\n\n`;
    
    md += `## Market Insights\n`;
    md += `- **Demand:** ${data.marketInsights?.demand.toUpperCase() || 'N/A'}\n`;
    md += `- **Salary Range:** ${data.marketInsights?.salaryRange || 'N/A'}\n`;
    md += `- **Outlook:** ${data.marketInsights?.outlook || 'N/A'}\n\n`;

    md += `## Matched Skills\n`;
    data.extractedSkills.forEach(s => md += `- [x] ${s.name} (${s.category})\n`);
    md += `\n## Missing Skills\n`;
    data.missingSkills.forEach(s => md += `- [ ] ${s.skill} (Priority: ${s.importance})\n`);
    
    md += `\n## Learning Roadmap\n`;
    data.roadmap.forEach(step => {
      md += `### ${step.title} (${step.duration})\n`;
      md += `${step.description}\n`;
      step.resources.forEach(res => md += `- [${res.name}](${res.url})\n`);
      md += `\n`;
    });

    if (data.interviewPrep) {
      md += `## Interview Preparation\n`;
      data.interviewPrep.topQuestions.forEach(q => {
        md += `### ${q.question}\n*Reason: ${q.reason}*\n\n`;
      });
    }

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
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-20">
      
      {/* Header Stats */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <motion.div variants={item}>
            <StatCard 
              title="Target Role"
              value={data.jobRole}
              icon={Target}
              subtitle={data.company}
            />
        </motion.div>

        <motion.div variants={item}>
            <StatCard 
              title="Readiness Power"
              value={`${data.matchScore}%`}
              icon={Award}
              subtitle={data.matchScore >= 80 ? 'Elite Applicant Status' : data.matchScore >= 60 ? 'Competitive Match' : 'High Growth Needed'}
              benchmark={
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
              }
            />
        </motion.div>

        <motion.div variants={item}>
            <StatCard 
              title="Skills Analyzed"
              value={data.extractedSkills.length + data.missingSkills.length}
              icon={TrendingUp}
              subtitle={`${data.extractedSkills.length} Caught • ${data.missingSkills.length} Missing`}
            />
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Skill Gap Analysis */}
        <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Target className="text-purple-600 dark:text-purple-400" />
                    Skill Gap Analysis
                </h2>
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleDownloadMarkdown}
                    className="flex items-center gap-2 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5"
                >
                    <Download size={16} />
                    Export Roadmap
                </Button>
            </div>

            <div className="space-y-4">
                {/* Missing Skills (Priority) */}
                {data.missingSkills.map((gap, idx) => (
                    <SkillGapCard 
                      key={idx}
                      gap={gap}
                      idx={idx}
                      getQuizLink={getQuizLink}
                    />
                ))}

                {/* Match Skills */}
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

            {/* Resume Suggestions Section */}
            {data.resumeSuggestions && data.resumeSuggestions.length > 0 && (
                <ResumeSection suggestions={data.resumeSuggestions} />
            )}

            {/* Interview Preparation Section */}
            {data.interviewPrep && (
                <InterviewPrepSection interviewPrep={data.interviewPrep} isDark={isDark} />
            )}
        </div>

        {/* Sidebar: Market Insights & Learning Roadmap */}
        <div className="space-y-8">
            {/* Market Insights */}
            {data.marketInsights && (
                <MarketPulseSection marketInsights={data.marketInsights} />
            )}

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2 uppercase tracking-tighter italic">
                       <BookOpen className="text-blue-500 dark:text-blue-400" size={20} />
                       Mission Roadmap
                   </h2>
                   <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2 py-1 bg-gray-100 dark:bg-white/5 rounded-md border border-gray-200 dark:border-white/10">
                      {data.roadmap.length} Phases
                   </span>
                </div>
                
                <div className="relative border-l-2 border-gray-200 dark:border-white/10 ml-3 space-y-4 py-2">
                    {data.roadmap.map((step, idx) => {
                        const isExpanded = expandedSteps.includes(idx);
                        return (
                          <motion.div 
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.5 + (idx * 0.1) }}
                              key={idx} 
                              className="pl-8 relative"
                          >
                              {/* Timeline Dot */}
                              <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 transition-all duration-500 ${
                                 isExpanded ? 'bg-blue-500 border-blue-400 scale-125 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-gray-200 dark:bg-gray-800 border-gray-300 dark:border-white/10 scale-100'
                              }`} />
                              
                              <div className="space-y-3 group cursor-pointer" onClick={() => toggleStep(idx)}>
                                  <div className="flex items-center justify-between">
                                     <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em]">
                                         PHASE {idx + 1} • {step.duration.toUpperCase()}
                                     </span>
                                     {isExpanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400 group-hover:text-blue-400" />}
                                  </div>
                                  
                                  <h4 className={`text-lg font-black tracking-tight transition-colors ${isExpanded ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'}`}>
                                     {step.title}
                                  </h4>

                                  <AnimatePresence>
                                     {isExpanded && (
                                        <motion.div
                                           initial={{ height: 0, opacity: 0 }}
                                           animate={{ height: 'auto', opacity: 1 }}
                                           exit={{ height: 0, opacity: 0 }}
                                           className="overflow-hidden"
                                        >
                                           <div className="space-y-4 pt-1">
                                              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium selection:bg-blue-500/20">
                                                  {step.description}
                                              </p>
                                              
                                              {step.resources.length > 0 && (
                                                  <div className="grid grid-cols-1 gap-2 pt-2">
                                                      {step.resources.map((res, rIdx) => (
                                                          <a 
                                                              key={rIdx}
                                                              href={res.url}
                                                              target="_blank"
                                                              rel="noopener noreferrer"
                                                              className="flex items-center gap-3 text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-all group/link p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-blue-500/30 shadow-sm"
                                                          >
                                                              <div className="p-2 bg-white dark:bg-gray-900 rounded-lg group-hover/link:shadow-md transition-all">
                                                                 <ExternalLink size={14} className="group-hover/link:rotate-45 transition-transform" />
                                                              </div>
                                                              <span className="font-bold truncate">{res.name}</span>
                                                          </a>
                                                      ))}
                                                  </div>
                                              )}
                                           </div>
                                        </motion.div>
                                     )}
                                  </AnimatePresence>
                              </div>
                          </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
