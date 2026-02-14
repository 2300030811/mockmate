"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuiz } from "@/hooks/useQuiz";
import { QuizMode } from "@/types";
import { useTheme } from "@/app/providers";
import { QuestionRenderer } from "./QuestionRenderer";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Star, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";

import { QuizNavbar } from "./QuizNavbar";
import { QuizSidebar } from "./QuizSidebar";
import { BobAssistant } from "./BobAssistant";
import { NicknamePrompt } from "./NicknamePrompt";

interface UniversalQuizShellProps {
  category: "aws" | "azure" | "salesforce" | "mongodb" | "pcap" | "oracle";
  mode: QuizMode;
  count?: string | null;
}

export function UniversalQuizShell({ category, mode, count = null }: UniversalQuizShellProps) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const {
      questions,
      loading,
      currentQuestionIndex,
      setCurrentQuestionIndex,
      userAnswers,
      markedQuestions,
      handleAnswer,
      toggleMark,
      nextQuestion,
      prevQuestion,
      handleSubmit,
      timeRemaining,
      isSubmitted,
      calculateScore,
  } = useQuiz({ category, initialMode: mode, countParam: count });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [viewingResults, setViewingResults] = useState(false);

  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [currentQuestionIndex]);

  useEffect(() => {
    if (isSubmitted) {
      setViewingResults(true);
    }
  }, [isSubmitted]);

  if (loading) {
    return (
        <div className={`h-screen flex items-center justify-center ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-lg font-medium">Loading {category.toUpperCase()} Quiz...</p>
            </div>
        </div>
    );
  }

  if (!questions.length) {
    return (
      <div className={`h-screen flex items-center justify-center ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="text-center p-10 max-w-md">
          <h2 className="text-2xl font-bold text-red-500 mb-4">No Questions Found</h2>
          <p className="mb-6 opacity-70">We couldn&apos;t load the questions for this category. Please try again later.</p>
          <Button onClick={() => router.back()} variant="primary">Go Back</Button>
        </div>
      </div>
    );
  }

  if (viewingResults) {
    const stats = calculateScore();
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
                    <div className={`p-4 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                        <p className="text-sm opacity-60 mb-1">Score</p>
                        <p className="text-2xl font-bold">{stats.percentage}%</p>
                    </div>
                    <div className={`p-4 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                        <p className="text-sm opacity-60 mb-1">Correct</p>
                        <p className="text-2xl font-bold text-green-500">{stats.correct}</p>
                    </div>
                    <div className={`p-4 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                        <p className="text-sm opacity-60 mb-1">Wrong</p>
                        <p className="text-2xl font-bold text-red-500">{stats.wrong}</p>
                    </div>
                    <div className={`p-4 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                        <p className="text-sm opacity-60 mb-1">Total</p>
                        <p className="text-2xl font-bold">{questions.length}</p>
                    </div>
                </div>

                {mode === 'exam' && (
                    <div className="mb-10">
                        <NicknamePrompt score={stats.correct} totalQuestions={questions.length} category={category} />
                    </div>
                )}

                <div className="flex flex-wrap gap-4 justify-center">
                    <Button onClick={() => router.push(`/${category}-quiz/mode`)} variant="secondary">Back to Menu</Button>
                    <Button onClick={() => setViewingResults(false)} variant="primary">Review Answers</Button>
                    <Button onClick={() => window.location.reload()} variant="outline">Retake Quiz</Button>
                </div>
            </motion.div>
        </div>
    );
  }

  const currentQ = questions[currentQuestionIndex];

  return (
    <div className={`h-screen w-full flex flex-col overflow-hidden ${isDark ? 'bg-gray-950 text-white' : 'bg-white text-gray-900'}`}>
      <QuizNavbar 
        category={category}
        mode={mode}
        timeRemaining={timeRemaining}
        isDark={isDark}
        toggleTheme={toggleTheme}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="flex-1 flex overflow-hidden relative">
        <QuizSidebar 
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          questions={questions}
          currentQuestionIndex={currentQuestionIndex}
          setCurrentQuestionIndex={setCurrentQuestionIndex}
          userAnswers={userAnswers}
          markedQuestions={markedQuestions}
          isDark={isDark}
          onOpenSubmitModal={() => setShowConfirm(true)}
          mode={mode}
        />

        <main ref={mainRef} className="flex-1 overflow-y-auto h-full p-4 md:p-8 scroll-smooth relative">
          <div className="max-w-4xl mx-auto pb-24">
            
            <div className="flex justify-between items-center mb-8">
              <div>
                <p className="text-sm font-medium opacity-50 mb-1">Question {currentQuestionIndex + 1} of {questions.length}</p>
                <div className={`w-64 h-2 rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                    className="h-full bg-blue-500 rounded-full"
                  />
                </div>
              </div>
              <Button 
                onClick={() => toggleMark(currentQ.id)}
                variant="ghost" 
                size="icon"
                className={markedQuestions.includes(currentQ.id) ? "text-yellow-500" : "opacity-40 hover:opacity-100"}
              >
                <Star className={`w-6 h-6 ${markedQuestions.includes(currentQ.id) ? "fill-current" : ""}`} />
              </Button>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentQ.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                >
                    <QuestionRenderer 
                        category={category}
                        question={currentQ}
                        userAnswer={userAnswers[currentQ.id]}
                        onAnswer={(ans) => handleAnswer(currentQ.id, ans)}
                        isReviewMode={isSubmitted}
                        isDark={isDark}
                    />
                </motion.div>
            </AnimatePresence>

            <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-100 dark:border-white/5">
                <Button 
                    variant="secondary"
                    onClick={prevQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="gap-2"
                >
                    <ChevronLeft className="w-4 h-4" /> Previous
                </Button>

                {currentQuestionIndex < questions.length - 1 ? (
                    <Button 
                        variant="primary"
                        onClick={nextQuestion}
                        className="gap-2"
                    >
                        Next <ChevronRight className="w-4 h-4" />
                    </Button>
                ) : (
                    <Button 
                        onClick={() => setShowConfirm(true)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        Finish & Submit
                    </Button>
                )}
            </div>
          </div>
        </main>
      </div>

      <AnimatePresence>
        {showConfirm && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={() => setShowConfirm(false)}
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`relative z-10 p-8 rounded-3xl shadow-2xl max-w-md w-full ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white'}`}
                >
                    <h3 className="text-2xl font-bold mb-4">Submit Results?</h3>
                    <p className="mb-8 opacity-60 text-lg">
                        You have answered <span className="font-bold text-blue-500">{(Object.values(userAnswers) as any[]).filter(a => a !== undefined).length}</span> out of {questions.length} questions.
                    </p>
                    <div className="flex gap-4">
                        <Button onClick={() => setShowConfirm(false)} variant="ghost" className="flex-1">Continue</Button>
                        <Button onClick={() => { setShowConfirm(false); handleSubmit(); }} variant="primary" className="flex-1">Submit</Button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {mode !== 'exam' && <BobAssistant question={currentQ} />}
    </div>
  );
}
