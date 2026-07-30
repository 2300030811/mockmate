import React from "react";
import { m, AnimatePresence } from "framer-motion";
import { BookOpen, ChevronDown, ChevronUp, Clock, ExternalLink, Flag, FileText, Play, Trophy, Wrench } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { RoadmapTabProps } from "../types";

export const RoadmapTab = React.memo(function RoadmapTab({ roadmap, expandedSteps, toggleStep }: RoadmapTabProps) {
  const priorityStyles: Record<string, string> = {
    critical: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-500/30",
    important: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-500/30",
    "nice-to-have": "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400 border-gray-200 dark:border-white/10",
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
                  ? "bg-blue-50/50 dark:bg-blue-500/5 border-blue-300 dark:border-blue-500/30 shadow-lg"
                  : "bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 hover:border-blue-200 dark:hover:border-blue-500/20 hover:shadow-md"
              }`} onClick={() => toggleStep(idx)}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em]">
                        PHASE {idx + 1} &bull; {step.duration.toUpperCase()}
                      </span>
                      {step.priority && (
                        <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${priorityStyles[step.priority] || priorityStyles["important"]}`}>
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

                  <h4 className={`text-lg font-black tracking-tight transition-colors ${isExpanded ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-300"}`}>
                    {step.title}
                  </h4>

                  <AnimatePresence>
                    {isExpanded && (
                      <m.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
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

RoadmapTab.displayName = "RoadmapTab";
