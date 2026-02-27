
import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { NicknamePrompt } from "./NicknamePrompt";
import { QuizMode, QuizAnswer } from "@/types";

interface QuizResultsProps {
  category: string;
  mode: QuizMode;
  stats: {
    passed: boolean;
    correct: number;
    wrong: number;
    attempted: number;
    skipped: number;
    percentage: string;
  };
  questionsLength: number;
  userAnswers: Record<string | number, QuizAnswer>;
  isDark: boolean;
  onReview: () => void;
  onRetake: () => void;
}

export const QuizResults: React.FC<QuizResultsProps> = ({
  category,
  mode,
  stats,
  questionsLength,
  userAnswers,
  isDark,
  onReview,
  onRetake
}) => {
  const router = useRouter();

  React.useEffect(() => {
    // Confetti logic removed to fix build issues
  }, [stats.passed]);

  const StatCard = ({ label, value, colorClass, delay }: { label: string; value: string | number; colorClass?: string; delay: number }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 200, damping: 20 }}
      className={`p-4 rounded-2xl ${isDark ? 'bg-white/5 border border-white/5' : 'bg-gray-50 border border-gray-100'}`}
    >
      <p className="text-sm opacity-60 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${colorClass || ""}`}>{value}</p>
    </motion.div>
  );

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`max-w-3xl w-full border rounded-3xl p-8 md:p-12 text-center shadow-2xl ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl relative ${stats.passed ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}
        >
          {stats.passed && <div className="absolute inset-0 rounded-full animate-ping bg-green-500/30"></div>}
          {stats.passed ? <CheckCircle className="w-12 h-12 relative z-10" /> : <XCircle className="w-12 h-12 relative z-10" />}
        </motion.div>
        <h2 className="text-4xl md:text-5xl font-extrabold mb-3">{stats.passed ? "Congratulations!" : "Keep Practicing!"}</h2>
        <p className="text-xl opacity-60 mb-10">You&apos;ve completed the {category.toUpperCase()} {mode} session.</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard label="Score" value={`${stats.percentage}%`} delay={0.1} colorClass={stats.passed ? "text-green-500" : "text-red-500"} />
          <StatCard label="Correct" value={stats.correct} colorClass="text-green-500" delay={0.2} />
          <StatCard label="Wrong" value={stats.wrong} colorClass="text-red-500" delay={0.3} />
          <StatCard label="Total" value={questionsLength} delay={0.4} />
        </div>

        {mode === 'exam' && (
          <div className="mb-10">
            <NicknamePrompt userAnswers={userAnswers} totalQuestions={questionsLength} category={category} />
          </div>
        )}

        <div className="flex flex-wrap gap-4 justify-center">
          <Button onClick={() => router.push(`/${category}-quiz/mode`)} variant="secondary">Back to Menu</Button>
          <Button onClick={onReview} variant="primary">Review Answers</Button>
          <Button onClick={onRetake} variant="outline">Retake Quiz</Button>
        </div>
      </motion.div>
    </div>
  );
};
