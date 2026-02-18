"use client";

import { motion } from "framer-motion";
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
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="rounded-2xl shadow-2xl max-w-lg w-full p-6 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            Exam Instructions
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full transition hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-3 rounded-lg text-center bg-gray-50 dark:bg-gray-700">
            <p className="text-xs uppercase font-bold text-gray-500 dark:text-gray-400">
              Duration
            </p>
            <p className="text-xl font-bold">
              {config.exam.duration} Mins
            </p>
          </div>
          <div className="p-3 rounded-lg text-center bg-gray-50 dark:bg-gray-700">
            <p className="text-xs uppercase font-bold text-gray-500 dark:text-gray-400">
              Questions
            </p>
            <p className="text-xl font-bold">
              {examCount} Items
            </p>
          </div>
        </div>

        <div className="mb-6 p-4 rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700/30">
          <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-200">
            Select number of questions:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {config.exam.options.map((count) => (
              <button
                key={count}
                onClick={() => setExamCount(count)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  examCount === count
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500 dark:border-transparent"
                }`}
              >
                {count}
              </button>
            ))}
          </div>
          <p className="text-xs mt-2 text-gray-400 dark:text-gray-500">
            Default: {config.exam.default} (Real exam format).
          </p>
        </div>

        <div className="space-y-3 mb-6 text-gray-700 dark:text-gray-300">
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Passing Score:</strong> {config.exam.passingScore}.
            </li>
            <li>The timer starts immediately.</li>
            <li>
              Results are <strong>hidden</strong> until submission.
            </li>
            <li className="font-bold px-2 py-1 rounded inline-block text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20">
              ⚠️ DO NOT REFRESH the page during the test.
            </li>
          </ul>
        </div>

        <div className="mb-6 pt-4 border-t border-gray-100 dark:border-gray-700">
          <p className="text-xs text-center leading-relaxed text-gray-400 dark:text-gray-500">
            By starting, you agree that these questions are for practice
            only. Accuracy is not guaranteed. The app is not responsible for
            errors or exam outcomes.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-lg font-semibold transition bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Decline
          </button>
          <button
            onClick={onStart}
            className="flex-[2] py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-bold transition shadow-lg shadow-blue-500/30"
          >
            Agree & Start Exam
          </button>
        </div>
      </motion.div>
    </div>
  );
}
