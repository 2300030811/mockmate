"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useQuiz } from "@/hooks/useQuiz";
import { QuizMode } from "@/types";
import { useTheme } from "@/app/providers";
import { QuestionRenderer } from "./QuestionRenderer";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Modal } from "@/components/ui/Modal";
import { EmptyState, LoadingState } from "@/components/ui/States";
import { QuizResults } from "./QuizResults";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

import { QuizNavbar } from "./QuizNavbar";
import { QuizSidebar } from "./QuizSidebar";
import { BobAssistant } from "./BobAssistant";

interface UniversalQuizShellProps {
  category: "aws" | "azure" | "salesforce" | "mongodb" | "pcap" | "oracle";
  mode: QuizMode;
  count?: string | null;
}

export function UniversalQuizShell({ category, mode, count = null }: UniversalQuizShellProps) {
  const { theme } = useTheme();
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

  // Scroll to top when question changes
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [currentQuestionIndex]);

  // Transition to results view upon submission
  useEffect(() => {
    if (isSubmitted) {
      setViewingResults(true);
    }
  }, [isSubmitted]);

  // Memoize handlers to prevent unnecessary re-renders of children
  const onAnswerQuestion = useCallback((ans: any) => {
    if (!questions[currentQuestionIndex]) return;
    handleAnswer(questions[currentQuestionIndex].id, ans);
  }, [handleAnswer, questions, currentQuestionIndex]);

  if (loading) {
    return <LoadingState message={`Loading ${category.toUpperCase()} Quiz...`} isDark={isDark} />;
  }

  if (!questions.length) {
    return <EmptyState title="No Questions Found" message="We couldn't load the questions for this category. Please try again later." isDark={isDark} />;
  }

  if (viewingResults) {
    return (
      <QuizResults 
        category={category}
        mode={mode}
        stats={calculateScore()}
        questionsLength={questions.length}
        userAnswers={userAnswers}
        isDark={isDark}
        onReview={() => setViewingResults(false)}
        onRetake={() => window.location.reload()} // Simple reload for retake
      />
    );
  }

  const currentQ = questions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;
  // Count answered questions for the prompt
  const answeredCount = Object.keys(userAnswers).length; 

  return (
    <div className={`h-screen w-full flex flex-col overflow-hidden ${isDark ? 'bg-gray-950 text-white' : 'bg-white text-gray-900'}`}>
      <QuizNavbar 
        category={category}
        mode={mode}
        timeRemaining={timeRemaining}
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
          onOpenSubmitModal={() => setShowConfirm(true)}
          mode={mode}
        />

        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
          <main ref={mainRef} className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth z-0">
            <div className="max-w-4xl mx-auto">
              
              {/* Header with Progress & Mark */}
              <div className="flex justify-between items-center mb-8">
                <div className="flex-1 max-w-md">
                  <p className="text-sm font-medium opacity-50 mb-2">Question {currentQuestionIndex + 1} of {questions.length}</p>
                  <ProgressBar value={progressPercentage} className="h-2" />
                </div>
                <Button 
                  onClick={() => toggleMark(currentQ.id)}
                  variant="ghost" 
                  size="icon"
                  className={`ml-4 ${markedQuestions.includes(currentQ.id) ? "text-yellow-500" : "opacity-40 hover:opacity-100"}`}
                >
                  <Star className={`w-6 h-6 ${markedQuestions.includes(currentQ.id) ? "fill-current" : ""}`} />
                </Button>
              </div>

              {/* Question Content */}
              <AnimatePresence mode="wait">
                  <motion.div
                      key={currentQ.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="pb-24" // Padding for footer
                  >
                      <QuestionRenderer 
                          category={category}
                          question={currentQ}
                          userAnswer={userAnswers[currentQ.id]}
                          onAnswer={onAnswerQuestion}
                          isReviewMode={isSubmitted}
                          isDark={isDark}
                      />
                  </motion.div>
              </AnimatePresence>
            </div>
          </main>

          {/* Sticky Footer */}
          <div className={`p-4 border-t ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} z-10 w-full`}>
              <div className="max-w-4xl mx-auto flex justify-between items-center">
                  <Button 
                      variant="secondary"
                      onClick={prevQuestion}
                      disabled={currentQuestionIndex === 0}
                      className="gap-2"
                  >
                      <ChevronLeft className="w-4 h-4" /> <span className="hidden sm:inline">Previous</span>
                  </Button>

                  {currentQuestionIndex < questions.length - 1 ? (
                      <Button 
                          variant="primary"
                          onClick={nextQuestion}
                          className="gap-2 px-8"
                      >
                          Next <ChevronRight className="w-4 h-4" />
                      </Button>
                  ) : (
                      <Button 
                          onClick={() => setShowConfirm(true)}
                          className="bg-green-600 hover:bg-green-700 text-white px-8"
                      >
                          Finish
                      </Button>
                  )}
              </div>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={showConfirm} 
        onClose={() => setShowConfirm(false)}
        title="Submit Results?"
        description={`You have answered ${answeredCount} out of ${questions.length} questions.`}
        isDark={isDark}
        footer={
            <>
                <Button onClick={() => setShowConfirm(false)} variant="ghost" className="flex-1">Continue</Button>
                <Button onClick={() => { setShowConfirm(false); handleSubmit(); }} variant="primary" className="flex-1">Submit</Button>
            </>
        }
      />

      {mode !== 'exam' && <BobAssistant question={currentQ} />}
    </div>
  );
}
