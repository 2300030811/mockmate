"use client";

import React, { useState, useMemo } from "react";
import { m, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  Flag,
  FileText,
  Play,
  Trophy,
  Wrench,
  CheckCircle2,
  Circle,
  Sparkles,
  Calendar,
  Layers,
  GraduationCap
} from "lucide-react";
import { RoadmapTabProps } from "../types";

export const RoadmapTab = React.memo(function RoadmapTab({
  roadmap,
  expandedSteps,
  toggleStep,
}: RoadmapTabProps) {
  // Track user-completed phases
  const [completedPhases, setCompletedPhases] = useState<number[]>([]);
  const [activeFilter, setActiveFilter] = useState<"all" | "incomplete" | "critical">("all");

  const togglePhaseCompletion = (e: React.MouseEvent, idx: number) => {
    e.stopPropagation();
    setCompletedPhases((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const priorityStyles: Record<string, { badge: string; text: string; border: string }> = {
    critical: {
      badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
      text: "text-rose-600 dark:text-rose-400",
      border: "border-rose-500/30",
    },
    important: {
      badge: "bg-[#5e6ad2]/10 text-[#5e6ad2] border-[#5e6ad2]/20",
      text: "text-[#5e6ad2]",
      border: "border-[#5e6ad2]/30",
    },
    "nice-to-have": {
      badge: "bg-zinc-100 text-zinc-600 dark:bg-[#0d0d12] dark:text-[#8b8b9e] border-zinc-200 dark:border-[#1e1e2a]",
      text: "text-zinc-500",
      border: "border-zinc-200 dark:border-[#1e1e2a]",
    },
  };

  const resourceIcons: Record<string, React.ReactNode> = {
    course: <GraduationCap size={13} />,
    video: <Play size={13} />,
    article: <FileText size={13} />,
    project: <Wrench size={13} />,
    documentation: <ExternalLink size={13} />,
  };

  // Metrics
  const totalHours = useMemo(
    () => roadmap.reduce((sum, step) => sum + (step.estimatedHours || 25), 0),
    [roadmap]
  );
  const totalResources = useMemo(
    () => roadmap.reduce((sum, step) => sum + (step.resources?.length || 0), 0),
    [roadmap]
  );
  const progressPct = roadmap.length > 0
    ? Math.round((completedPhases.length / roadmap.length) * 100)
    : 0;

  // Filtered steps
  const filteredSteps = useMemo(() => {
    return roadmap.map((step, idx) => ({ step, idx })).filter(({ step, idx }) => {
      if (activeFilter === "incomplete") return !completedPhases.includes(idx);
      if (activeFilter === "critical") return step.priority === "critical";
      return true;
    });
  }, [roadmap, completedPhases, activeFilter]);

  const allExpanded = expandedSteps.length === roadmap.length;
  const toggleExpandAll = () => {
    if (allExpanded) {
      // Collapse all
      roadmap.forEach((_, idx) => {
        if (expandedSteps.includes(idx)) toggleStep(idx);
      });
    } else {
      // Expand all
      roadmap.forEach((_, idx) => {
        if (!expandedSteps.includes(idx)) toggleStep(idx);
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* ─────────────────────────────────────────────────────────────
          1. ROADMAP HEADER & TELEMETRY PROGRESS BANNER
         ───────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] p-5 sm:p-6 shadow-subtle space-y-5 relative overflow-hidden">
        {/* Subtle Horizon Glow Accent */}
        <div className="absolute top-0 right-0 w-80 h-32 bg-indigo-500/5 blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-[#1e1e2a] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#5e6ad2]/10 text-[#5e6ad2] flex items-center justify-center">
                <BookOpen size={15} />
              </span>
              <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-[#ebebef]">
                Milestone Execution Roadmap
              </h3>
            </div>
            <p className="text-xs text-zinc-500 dark:text-[#8b8b9e]">
              Chronological curriculum crafted to systematically bridge your missing competencies and reach target hiring readiness.
            </p>
          </div>

          {/* Quick Metrics Cluster */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-[#0d0d12] border border-zinc-200/80 dark:border-[#1e1e2a] text-xs">
              <Clock size={13} className="text-[#5e6ad2]" />
              <span className="font-mono font-bold text-zinc-800 dark:text-[#ebebef]">~{totalHours}h</span>
              <span className="text-zinc-400">Total</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-[#0d0d12] border border-zinc-200/80 dark:border-[#1e1e2a] text-xs">
              <Layers size={13} className="text-indigo-400" />
              <span className="font-mono font-bold text-zinc-800 dark:text-[#ebebef]">{roadmap.length}</span>
              <span className="text-zinc-400">Phases</span>
            </div>
          </div>
        </div>

        {/* Progress Tracker Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-500 dark:text-[#8b8b9e] flex items-center gap-1.5">
              <span>Milestone Completion Status</span>
              {progressPct === 100 && (
                <span className="text-emerald-500 font-bold flex items-center gap-1">
                  <CheckCircle2 size={12} /> Complete!
                </span>
              )}
            </span>
            <span className="font-bold text-[#5e6ad2]">
              {completedPhases.length} of {roadmap.length} Milestones Checked ({progressPct}%)
            </span>
          </div>

          <div className="w-full bg-zinc-100 dark:bg-[#0d0d12] rounded-full h-2 border border-zinc-200/80 dark:border-[#1e1e2a] overflow-hidden p-0.5">
            <m.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="bg-gradient-to-r from-[#5e6ad2] to-[#7f8cf8] h-full rounded-full"
            />
          </div>
        </div>

        {/* Controls Strip: Filters & Expand All */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Filter Pills */}
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-[#0d0d12] border border-zinc-200 dark:border-[#1e1e2a] text-xs">
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                activeFilter === "all"
                  ? "bg-white dark:bg-[#1e1e2a] text-zinc-900 dark:text-[#ebebef] shadow-subtle font-semibold"
                  : "text-zinc-500 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-[#ebebef]"
              }`}
            >
              All Phases ({roadmap.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("incomplete")}
              className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                activeFilter === "incomplete"
                  ? "bg-white dark:bg-[#1e1e2a] text-zinc-900 dark:text-[#ebebef] shadow-subtle font-semibold"
                  : "text-zinc-500 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-[#ebebef]"
              }`}
            >
              In Progress ({roadmap.length - completedPhases.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("critical")}
              className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                activeFilter === "critical"
                  ? "bg-white dark:bg-[#1e1e2a] text-rose-600 dark:text-rose-400 shadow-subtle font-semibold"
                  : "text-zinc-500 dark:text-[#8b8b9e] hover:text-rose-600 dark:hover:text-rose-400"
              }`}
            >
              Critical Only
            </button>
          </div>

          {/* Expand/Collapse Toggle */}
          <button
            type="button"
            onClick={toggleExpandAll}
            className="text-xs font-semibold text-[#5e6ad2] hover:underline cursor-pointer flex items-center gap-1"
          >
            {allExpanded ? "Collapse All Phases" : "Expand All Phases"}
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. CONNECTED TIMELINE ARCHITECTURE
         ───────────────────────────────────────────────────────────── */}
      <div className="relative pl-4 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-2 sm:before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-[#5e6ad2] before:via-indigo-500/40 before:to-zinc-200 dark:before:to-[#1e1e2a]">
        {filteredSteps.map(({ step, idx }, listIdx) => {
          const isExpanded = expandedSteps.includes(idx);
          const isDone = completedPhases.includes(idx);
          const priority = step.priority || "important";
          const priorityConf = priorityStyles[priority] || priorityStyles.important;

          return (
            <m.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: listIdx * 0.05 }}
              className="relative group"
            >
              {/* Timeline Node Marker */}
              <button
                type="button"
                onClick={(e) => togglePhaseCompletion(e, idx)}
                title={isDone ? "Mark as in-progress" : "Mark as completed"}
                className={`absolute -left-6 sm:-left-10 top-5 w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer z-10 ${
                  isDone
                    ? "bg-emerald-500 text-white shadow-sm ring-4 ring-emerald-500/20"
                    : isExpanded
                    ? "bg-[#5e6ad2] text-white ring-4 ring-[#5e6ad2]/20"
                    : "bg-white dark:bg-[#14141e] text-zinc-400 border-2 border-zinc-300 dark:border-[#2a2a3c] hover:border-[#5e6ad2]"
                }`}
              >
                {isDone ? <CheckCircle2 size={14} /> : <span className="text-[10px] font-mono font-bold">{idx + 1}</span>}
              </button>

              {/* Main Phase Card */}
              <div
                onClick={() => toggleStep(idx)}
                className={`rounded-2xl bg-white dark:bg-[#14141e] border transition-all cursor-pointer p-5 sm:p-6 shadow-subtle space-y-4 ${
                  isDone
                    ? "border-emerald-500/30 bg-emerald-500/[0.02]"
                    : isExpanded
                    ? "border-[#5e6ad2]/60 ring-1 ring-[#5e6ad2]/20"
                    : "border-zinc-200 dark:border-[#1e1e2a] hover:border-zinc-300 dark:hover:border-[#2a2a3c]"
                }`}
              >
                {/* Top Phase Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-mono font-bold text-[#5e6ad2] uppercase tracking-wider bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 px-2.5 py-0.5 rounded-md">
                      PHASE {idx + 1} • {step.duration.toUpperCase()}
                    </span>

                    {/* Priority Badge */}
                    <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md border font-semibold flex items-center gap-1 ${priorityConf.badge}`}>
                      <Flag size={9} />
                      <span>{step.priority} Milestone</span>
                    </span>

                    {/* Hours Tag */}
                    {step.estimatedHours && step.estimatedHours > 0 && (
                      <span className="text-[11px] font-mono text-zinc-400 dark:text-[#8b8b9e] flex items-center gap-1 bg-zinc-100 dark:bg-[#0d0d12] px-2 py-0.5 rounded-md">
                        <Clock size={11} /> ~{step.estimatedHours}h
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {/* Completion Action */}
                    <button
                      type="button"
                      onClick={(e) => togglePhaseCompletion(e, idx)}
                      className={`text-xs font-semibold px-3 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                        isDone
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                          : "bg-zinc-50 dark:bg-[#0d0d12] border-zinc-200 dark:border-[#1e1e2a] text-zinc-600 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-[#ebebef]"
                      }`}
                    >
                      {isDone ? (
                        <>
                          <CheckCircle2 size={13} />
                          <span>Phase Completed</span>
                        </>
                      ) : (
                        <>
                          <Circle size={13} />
                          <span>Mark Done</span>
                        </>
                      )}
                    </button>

                    <div className="text-zinc-400 p-1">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                </div>

                {/* Phase Title */}
                <div>
                  <h4 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-[#ebebef] leading-snug">
                    {step.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-[#8b8b9e] mt-1 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Expandable Phase Detail Area */}
                <AnimatePresence>
                  {isExpanded && (
                    <m.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4 pt-3 border-t border-zinc-100 dark:border-[#1e1e2a]"
                    >
                      {/* Concrete Deliverable Checkpoint Banner */}
                      {step.milestone && (
                        <div className="p-4 rounded-xl bg-amber-500/[0.08] border border-amber-500/25 flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                            <Trophy size={16} />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-amber-700 dark:text-amber-400">
                              Phase Deliverable & Verification Checkpoint
                            </span>
                            <p className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-[#ebebef] leading-relaxed">
                              {step.milestone}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Recommended Curriculum Links */}
                      {step.resources && step.resources.length > 0 && (
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 dark:text-[#8b8b9e] font-semibold flex items-center gap-1.5">
                              <BookOpen size={12} className="text-[#5e6ad2]" />
                              <span>Verified Curriculum & Resources ({step.resources.length})</span>
                            </span>
                            <span className="text-[10px] font-mono text-zinc-400">Direct Links</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {step.resources.map((res, rIdx) => (
                              <a
                                key={rIdx}
                                href={res.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-[#0d0d12] border border-zinc-200/80 dark:border-[#1e1e2a] hover:border-[#5e6ad2]/50 hover:bg-white dark:hover:bg-[#181826] transition-all text-xs group"
                              >
                                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                  <span className="text-[#5e6ad2] shrink-0">
                                    {resourceIcons[res.type] || <ExternalLink size={13} />}
                                  </span>
                                  <span className="font-semibold text-zinc-800 dark:text-[#ebebef] truncate group-hover:text-[#5e6ad2] transition-colors">
                                    {res.name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-200/60 dark:bg-[#1e1e2a] text-zinc-500 dark:text-[#8b8b9e]">
                                    {res.type}
                                  </span>
                                  <ExternalLink size={11} className="text-zinc-400 group-hover:text-[#5e6ad2] transition-colors" />
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </m.div>
                  )}
                </AnimatePresence>
              </div>
            </m.div>
          );
        })}
      </div>
    </div>
  );
});

RoadmapTab.displayName = "RoadmapTab";
