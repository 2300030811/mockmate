"use client";

import { m } from "framer-motion";
import { AtsScoreResult } from "@/types/ats-score";
import { CheckCircle2, XCircle, AlertTriangle, Cpu, Layout, Type, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface AtsScoreDashboardProps {
  data: AtsScoreResult;
}

export function AtsScoreDashboard({ data }: AtsScoreDashboardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-emerald-400";
    if (score >= 45) return "text-orange-400";
    return "text-red-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 75) return "bg-emerald-400";
    if (score >= 45) return "bg-orange-400";
    return "bg-red-400";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Main Stats Card */}
      <m.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="lg:col-span-8 bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-white/5 rounded-3xl p-8 md:p-12 shadow-sm relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-10 transition-opacity">
          <Cpu size={240} />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          {/* Main Score Gauge */}
          <div className="relative w-48 h-48 shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="12"
                className="text-gray-100 dark:text-white/5"
              />
              <m.circle
                cx="96"
                cy="96"
                r="88"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="12"
                strokeDasharray={552.92}
                initial={{ strokeDashoffset: 552.92 }}
                animate={{ strokeDashoffset: 552.92 - (552.92 * data.atsScore) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className={getScoreColor(data.atsScore)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn("text-5xl font-black tabular-nums tracking-tighter", getScoreColor(data.atsScore))}>
                {data.atsScore}
              </span>
              <span className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">ATS Score</span>
            </div>
          </div>

          <div className="flex-1 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border", 
                  data.matchRating === 'High' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                  data.matchRating === 'Medium' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' :
                  'bg-red-500/10 border-red-500/20 text-red-400'
                )}>
                  {data.matchRating} Match Rating
                </span>
              </div>
              <p className="text-lg text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                &quot;{data.overallFeedback}&quot;
              </p>
            </div>

            {/* Sub-scores */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-gray-100 dark:border-white/5">
              {[
                { 
                  label: "Formatting", 
                  score: data.formatScore, 
                  icon: Layout,
                  desc: "Layout simplicity & readability"
                },
                { 
                  label: "Content", 
                  score: data.contentScore, 
                  icon: Type,
                  desc: "Metric density & action verbs"
                },
                { 
                  label: "Keywords", 
                  score: data.keywordScore, 
                  icon: Search,
                  desc: "Market-aligned skill match"
                },
              ].map((sub, i) => (
                <div key={sub.label} className="space-y-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <sub.icon size={12} className="text-blue-500" />
                        {sub.label}
                      </div>
                      <span className="text-gray-900 dark:text-gray-300 font-black">{sub.score}%</span>
                    </div>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium leading-tight">{sub.desc}</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <m.div
                      initial={{ width: 0 }}
                      animate={{ width: `${sub.score}%` }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className={cn("h-full rounded-full", getScoreBg(sub.score))}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </m.div>

      {/* Side Panel Analysis */}
      <m.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="lg:col-span-4 space-y-6"
      >
        {/* Section Checklist */}
        <div className="bg-white dark:bg-gray-900/40 border border-gray-200 dark:border-white/5 rounded-3xl p-6 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-5 flex items-center gap-2">
            Section Completion
          </h3>
          <div className="grid grid-cols-2 gap-y-4">
            {Object.entries(data.sectionAnalysis).map(([section, present]) => (
              <div key={section} className="flex items-center gap-2">
                {present ? (
                  <CheckCircle2 size={16} className="text-emerald-400" />
                ) : (
                  <XCircle size={16} className="text-red-400" />
                )}
                <span className={cn("text-xs font-medium capitalize", present ? "text-gray-700 dark:text-gray-300" : "text-gray-400 dark:text-gray-500")}>
                  {section}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Structure Issues */}
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-500/10 rounded-3xl p-6 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-widest text-red-500 dark:text-red-400/70 mb-5 flex items-center gap-2">
            Structure Red Flags
          </h3>
          <ul className="space-y-3">
            {data.structureIssues.length > 0 ? (
              data.structureIssues.map((issue, i) => (
                <li key={i} className="flex gap-2 text-xs text-gray-700 dark:text-gray-400 leading-relaxed">
                  <AlertTriangle size={14} className="text-red-500 shrink-0 mt-0.5" />
                  {issue}
                </li>
              ))
            ) : (
              <li className="text-emerald-600 dark:text-emerald-400/50 text-xs italic">No major structural issues detected.</li>
            )}
          </ul>
        </div>
      </m.div>

      {/* Keywords Panel */}
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div className="bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10 rounded-3xl p-6 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-5">Present Keywords</h3>
          <div className="flex flex-wrap gap-2">
            {data.presentKeywords.map((kw, i) => (
              <span key={i} className="px-3 py-1.5 bg-emerald-100/50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold rounded-xl lowercase">
                {kw}
              </span>
            ))}
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/10 rounded-3xl p-6 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-widest text-red-600 dark:text-red-400 mb-5">Missing Keywords</h3>
          <div className="flex flex-wrap gap-2">
            {data.missingKeywords.map((kw, i) => (
              <span key={i} className="px-3 py-1.5 bg-red-100/50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-300 text-[10px] font-bold rounded-xl lowercase">
                {kw}
              </span>
            ))}
          </div>
        </div>
      </m.div>
    </div>
  );
}
