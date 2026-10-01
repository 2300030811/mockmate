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
import { Star, ChevronLeft, ChevronRight, ShieldAlert, AlertTriangle, CheckCircle2 } from "lucide-react";
import { QuizAnswer } from "@/types";
import type { QuizCategoryId } from "@/lib/quiz-registry";

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
  category: QuizCategoryId;
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
    <div className="h-screen w-full flex flex-col overflow-hidden bg-white dark:bg-[#0d0d12] text-zinc-900 dark:text-[#ebebef] transition-colors">
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
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-200/80 dark:border-[#1e1e2a]">
                <div className="flex-1 max-w-md">
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-500 dark:text-[#8b8b9e] mb-2">
                    <span className="font-semibold text-zinc-900 dark:text-[#ebebef]">
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </span>
                    <span className="tabular-nums font-mono">{Math.round(progressPercentage)}% Completed</span>
                  </div>
                  <ProgressBar value={progressPercentage} className="h-1.5" />
                </div>
                <button
                  onClick={() => toggleMark(currentQ.id)}
                  className={`ml-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors cursor-pointer ${
                    markedQuestions.includes(currentQ.id)
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 font-semibold"
                      : "bg-zinc-50 dark:bg-[#14141e] border-zinc-200 dark:border-[#1e1e2a] text-zinc-500 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-[#ebebef]"
                  }`}
                  title={markedQuestions.includes(currentQ.id) ? "Unmark question" : "Mark question for review"}
                >
                  <Star className={`w-3.5 h-3.5 ${markedQuestions.includes(currentQ.id) ? "fill-current" : ""}`} />
                  <span className="hidden sm:inline">
                    {markedQuestions.includes(currentQ.id) ? "Marked" : "Mark for Review"}
                  </span>
                </button>
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
        icon={
          <div className="w-9 h-9 rounded-xl bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 flex items-center justify-center text-[#5e6ad2]">
            <ShieldAlert className="w-5 h-5" />
          </div>
        }
        title="Submit Assessment?"
        description="Verify your completion telemetry before locking and grading your session."
        footer={
          <div className="flex items-center gap-2.5 w-full">
            <Button
              onClick={closeSubmitModal}
              variant="outline"
              className="flex-1 h-9 rounded-xl text-xs font-medium border-zinc-200 dark:border-[#262636] hover:bg-zinc-100 dark:hover:bg-[#1a1a26] text-zinc-700 dark:text-[#c4c4d4]"
            >
              Continue Assessment
            </Button>
            <Button
              onClick={() => { closeSubmitModal(); handleSubmit(); }}
              className="flex-1 h-9 rounded-xl text-xs font-semibold bg-[#5e6ad2] hover:bg-[#525ec2] text-white shadow-sm transition-all"
            >
              Confirm & Submit
            </Button>
          </div>
        }
      >
        <div className="space-y-3 pt-1 pb-1">
          {/* Bento Telemetry Metrics */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-[#101017] border border-zinc-200 dark:border-[#1e1e2a]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-[#6e6e84]">
                  Answered
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Recorded
                </span>
              </div>
              <p className="font-mono text-lg font-bold text-zinc-900 dark:text-[#ebebef]">
                <span className="text-emerald-600 dark:text-emerald-400">{answeredCount}</span>
                <span className="text-xs text-zinc-400 dark:text-[#6e6e84] font-normal"> / {questions.length}</span>
              </p>
            </div>

            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-[#101017] border border-zinc-200 dark:border-[#1e1e2a]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-[#6e6e84]">
                  Unanswered
                </span>
                <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-medium ${
                  questions.length - answeredCount > 0 ? "text-amber-500" : "text-zinc-400"
                }`}>
                  {questions.length - answeredCount > 0 ? "Pending" : "Cleared"}
                </span>
              </div>
              <p className="font-mono text-lg font-bold">
                <span className={questions.length - answeredCount > 0 ? "text-amber-500" : "text-zinc-400 dark:text-[#6e6e84]"}>
                  {questions.length - answeredCount}
                </span>
                <span className="text-xs text-zinc-400 dark:text-[#6e6e84] font-normal"> remaining</span>
              </p>
            </div>
          </div>

          {/* Linear completion bar */}
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-[#101017] border border-zinc-200 dark:border-[#1e1e2a]">
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="text-zinc-500 dark:text-[#8b8b9e]">Completion Rate</span>
              <span className="font-bold text-zinc-900 dark:text-[#ebebef]">
                {questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-zinc-200 dark:bg-[#1a1a26] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#5e6ad2] transition-all duration-300 rounded-full"
                style={{ width: `${questions.length > 0 ? (answeredCount / questions.length) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Advisory Notice */}
          {questions.length - answeredCount > 0 ? (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 flex items-start gap-2.5 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
              <p className="leading-relaxed">
                <strong className="font-semibold">{questions.length - answeredCount} unanswered item{questions.length - answeredCount > 1 ? 's' : ''}</strong> will be marked incorrect (0 pts). Once submitted, this attempt cannot be resumed.
              </p>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-start gap-2.5 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
              <p className="leading-relaxed">
                All questions answered! Your responses are ready for final grading and leaderboard ranking.
              </p>
            </div>
          )}
        </div>
      </Modal>

      {mode !== 'exam' && <BobAssistant question={currentQ} />}
    </div>
  );
}
