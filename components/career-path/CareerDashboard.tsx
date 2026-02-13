"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, BookOpen, ExternalLink, ArrowRight, Award, Target, TrendingUp, Briefcase, MessageSquare, ListChecks, Download, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CareerAnalysisResult, SkillGap } from '@/types/career';
import Link from 'next/link';
import { QUIZ_ROUTES } from '@/lib/constants';

interface CareerDashboardProps {
  data: CareerAnalysisResult;
}

export const CareerDashboard: React.FC<CareerDashboardProps> = ({ data }) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const getQuizLink = (quizType: SkillGap['recommendedQuiz']) => {
    switch (quizType) {
      case 'aws': return QUIZ_ROUTES.aws;
      case 'azure': return QUIZ_ROUTES.azure;
      case 'mongodb': return QUIZ_ROUTES.mongodb;
      case 'salesforce': return QUIZ_ROUTES.salesforce;
      case 'pcap': return QUIZ_ROUTES.pcap;
      case 'java': return QUIZ_ROUTES.oracle;
      default: return null;
    }
  };

  const handleDownloadMarkdown = () => {
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
  };

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
            <Card className="p-6 bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Target size={80} className="text-gray-900 dark:text-white" />
                </div>
                <h3 className="text-gray-500 dark:text-gray-400 mb-1">Target Role</h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white truncate" title={data.jobRole}>
                    {data.jobRole}
                </p>
                {data.company && <p className="text-sm text-purple-600 dark:text-purple-400">{data.company}</p>}
            </Card>
        </motion.div>

        <motion.div variants={item}>
            <Card className="p-6 bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Award size={80} className="text-gray-900 dark:text-white" />
                </div>
                <h3 className="text-gray-500 dark:text-gray-400 mb-1">Readiness Score</h3>
                <div className="flex items-baseline gap-2">
                    <p className={`text-4xl font-bold ${
                        data.matchScore >= 80 ? 'text-green-500 dark:text-green-400' : 
                        data.matchScore >= 60 ? 'text-yellow-500 dark:text-yellow-400' : 'text-red-500 dark:text-red-400'
                    }`}>
                        {data.matchScore}%
                    </p>
                    <span className="text-sm text-gray-500 dark:text-gray-500">match</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full mt-3 overflow-hidden">
                    <div 
                        className={`h-full rounded-full ${
                             data.matchScore >= 80 ? 'bg-green-500' : 
                             data.matchScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`} 
                        style={{ width: `${data.matchScore}%` }}
                    />
                </div>
            </Card>
        </motion.div>

        <motion.div variants={item}>
            <Card className="p-6 bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <TrendingUp size={80} className="text-gray-900 dark:text-white" />
                </div>
                <h3 className="text-gray-500 dark:text-gray-400 mb-1">Skills Analyzed</h3>
                <p className="text-4xl font-bold text-gray-900 dark:text-white">
                    {data.extractedSkills.length + data.missingSkills.length}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                    <span className="text-green-600 dark:text-green-400">{data.extractedSkills.length} caught</span> • 
                    <span className="text-red-600 dark:text-red-400 ml-1">{data.missingSkills.length} missing</span>
                </p>
            </Card>
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
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={idx}
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
                                            <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{gap.importance} Priority</span>
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
                <div className="pt-8 space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Lightbulb className="text-yellow-500" />
                        Resume Optimization
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {data.resumeSuggestions.map((sug, idx) => (
                            <Card key={idx} className="p-4 bg-white dark:bg-white/5 border-gray-200 dark:border-white/10">
                                <div className="flex items-start gap-3">
                                    <div className={`mt-1 p-1.5 rounded-lg ${
                                        sug.impact === 'high' ? 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400' :
                                        'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
                                    }`}>
                                        <Award size={16} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">{sug.category}</span>
                                            {sug.impact === 'high' && <span className="text-[10px] uppercase font-bold tracking-wider text-orange-500">High Impact</span>}
                                        </div>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                                            {sug.suggestion}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Interview Preparation Section */}
            {data.interviewPrep && (
                <div className="pt-8 space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <MessageSquare className="text-blue-500 dark:text-blue-400" />
                        Interview Prep
                    </h2>
                    <div className="space-y-4">
                        {data.interviewPrep.topQuestions.map((q, idx) => (
                            <Card key={idx} className="p-5 border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-500/5 border-gray-200 dark:border-white/10">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">"{q.question}"</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                                    <span className="font-semibold text-blue-600 dark:text-blue-400 not-italic mr-2">Why this?</span>
                                    {q.reason}
                                </p>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* Sidebar: Market Insights & Learning Roadmap */}
        <div className="space-y-8">
            {/* Market Insights */}
            {data.marketInsights && (
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Briefcase className="text-emerald-500" />
                        Market Outlook
                    </h2>
                    <Card className="p-6 bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Demand Level</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                                    data.marketInsights.demand === 'high' ? 'bg-emerald-200 text-emerald-800 dark:bg-emerald-500/30 dark:text-emerald-300' :
                                    'bg-yellow-200 text-yellow-800 dark:bg-yellow-500/30 dark:text-yellow-300'
                                }`}>
                                    {data.marketInsights.demand}
                                </span>
                            </div>
                            <div>
                                <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">Salary Range</span>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">{data.marketInsights.salaryRange}</p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-500 dark:text-gray-400 block mb-2">Trend Analysis</span>
                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {data.marketInsights.outlook}
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="text-blue-500 dark:text-blue-400" />
                    Learning Path
                </h2>
                
                <div className="relative border-l-2 border-gray-200 dark:border-white/10 ml-3 space-y-8 py-2">
                    {data.roadmap.map((step, idx) => (
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + (idx * 0.1) }}
                            key={idx} 
                            className="pl-8 relative"
                        >
                            {/* Timeline Dot */}
                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white dark:bg-gray-900 border-2 border-blue-500" />
                            
                            <div className="space-y-2">
                                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                                    {step.duration}
                                </span>
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{step.title}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {step.description}
                                </p>
                                
                                {step.resources.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        {step.resources.map((res, rIdx) => (
                                            <a 
                                                key={rIdx}
                                                href={res.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors group/link p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"
                                            >
                                                <ExternalLink size={14} className="group-hover/link:text-blue-500 dark:group-hover/link:text-blue-400" />
                                                {res.name}
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
