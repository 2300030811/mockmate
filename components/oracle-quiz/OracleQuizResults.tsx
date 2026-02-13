import { QuizMode, QuizQuestion, MCQQuestion } from "@/types";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, RefreshCw, Trophy, ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "@/app/providers";
import { NicknamePrompt } from "../quiz/NicknamePrompt";
import { useState } from "react";
import { OracleQuestionCard } from "./OracleQuestionCard";

interface OracleQuizResultsProps {
  report: {
    correct: number;
    attempted: number;
    wrong: number;
    skipped: number;
    percentage: string;
    passed: boolean;
  };
  onRetake: () => void;
  mode: QuizMode;
  questions: QuizQuestion[];
  userAnswers: Record<string | number, string[]>;
  checkAnswer: (q: QuizQuestion, answers: string[]) => boolean;
}

export function OracleQuizResults({ report, onRetake, mode, questions, userAnswers, checkAnswer }: OracleQuizResultsProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [showReview, setShowReview] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);

  if (showReview) {
    return (
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={`min-h-screen transition-colors duration-500 py-12 px-4 ${
                isDark 
                  ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-red-950 text-white' 
                  : 'bg-gradient-to-br from-red-50 via-white to-orange-50 text-gray-900'
              }`}
        >
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <button 
                        onClick={() => setShowReview(false)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                            isDark ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-200 text-gray-600'
                        }`}
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Back to Results
                    </button>
                    <div className="text-center">
                        <h2 className="text-2xl font-bold">Review Answers</h2>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Question {reviewIndex + 1} of {questions.length}
                        </p>
                    </div>
                    <div className="w-24"></div> {/* Spacer */}
                </div>

                <div className="relative">
                    <OracleQuestionCard 
                        question={questions[reviewIndex]}
                        selectedAnswers={userAnswers[questions[reviewIndex].id] || []}
                        onAnswer={() => {}} // Read-only in review
                        checkAnswer={checkAnswer as (q: QuizQuestion, answers: string[]) => boolean}
                        isSubmitted={true}
                        mode={mode}
                    />
                </div>

                <div className="flex justify-between items-center bg-transparent pt-4">
                    <button
                        disabled={reviewIndex === 0}
                        onClick={() => setReviewIndex(prev => prev - 1)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
                            reviewIndex === 0 
                                ? 'opacity-30 cursor-not-allowed' 
                                : isDark ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-white hover:bg-gray-50 text-gray-900 shadow-md border border-gray-200'
                        }`}
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Previous
                    </button>

                    <div className="flex gap-2">
                         {questions.map((_, idx) => (
                             <button
                                key={idx}
                                onClick={() => setReviewIndex(idx)}
                                className={`w-2.5 h-2.5 rounded-full transition-all ${
                                    reviewIndex === idx 
                                        ? 'bg-red-600 scale-125' 
                                        : isDark ? 'bg-gray-700' : 'bg-gray-300'
                                }`}
                             />
                         ))}
                    </div>

                    <button
                        disabled={reviewIndex === questions.length - 1}
                        onClick={() => setReviewIndex(prev => prev + 1)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
                            reviewIndex === questions.length - 1 
                                ? 'opacity-30 cursor-not-allowed' 
                                : isDark ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/30'
                        }`}
                    >
                        Next
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-500 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-red-950'
        : 'bg-gradient-to-br from-red-50 via-white to-orange-50'
    }`}>
      <div className={`max-w-2xl w-full rounded-3xl shadow-2xl p-8 md:p-12 text-center border ${
         isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
      }`}>
        
        {/* Icon Header */}
        <div className="mb-8 flex justify-center">
          {report.passed ? (
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-400 blur-2xl opacity-20 animate-pulse"></div>
              <Trophy className="w-24 h-24 text-yellow-500 relative z-10 animate-bounce" />
            </div>
          ) : (
            <div className="bg-red-100 p-6 rounded-full dark:bg-red-900/30">
              <XCircle className="w-16 h-16 text-red-500" />
            </div>
          )}
        </div>

        {/* Title */}
        <h2 className={`text-4xl font-extrabold mb-2 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          {report.passed ? "Congratulations!" : "Keep Practicing!"}
        </h2>
        <p className={`text-lg mb-8 ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {report.passed 
            ? "You have mastered the Oracle concepts." 
            : "Review your mistakes and try again to improve your score."}
        </p>

        {/* Score Ring */}
        <div className="relative w-48 h-48 mx-auto mb-10 flex items-center justify-center">
           <svg className="w-full h-full transform -rotate-90">
             <circle
               cx="96"
               cy="96"
               r="88"
               fill="none"
               stroke={isDark ? "#374151" : "#E5E7EB"}
               strokeWidth="12"
             />
             <circle
               cx="96"
               cy="96"
               r="88"
               fill="none"
               stroke={report.passed ? "#10B981" : "#EF4444"}
               strokeWidth="12"
               strokeDasharray={2 * Math.PI * 88}
               strokeDashoffset={2 * Math.PI * 88 * (1 - parseFloat(report.percentage) / 100)}
               className="transition-all duration-1000 ease-out"
               strokeLinecap="round"
             />
           </svg>
           <div className="absolute inset-0 flex flex-col items-center justify-center">
             <span className={`text-5xl font-black ${
               isDark ? 'text-white' : 'text-gray-900'
             }`}>
               {report.percentage}%
             </span>
             <span className={`text-sm font-medium uppercase tracking-wider mt-1 ${
               isDark ? 'text-gray-500' : 'text-gray-400'
             }`}>
               Score
             </span>
           </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className={`p-4 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-green-50'}`}>
            <p className={`text-sm font-bold uppercase mb-1 ${isDark ? 'text-gray-400' : 'text-green-600'}`}>Correct</p>
            <p className={`text-3xl font-bold ${isDark ? 'text-green-400' : 'text-green-700'}`}>{report.correct}</p>
          </div>
          <div className={`p-4 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-red-50'}`}>
            <p className={`text-sm font-bold uppercase mb-1 ${isDark ? 'text-gray-400' : 'text-red-600'}`}>Wrong</p>
            <p className={`text-3xl font-bold ${isDark ? 'text-red-400' : 'text-red-700'}`}>{report.wrong}</p>
          </div>
          <div className={`p-4 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-blue-50'}`}>
            <p className={`text-sm font-bold uppercase mb-1 ${isDark ? 'text-gray-400' : 'text-blue-600'}`}>Attempted</p>
            <p className={`text-3xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>{report.attempted}</p>
          </div>
          <div className={`p-4 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
             <p className={`text-sm font-bold uppercase mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Skipped</p>
             <p className={`text-3xl font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{report.skipped}</p>
          </div>
        </div>

        {/* Leaderboard Nickname Prompt */}
        {mode === 'exam' && (
            <div className="mb-10 text-left">
                <NicknamePrompt 
                    score={report.correct}
                    totalQuestions={report.attempted + report.skipped}
                    category="oracle"
                />
            </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-4">
            <button
              onClick={() => setShowReview(true)}
              className="w-full py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 active:scale-95"
            >
              Review Answers
            </button>
            <button
              onClick={onRetake}
              className="w-full py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 text-white hover:opacity-90 active:scale-95"
            >
              <RefreshCw className="w-6 h-6" />
              Retake Quiz
            </button>
        </div>

      </div>
    </div>
  );
}
