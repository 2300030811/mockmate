"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import Link from "next/link";
import { m, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Clock,
  Layers,
  Award,
} from "lucide-react";
import { ModeCard } from "@/components/quiz/ModeCard";
import { HomeBackground } from "@/components/home/HomeBackground";
import { QuizTheme } from "@/lib/quiz-themes";
import { PracticeModal } from "./modals/PracticeModal";
import { ExamModal } from "./modals/ExamModal";
import { ThemeIcon } from "./ThemeIcon";

interface GenericModeSelectProps {
  config: QuizTheme;
}

export function GenericModeSelect({ config }: GenericModeSelectProps) {
  const router = useRouter();
  const [modal, setModal] = useState<"none" | "practice" | "exam">("none");
  const [practiceCount, setPracticeCount] = useState<number | "all">("all");
  const [examCount, setExamCount] = useState<number>(config.exam.default);

  const startPractice = useCallback(() => {
    const countParam = practiceCount === "all" ? "all" : practiceCount.toString();
    router.push(`/${config.id}-quiz?mode=practice&count=${countParam}`);
  }, [router, config.id, practiceCount]);

  const startExam = useCallback(() => {
    router.push(`/${config.id}-quiz?mode=exam&count=${examCount}`);
  }, [router, config.id, examCount]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0d12] text-zinc-900 dark:text-[#ebebef] pt-14 selection:bg-[#5e6ad2]/20 transition-colors relative">
      <HomeBackground />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-5 relative z-10 space-y-4 text-left">
        {/* Unified Top Utility Row: Breadcrumbs on Left, Telemetry on Right */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 dark:border-[#1a1a26] pb-3">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 dark:text-[#6e6e84]">
            <Link href="/" className="hover:text-zinc-900 dark:hover:text-[#ebebef] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/certification" className="hover:text-zinc-900 dark:hover:text-[#ebebef] transition-colors">
              Certifications
            </Link>
            <span>/</span>
            <span className="text-zinc-800 dark:text-[#ebebef] font-semibold">
              {config.badge.text}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-zinc-500 dark:text-[#8b8b9e]">
            <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-500" />
              <span>{config.exam.duration}m Exam</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] flex items-center gap-1">
              <Award className="w-3 h-3 text-emerald-500" />
              <span>Pass: {config.exam.passingScore}</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] flex items-center gap-1">
              <Layers className="w-3 h-3 text-[#5e6ad2]" />
              <span>{config.practice.max || 500}+ Questions</span>
            </span>
          </div>
        </div>

        {/* ── HIGH-DENSITY HERO SECTION ── */}
        <div className="space-y-2">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-zinc-100 dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] text-zinc-600 dark:text-[#8b8b9e] text-[10.5px] font-medium tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 dark:bg-emerald-400/80 animate-pulse" />
            <ThemeIcon icon={config.badge.icon} className="w-3 h-3" />
            <span className="font-semibold text-zinc-800 dark:text-[#ebebef]">
              {config.badge.text}
            </span>
            <span className="text-zinc-400 dark:text-[#5a5a6e]">•</span>
            <span>2026 Blueprint</span>
          </div>

          {/* Headline */}
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.025em] text-zinc-900 dark:text-[#ebebef] leading-tight">
            {config.title}.
          </h1>

          {/* Subtitle & Integrated Question Engines */}
          <div className="space-y-1.5">
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-[#8b8b9e] leading-relaxed max-w-2xl font-normal">
              {config.subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-[#6e6e84]">
                Engines:
              </span>
              {config.questionTypes?.map((qType, idx) => (
                <span
                  key={idx}
                  className={`px-1.5 py-0.2 rounded text-[10.5px] font-mono border transition-colors ${
                    qType.toLowerCase().includes("drag") ||
                    qType.toLowerCase().includes("hotspot") ||
                    qType.toLowerCase().includes("case")
                      ? "bg-[#5e6ad2]/10 border-[#5e6ad2]/30 text-[#5e6ad2] dark:text-[#7d88e8] font-semibold"
                      : "bg-zinc-100 dark:bg-[#181824] border-zinc-200 dark:border-[#222232] text-zinc-600 dark:text-[#8b8b9e]"
                  }`}
                >
                  {qType}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── COMPACT BENTO MODE CARDS ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Practice Labs */}
          <ModeCard
            title="Practice Labs"
            description="Untimed environment with immediate feedback, detailed vendor rationales, and step-by-step guidance."
            icon={<BookOpen className="w-5 h-5 text-[#5e6ad2]" />}
            badge="Untimed • Instant Feedback"
            features={[
              "Instant answer evaluation & vendor rationales",
              "Interactive drag-and-drop, hotspot & case study engines",
              "Custom question batch sizing (1 to all dumps)",
            ]}
            buttonText="Configure Practice Lab"
            onClick={() => setModal("practice")}
            onHover={() => {
              router.prefetch(`/${config.id}-quiz?mode=practice&count=all`);
              router.prefetch(`/${config.id}-quiz?mode=practice&count=25`);
            }}
          />

          {/* Exam Simulation */}
          <ModeCard
            title="Exam Simulation"
            description={`Full-fidelity vendor examination simulation with ${config.exam.count} questions in ${config.exam.duration} minutes under strict exam conditions.`}
            icon={<Clock className="w-5 h-5 text-amber-500" />}
            badge="Proctored • Timed Scoring"
            features={[
              `Official ${config.exam.duration}-minute countdown timer`,
              `Official passing benchmark: ${config.exam.passingScore}`,
              "Locked answer rationales until diagnostic report",
            ]}
            buttonText="Start Timed Exam"
            onClick={() => setModal("exam")}
            onHover={() => {
              router.prefetch(`/${config.id}-quiz?mode=exam&count=${config.exam.default}`);
            }}
          />
        </div>
      </div>

      {/* ── MODALS ── */}
      <AnimatePresence>
        {modal === "practice" && (
          <PracticeModal
            config={config}
            practiceCount={practiceCount}
            setPracticeCount={setPracticeCount}
            onClose={() => setModal("none")}
            onStart={startPractice}
          />
        )}

        {modal === "exam" && (
          <ExamModal
            config={config}
            examCount={examCount}
            setExamCount={setExamCount}
            onClose={() => setModal("none")}
            onStart={startExam}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
