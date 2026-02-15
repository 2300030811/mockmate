"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { ModeCard } from "@/components/quiz/ModeCard";
import { ArrowLeft, Home } from "lucide-react";
import Link from "next/link";

// --- Icons ---
const CloudIcon = () => <span className="text-5xl">🔷</span>; // Blue Diamond for Azure
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
  const [examCount, setExamCount] = useState<number>(40);

  return (
    <div className="min-h-screen transition-colors duration-500 bg-gradient-to-br from-cyan-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-cyan-950 pt-20">
      
      {/* Navigation Pill */}
      <div className="absolute top-6 left-6 z-50">
        <div className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-full shadow-lg border border-gray-200 dark:border-gray-700">
          <button onClick={() => router.back()} className="flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
          <Link href="/" className="flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
            <Home className="w-4 h-4" />
            <span>Home</span>
          </Link>
        </div>
      </div>
      
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl animate-pulse bg-cyan-500/20 dark:bg-cyan-500/10"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl animate-pulse bg-blue-500/20 dark:bg-blue-500/10" style={{ animationDelay: "1s" }}></div>
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-sm transition-all duration-300 hover:scale-105 bg-cyan-500/10 border-cyan-500/30 text-cyan-600 dark:bg-cyan-500/10 dark:border-cyan-500/20 dark:text-cyan-400">
            <span className="text-2xl">🔷</span>
            <span className="text-sm font-bold tracking-wider">
              AZ-900 AZURE FUNDAMENTALS
            </span>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold mb-6 pb-4 text-center bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-800 dark:from-blue-400 dark:via-cyan-300 dark:to-blue-200 bg-clip-text text-transparent"
        >
          Master Azure Cloud
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto text-center text-gray-600 dark:text-gray-400"
        >
          Choose how you want to prepare for Microsoft Azure Fundamentals certification.
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
            description="Access comprehensive questions including MCQ, Hotspot, and Drag & Drop."
            icon={<CloudIcon />}
            features={["Instant feedback", "Detailed explanations", "No time pressure"]}
            buttonText="Start Practice"
            gradient="from-cyan-400 to-blue-500"
            iconBgLight="bg-cyan-100"
            iconBgDark="bg-cyan-500"
            onClick={() => setModal("practice")}
            iconColorClass="text-cyan-600"
          />

          <ModeCard
            title="Exam Simulation"
            description="Simulate the real AZ-900 exam with 40 questions in 45 minutes."
            icon={<TimerIcon />}
            features={["45-minute timer", "40 questions", "70% passing score"]}
            buttonText="Start Exam"
            gradient="from-blue-500 to-indigo-600"
            iconBgLight="bg-blue-100"
            iconBgDark="bg-blue-500"
            onClick={() => setModal("exam")}
            iconColorClass="text-blue-500"
            buttonColorClass="text-blue-700 dark:text-blue-900"
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

            <div className="mb-6 p-4 rounded-lg text-sm bg-cyan-50 text-cyan-900 dark:bg-cyan-500/20 dark:text-cyan-200">
              <p>
                <strong>Note:</strong> This mode is for study purposes. Correct
                answers and explanations will be shown immediately after
                answering.
              </p>
            </div>

            <ul className="space-y-2 text-sm list-disc pl-5 mb-6 text-gray-600 dark:text-gray-400">
              <li>Accuracy is not guaranteed. Focus on concepts.</li>
              <li>Includes Image-based (Hotspot) and Drag & Drop questions.</li>
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
                        ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/30"
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
                      ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/30"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500 dark:border-transparent"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setPracticeCount(0)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    typeof practiceCount === "number" && practiceCount !== 30 && practiceCount !== 50 && practiceCount !== 65 && practiceCount !== 100
                      ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/30"
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
                  max="500"
                  value={practiceCount || ""}
                  onChange={(e) => setPracticeCount(parseInt(e.target.value) || 1)}
                  placeholder="Enter number of questions"
                  className="w-full px-4 py-2 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white text-gray-900 border border-gray-300 dark:bg-gray-600 dark:text-white dark:border-gray-500 dark:placeholder-gray-400"
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
                  router.push(`/azure-quiz?mode=practice&count=${countParam}`);
                }}
                className="px-5 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 font-bold transition shadow-lg shadow-cyan-500/30"
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
                  45 Mins
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
                {[30, 40, 50].map((count) => (
                  <button
                    key={count}
                    onClick={() => setExamCount(count)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                      examCount === count
                        ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/30"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500 dark:border-transparent"
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
              <p className="text-xs mt-2 text-gray-400 dark:text-gray-500">
                Default: 40 (Real AZ-900 exam format). Choose 30 or 50 for a quick test.
              </p>
            </div>

            {/* Critical Rules */}
            <div className="space-y-3 mb-6 text-gray-700 dark:text-gray-300">
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Passing Score:</strong> 700/1000 (~70%).
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

            {/* Disclaimer */}
            <div className="mb-6 pt-4 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs text-center leading-relaxed text-gray-400 dark:text-gray-500">
                By starting, you agree that these questions are for practice
                only. Accuracy is not guaranteed. The app is not responsible for
                errors or exam outcomes.
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
                onClick={() => router.push(`/azure-quiz?mode=exam&count=${examCount}`)}
                className="flex-[2] py-3 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 font-bold transition shadow-lg shadow-cyan-500/30"
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
