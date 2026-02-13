import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useTheme } from "@/app/providers";
import { NicknamePrompt } from "../quiz/NicknamePrompt";
import { useState } from "react";
import { SalesforceQuestionCard } from "./SalesforceQuestionCard";
import { QuizQuestion } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SalesforceQuizResultsProps {
    report: {
        correct: number;
        attempted: number;
        wrong: number;
        skipped: number;
        percentage: string;
        passed: boolean;
    };
    onRetake: () => void;
    mode: 'practice' | 'exam';
    questions: QuizQuestion[];
    userAnswers: Record<string | number, string[]>;
    checkAnswer: (q: QuizQuestion, answers: string[]) => boolean;
}

export function SalesforceQuizResults({ report, onRetake, mode, questions, userAnswers, checkAnswer }: SalesforceQuizResultsProps) {
    const router = useRouter();
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
                      ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950 text-white' 
                      : 'bg-gradient-to-br from-gray-50 via-white to-blue-50 text-gray-900'
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
                        <SalesforceQuestionCard 
                            question={questions[reviewIndex]}
                            selectedAnswers={userAnswers[questions[reviewIndex].id] || []}
                            onAnswer={() => {}} // Read-only in review
                            checkAnswer={checkAnswer}
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
                                            ? 'bg-blue-600 scale-125' 
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
                                    : isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30'
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
        <div className={`min-h-screen transition-colors duration-500 py-12 px-4 ${
            isDark 
              ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950' 
              : 'bg-gradient-to-br from-gray-50 via-white to-blue-50'
          }`}>
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className={`absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl animate-pulse ${
                isDark ? 'bg-blue-500/10' : 'bg-blue-500/20'
              }`}></div>
              <div className={`absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl animate-pulse ${
                isDark ? 'bg-purple-500/10' : 'bg-purple-500/20'
              }`} style={{animationDelay: '1s'}}></div>
            </div>
    
            <div className="relative z-10 max-w-5xl mx-auto space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className={`p-8 rounded-3xl shadow-lg border ${
                  isDark 
                    ? 'bg-gray-900/50 border-gray-800' 
                    : 'bg-white border-gray-200'
                }`}
              >
                {/* Result Badge */}
                <div className="text-center mb-6">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${
                    report.passed
                      ? isDark 
                        ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                        : 'bg-green-500/10 border-green-500/30 text-green-600'
                      : isDark 
                        ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' 
                        : 'bg-orange-500/10 border-orange-500/30 text-orange-600'
                  }`}>
                    <span className="text-2xl">{report.passed ? '🎉' : '📚'}</span>
                    <span className="text-sm font-bold tracking-wider">
                      {report.passed ? 'PASSED' : 'KEEP PRACTICING'}
                    </span>
                  </div>
                </div>
    
                <h2 className={`text-4xl font-extrabold mb-6 text-center ${
                  isDark 
                    ? 'bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent' 
                    : 'bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent'
                }`}>
                  {mode === "exam" ? "Exam Results" : "Practice Complete"}
                </h2>
    
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center mb-8">
                  <div className={`p-6 rounded-2xl ${
                    isDark ? 'bg-gray-800/50' : 'bg-gray-100'
                  }`}>
                    <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total No of Attempted</p>
                    <p className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{report.attempted}</p>
                  </div>
                  <div className={`p-6 rounded-2xl ${
                    isDark ? 'bg-gray-800/50' : 'bg-gray-100'
                  }`}>
                    <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Correct</p>
                    <p className="text-4xl font-bold text-green-500">{report.correct}</p>
                  </div>
                  <div className={`p-6 rounded-2xl ${
                    isDark ? 'bg-gray-800/50' : 'bg-gray-100'
                  }`}>
                    <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Wrong</p>
                    <p className="text-4xl font-bold text-red-500">{report.wrong}</p>
                  </div>
                  <div className={`p-6 rounded-2xl ${
                    isDark ? 'bg-gray-800/50' : 'bg-gray-100'
                  }`}>
                    <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Skipped</p>
                    <p className="text-4xl font-bold text-orange-500">{report.skipped}</p>
                  </div>
                  <div className={`p-6 rounded-2xl ${
                    isDark ? 'bg-gray-800/50' : 'bg-gray-100'
                  }`}>
                    <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Score</p>
                    <p className={`text-4xl font-bold ${report.passed ? 'text-blue-500' : 'text-orange-500'}`}>
                      {report.percentage}%
                    </p>
                  </div>
                </div>
                
                {/* Leaderboard Nickname Prompt */}
                {mode === 'exam' && (
                    <div className="mb-10 text-left">
                        <NicknamePrompt 
                            score={report.correct}
                            totalQuestions={report.attempted + report.skipped}
                            category="salesforce"
                        />
                    </div>
                )}
                
                <div className="flex flex-wrap justify-center gap-4">
                  <button 
                    onClick={() => setShowReview(true)} 
                    className={`px-8 py-3 rounded-2xl font-bold transition-all hover:scale-105 ${
                      isDark 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30'
                    }`}
                  >
                    Review Answers
                  </button>
                  <button 
                    onClick={onRetake} 
                    className={`px-8 py-3 rounded-2xl font-bold transition-all hover:scale-105 ${
                      isDark 
                        ? 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700' 
                        : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 shadow-lg'
                    }`}
                  >
                    Retake Quiz
                  </button>
                  <button 
                    onClick={() => router.push('/salesforce-quiz/mode')} 
                    className={`px-8 py-3 rounded-2xl font-bold transition-all hover:scale-105 ${
                      isDark 
                        ? 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700' 
                        : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 shadow-lg'
                    }`}
                  >
                    Change Mode
                  </button>
                  <button 
                    onClick={() => router.push('/')} 
                    className={`px-8 py-3 rounded-2xl font-bold transition-all hover:scale-105 ${
                      isDark 
                        ? 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700' 
                        : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 shadow-lg'
                    }`}
                  >
                    Home
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
    );
}
