"use client";

import { m } from "framer-motion";
import { useEffect } from "react";
import { QuizTheme } from "@/lib/quiz-themes";

interface PracticeModalProps {
  config: QuizTheme;
  practiceCount: number | "all";
  setPracticeCount: (count: number | "all") => void;
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

export function PracticeModal({ config, practiceCount, setPracticeCount, onClose, onStart }: PracticeModalProps) {
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
        <div className="flex justify-between items-center mb-4 border-b pb-4 border-zinc-200 dark:border-[#1e1e2a]">
          <div>
            <h3 className="text-base font-semibold tracking-[-0.015em] text-zinc-900 dark:text-[#ebebef]">
              Practice Labs Configuration
            </h3>
            <p className="text-xs text-zinc-500 dark:text-[#8b8b9e] mt-0.5">
              Self-paced mastery with instant feedback and explanations
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-[#ebebef] hover:bg-zinc-100 dark:hover:bg-[#1a1a26] transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="mb-5 p-3.5 rounded-lg text-xs bg-zinc-50 dark:bg-[#101017] border border-zinc-200 dark:border-[#1e1e2a] text-zinc-600 dark:text-[#8b8b9e]">
          <strong className="text-zinc-900 dark:text-[#ebebef]">Study Protocol: </strong>
          Correct answers, detailed vendor rationales, and domain breakdowns are revealed immediately after submitting each question.
        </div>

        <ul className="space-y-1.5 text-xs mb-5 text-zinc-500 dark:text-[#8b8b9e]">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Interactive Engines Active (Drag & Drop, Hotspots, Code Snippets)</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5e6ad2]" />
            <span>No countdown timer pressure — take notes and analyze concepts</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>AI Assistant available on every question for step-by-step guidance</span>
          </li>
        </ul>

        {/* Question Count Selection */}
        <div className="mb-6 p-4 rounded-lg border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50 dark:bg-[#101017]">
          <label className="block text-xs font-semibold mb-2.5 text-zinc-700 dark:text-[#c4c4d4]">
            Select Practice Pool Size:
          </label>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <button
              onClick={() => setPracticeCount("all")}
              className={`px-3 py-2 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer ${
                practiceCount === "all"
                  ? "bg-[#5e6ad2] text-white shadow-subtle border border-[#5e6ad2]"
                  : "bg-white dark:bg-[#181824] text-zinc-700 dark:text-[#8b8b9e] border border-zinc-200 dark:border-[#222232] hover:border-zinc-300 dark:hover:border-zinc-700"
              }`}
            >
              All Questions
            </button>
            {config.practice.options.map((count) => (
              <button
                key={count}
                onClick={() => setPracticeCount(count)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer ${
                  practiceCount === count
                    ? "bg-[#5e6ad2] text-white shadow-subtle border border-[#5e6ad2]"
                    : "bg-white dark:bg-[#181824] text-zinc-700 dark:text-[#8b8b9e] border border-zinc-200 dark:border-[#222232] hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                {count} Questions
              </button>
            ))}
            
             <button
               onClick={() => setPracticeCount(1)} 
               className={`px-3 py-2 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer ${
                 typeof practiceCount === "number" && !config.practice.options.includes(practiceCount)
                   ? "bg-[#5e6ad2] text-white shadow-subtle border border-[#5e6ad2]"
                   : "bg-white dark:bg-[#181824] text-zinc-700 dark:text-[#8b8b9e] border border-zinc-200 dark:border-[#222232] hover:border-zinc-300 dark:hover:border-zinc-700"
               }`}
             >
               Custom Size
             </button>
          </div>
          
          {typeof practiceCount === "number" && !config.practice.options.includes(practiceCount) && (
            <input
              type="number"
              min="1"
              max={config.practice.max || 1500}
              value={practiceCount > 0 ? practiceCount : ""}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val) && val > 0) setPracticeCount(val);
              }}
              placeholder="Enter number of questions (e.g. 25)"
              className="w-full px-3 py-2 rounded-lg text-xs font-mono transition-all focus:outline-none focus:border-[#5e6ad2] bg-white dark:bg-[#181824] text-zinc-900 dark:text-[#ebebef] border border-zinc-200 dark:border-[#222232]"
              autoFocus
            />
          )}
        </div>

        <div className="flex justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium transition bg-zinc-100 hover:bg-zinc-200 dark:bg-[#1a1a26] dark:hover:bg-[#222232] text-zinc-700 dark:text-[#8b8b9e] cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onStart}
            disabled={typeof practiceCount === "number" && practiceCount <= 0}
            className="px-5 py-2 rounded-lg text-xs font-semibold transition bg-[#5e6ad2] hover:bg-[#4f59b8] text-white shadow-subtle disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Launch Practice Lab
          </button>
        </div>
      </m.div>
    </m.div>
  );
}
