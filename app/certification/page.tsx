"use client";

import { useRouter } from "next/navigation";
import { useTheme } from "../providers";
import { motion } from "framer-motion";
import Link from "next/link";

// --- Icons ---
const AWSIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
        <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z" />
    </svg>
);

const AzureIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
        <path d="M4.2 2h15.6C21 2 22 3 22 4.2v15.6c0 1.2-1 2.2-2.2 2.2H4.2C3 22 2 21 2 19.8V4.2C2 3 3 2 4.2 2zm7.1 14.8L15.6 7l-4.3 8.3-2.1-4-2.1 4L11.3 16.8z" />
    </svg>
);

export default function CertificationSelect() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className={`min-h-screen transition-colors duration-500 pt-20 ${
        isDark
          ? "bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950"
          : "bg-gradient-to-br from-gray-50 via-white to-blue-50"
      }`}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl animate-pulse ${
            isDark ? "bg-cyan-500/10" : "bg-cyan-500/20"
          }`}
        ></div>
        <div
          className={`absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl animate-pulse ${
            isDark ? "bg-orange-500/10" : "bg-orange-500/20"
          }`}
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-20">
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className={`text-5xl md:text-7xl font-extrabold mb-6 text-center ${
            isDark
              ? "bg-gradient-to-r from-white via-cyan-100 to-orange-100 bg-clip-text text-transparent"
              : "bg-gradient-to-r from-gray-900 via-cyan-900 to-orange-900 bg-clip-text text-transparent"
          }`}
        >
          Select Certification
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
          Choose a certification path to begin practicing
        </motion.p>

        {/* Certification Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-5xl w-full grid md:grid-cols-2 gap-8 px-4"
        >
          {/* AWS Card */}
          <Link
            href="/aws-quiz/mode"
            className="group relative"
          >
            <div
              className={`relative h-full p-8 rounded-3xl transition-all duration-300 overflow-hidden ${
                isDark
                  ? "bg-gray-900/50 hover:bg-gray-900/70 border border-gray-800"
                  : "bg-white hover:bg-gray-50 border border-gray-200 shadow-lg"
              } hover:scale-105 hover:shadow-2xl`}
            >
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-yellow-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>

              <div className="relative z-10 text-left h-full flex flex-col">
                <div
                  className={`mb-6 w-20 h-20 flex items-center justify-center rounded-2xl transform group-hover:scale-110 transition-transform duration-300 ${
                    isDark ? "bg-orange-500/20 text-orange-400" : "bg-orange-100 text-orange-600"
                  }`}
                >
                  <AWSIcon />
                </div>
                <h2
                  className={`text-2xl font-bold mb-3 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  AWS Certified Cloud Practitioner
                </h2>
                <p
                  className={`mb-6 leading-relaxed flex-grow ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Prepare for the foundational AWS certification with comprehensive practice questions.
                </p>

                <span className="inline-flex items-center gap-2 text-orange-500 font-bold group-hover:gap-4 transition-all mt-auto">
                  Start AWS Quiz
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
          </Link>

          {/* Azure Card */}
          <Link
            href="/azure-quiz/mode"
            className="group relative"
          >
            <div
              className={`relative h-full p-8 rounded-3xl transition-all duration-300 overflow-hidden ${
                isDark
                  ? "bg-gray-900/50 hover:bg-gray-900/70 border border-gray-800"
                  : "bg-white hover:bg-gray-50 border border-gray-200 shadow-lg"
              } hover:scale-105 hover:shadow-2xl`}
            >
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>

              <div className="relative z-10 text-left h-full flex flex-col">
                <div
                  className={`mb-6 w-20 h-20 flex items-center justify-center rounded-2xl transform group-hover:scale-110 transition-transform duration-300 ${
                    isDark ? "bg-cyan-500/20 text-cyan-400" : "bg-cyan-100 text-cyan-600"
                  }`}
                >
                  <AzureIcon />
                </div>
                <h2
                  className={`text-2xl font-bold mb-3 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Azure Fundamentals (AZ-900)
                </h2>
                <p
                  className={`mb-6 leading-relaxed flex-grow ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Master Microsoft Azure basics and cloud concepts with practice exams.
                </p>

                <span className="inline-flex items-center gap-2 text-cyan-500 font-bold group-hover:gap-4 transition-all mt-auto">
                  Start Azure Quiz
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
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
