"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { m, AnimatePresence } from "framer-motion";
import { ModeCard } from "@/components/quiz/ModeCard";
import { NavigationPill } from "@/components/ui/NavigationPill";
import { QuizTheme } from "@/lib/quiz-themes";
import { PracticeModal } from "./modals/PracticeModal";
import { ExamModal } from "./modals/ExamModal";
import { Zap, Database, Code, Terminal } from "lucide-react";

interface GenericModeSelectProps {
  config: QuizTheme;
}

const TimerIcon = () => <span className="text-5xl">⏳</span>;

const ThemeIcon = ({ icon, className }: { icon: string; className?: string }) => {
  const iconLower = icon.toLowerCase();
  if (iconLower === "zap") return <Zap className={className} />;
  if (iconLower === "database") return <Database className={className} />;
  if (iconLower === "code") return <Code className={className} />;
  if (iconLower === "terminal") return <Terminal className={className} />;
  return <span className="text-2xl">{icon}</span>; // Fallback for emojis
};

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
      <NavigationPill showBack={true} backHref="/certification" />
      
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl animate-pulse ${config.orb1}`}></div>
        <div className={`absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl animate-pulse ${config.orb2}`} style={{ animationDelay: "1s" }}></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 pb-20">
        <m.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-sm transition-all duration-300 hover:scale-105 ${config.badge.className}`}>
            <ThemeIcon icon={config.badge.icon} className="w-6 h-6" />
            <span className="text-sm font-bold tracking-wider">{config.badge.text}</span>
          </div>
        </m.div>

        <m.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className={`text-5xl md:text-7xl font-extrabold mb-6 pb-4 text-center bg-clip-text text-transparent ${config.titleGradient}`}
        >
          {config.title}
        </m.h1>

        <m.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto text-center text-gray-600 dark:text-gray-400"
        >
          {config.subtitle}
        </m.p>

        {/* Question Types Pills */}
        <m.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mb-12 flex flex-wrap gap-2 justify-center"
        >
          {config.questionTypes?.map((type, idx) => (
            <span key={idx} className={`px-3 py-1 rounded-full text-sm font-semibold border ${config.badge.className}`}>
              {type}
            </span>
          ))}
        </m.div>

        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-5xl w-full grid md:grid-cols-2 gap-8 px-4"
        >
          <ModeCard
            title="Practice Labs"
            description="Access comprehensive questions with immediate feedback."
            icon={<ThemeIcon icon={config.cards.practice.icon} className="w-12 h-12" />}
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
            features={[`${config.exam.duration}-minute timer`, `${config.exam.count} questions`, `${config.exam.passingScore} passing score`]}
            buttonText="Start Exam"
            gradient={config.cards.exam.gradient}
            iconBgLight={config.cards.exam.iconBgLight}
            iconBgDark={config.cards.exam.iconBgDark}
            iconColorClass={config.cards.exam.iconColorClass}
            buttonColorClass={config.cards.exam.buttonColorClass}
            onClick={() => setModal("exam")}
            onHover={() => router.prefetch(`/${config.id}-quiz?mode=exam&count=${config.exam.default}`)}
          />
        </m.div>
      </div>

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
