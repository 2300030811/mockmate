"use client";

import React, { useState, useMemo } from "react";
import { m, AnimatePresence } from "framer-motion";
import {
  Award,
  MessageSquare,
  Sparkles,
  Code2,
  Users,
  Layers,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  ExternalLink,
  Target,
  Swords
} from "lucide-react";
import Link from "next/link";
import { InterviewPrepSectionProps } from "../types";

export const InterviewPrepSection = React.memo(
  ({ interviewPrep }: InterviewPrepSectionProps) => {
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [expandedQuestion, setExpandedQuestion] = useState<number | null>(0);

    const getCategoryIcon = (cat?: string) => {
      switch (cat?.toLowerCase()) {
        case "technical":
          return <Code2 size={12} />;
        case "behavioral":
          return <Users size={12} />;
        case "system-design":
          return <Layers size={12} />;
        default:
          return <MessageSquare size={12} />;
      }
    };

    const getDifficultyClass = (diff?: string) => {
      switch (diff?.toLowerCase()) {
        case "easy":
          return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
        case "medium":
          return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
        case "hard":
          return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
        default:
          return "bg-zinc-100 dark:bg-[#1e1e2a] text-zinc-500 border-zinc-200 dark:border-[#2a2a3c]";
      }
    };

    // Filter questions
    const filteredQuestions = useMemo(() => {
      if (selectedCategory === "all") return interviewPrep.topQuestions;
      return interviewPrep.topQuestions.filter(
        (q) => q.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }, [interviewPrep.topQuestions, selectedCategory]);

    const categories = useMemo(() => {
      const set = new Set<string>();
      interviewPrep.topQuestions.forEach((q) => {
        if (q.category) set.add(q.category.toLowerCase());
      });
      return Array.from(set);
    }, [interviewPrep.topQuestions]);

    return (
      <div className="space-y-8">
        {/* ─────────────────────────────────────────────────────────────
            1. ANTICIPATED INTERVIEW QUESTIONS & EVALUATOR INTENT
           ───────────────────────────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-[#1e1e2a] pb-3">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#5e6ad2]/10 text-[#5e6ad2] flex items-center justify-center">
                <MessageSquare size={15} />
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-[#ebebef]">
                  Anticipated Technical & Behavioral Prompts
                </h3>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === "all"
                    ? "bg-[#5e6ad2] text-white shadow-sm font-semibold"
                    : "bg-zinc-100 dark:bg-[#14141e] text-zinc-500 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-[#ebebef] border border-zinc-200 dark:border-[#1e1e2a]"
                }`}
              >
                All ({interviewPrep.topQuestions.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    selectedCategory === cat
                      ? "bg-[#5e6ad2] text-white shadow-sm font-semibold"
                      : "bg-zinc-100 dark:bg-[#14141e] text-zinc-500 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-[#ebebef] border border-zinc-200 dark:border-[#1e1e2a]"
                  }`}
                >
                  {getCategoryIcon(cat)}
                  <span>{cat}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Questions Accordion List */}
          <div className="space-y-3">
            {filteredQuestions.map((q: any, idx: number) => {
              const isExpanded = expandedQuestion === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl bg-white dark:bg-[#14141e] border transition-all p-5 sm:p-6 shadow-subtle space-y-3 cursor-pointer ${
                    isExpanded
                      ? "border-[#5e6ad2]/60 ring-1 ring-[#5e6ad2]/20"
                      : "border-zinc-200 dark:border-[#1e1e2a] hover:border-zinc-300 dark:hover:border-[#2a2a3c]"
                  }`}
                  onClick={() => setExpandedQuestion(isExpanded ? null : idx)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-md bg-zinc-100 dark:bg-[#0d0d12] border border-zinc-200 dark:border-[#1e1e2a] text-[11px] font-mono font-bold text-zinc-500 dark:text-[#8b8b9e] flex items-center justify-center shrink-0 mt-0.5">
                        Q{idx + 1}
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-[#ebebef] leading-snug">
                        &ldquo;{q.question}&rdquo;
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      {q.difficulty && (
                        <span
                          className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded border ${getDifficultyClass(
                            q.difficulty
                          )}`}
                        >
                          {q.difficulty}
                        </span>
                      )}
                      {q.category && (
                        <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-[#5e6ad2]/10 text-[#5e6ad2] border border-[#5e6ad2]/20 flex items-center gap-1">
                          {getCategoryIcon(q.category)}
                          <span className="capitalize">{q.category}</span>
                        </span>
                      )}
                      <div className="text-zinc-400 p-0.5">
                        {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </div>
                    </div>
                  </div>

                  {/* Evaluator Intent Banner */}
                  <div className="text-xs text-zinc-600 dark:text-[#a0a0b2] leading-relaxed pl-3.5 border-l-2 border-[#5e6ad2]/50 bg-[#5e6ad2]/[0.02] py-1 rounded-r-lg">
                    <span className="font-semibold text-zinc-900 dark:text-[#ebebef] mr-1">
                      Evaluator Rubric & Intent:
                    </span>
                    {q.reason}
                  </div>

                  {/* Expandable Answer Strategy & Blueprint */}
                  <AnimatePresence>
                    {isExpanded && (
                      <m.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="pt-3 border-t border-zinc-100 dark:border-[#1e1e2a] space-y-3"
                      >
                        <div className="p-3.5 rounded-xl bg-amber-500/[0.06] border border-amber-500/20 space-y-1.5">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                            <Lightbulb size={12} /> Recommended Answer Architecture
                          </span>
                          <p className="text-xs text-zinc-700 dark:text-[#c4c4d4] leading-relaxed">
                            Frame your response around real production trade-offs. Start with a direct high-level summary, substantiate with one concrete technical war story from your background, and conclude with the measurable metric impact.
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] font-mono text-zinc-400">
                            Recommended duration: ~2–3 minutes
                          </span>
                          <Link
                            href="/arena"
                            target="_blank"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-100 dark:bg-[#1a1a28] hover:bg-zinc-200 dark:hover:bg-[#252538] border border-zinc-200 dark:border-[#26263a] text-xs font-semibold text-[#5e6ad2] transition-colors"
                          >
                            <Swords size={12} />
                            <span>Simulate in Arena</span>
                          </Link>
                        </div>
                      </m.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            2. HIGH-YIELD STAR SCENARIO POSITIONING
           ───────────────────────────────────────────────────────────── */}
        {interviewPrep.starStories && interviewPrep.starStories.length > 0 && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-[#1e1e2a] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Sparkles size={15} />
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-[#ebebef]">
                    High-Yield STAR Behavioral Frameworks
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-[#8b8b9e]">
                    Pre-engineered narrative blueprints aligning your real resume projects to core interview competency bars.
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono text-zinc-400">
                {interviewPrep.starStories.length} Frameworks
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {interviewPrep.starStories.map((story: any, idx: number) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] p-5 sm:p-6 shadow-subtle space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3.5">
                    {/* Target Competency Pill */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md">
                        {story.requirementMatch}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400">STAR Model</span>
                    </div>

                    {/* S & T */}
                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-[#0d0d12] border border-zinc-200/80 dark:border-[#1e1e2a] space-y-1">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-500">
                        [S/T] Situation & Context
                      </span>
                      <p className="text-xs text-zinc-700 dark:text-[#c4c4d4] leading-relaxed">
                        {story.situationTask}
                      </p>
                    </div>

                    {/* Action */}
                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-[#0d0d12] border border-zinc-200/80 dark:border-[#1e1e2a] space-y-1">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#5e6ad2]">
                        [A] Technical Action Taken
                      </span>
                      <p className="text-xs text-zinc-700 dark:text-[#c4c4d4] leading-relaxed">
                        {story.action}
                      </p>
                    </div>

                    {/* Result */}
                    <div className="p-3 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/20 space-y-1">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 size={11} /> [R] Quantified Deliverable Impact
                      </span>
                      <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 leading-relaxed">
                        {story.result}
                      </p>
                    </div>
                  </div>

                  {/* Senior Engineering Reflection */}
                  {story.seniorReflection && (
                    <div className="pt-3 border-t border-zinc-100 dark:border-[#1e1e2a] space-y-1">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#5e6ad2] flex items-center gap-1">
                        <Award size={11} /> Senior Engineering Reflection & Retrospective
                      </span>
                      <p className="text-xs text-zinc-600 dark:text-[#a0a0b2] leading-relaxed italic">
                        &ldquo;{story.seniorReflection}&rdquo;
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);

InterviewPrepSection.displayName = "InterviewPrepSection";
