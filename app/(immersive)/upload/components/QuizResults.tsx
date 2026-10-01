"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { m, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Home,
  FileText,
  Sparkles,
  ArrowLeft,
  Info,
  Layers,
  Search,
  Check,
  AlertCircle,
  HelpCircle,
  Compass,
  UploadCloud,
  ChevronDown
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { saveQuizResult } from "@/app/actions/results";
import { HomeBackground } from "@/components/home/HomeBackground";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

function renderVisualText(text: string) {
  if (!text || typeof text !== "string") return text;

  const parts = text.split(/(\[MIRROR\].*?\[\/MIRROR\]|\[WATER\].*?\[\/WATER\])/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("[MIRROR]") && part.endsWith("[/MIRROR]")) {
          return (
            <span key={i} style={{ display: "inline-block", transform: "scaleX(-1)" }}>
              {part.slice(8, -9)}
            </span>
          );
        }
        if (part.startsWith("[WATER]") && part.endsWith("[/WATER]")) {
          return (
            <span key={i} style={{ display: "inline-block", transform: "scaleY(-1)" }}>
              {part.slice(7, -8)}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

interface QuizResultsProps {
  quiz: any[];
  answers: Record<number, string>;
  isDark: boolean;
  fileName?: string;
  onRetake?: () => void;
  onReset?: () => void;
}

export function QuizResults({
  quiz,
  answers,
  isDark,
  fileName,
  onRetake,
  onReset,
}: QuizResultsProps) {
  const savedRef = useRef(false);
  const [filter, setFilter] = useState<"all" | "correct" | "incorrect" | "skipped">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeQuestionId, setActiveQuestionId] = useState<number | null>(null);

  // Performance calculations
  const totalQuestions = quiz.length;
  const score = useMemo(() => quiz.filter((q) => answers[q.id] === q.answer).length, [quiz, answers]);
  const attemptedCount = useMemo(() => Object.keys(answers).length, [answers]);
  const skippedCount = totalQuestions - attemptedCount;
  const incorrectCount = attemptedCount - score;
  const scorePercentage = useMemo(() => ((score / (totalQuestions || 1)) * 100).toFixed(1), [score, totalQuestions]);
  const attemptedAccuracy = useMemo(
    () => (attemptedCount > 0 ? ((score / attemptedCount) * 100).toFixed(0) : "0"),
    [score, attemptedCount]
  );
  const passed = Number(scorePercentage) >= 70;

  // Auto-save results to database
  useEffect(() => {
    if (savedRef.current) return;

    const save = async () => {
      savedRef.current = true;
      try {
        await saveQuizResult({
          sessionId: crypto.randomUUID(),
          category: fileName ? `PDF: ${fileName}` : "AI Generated",
          userAnswers: answers,
          totalQuestions: quiz.length,
          generatedQuiz: quiz,
        });
      } catch (e) {
        console.error("Failed to auto-save results", e);
      }
    };

    save();
  }, [quiz, answers, fileName]);

  // Filtered Questions with Search & Filter Tabs
  const filteredQuiz = useMemo(() => {
    return quiz.filter((q) => {
      const userAnswer = answers[q.id];
      const isAttempted = userAnswer !== undefined && userAnswer !== null && userAnswer !== "";
      const isCorrect = isAttempted && userAnswer === q.answer;

      // Status Filter
      if (filter === "correct" && !isCorrect) return false;
      if (filter === "incorrect" && (!isAttempted || isCorrect)) return false;
      if (filter === "skipped" && isAttempted) return false;

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const questionMatch = q.question?.toLowerCase().includes(query);
        const explanationMatch = q.explanation?.toLowerCase().includes(query);
        const optionsMatch = q.options?.some((opt: string) => opt.toLowerCase().includes(query));
        if (!questionMatch && !explanationMatch && !optionsMatch) return false;
      }

      return true;
    });
  }, [quiz, answers, filter, searchQuery]);

  const scrollToQuestion = (id: number) => {
    setActiveQuestionId(id);
    const element = document.getElementById(`question-card-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-white dark:bg-[#0d0d12] text-zinc-900 dark:text-[#ebebef] relative selection:bg-[#5e6ad2]/20 transition-colors">
      {/* Precision Dot Grid & Horizon Glow */}
      <HomeBackground />

      {/* Unified Platform Header */}
      <header className="h-14 flex-none border-b border-zinc-200/80 dark:border-[#1e1e2a]/80 bg-white/85 dark:bg-[#0d0d12]/85 backdrop-blur-md z-40 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#5e6ad2] flex items-center justify-center text-white font-black text-sm shadow-sm group-hover:bg-[#4f5ac4] transition-colors">
              M
            </div>
            <span className="font-bold text-sm text-zinc-900 dark:text-[#ebebef] tracking-tight">MockMate</span>
          </Link>
          <span className="text-zinc-300 dark:text-zinc-700">/</span>
          <span className="text-xs font-mono font-medium text-zinc-500 dark:text-[#8b8b9e]">Assessment Report</span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-[#ebebef] hover:bg-zinc-100 dark:hover:bg-[#14141e] border border-transparent hover:border-zinc-200 dark:hover:border-[#1e1e2a] transition-all"
          >
            <ArrowLeft size={13} />
            <span className="hidden sm:inline">Back to Hub</span>
          </Link>
          <ThemeSwitcher />
        </div>
      </header>

      {/* Main 2-Column Responsive Dashboard (Independent Pane Scrolling) */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 overflow-hidden relative z-10">
        <div className="flex flex-col lg:flex-row items-start gap-6 h-full">
          {/* ──────────────────────────────────────────────────────────
              LEFT COLUMN: Performance & Navigator Sidebar
             ────────────────────────────────────────────────────────── */}
          <aside className="w-full lg:w-80 xl:w-96 shrink-0 lg:h-full lg:overflow-y-auto space-y-4 no-scrollbar">
            {/* Performance Overview Card */}
            <div className="w-full bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] rounded-2xl p-5 sm:p-6 shadow-subtle space-y-5">
              {/* Header Strip */}
              <div className="flex items-center justify-between gap-2 border-b border-zinc-100 dark:border-[#1e1e2a] pb-3.5">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-[#0d0d12] border border-zinc-200 dark:border-[#1e1e2a] text-xs font-mono text-zinc-600 dark:text-[#8b8b9e]">
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    passed ? "bg-emerald-500" : "bg-[#5e6ad2]"
                  )} />
                  <span className="font-semibold text-zinc-900 dark:text-[#ebebef]">
                    {passed ? "Assessment Passed" : "Assessment Completed"}
                  </span>
                </div>

                <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500">
                  Auto-Saved
                </span>
              </div>

              {/* Radial Score Gauge & Tier */}
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="transparent"
                      className="text-zinc-100 dark:text-[#1e1e2a]"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="transparent"
                      strokeDasharray={213.6}
                      strokeDashoffset={213.6 - (213.6 * (score / totalQuestions))}
                      strokeLinecap="round"
                      className={cn(
                        "transition-all duration-700 ease-out",
                        passed ? "text-emerald-500" : "text-[#5e6ad2]"
                      )}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-mono font-black text-lg text-zinc-900 dark:text-[#ebebef] leading-none">
                      {Math.round(Number(scorePercentage))}%
                    </span>
                    <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-tight mt-0.5">
                      Score
                    </span>
                  </div>
                </div>

                <div className="space-y-1 min-w-0">
                  <p className="text-sm font-bold text-zinc-900 dark:text-[#ebebef] truncate">
                    {passed ? "Outstanding Performance" : score > 0 ? "Review Required" : "Assessment Attempt"}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-[#8b8b9e] leading-snug">
                    {score} correct out of {totalQuestions} questions ({attemptedCount} attempted).
                  </p>
                </div>
              </div>

              {/* High-Density KPI Grid */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-[#0d0d12] border border-zinc-200/70 dark:border-[#1e1e2a] space-y-0.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                    <CheckCircle2 size={11} className="text-emerald-500" />
                    <span>Correct</span>
                  </span>
                  <p className="text-lg font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {score} <span className="text-xs font-normal text-zinc-400">/ {totalQuestions}</span>
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-[#0d0d12] border border-zinc-200/70 dark:border-[#1e1e2a] space-y-0.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                    <XCircle size={11} className="text-rose-500" />
                    <span>Incorrect</span>
                  </span>
                  <p className="text-lg font-mono font-bold text-rose-600 dark:text-rose-400">
                    {incorrectCount}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-[#0d0d12] border border-zinc-200/70 dark:border-[#1e1e2a] space-y-0.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                    <Sparkles size={11} className="text-[#5e6ad2]" />
                    <span>Accuracy</span>
                  </span>
                  <p className="text-lg font-mono font-bold text-zinc-900 dark:text-[#ebebef]">
                    {attemptedAccuracy}%
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-[#0d0d12] border border-zinc-200/70 dark:border-[#1e1e2a] space-y-0.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                    <HelpCircle size={11} className="text-zinc-400" />
                    <span>Skipped</span>
                  </span>
                  <p className="text-lg font-mono font-bold text-zinc-600 dark:text-zinc-400">
                    {skippedCount}
                  </p>
                </div>
              </div>

              {/* Source Document Badge */}
              {fileName && (
                <div className="p-2.5 rounded-xl bg-zinc-100/70 dark:bg-[#0d0d12]/80 border border-zinc-200/80 dark:border-[#1e1e2a] flex items-center gap-2 text-xs font-mono text-zinc-600 dark:text-[#8b8b9e] min-w-0">
                  <FileText size={14} className="text-[#5e6ad2] shrink-0" />
                  <span className="truncate">{fileName}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-1 border-t border-zinc-100 dark:border-[#1e1e2a]">
                {onRetake && (
                  <button
                    type="button"
                    onClick={onRetake}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-[#5e6ad2] hover:bg-[#4f5ac4] text-white shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shadow-[#5e6ad2]/20"
                  >
                    <RotateCcw size={13} />
                    <span>Retake Assessment</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={onReset || (() => window.location.reload())}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-[#1e1e2a] hover:bg-zinc-200 dark:hover:bg-[#252536] text-zinc-800 dark:text-[#ebebef] border border-zinc-200/80 dark:border-[#2a2a3c] flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <UploadCloud size={13} />
                  <span>Upload Another Document</span>
                </button>
              </div>
            </div>

            {/* Interactive Question Jump Matrix (Space-Saving Telemetry) */}
            <div className="w-full bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] rounded-2xl p-5 shadow-subtle space-y-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-900 dark:text-[#ebebef] flex items-center gap-1.5">
                  <Compass size={13} className="text-[#5e6ad2]" />
                  <span>Question Navigator</span>
                </span>
                <span className="font-mono text-[11px] text-zinc-400">Click to jump</span>
              </div>

              {/* Matrix Chips Grid */}
              <div className="grid grid-cols-5 gap-1.5">
                {quiz.map((q, idx) => {
                  const userAnswer = answers[q.id];
                  const isAttempted = userAnswer !== undefined && userAnswer !== null && userAnswer !== "";
                  const isCorrect = isAttempted && userAnswer === q.answer;
                  const isSelected = activeQuestionId === q.id;

                  let chipStyle = "bg-zinc-100 dark:bg-[#0d0d12] text-zinc-400 dark:text-zinc-500 border-zinc-200/80 dark:border-[#1e1e2a]";
                  if (isAttempted) {
                    if (isCorrect) {
                      chipStyle = "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 font-bold";
                    } else {
                      chipStyle = "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30 font-bold";
                    }
                  }

                  return (
                    <button
                      key={q.id || idx}
                      type="button"
                      onClick={() => scrollToQuestion(q.id)}
                      className={cn(
                        "h-8 rounded-lg border text-xs font-mono transition-all flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95",
                        chipStyle,
                        isSelected && "ring-2 ring-[#5e6ad2] ring-offset-1 dark:ring-offset-[#14141e]"
                      )}
                      title={`Jump to Question ${idx + 1}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Mini Legend */}
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 dark:text-zinc-500 pt-1 border-t border-zinc-100 dark:border-[#1e1e2a]">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Correct
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> Incorrect
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-zinc-400" /> Skipped
                </span>
              </div>
            </div>
          </aside>

          {/* ──────────────────────────────────────────────────────────
              RIGHT COLUMN: Optimized Question Review Feed (Scrolls Independently)
             ────────────────────────────────────────────────────────── */}
          <section className="flex-1 min-w-0 w-full lg:h-full lg:overflow-y-auto space-y-4 no-scrollbar pb-16">
            {/* Control & Filter Strip */}
            <div className="w-full bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] rounded-2xl p-4 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Filter Tabs */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-[#0d0d12] border border-zinc-200 dark:border-[#1e1e2a] w-full sm:w-auto overflow-x-auto">
                {[
                  { id: "all", label: `All (${totalQuestions})` },
                  { id: "incorrect", label: `Incorrect (${incorrectCount})` },
                  { id: "correct", label: `Correct (${score})` },
                  ...(skippedCount > 0 ? [{ id: "skipped", label: `Skipped (${skippedCount})` }] : []),
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFilter(tab.id as any)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium font-mono whitespace-nowrap transition-all cursor-pointer",
                      filter === tab.id
                        ? "bg-white dark:bg-[#1e1e2a] text-[#5e6ad2] font-semibold shadow-subtle"
                        : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-[#ebebef]"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search questions..."
                  className="w-full py-1.5 pl-8 pr-3 text-xs bg-zinc-50 dark:bg-[#0d0d12] border border-zinc-200 dark:border-[#1e1e2a] rounded-xl text-zinc-900 dark:text-[#ebebef] placeholder-zinc-400 outline-none focus:border-[#5e6ad2] transition-colors"
                />
              </div>
            </div>

            {/* Questions Feed */}
            {filteredQuiz.length === 0 ? (
              <div className="w-full p-12 text-center rounded-2xl bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] shadow-subtle space-y-2">
                <p className="text-sm font-semibold text-zinc-900 dark:text-[#ebebef]">
                  No questions match your filter.
                </p>
                <p className="text-xs text-zinc-500">
                  Try switching the filter tab or clearing your search query.
                </p>
                <button
                  type="button"
                  onClick={() => { setFilter("all"); setSearchQuery(""); }}
                  className="mt-3 text-xs font-semibold text-[#5e6ad2] hover:underline"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredQuiz.map((q) => {
                  const originalIndex = quiz.indexOf(q);
                  const userAnswer = answers[q.id];
                  const isAttempted = userAnswer !== undefined && userAnswer !== null && userAnswer !== "";
                  const isCorrect = isAttempted && userAnswer === q.answer;
                  const isSelected = activeQuestionId === q.id;

                  return (
                    <div
                      key={q.id || originalIndex}
                      id={`question-card-${q.id}`}
                      className={cn(
                        "p-4 sm:p-5 rounded-2xl border bg-white dark:bg-[#14141e] shadow-subtle transition-all space-y-3",
                        isCorrect
                          ? "border-zinc-200/90 dark:border-[#1e1e2a]"
                          : isAttempted
                          ? "border-rose-500/30 dark:border-rose-500/25"
                          : "border-zinc-200/60 dark:border-[#1e1e2a]",
                        isSelected && "ring-2 ring-[#5e6ad2] dark:ring-[#5e6ad2]"
                      )}
                    >
                      {/* Question Header Row */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-[#0d0d12] border border-zinc-200 dark:border-[#1e1e2a] text-[11px] font-mono font-bold text-zinc-700 dark:text-zinc-300">
                            Q{originalIndex + 1}
                          </span>
                          <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">
                            Question {originalIndex + 1} of {totalQuestions}
                          </span>
                        </div>

                        {/* Status Badge */}
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold",
                          isCorrect
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : isAttempted
                            ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                            : "bg-zinc-100 dark:bg-[#0d0d12] text-zinc-500 border border-zinc-200 dark:border-[#1e1e2a]"
                        )}>
                          {isCorrect ? (
                            <>
                              <CheckCircle2 size={12} />
                              <span>Correct</span>
                            </>
                          ) : isAttempted ? (
                            <>
                              <XCircle size={12} />
                              <span>Incorrect</span>
                            </>
                          ) : (
                            <>
                              <HelpCircle size={12} />
                              <span>Skipped</span>
                            </>
                          )}
                        </span>
                      </div>

                      {/* Question Text */}
                      <h3 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-[#ebebef] leading-snug">
                        {renderVisualText(q.question)}
                      </h3>

                      {/* Side-by-Side Answer Comparison Strip */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                        {/* User Answer */}
                        <div className={cn(
                          "p-2.5 rounded-xl border flex flex-col gap-1",
                          isCorrect
                            ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-800 dark:text-emerald-300"
                            : isAttempted
                            ? "bg-rose-500/5 border-rose-500/20 text-rose-800 dark:text-rose-300"
                            : "bg-zinc-50 dark:bg-[#0d0d12] border-zinc-200/70 dark:border-[#1e1e2a] text-zinc-500"
                        )}>
                          <span className="text-[10px] font-mono uppercase tracking-wider opacity-70">
                            Your Answer:
                          </span>
                          <span className="font-semibold leading-relaxed">
                            {isAttempted ? renderVisualText(userAnswer) : "Skipped (Not answered)"}
                          </span>
                        </div>

                        {/* Correct Answer */}
                        <div className="p-2.5 rounded-xl border bg-emerald-500/5 border-emerald-500/20 text-emerald-800 dark:text-emerald-300 flex flex-col gap-1">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 opacity-80">
                            Verified Correct Answer:
                          </span>
                          <span className="font-semibold leading-relaxed">
                            {renderVisualText(q.answer)}
                          </span>
                        </div>
                      </div>

                      {/* Compact Rubric & Explanation */}
                      {q.explanation && (
                        <div className="p-3 rounded-xl border border-zinc-100 dark:border-[#1e1e2a] bg-zinc-50/70 dark:bg-[#0d0d12]/70 flex items-start gap-2.5 text-xs text-zinc-600 dark:text-[#8b8b9e]">
                          <Info size={14} className="text-[#5e6ad2] shrink-0 mt-0.5" />
                          <div className="leading-relaxed">
                            <span className="font-mono font-semibold uppercase text-zinc-500 dark:text-zinc-400 mr-1.5">
                              Rubric:
                            </span>
                            <span>{renderVisualText(q.explanation)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
