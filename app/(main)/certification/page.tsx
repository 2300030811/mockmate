"use client";

import { m } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { NavigationPill } from "@/components/ui/NavigationPill";
import { getAllCategories } from "@/lib/quiz-registry";
import { quizThemes } from "@/lib/quiz-themes";
import type { QuizCategoryId } from "@/lib/quiz-registry";
import { ThemeIcon } from "@/components/quiz/ThemeIcon";

const BobAssistant = dynamic(
  () => import("@/components/quiz/BobAssistant").then((mod) => mod.BobAssistant),
  { ssr: false }
);

export default function CertificationSelect() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";
  const categories = getAllCategories();

  return (
    <div
      className={`min-h-screen transition-colors duration-500 pt-20 ${
        isDark
          ? "bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950"
          : "bg-gradient-to-br from-gray-50 via-white to-blue-50"
      }`}
    >
      <NavigationPill
        showBack={false}
        className="absolute top-4 left-4 sm:top-6 sm:left-6 z-50 scale-75 origin-top-left sm:scale-100"
      />

      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl animate-pulse ${
            isDark ? "bg-cyan-500/10" : "bg-cyan-500/20"
          }`}
        />
        <div
          className={`absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl animate-pulse ${
            isDark ? "bg-orange-500/10" : "bg-orange-500/20"
          }`}
          style={{ animationDelay: "1s" }}
        />
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

        {/* Certification Cards — rendered from registry + theme config */}
        <div className="max-w-7xl w-full grid md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
          {categories.map((cat, idx) => {
            const theme = quizThemes[cat.id as QuizCategoryId];
            if (!theme) return null;

            const iconBgLight = theme.cards.practice.iconBgLight;
            const iconBgDark = theme.cards.practice.iconBgDark;
            const iconColorClass = theme.cards.practice.iconColorClass;

            const CATEGORY_ACCENT_MAP: Record<string, { textColor: string; gradientOverlay: string }> = {
              aws: { textColor: "text-orange-500", gradientOverlay: "from-orange-500 to-amber-500" },
              azure: { textColor: "text-blue-500", gradientOverlay: "from-blue-500 to-cyan-500" },
              salesforce: { textColor: "text-sky-500", gradientOverlay: "from-sky-500 to-blue-600" },
              mongodb: { textColor: "text-emerald-500", gradientOverlay: "from-emerald-500 to-teal-500" },
              pcap: { textColor: "text-yellow-500", gradientOverlay: "from-yellow-500 to-amber-600" },
            };

            const accentStyle = CATEGORY_ACCENT_MAP[cat.id] || {
              textColor: "text-orange-500",
              gradientOverlay: "from-orange-500 to-yellow-500",
            };
            const textColor = accentStyle.textColor;
            const gradientOverlay = accentStyle.gradientOverlay;

            return (
              <m.div
                key={cat.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + idx * 0.08, ease: "easeOut" }}
              >
                <Link
                  href={`/${cat.routeSlug}/mode`}
                  className="group relative block h-full"
                  aria-label={`Select ${cat.name}`}
                >
                  <div
                    className={`relative h-full p-8 rounded-3xl transition-all duration-300 overflow-hidden ${
                      isDark
                        ? "bg-gray-900/50 hover:bg-gray-900/70 border border-gray-800"
                        : "bg-white hover:bg-gray-50 border border-gray-200 shadow-lg"
                    } hover:scale-105 hover:shadow-2xl`}
                  >
                    {/* Gradient Overlay */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${gradientOverlay} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                    />

                    <div className="relative z-10 text-left h-full flex flex-col">
                      {/* Icon */}
                      <div
                        className={`mb-6 w-20 h-20 flex items-center justify-center rounded-2xl transform group-hover:scale-110 transition-transform duration-300
                          ${isDark ? `${iconBgDark} text-white` : `${iconBgLight} ${iconColorClass}`}`}
                      >
                        <ThemeIcon icon={theme.badge.icon} className="w-10 h-10" />
                      </div>

                      {/* Title */}
                      <h2
                        className={`text-2xl font-bold mb-3 ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {cat.name}
                      </h2>

                      {/* Subtitle */}
                      <p
                        className={`mb-4 leading-relaxed ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {theme.subtitle}
                      </p>

                      {/* Exam Info */}
                      <div
                        className={`flex items-center gap-3 mb-4 text-xs font-medium ${
                          isDark ? "text-gray-500" : "text-gray-400"
                        }`}
                      >
                        <span>{theme.exam.count} questions</span>
                        <span>·</span>
                        <span>{theme.exam.duration} min</span>
                        <span>·</span>
                        <span>{theme.exam.passingScore} to pass</span>
                      </div>

                      {/* Question Type Badges */}
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {theme.questionTypes?.map((type, i) => (
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

                      {/* CTA */}
                      <span
                        className={`inline-flex items-center gap-2 ${textColor} font-bold group-hover:gap-4 transition-all mt-auto`}
                      >
                        Start {cat.name.split(" ")[0]} Quiz
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
