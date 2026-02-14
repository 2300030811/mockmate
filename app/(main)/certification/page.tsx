"use client";

import { useRouter } from "next/navigation";
import { useTheme } from "@/components/providers/providers";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { BobAssistant } from "@/components/quiz/BobAssistant";
import { Database, Zap, Terminal } from "lucide-react";

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

// Salesforce is now represented by a Lightning/Zap icon to distinguish from AWS cloud
const SalesforceIcon = () => (
    <Zap className="w-12 h-12" />
);

// Oracle is represented by Terminal/Code to distinguish from generic databases
const OracleIcon = () => (
    <Terminal className="w-12 h-12" />
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
          className="max-w-7xl w-full grid md:grid-cols-2 lg:grid-cols-3 gap-8 px-4"
        >
          {/* AWS Card */}
          <Link
            href="/aws-quiz/mode"
            className="group relative"
            aria-label="Select AWS Certified Cloud Practitioner"
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
            aria-label="Select Azure Fundamentals AZ-900"
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


          {/* Salesforce Card */}
          <Link
            href="/salesforce-quiz/mode"
            className="group relative"
            aria-label="Select Salesforce Agentforce Specialist"
          >
            <div
              className={`relative h-full p-8 rounded-3xl transition-all duration-300 overflow-hidden ${
                isDark
                  ? "bg-gray-900/50 hover:bg-gray-900/70 border border-gray-800"
                  : "bg-white hover:bg-gray-50 border border-gray-200 shadow-lg"
              } hover:scale-105 hover:shadow-2xl`}
            >
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>

              <div className="relative z-10 text-left h-full flex flex-col">
                <div
                  className={`mb-6 w-20 h-20 flex items-center justify-center rounded-2xl transform group-hover:scale-110 transition-transform duration-300 ${
                    isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"
                  }`}
                >
                  <SalesforceIcon />
                </div>
                <h2
                  className={`text-2xl font-bold mb-3 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Salesforce Agentforce Specialist
                </h2>
                <p
                  className={`mb-6 leading-relaxed flex-grow ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Master Salesforce AI agents, prompt building, and Copilot actions.
                </p>

                <span className="inline-flex items-center gap-2 text-blue-500 font-bold group-hover:gap-4 transition-all mt-auto">
                  Start Salesforce Quiz
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

          {/* MongoDB Card */}
          <Link
            href="/mongodb-quiz/mode"
            className="group relative"
            aria-label="Select MongoDB Certification"
          >
            <div
              className={`relative h-full p-8 rounded-3xl transition-all duration-300 overflow-hidden ${
                isDark
                  ? "bg-gray-900/50 hover:bg-gray-900/70 border border-gray-800"
                  : "bg-white hover:bg-gray-50 border border-gray-200 shadow-lg"
              } hover:scale-105 hover:shadow-2xl`}
            >
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-teal-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>

              <div className="relative z-10 text-left h-full flex flex-col">
                <div
                  className={`mb-6 w-20 h-20 flex items-center justify-center rounded-2xl transform group-hover:scale-110 transition-transform duration-300 ${
                    isDark ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-600"
                  }`}
                >
                  <span className="text-4xl">🍃</span>
                </div>
                <h2
                  className={`text-2xl font-bold mb-3 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  MongoDB Certification
                </h2>
                <p
                  className={`mb-6 leading-relaxed flex-grow ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Prepare for MongoDB Associate exams with targeted practice questions.
                </p>

                <span className="inline-flex items-center gap-2 text-green-500 font-bold group-hover:gap-4 transition-all mt-auto">
                  Start MongoDB Quiz
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

          {/* PCAP Card */}
          <Link
            href="/pcap-quiz/mode"
            className="group relative"
            aria-label="Select PCAP Python Certification"
          >
            <div
              className={`relative h-full p-8 rounded-3xl transition-all duration-300 overflow-hidden ${
                isDark
                  ? "bg-gray-900/50 hover:bg-gray-900/70 border border-gray-800"
                  : "bg-white hover:bg-gray-50 border border-gray-200 shadow-lg"
              } hover:scale-105 hover:shadow-2xl`}
            >
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-yellow-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>

              <div className="relative z-10 text-left h-full flex flex-col">
                <div
                  className={`mb-6 w-20 h-20 flex items-center justify-center rounded-2xl transform group-hover:scale-110 transition-transform duration-300 ${
                    isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"
                  }`}
                >
                  <span className="text-4xl">🐍</span>
                </div>
                <h2
                  className={`text-2xl font-bold mb-3 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  PCAP Python Certified Associate
                </h2>
                <p
                  className={`mb-6 leading-relaxed flex-grow ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Master Python programming with code-centric questions and real-world scenarios.
                </p>

                <span className="inline-flex items-center gap-2 text-blue-500 font-bold group-hover:gap-4 transition-all mt-auto">
                  Start Python Quiz
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

          {/* Oracle Card */}
          <Link
            href="/oracle-quiz/mode"
            className="group relative"
            aria-label="Select Oracle Certified Associate"
          >
            <div
              className={`relative h-full p-8 rounded-3xl transition-all duration-300 overflow-hidden ${
                isDark
                  ? "bg-gray-900/50 hover:bg-gray-900/70 border border-gray-800"
                  : "bg-white hover:bg-gray-50 border border-gray-200 shadow-lg"
              } hover:scale-105 hover:shadow-2xl`}
            >
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-orange-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>

              <div className="relative z-10 text-left h-full flex flex-col">
                <div
                  className={`mb-6 w-20 h-20 flex items-center justify-center rounded-2xl transform group-hover:scale-110 transition-transform duration-300 ${
                    isDark ? "bg-red-500/20 text-red-400" : "bg-red-100 text-red-600"
                  }`}
                >
                  <OracleIcon />
                </div>
                <h2
                  className={`text-2xl font-bold mb-3 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Oracle Certified Associate
                </h2>
                <p
                  className={`mb-6 leading-relaxed flex-grow ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Master Java and SQL concepts for Oracle certifications.
                </p>

                <span className="inline-flex items-center gap-2 text-red-500 font-bold group-hover:gap-4 transition-all mt-auto">
                  Start Oracle Quiz
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

        <BobAssistant
          key="career-guide-bob"
          customContext="You are Bob, a helpful career counselor and certification guide for MockMate. Help the user choose the right certification based on their interests. AWS is great for cloud infrastructure, Azure for Microsoft enterprise, Salesforce for CRM/AI integration, MongoDB for databases, and PCAP for programming. Be encouraging!"
          initialMessage="Hi there! Need help choosing a certification? I can help you decide which path is right for your career goals! 🚀"
        />
      </div>
    </div>
  );
}

