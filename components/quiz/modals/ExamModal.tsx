"use client";

import { m } from "framer-motion";
import { useEffect } from "react";
import { QuizTheme } from "@/lib/quiz-themes";

interface ExamModalProps {
  config: QuizTheme;
  examCount: number;
  setExamCount: (count: number) => void;
  onClose: () => void;
  onStart: () => void;
}

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

export function ExamModal({ config, examCount, setExamCount, onClose, onStart }: ExamModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <m.div 
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <m.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="rounded-xl border border-zinc-200 dark:border-[#1e1e2a] shadow-2xl max-w-lg w-full p-6 bg-white dark:bg-[#14141e] text-zinc-900 dark:text-[#ebebef]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5 border-b pb-4 border-zinc-200 dark:border-[#1e1e2a]">
          <div>
            <h2 className="text-base font-semibold tracking-[-0.015em] text-zinc-900 dark:text-[#ebebef]">
              Proctored Exam Simulation Protocol
            </h2>
            <p className="text-xs text-zinc-500 dark:text-[#8b8b9e] mt-0.5">
              Simulated vendor exam under strict timing and passing constraints
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-[#ebebef] hover:bg-zinc-100 dark:hover:bg-[#1a1a26] transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="p-3 rounded-lg text-center bg-zinc-50 dark:bg-[#101017] border border-zinc-200 dark:border-[#1e1e2a]">
            <p className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 dark:text-[#6e6e84]">
              Allocated Duration
            </p>
            <p className="text-lg font-bold font-mono text-zinc-900 dark:text-[#ebebef] mt-0.5">
              {config.exam.duration} Minutes
            </p>
          </div>
          <div className="p-3 rounded-lg text-center bg-zinc-50 dark:bg-[#101017] border border-zinc-200 dark:border-[#1e1e2a]">
            <p className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 dark:text-[#6e6e84]">
              Question Target
            </p>
            <p className="text-lg font-bold font-mono text-[#5e6ad2] mt-0.5">
              {examCount} Questions
            </p>
          </div>
        </div>

        <div className="mb-5 p-4 rounded-lg border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50 dark:bg-[#101017]">
          <label className="block text-xs font-semibold mb-2.5 text-zinc-700 dark:text-[#c4c4d4]">
            Select Examination Scope:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {config.exam.options.map((count) => (
              <button
                key={count}
                onClick={() => setExamCount(count)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer ${
                  examCount === count
                    ? "bg-[#5e6ad2] text-white shadow-subtle border border-[#5e6ad2]"
                    : "bg-white dark:bg-[#181824] text-zinc-700 dark:text-[#8b8b9e] border border-zinc-200 dark:border-[#222232] hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                {count} Questions
              </button>
            ))}
          </div>
          <p className="text-[11px] mt-2 text-zinc-500 dark:text-[#8b8b9e]">
            Official Exam Standard: <span className="font-semibold text-zinc-800 dark:text-[#ebebef]">{config.exam.default} Questions</span>
          </p>
        </div>

        <div className="space-y-2 mb-5 text-xs text-zinc-600 dark:text-[#8b8b9e]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Passing Cutoff Benchmark: <strong className="text-zinc-900 dark:text-[#ebebef]">{config.exam.passingScore}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Results and detailed answer keys remain locked until submission</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span className="text-rose-600 dark:text-rose-400 font-medium">Do not refresh browser during exam to preserve session state</span>
          </div>
        </div>

        <div className="flex justify-end gap-2.5 pt-3 border-t border-zinc-200 dark:border-[#1e1e2a]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium transition bg-zinc-100 hover:bg-zinc-200 dark:bg-[#1a1a26] dark:hover:bg-[#222232] text-zinc-700 dark:text-[#8b8b9e] cursor-pointer"
          >
            Decline
          </button>
          <button
            onClick={onStart}
            className="px-5 py-2 rounded-lg text-xs font-semibold transition bg-[#5e6ad2] hover:bg-[#4f59b8] text-white shadow-subtle cursor-pointer"
          >
            Agree & Start Exam
          </button>
        </div>
      </m.div>
    </m.div>
  );
}
