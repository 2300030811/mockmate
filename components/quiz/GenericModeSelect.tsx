"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ModeCard } from "@/components/quiz/ModeCard";
import { ArrowLeft, Home } from "lucide-react";
import Link from "next/link";
import { QuizTheme } from "@/lib/quiz-themes";
import { PracticeModal } from "./modals/PracticeModal";
import { ExamModal } from "./modals/ExamModal";

interface GenericModeSelectProps {
  config: QuizTheme;
}

const TimerIcon = () => <span className="text-5xl">⏳</span>;

const NavigationPill = ({ onBack }: { onBack: () => void }) => (
  <div className="absolute top-6 left-6 z-50">
    <div className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-full shadow-lg border border-gray-200 dark:border-gray-700">
      <button onClick={onBack} className="flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
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
);

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
    <div className={`min-h-screen transition-colors duration-500 pt-20 ${config.bgGradient}`}>
      <NavigationPill onBack={() => router.push('/certification')} />
      
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl animate-pulse ${config.orb1}`}></div>
        <div className={`absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl animate-pulse ${config.orb2}`} style={{ animationDelay: "1s" }}></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 pb-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-sm transition-all duration-300 hover:scale-105 ${config.badge.className}`}>
            <span className="text-2xl">{config.badge.icon}</span>
            <span className="text-sm font-bold tracking-wider">{config.badge.text}</span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className={`text-5xl md:text-7xl font-extrabold mb-6 pb-4 text-center bg-clip-text text-transparent ${config.titleGradient}`}
        >
          {config.title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto text-center text-gray-600 dark:text-gray-400"
        >
          {config.subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-5xl w-full grid md:grid-cols-2 gap-8 px-4"
        >
          <ModeCard
            title="Practice Labs"
            description="Access comprehensive questions with immediate feedback."
            icon={<span className="text-5xl">{config.cards.practice.icon}</span>}
            features={["Instant feedback", "Detailed explanations", "No time pressure"]}
            buttonText="Start Practice"
            gradient={config.cards.practice.gradient}
            iconBgLight={config.cards.practice.iconBgLight}
            iconBgDark={config.cards.practice.iconBgDark}
            iconColorClass={config.cards.practice.iconColorClass}
            onClick={() => setModal("practice")}
            onHover={() => {
                router.prefetch(`/${config.id}-quiz?mode=practice&count=all`);
                router.prefetch(`/${config.id}-quiz?mode=practice&count=25`);
            }}
          />

          <ModeCard
            title="Exam Simulation"
            description={`Simulate the real exam with ${config.exam.count} questions in ${config.exam.duration} minutes.`}
            icon={<TimerIcon />}
            features={[`${config.exam.duration}-minute timer`, `${config.exam.count} questions`, "70% passing score"]}
            buttonText="Start Exam"
            gradient={config.cards.exam.gradient}
            iconBgLight={config.cards.exam.iconBgLight}
            iconBgDark={config.cards.exam.iconBgDark}
            iconColorClass={config.cards.exam.iconColorClass}
            buttonColorClass={config.cards.exam.buttonColorClass}
            onClick={() => setModal("exam")}
            onHover={() => router.prefetch(`/${config.id}-quiz?mode=exam&count=${config.exam.default}`)}
          />
        </motion.div>
      </div>

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
    </div>
  );
}
