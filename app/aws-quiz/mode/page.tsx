"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";

// --- Icons ---
const BookIcon = () => <span className="text-5xl">📚</span>;
const TimerIcon = () => <span className="text-5xl">⏱️</span>;
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
const HomeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
    />
  </svg>
);

export default function ModeSelect() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(true);
  const [modal, setModal] = useState<"none" | "practice" | "exam">("none");

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        isDark
          ? "bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950"
          : "bg-gradient-to-br from-gray-50 via-white to-blue-50"
      }`}
    >
      {/* Theme Toggle */}
      <button
        onClick={() => setIsDark(!isDark)}
        className={`fixed top-6 right-6 z-50 p-3 rounded-full transition-all ${
          isDark
            ? "bg-gray-800 hover:bg-gray-700 text-yellow-400"
            : "bg-white hover:bg-gray-100 text-gray-900 shadow-lg"
        }`}
      >
        {isDark ? "☀️" : "🌙"}
      </button>

      {/* Home Button */}
      <button
        onClick={() => router.push("/")}
        className={`fixed top-6 left-6 z-50 p-3 rounded-full transition-all flex items-center gap-2 ${
          isDark
            ? "bg-gray-800 hover:bg-gray-700 text-white"
            : "bg-white hover:bg-gray-100 text-gray-900 shadow-lg"
        }`}
      >
        <HomeIcon />
        <span className="hidden sm:inline text-sm font-semibold">Home</span>
      </button>

      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl animate-pulse ${
            isDark ? "bg-orange-500/10" : "bg-orange-500/20"
          }`}
        ></div>
        <div
          className={`absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl animate-pulse ${
            isDark ? "bg-red-500/10" : "bg-red-500/20"
          }`}
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-20">
        {/* Logo Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${
              isDark
                ? "bg-orange-500/10 border-orange-500/20 text-orange-400"
                : "bg-orange-500/10 border-orange-500/30 text-orange-600"
            }`}
          >
            <span className="text-2xl">☁️</span>
            <span className="text-sm font-bold tracking-wider">
              AWS CERTIFICATION PREP
            </span>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className={`text-5xl md:text-7xl font-extrabold mb-6 text-center ${
            isDark
              ? "bg-gradient-to-r from-white via-orange-100 to-red-100 bg-clip-text text-transparent"
              : "bg-gradient-to-r from-gray-900 via-orange-900 to-red-900 bg-clip-text text-transparent"
          }`}
        >
          Select Your Challenge
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className={`text-xl md:text-2xl mb-12 max-w-3xl mx-auto text-center ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Choose how you want to prepare for AWS Cloud Practitioner
          certification
        </motion.p>

        {/* Mode Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-5xl w-full grid md:grid-cols-2 gap-8 px-4"
        >
          {/* Practice Card */}
          <button
            onClick={() => setModal("practice")}
            className="group relative"
          >
            <div
              className={`relative p-8 rounded-3xl transition-all duration-300 overflow-hidden ${
                isDark
                  ? "bg-gray-900/50 hover:bg-gray-900/70 border border-gray-800"
                  : "bg-white hover:bg-gray-50 border border-gray-200 shadow-lg"
              } hover:scale-105 hover:shadow-2xl`}
            >
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>

              <div className="relative z-10 text-left">
                <div
                  className={`mb-6 w-20 h-20 flex items-center justify-center rounded-2xl transform group-hover:scale-110 transition-transform duration-300 ${
                    isDark ? "bg-blue-500/20" : "bg-blue-100"
                  }`}
                >
                  <BookIcon />
                </div>
                <h2
                  className={`text-2xl font-bold mb-3 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Practice Question Bank
                </h2>
                <p
                  className={`mb-6 leading-relaxed ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Access 1500+ questions with immediate feedback and detailed
                  explanations
                </p>

                {/* Features */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <svg
                      className="w-5 h-5 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span
                      className={isDark ? "text-gray-400" : "text-gray-600"}
                    >
                      Instant feedback
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <svg
                      className="w-5 h-5 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span
                      className={isDark ? "text-gray-400" : "text-gray-600"}
                    >
                      Detailed explanations
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <svg
                      className="w-5 h-5 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span
                      className={isDark ? "text-gray-400" : "text-gray-600"}
                    >
                      No time pressure
                    </span>
                  </div>
                </div>

                <span className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold group-hover:gap-4 transition-all">
                  Start Practice
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </span>
              </div>
            </div>
          </button>

          {/* Exam Card */}
          <button onClick={() => setModal("exam")} className="group relative">
            <div
              className={`relative p-8 rounded-3xl transition-all duration-300 overflow-hidden ${
                isDark
                  ? "bg-gray-900/50 hover:bg-gray-900/70 border border-gray-800"
                  : "bg-white hover:bg-gray-50 border border-gray-200 shadow-lg"
              } hover:scale-105 hover:shadow-2xl`}
            >
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>

              <div className="relative z-10 text-left">
                <div
                  className={`mb-6 w-20 h-20 flex items-center justify-center rounded-2xl transform group-hover:scale-110 transition-transform duration-300 ${
                    isDark ? "bg-red-500/20" : "bg-red-100"
                  }`}
                >
                  <TimerIcon />
                </div>
                <h2
                  className={`text-2xl font-bold mb-3 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Real Exam Simulation
                </h2>
                <p
                  className={`mb-6 leading-relaxed ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Simulate the real AWS exam with 65 questions in 90 minutes
                </p>

                {/* Features */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <svg
                      className="w-5 h-5 text-orange-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span
                      className={isDark ? "text-gray-400" : "text-gray-600"}
                    >
                      90-minute timer
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <svg
                      className="w-5 h-5 text-orange-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span
                      className={isDark ? "text-gray-400" : "text-gray-600"}
                    >
                      65 questions
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <svg
                      className="w-5 h-5 text-orange-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span
                      className={isDark ? "text-gray-400" : "text-gray-600"}
                    >
                      70% passing score
                    </span>
                  </div>
                </div>

                <span className="inline-flex items-center gap-2 text-red-600 dark:text-red-400 font-bold group-hover:gap-4 transition-all">
                  Start Exam
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </span>
              </div>
            </div>
          </button>
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
            className={`rounded-2xl shadow-2xl max-w-lg w-full p-6 ${
              isDark ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="flex justify-between items-center mb-4 border-b pb-4 border-gray-700">
              <h3
                className={`text-lg font-bold flex items-center gap-2 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Practice Mode
              </h3>
              <button
                onClick={() => setModal("none")}
                className={`p-1 rounded-full transition ${
                  isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
                }`}
              >
                <CloseIcon />
              </button>
            </div>

            <div
              className={`mb-6 p-4 rounded-lg text-sm ${
                isDark
                  ? "bg-blue-500/20 text-blue-200"
                  : "bg-blue-50 text-blue-900"
              }`}
            >
              <p>
                <strong>Note:</strong> This mode is for study purposes. Correct
                answers and explanations will be shown immediately after
                answering.
              </p>
            </div>

            <ul
              className={`space-y-2 text-sm list-disc pl-5 mb-8 ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              <li>Accuracy is not guaranteed. Focus on concepts.</li>
              <li>Questions are from public sources.</li>
              <li>No timer attached.</li>
            </ul>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModal("none")}
                className={`px-5 py-2 rounded-lg font-medium transition ${
                  isDark
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Back
              </button>
              <button
                onClick={() => router.push("/aws-quiz?mode=practice")}
                className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-bold transition shadow-lg shadow-blue-500/30"
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
            className={`rounded-2xl shadow-2xl max-w-lg w-full p-6 ${
              isDark ? "bg-gray-800" : "bg-white"
            }`}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2
                className={`text-2xl font-bold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Exam Instructions
              </h2>
              <button
                onClick={() => setModal("none")}
                className={`p-1 rounded-full transition ${
                  isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
                }`}
              >
                <CloseIcon />
              </button>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div
                className={`p-3 rounded-lg text-center ${
                  isDark ? "bg-gray-700" : "bg-gray-50"
                }`}
              >
                <p
                  className={`text-xs uppercase font-bold ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Duration
                </p>
                <p
                  className={`text-xl font-bold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  90 Mins
                </p>
              </div>
              <div
                className={`p-3 rounded-lg text-center ${
                  isDark ? "bg-gray-700" : "bg-gray-50"
                }`}
              >
                <p
                  className={`text-xs uppercase font-bold ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Questions
                </p>
                <p
                  className={`text-xl font-bold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  65 Items
                </p>
              </div>
            </div>

            {/* Critical Rules */}
            <div
              className={`space-y-3 mb-6 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Passing Score:</strong> 70% (46/65 correct).
                </li>
                <li>The timer starts immediately.</li>
                <li>
                  Results are <strong>hidden</strong> until submission.
                </li>
                <li
                  className={`font-bold px-2 py-1 rounded inline-block ${
                    isDark
                      ? "text-red-400 bg-red-900/20"
                      : "text-red-600 bg-red-50"
                  }`}
                >
                  ⚠️ DO NOT REFRESH the page during the test.
                </li>
              </ul>
            </div>

            {/* Disclaimer */}
            <div
              className={`mb-6 pt-4 border-t ${
                isDark ? "border-gray-700" : "border-gray-100"
              }`}
            >
              <p
                className={`text-xs text-center leading-relaxed ${
                  isDark ? "text-gray-500" : "text-gray-400"
                }`}
              >
                By starting, you agree that these questions are for practice
                only. Accuracy is not guaranteed. The app is not responsible for
                errors or exam outcomes.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setModal("none")}
                className={`flex-1 py-3 rounded-lg font-semibold transition ${
                  isDark
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Decline
              </button>
              <button
                onClick={() => router.push("/aws-quiz?mode=exam")}
                className="flex-[2] py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-bold transition shadow-lg shadow-blue-500/30"
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
