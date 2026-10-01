"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { m, AnimatePresence } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Sparkles,
  Flame,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Bot,
  Flag,
  Check
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { HomeBackground } from "@/components/home/HomeBackground";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";
import { UserAuthSection } from "@/components/UserAuthSection";

const BobAssistant = dynamic(
  () => import("@/components/quiz/BobAssistant").then((mod) => mod.BobAssistant),
  { ssr: false }
);

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

interface QuizGameProps {
  quiz: any[];
  current: number;
  setCurrent: (c: number | ((prev: number) => number)) => void;
  answers: Record<number, string>;
  setAnswers: (a: Record<number, string>) => void;
  setShowResults: (s: boolean) => void;
  isDark: boolean;
  setTheme: (theme: string) => void;
}

const OPTION_LABELS = ["A", "B", "C", "D", "E", "F"];

export function QuizGame({
  quiz,
  current,
  setCurrent,
  answers,
  setAnswers,
  setShowResults,
  isDark,
  setTheme,
}: QuizGameProps) {
  const [isBobOpen, setIsBobOpen] = useState(false);
  const [streak, setStreak] = useState(0);

  const q = quiz[current];
  const progress = useMemo(() => ((current + 1) / quiz.length) * 100, [current, quiz.length]);

  const handleAnswer = useCallback(
    (option: string) => {
      if (answers[q.id]) return; // Prevent changing answer once selected

      const normalizeStr = (s: string) => s.replace(/\s+/g, "").toLowerCase();
      const isCorrect = q.answer === option || normalizeStr(q.answer) === normalizeStr(option);

      setAnswers({ ...answers, [q.id]: option });

      if (isCorrect) {
        setStreak((prev) => prev + 1);
      } else {
        setStreak(0);
      }
    },
    [answers, q, setAnswers]
  );

  // Keyboard Navigation: keys 1-4 to select, Enter to advance
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["1", "2", "3", "4"].includes(e.key)) {
        const index = parseInt(e.key, 10) - 1;
        if (q?.options?.[index]) {
          handleAnswer(q.options[index]);
        }
      }
      if (e.key === "Enter" && answers[q.id]) {
        if (current < quiz.length - 1) {
          setCurrent((prev) => prev + 1);
        } else {
          setShowResults(true);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [q, answers, handleAnswer, current, quiz.length, setCurrent, setShowResults]);

  if (!q) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0d0d12] flex items-center justify-center p-8">
        <p className="font-mono text-sm text-zinc-500">Loading assessment questions...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0d12] text-zinc-900 dark:text-[#ebebef] relative selection:bg-[#5e6ad2]/20 flex flex-col transition-colors overflow-x-hidden">
      {/* Precision 28px Grid & Horizon Glow */}
      <HomeBackground />

      {/* Integrated Platform Header */}
      <header className="fixed top-0 inset-x-0 h-14 border-b border-zinc-200/80 dark:border-[#1e1e2a]/80 bg-white/85 dark:bg-[#0d0d12]/85 backdrop-blur-md z-40 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#5e6ad2] flex items-center justify-center text-white font-black text-sm shadow-sm group-hover:bg-[#4f5ac4] transition-colors">
              M
            </div>
            <span className="font-bold text-sm text-zinc-900 dark:text-[#ebebef] tracking-tight">MockMate</span>
          </Link>
          <span className="text-zinc-300 dark:text-zinc-700">/</span>
          <span className="text-xs font-mono font-medium text-zinc-500 dark:text-[#8b8b9e]">AI Quiz</span>
          <span className="text-zinc-300 dark:text-zinc-700 hidden sm:inline">/</span>
          <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500 hidden sm:inline">
            Q{current + 1} of {quiz.length}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center">
            <UserAuthSection />
            <div className="w-px h-5 bg-zinc-200 dark:bg-[#1e1e2a] mx-3" />
          </div>

          <button
            type="button"
            onClick={() => setShowResults(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
          >
            <Flag size={12} />
            <span>Finish Now</span>
          </button>

          <ThemeSwitcher />
        </div>
      </header>

      {/* Main Assessment Container */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 pt-20 pb-20 relative z-10 flex flex-col justify-start">
        {/* Progress & Telemetry Header */}
        <div className="mb-6 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-zinc-600 dark:text-[#8b8b9e]">
              <span className="font-semibold text-zinc-900 dark:text-[#ebebef]">
                Question {current + 1}
              </span>
              <span>of</span>
              <span>{quiz.length}</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500 hidden sm:inline">
                Press [1-4] to answer • [Enter] next
              </span>
              <span className="font-semibold text-[#5e6ad2]">
                {Math.round(progress)}%
              </span>
            </div>
          </div>

          {/* Precision Linear Progress Bar */}
          <div className="h-1.5 w-full bg-zinc-100 dark:bg-[#14141e] border border-zinc-200/80 dark:border-[#1e1e2a] rounded-full overflow-hidden">
            <m.div
              className="h-full bg-[#5e6ad2] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <m.div
            key={current}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="w-full bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] rounded-2xl p-6 sm:p-8 shadow-subtle space-y-6"
          >
            {/* Card Metadata Strip */}
            <div className="flex items-center justify-between gap-2 border-b border-zinc-100 dark:border-[#1e1e2a] pb-4">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-[#0d0d12] border border-zinc-200 dark:border-[#1e1e2a] text-zinc-600 dark:text-[#8b8b9e] text-xs font-mono">
                <Sparkles size={12} className="text-[#5e6ad2]" />
                <span className="font-semibold text-zinc-900 dark:text-[#ebebef]">Question {current + 1}</span>
                <span className="text-zinc-400 dark:text-zinc-600">•</span>
                <span>Synthesized Objective</span>
              </div>

              {streak > 1 && (
                <m.div
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  key={streak}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-mono font-bold"
                >
                  <Flame size={12} />
                  <span>{streak} Streak</span>
                </m.div>
              )}
            </div>

            {/* Question Text */}
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-[#ebebef] leading-snug">
              {renderVisualText(q.question)}
            </h2>

            {/* Options Track */}
            <div className="space-y-2.5">
              {q.options.map((opt: string, i: number) => {
                const normalizeStr = (s: string) => s.replace(/\s+/g, "").toLowerCase();
                const isSelected = answers[q.id] === opt;
                const isCorrect = q.answer === opt || normalizeStr(q.answer) === normalizeStr(opt);
                const isWrong = isSelected && !isCorrect;
                const showFeedback = !!answers[q.id];

                let optionContainerStyle = "border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50/60 dark:bg-[#0d0d12]/50 hover:bg-zinc-100 dark:hover:bg-[#181824] hover:border-zinc-300 dark:hover:border-[#2a2a3c] text-zinc-800 dark:text-[#ebebef]";
                let pillStyle = "bg-zinc-200/70 dark:bg-[#1e1e2a] text-zinc-600 dark:text-zinc-400";

                if (showFeedback) {
                  if (isCorrect) {
                    optionContainerStyle = "border-emerald-500/80 bg-emerald-500/10 text-emerald-900 dark:text-emerald-300 font-semibold";
                    pillStyle = "bg-emerald-500 text-white";
                  } else if (isWrong) {
                    optionContainerStyle = "border-rose-500/80 bg-rose-500/10 text-rose-900 dark:text-rose-300 font-semibold";
                    pillStyle = "bg-rose-500 text-white";
                  } else {
                    optionContainerStyle = "opacity-45 border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50/30 dark:bg-[#0d0d12]/30 text-zinc-400 dark:text-zinc-600";
                    pillStyle = "bg-zinc-200/40 dark:bg-[#1e1e2a]/40 text-zinc-400 dark:text-zinc-600";
                  }
                } else if (isSelected) {
                  optionContainerStyle = "border-[#5e6ad2] bg-[#5e6ad2]/10 text-zinc-900 dark:text-[#ebebef] font-semibold";
                  pillStyle = "bg-[#5e6ad2] text-white";
                }

                return (
                  <button
                    key={i}
                    type="button"
                    disabled={showFeedback}
                    onClick={() => handleAnswer(opt)}
                    className={cn(
                      "w-full text-left p-3.5 sm:p-4 rounded-xl border transition-all flex items-center justify-between gap-3 text-sm cursor-pointer shadow-subtle group",
                      optionContainerStyle
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className={cn(
                        "w-6 h-6 rounded-md text-[11px] font-mono font-bold flex items-center justify-center shrink-0 transition-colors",
                        pillStyle
                      )}>
                        {OPTION_LABELS[i] || i + 1}
                      </span>
                      <span className="leading-relaxed truncate sm:whitespace-normal">
                        {renderVisualText(opt)}
                      </span>
                    </div>

                    {showFeedback && isCorrect && (
                      <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                    )}
                    {showFeedback && isWrong && (
                      <XCircle size={18} className="text-rose-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation Disclosure */}
            <AnimatePresence>
              {answers[q.id] && q.explanation && (
                <m.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 20 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="rounded-xl border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50 dark:bg-[#0d0d12] p-4 sm:p-5 overflow-hidden"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#5e6ad2]/15 text-[#5e6ad2] flex items-center justify-center shrink-0 mt-0.5">
                      <Lightbulb size={15} />
                    </div>
                    <div className="space-y-1 text-xs">
                      <p className="font-mono uppercase tracking-wider font-semibold text-zinc-500 dark:text-[#8b8b9e]">
                        Verified Explanation
                      </p>
                      <p className="leading-relaxed text-zinc-700 dark:text-zinc-300">
                        {renderVisualText(q.explanation)}
                      </p>
                    </div>
                  </div>
                </m.div>
              )}
            </AnimatePresence>
          </m.div>
        </AnimatePresence>

        {/* Navigation Action Bar */}
        <div className="flex items-center justify-between gap-4 mt-6">
          <button
            type="button"
            disabled={current === 0}
            onClick={() => setCurrent((prev) => prev - 1)}
            className={cn(
              "inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer",
              current === 0
                ? "opacity-0 pointer-events-none"
                : "border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] text-zinc-700 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-[#ebebef] hover:bg-zinc-50 dark:hover:bg-[#1e1e2a]"
            )}
          >
            <ArrowLeft size={14} />
            <span>Previous</span>
          </button>

          {current < quiz.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrent((prev) => prev + 1)}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-semibold bg-[#5e6ad2] hover:bg-[#4f5ac4] text-white shadow-sm transition-all cursor-pointer active:scale-95 shadow-[#5e6ad2]/20"
            >
              <span>Next Question</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowResults(true)}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all cursor-pointer active:scale-95 shadow-emerald-500/20"
            >
              <Check size={14} />
              <span>Complete Assessment</span>
            </button>
          )}
        </div>
      </main>

      {/* Bob Assistant Modal */}
      <BobAssistant
        question={q}
        isOpen={isBobOpen}
        onClose={() => setIsBobOpen(false)}
        customContext="You are Bob, an AI tutor helping the user review and understand this quiz question. Explain underlying concepts simply and clarify why certain options are correct or incorrect without simply giving away answers."
        initialMessage="Need clarification on this question or want to explore the concept deeper? Ask me anything!"
      />

      {/* Floating Bob AI Trigger Pill (Homepage Aligned) */}
      <button
        type="button"
        onClick={() => setIsBobOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-zinc-900 dark:bg-[#14141e] hover:bg-zinc-800 dark:hover:bg-[#1e1e2a] text-zinc-100 border border-zinc-700/60 dark:border-[#2a2a3c] shadow-xl px-4 py-2.5 rounded-full flex items-center gap-2 transition-all hover:scale-105 active:scale-95 text-xs font-semibold cursor-pointer group"
        title="Ask Bob AI"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <Bot className="w-4 h-4 text-[#5e6ad2]" />
        <span>Ask Bob AI</span>
      </button>
    </div>
  );
}
