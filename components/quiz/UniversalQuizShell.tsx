"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useQuiz } from "@/hooks/useQuiz";
import { QuizMode } from "@/types";
import { QuestionRenderer } from "./QuestionRenderer";
import { m, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Modal } from "@/components/ui/Modal";
import { EmptyState, LoadingState } from "@/components/ui/States";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { QuizAnswer } from "@/types";

import dynamic from 'next/dynamic';
import { QuizNavbar } from "./QuizNavbar";
import { QuizSidebar } from "./QuizSidebar";
import { QuizControls } from "./QuizControls";

const BobAssistant = dynamic(() => import("./BobAssistant").then(mod => mod.BobAssistant), {
  ssr: false,
});

const QuizResults = dynamic(() => import("./QuizResults").then(mod => mod.QuizResults), {
  ssr: false,
});

import { useQuizKeyboardShortcuts } from "@/hooks/useQuizKeyboardShortcuts";

interface UniversalQuizShellProps {
  category: "aws" | "azure" | "salesforce" | "mongodb" | "pcap" | "oracle";
  mode: QuizMode;
  count?: string | null;
}

export function UniversalQuizShell({ category, mode, count = null }: UniversalQuizShellProps) {

  const {
    questions,
    loading,
    error,
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

  // Memoized setters for child components
  const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), []);
  const openSubmitModal = useCallback(() => {
    setShowConfirm(true);
    // Prefetch the heavy QuizResults component when they are about to submit
    import("./QuizResults");
  }, []);
  const closeSubmitModal = useCallback(() => setShowConfirm(false), []);
  const closeResults = useCallback(() => setViewingResults(false), []);

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

  // Global Keyboard Navigation
  useQuizKeyboardShortcuts({
    currentQuestionIndex,
    totalQuestions: questions.length,
    viewingResults,
    showConfirm,
    prevQuestion,
    nextQuestion,
    onSubmit: () => setShowConfirm(true),
  });

  // Memoize handlers to prevent unnecessary re-renders of children
  const onAnswerQuestion = useCallback((ans: QuizAnswer) => {
    if (!questions[currentQuestionIndex]) return;
    handleAnswer(questions[currentQuestionIndex].id, ans);
  }, [handleAnswer, questions, currentQuestionIndex]);

  if (loading) {
    return <LoadingState message={`Preparing Your ${category.toUpperCase()} Journey...`} />;
  }

  if (error) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center p-6 text-center bg-gray-50 dark:bg-gray-950">
        <h2 className="text-xl font-black mb-2 text-red-500">Connection Error</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
          {(error as Error).message || "We encountered a network issue while fetching your questions. Please check your connection."}
        </p>
        <Button onClick={() => window.location.reload()} variant="primary">
          Try Again
        </Button>
      </div>
    );
  }

  // If we have no questions, check if it's because the user isn't logged in
  if (!questions.length) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center p-6 text-center bg-gray-50 dark:bg-gray-950">
        <m.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md"
        >
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Star className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-black mb-3">Authentication Required</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">
            You need to be signed in to access the certification quiz engine and save your progress.
          </p>
          <div className="flex flex-col gap-3">
            <Button onClick={() => window.location.href = `/login?next=${window.location.pathname}`} variant="primary" size="lg" className="w-full">
              Sign In to Start
            </Button>
            <Button onClick={() => window.location.href = '/'} variant="ghost" className="w-full">
              Back to Home
            </Button>
          </div>
        </m.div>
      </div>
    );
  }

  if (viewingResults) {
    return (
      <QuizResults
        category={category}
        mode={mode}
        stats={calculateScore()}
        questionsLength={questions.length}
        userAnswers={userAnswers}
        onReview={closeResults}
        onRetake={() => window.location.reload()} // Simple reload for retake
      />
    );
  }

  const currentQ = questions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;
  // Count answered questions for the prompt
  const answeredCount = Object.keys(userAnswers).length;

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-white dark:bg-gray-950 text-gray-900 dark:text-white">
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
          onOpenSubmitModal={openSubmitModal}
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
                <m.div
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

                    mode={mode}
                  />
                </m.div>
              </AnimatePresence>
            </div>
          </main>

          {/* Sticky Footer */}
          <QuizControls
            canGoPrev={currentQuestionIndex > 0}
            canGoNext={currentQuestionIndex < questions.length - 1}
            onPrev={prevQuestion}
            onNext={nextQuestion}
            onFinish={() => setShowConfirm(true)}
          />
        </div>
      </div>

      <Modal
        isOpen={showConfirm}
        onClose={closeSubmitModal}
        title="Submit Results?"
        description={`You have answered ${answeredCount} out of ${questions.length} questions.`}
        footer={
          <div className="flex gap-4 w-full">
            <Button onClick={closeSubmitModal} variant="ghost" className="flex-1">Continue</Button>
            <Button onClick={() => { closeSubmitModal(); handleSubmit(); }} variant="primary" className="flex-1">Submit</Button>
          </div>
        }
      />

      {mode !== 'exam' && <BobAssistant question={currentQ} />}
    </div>
  );
}
