"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { ModeCard } from "@/components/quiz/ModeCard";
import { Database } from "lucide-react";

// --- Icons ---
const DBIcon = () => <span className="text-5xl">🗄️</span>;
const TimerIcon = () => <span className="text-5xl">⏳</span>;
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

export default function ModeSelect() {
  const router = useRouter();
  const [modal, setModal] = useState<"none" | "practice" | "exam">("none");
  const [practiceCount, setPracticeCount] = useState<number | "all">("all");
  const [examCount, setExamCount] = useState<number>(50);

  return (
    <div className="min-h-screen transition-colors duration-500 bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-950 dark:via-gray-900 dark:to-red-950 pt-20">
      
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl animate-pulse bg-red-500/20 dark:bg-red-500/10"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl animate-pulse bg-orange-500/20 dark:bg-orange-500/10" style={{ animationDelay: "1s" }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 pb-20">
        {/* Logo Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-sm transition-all duration-300 hover:scale-105 bg-red-500/10 border-red-500/30 text-red-600 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400">
            <Database className="w-6 h-6" />
            <span className="text-sm font-bold tracking-wider">
              ORACLE CERTIFIED ASSOCIATE
            </span>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold mb-6 pb-4 text-center bg-gradient-to-r from-red-600 via-orange-600 to-red-800 dark:from-red-400 dark:via-orange-300 dark:to-red-200 bg-clip-text text-transparent"
        >
          Master Java & SQL
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto text-center text-gray-600 dark:text-gray-400"
        >
          Prepare for the Oracle certification exam with our comprehensive practice suite.
        </motion.p>

        {/* Mode Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-5xl w-full grid md:grid-cols-2 gap-8 px-4"
        >
          <ModeCard
            title="Practice Labs"
            description="Access questions with immediate feedback and detailed explanations."
            icon={<DBIcon />}
            features={["Instant feedback", "Detailed explanations", "No time pressure"]}
            buttonText="Start Practice"
            gradient="from-red-400 to-orange-500"
            iconBgLight="bg-red-100"
            iconBgDark="bg-red-500"
            onClick={() => setModal("practice")}
            iconColorClass="text-red-600"
          />

          <ModeCard
            title="Exam Simulation"
            description="Simulate the real Oracle exam with 50 questions in 90 minutes."
            icon={<TimerIcon />}
            features={["90-minute timer", "50 questions", "65% passing score"]}
            buttonText="Start Exam"
            gradient="from-orange-500 to-red-600"
            iconBgLight="bg-orange-100"
            iconBgDark="bg-orange-500"
            onClick={() => setModal("exam")}
            iconColorClass="text-orange-500"
            buttonColorClass="text-orange-700 dark:text-orange-900"
          />
        </motion.div>
      </div>

      {/* --- MODALS --- */}

      {/* Practice Mode Modal */}
      {modal === "practice" && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl shadow-2xl max-w-lg w-full p-6 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <div className="flex justify-between items-center mb-4 border-b pb-4 border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold flex items-center gap-2">
                Practice Mode
              </h3>
              <button
                onClick={() => setModal("none")}
                className="p-1 rounded-full transition hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="mb-6 p-4 rounded-lg text-sm bg-blue-50 text-blue-900 dark:bg-blue-500/20 dark:text-blue-200">
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
                {[30, 50, 65, 100].map((count) => (
                  <button
                    key={count}
                    onClick={() => setPracticeCount(count)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                      practiceCount === count
                        ? "bg-red-600 text-white shadow-lg shadow-red-500/30"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500 dark:border-transparent"
                    }`}
                  >
                    {count}
                  </button>
                ))}
                <button
                  onClick={() => setPracticeCount("all")}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    practiceCount === "all"
                      ? "bg-red-600 text-white shadow-lg shadow-red-500/30"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500 dark:border-transparent"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setPracticeCount(0)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    typeof practiceCount === "number" && practiceCount !== 30 && practiceCount !== 50 && practiceCount !== 65 && practiceCount !== 100
                      ? "bg-red-600 text-white shadow-lg shadow-red-500/30"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500 dark:border-transparent"
                  }`}
                >
                  Custom
                </button>
              </div>
              {typeof practiceCount === "number" && practiceCount !== 30 && practiceCount !== 50 && practiceCount !== 65 && practiceCount !== 100 && (
                <input
                  type="number"
                  min="1"
                  max="1500"
                  value={practiceCount || ""}
                  onChange={(e) => setPracticeCount(parseInt(e.target.value) || 1)}
                  placeholder="Enter number of questions"
                  className="w-full px-4 py-2 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-gray-900 border border-gray-300 dark:bg-gray-600 dark:text-white dark:border-gray-500 dark:placeholder-gray-400"
                />
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModal("none")}
                className="px-5 py-2 rounded-lg font-medium transition bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Back
              </button>
              <button
                onClick={() => {
                  const countParam = practiceCount === "all" ? "all" : practiceCount.toString();
                  router.push(`/oracle-quiz?mode=practice&count=${countParam}`);
                }}
                className="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-bold transition shadow-lg shadow-red-500/30"
              >
                Start Practice
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Exam Mode Modal */}
      {modal === "exam" && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl shadow-2xl max-w-lg w-full p-6 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                Exam Instructions
              </h2>
              <button
                onClick={() => setModal("none")}
                className="p-1 rounded-full transition hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-3 rounded-lg text-center bg-gray-50 dark:bg-gray-700">
                <p className="text-xs uppercase font-bold text-gray-500 dark:text-gray-400">
                  Duration
                </p>
                <p className="text-xl font-bold">
                  90 Mins
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

            {/* Question Count Selection */}
            <div className="mb-6 p-4 rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700/30">
              <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-200">
                Select number of questions:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[30, 50, 65].map((count) => (
                  <button
                    key={count}
                    onClick={() => setExamCount(count)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                      examCount === count
                        ? "bg-red-600 text-white shadow-lg shadow-red-500/30"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500 dark:border-transparent"
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
              <p className="text-xs mt-2 text-gray-400 dark:text-gray-500">
                Default: 50 (Real Oracle exam format might vary).
              </p>
            </div>

            {/* Critical Rules */}
            <div className="space-y-3 mb-6 text-gray-700 dark:text-gray-300">
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Passing Score:</strong> 65%.
                </li>
                <li>The timer starts immediately.</li>
                <li>
                  Results are <strong>hidden</strong> until submission.
                </li>
              </ul>
            </div>

            {/* Disclaimer */}
            <div className="mb-6 pt-4 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs text-center leading-relaxed text-gray-400 dark:text-gray-500">
                By starting, you agree that these questions are for practice
                only. Accuracy is not guaranteed.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setModal("none")}
                className="flex-1 py-3 rounded-lg font-semibold transition bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Decline
              </button>
              <button
                onClick={() => router.push(`/oracle-quiz?mode=exam&count=${examCount}`)}
                className="flex-[2] py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 font-bold transition shadow-lg shadow-red-500/30"
              >
                Agree & Start Exam
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
