"use client";

import { m } from "framer-motion";
import Link from "next/link";
import { 
  ArrowRight, 
  Database, 
  Zap, 
  Terminal, 
  Code 
} from "lucide-react";
import dynamic from 'next/dynamic';
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { NavigationPill } from "@/components/ui/NavigationPill";
import { quizThemes } from "@/lib/quiz-themes";

const BobAssistant = dynamic(() => import("@/components/quiz/BobAssistant").then(mod => mod.BobAssistant), {
  ssr: false,
});

export default function CertificationSelect() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";

  return (
    <div
      className={`min-h-screen transition-colors duration-500 pt-20 ${
        isDark
          ? "bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950"
          : "bg-gradient-to-br from-gray-50 via-white to-blue-50"
      }`}
    >
      <NavigationPill showBack={false} className="absolute top-4 left-4 sm:top-6 sm:left-6 z-50 scale-75 origin-top-left sm:scale-100" />

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
        <m.h1
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
        </m.h1>

        {/* Subtitle */}
        <m.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className={`text-xl md:text-2xl mb-12 max-w-3xl mx-auto text-center ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Choose a certification path to begin practicing
        </m.p>

        {/* Certification Cards */}
        <div
          className="max-w-7xl w-full grid md:grid-cols-2 lg:grid-cols-3 gap-8 px-4"
        >
          {[
            {
              id: "aws",
              href: "/aws-quiz/mode",
              title: "AWS Certified Cloud Practitioner",
              description: "Prepare for the foundational AWS certification with comprehensive practice questions.",
              icon: "☁️",
              buttonText: "Start AWS Quiz",
              accentColor: "orange",
              gradientOverlay: "from-orange-500 to-yellow-500",
              iconBg: "bg-orange-100 dark:bg-orange-500/20",
              iconColor: "text-orange-600 dark:text-orange-400",
              textColor: "text-orange-500",
              ariaLabel: "Select AWS Certified Cloud Practitioner",
            },
            {
              id: "azure",
              href: "/azure-quiz/mode",
              title: "Azure Fundamentals (AZ-900)",
              description: "Master Microsoft Azure basics and cloud concepts with practice exams.",
              icon: "🔷",
              buttonText: "Start Azure Quiz",
              accentColor: "cyan",
              gradientOverlay: "from-cyan-500 to-blue-500",
              iconBg: "bg-cyan-100 dark:bg-cyan-500/20",
              iconColor: "text-cyan-600 dark:text-cyan-400",
              textColor: "text-cyan-500",
              ariaLabel: "Select Azure Fundamentals AZ-900",
            },
            {
              id: "salesforce",
              href: "/salesforce-quiz/mode",
              title: "Salesforce Agentforce Specialist",
              description: "Master Salesforce AI agents, prompt building, and Copilot actions.",
              icon: <Zap className="w-12 h-12" />,
              buttonText: "Start Salesforce Quiz",
              accentColor: "blue",
              gradientOverlay: "from-blue-500 to-indigo-500",
              iconBg: "bg-blue-100 dark:bg-blue-500/20",
              iconColor: "text-blue-600 dark:text-blue-400",
              textColor: "text-blue-500",
              ariaLabel: "Select Salesforce Agentforce Specialist",
            },
            {
              id: "mongodb",
              href: "/mongodb-quiz/mode",
              title: "MongoDB Certification",
              description: "Prepare for MongoDB Associate exams with targeted practice questions.",
              icon: <Database className="w-12 h-12" />,
              buttonText: "Start MongoDB Quiz",
              accentColor: "green",
              gradientOverlay: "from-green-500 to-teal-500",
              iconBg: "bg-green-100 dark:bg-green-500/20",
              iconColor: "text-green-600 dark:text-green-400",
              textColor: "text-green-500",
              ariaLabel: "Select MongoDB Certification",
            },
            {
              id: "pcap",
              href: "/pcap-quiz/mode",
              title: "PCAP Python Certified Associate",
              description: "Master Python programming with code-centric questions and real-world scenarios.",
              icon: <Code className="w-12 h-12" />,
              buttonText: "Start Python Quiz",
              accentColor: "blue",
              gradientOverlay: "from-blue-500 to-yellow-500",
              iconBg: "bg-blue-100 dark:bg-blue-500/20",
              iconColor: "text-blue-600 dark:text-blue-400",
              textColor: "text-blue-500",
              ariaLabel: "Select PCAP Python Certification",
            },
            {
              id: "oracle",
              href: "/oracle-quiz/mode",
              title: "Oracle Certified Associate",
              description: "Master Java and SQL concepts for Oracle certifications.",
              icon: <Terminal className="w-12 h-12" />,
              buttonText: "Start Oracle Quiz",
              accentColor: "red",
              gradientOverlay: "from-red-500 to-orange-500",
              iconBg: "bg-red-100 dark:bg-red-500/20",
              iconColor: "text-red-600 dark:text-red-400",
              textColor: "text-red-500",
              ariaLabel: "Select Oracle Certified Associate",
            },
          ].map((cert, idx) => {
            const themeData = quizThemes[cert.id as keyof typeof quizThemes];
            return (
              <m.div
                key={cert.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + idx * 0.08, ease: "easeOut" }}
              >
                <Link
                  href={cert.href}
                  className="group relative block h-full"
                  aria-label={cert.ariaLabel}
                >
                  <div
                    className={`relative h-full p-8 rounded-3xl transition-all duration-300 overflow-hidden ${
                      isDark
                        ? "bg-gray-900/50 hover:bg-gray-900/70 border border-gray-800"
                        : "bg-white hover:bg-gray-50 border border-gray-200 shadow-lg"
                    } hover:scale-105 hover:shadow-2xl`}
                  >
                    {/* Gradient Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${cert.gradientOverlay} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>

                    <div className="relative z-10 text-left h-full flex flex-col">
                      <div
                        className={`mb-6 w-20 h-20 flex items-center justify-center rounded-2xl transform group-hover:scale-110 transition-transform duration-300 ${cert.iconBg} ${cert.iconColor}`}
                      >
                        {typeof cert.icon === "string" ? (
                          <span className="text-5xl">{cert.icon}</span>
                        ) : (
                          cert.icon
                        )}
                      </div>
                      <h2
                        className={`text-2xl font-bold mb-3 ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {cert.title}
                      </h2>
                      <p
                        className={`mb-4 leading-relaxed ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {cert.description}
                      </p>

                      {/* Exam Info */}
                      <div className={`flex items-center gap-3 mb-4 text-xs font-medium ${
                        isDark ? "text-gray-500" : "text-gray-400"
                      }`}>
                        <span>{themeData.exam.count} questions</span>
                        <span>·</span>
                        <span>{themeData.exam.duration} min</span>
                        <span>·</span>
                        <span>{themeData.exam.passingScore} to pass</span>
                      </div>

                      {/* Question Type Badges */}
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {themeData.questionTypes?.map((type, i) => (
                          <span
                            key={i}
                            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                              isDark
                                ? "bg-white/5 border-white/10 text-gray-400"
                                : "bg-gray-100 border-gray-200 text-gray-500"
                            }`}
                          >
                            {type}
                          </span>
                        ))}
                      </div>

                      <span className={`inline-flex items-center gap-2 ${cert.textColor} font-bold group-hover:gap-4 transition-all mt-auto`}>
                        {cert.buttonText}
                        <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Link>
              </m.div>
            );
          })}
        </div>



        <BobAssistant
          key="career-guide-bob"
          customContext="You are Bob, a helpful career counselor and certification guide for MockMate. Help the user choose the right certification based on their interests. AWS is great for cloud infrastructure, Azure for Microsoft enterprise, Salesforce for CRM/AI integration, MongoDB for databases, and PCAP for programming. Be encouraging!"
          initialMessage="Hi there! Need help choosing a certification? I can help you decide which path is right for your career goals! 🚀"
        />
      </div>
    </div>
  );
}
