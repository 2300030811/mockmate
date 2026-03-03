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
        className="rounded-2xl shadow-2xl max-w-lg w-full p-6 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 border-b pb-4 border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold flex items-center gap-2">
            Practice Mode
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full transition hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <CloseIcon />
          </button>
        </div>

        <div className={`mb-6 p-4 rounded-lg text-sm ${config.cards.practice.iconBgLight} text-gray-900 border border-current dark:bg-opacity-20`}>
          <p>
            <strong>Note:</strong> This mode is for study purposes. Correct
            answers and explanations will be shown immediately after
            answering.
          </p>
        </div>

        <ul className="space-y-2 text-sm list-disc pl-5 mb-6 text-gray-600 dark:text-gray-400">
          <li>Accuracy is not guaranteed. Focus on concepts.</li>
          <li>Questions are from public sources.</li>
          <li>No timer attached.</li>
        </ul>

        {/* Question Count Selection */}
        <div className="mb-6 p-4 rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700/30">
          <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-200">
            How many questions do you want to practice?
          </label>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {config.practice.options.map((count) => (
              <button
                key={count}
                onClick={() => setPracticeCount(count as (number | "all"))}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  practiceCount === count
                    ? (config.practice.activeClass || "bg-blue-600 text-white shadow-lg shadow-blue-500/30")
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500 dark:border-transparent"
                }`}
              >
                {count}
              </button>
            ))}
            
             <button
               onClick={() => setPracticeCount(0)} 
               className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                 typeof practiceCount === "number" && !config.practice.options.includes(practiceCount)
                   ? (config.practice.activeClass || "bg-blue-600 text-white shadow-lg shadow-blue-500/30")
                   : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500 dark:border-transparent"
               }`}
             >
               Custom
             </button>
          </div>
          
          {typeof practiceCount === "number" && !config.practice.options.includes(practiceCount) && (
            <input
              type="number"
              min="1"
              max={config.practice.max || 1500}
              value={practiceCount || ""}
              onChange={(e) => setPracticeCount(parseInt(e.target.value) || 1)}
              placeholder="Enter number of questions"
              className={`w-full px-4 py-2 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 ${config.practice.ringClass || "focus:ring-blue-500"} bg-white text-gray-900 border border-gray-300 dark:bg-gray-600 dark:text-white dark:border-gray-500 dark:placeholder-gray-400`}
            />
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg font-medium transition bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Back
          </button>
          <button
            onClick={onStart}
            className={`px-5 py-2 rounded-lg font-bold transition ${config.practice.activeClass}`}
          >
            Start Practice
          </button>
        </div>
      </m.div>
    </m.div>
  );
}
