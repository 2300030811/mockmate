
import React from "react";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { NicknamePrompt } from "./NicknamePrompt";
import { QuizMode } from "@/types";

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
  userAnswers: any;
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

  const StatCard = ({ label, value, colorClass }: { label: string; value: string | number; colorClass?: string }) => (
    <div className={`p-4 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
        <p className="text-sm opacity-60 mb-1">{label}</p>
        <p className={`text-2xl font-bold ${colorClass || ""}`}>{value}</p>
    </div>
  );

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`max-w-3xl w-full border rounded-3xl p-8 md:p-12 text-center shadow-2xl ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}
      >
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${stats.passed ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
            <CheckCircle className="w-12 h-12" />
        </div>
        <h2 className="text-4xl font-bold mb-2">{stats.passed ? "Congratulations!" : "Keep Practicing!"}</h2>
        <p className="text-xl opacity-60 mb-8">You&apos;ve completed the {category.toUpperCase()} {mode} session.</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <StatCard label="Score" value={`${stats.percentage}%`} />
            <StatCard label="Correct" value={stats.correct} colorClass="text-green-500" />
            <StatCard label="Wrong" value={stats.wrong} colorClass="text-red-500" />
            <StatCard label="Total" value={questionsLength} />
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
