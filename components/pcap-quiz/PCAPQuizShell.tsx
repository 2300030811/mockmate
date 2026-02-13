"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { usePCAPQuiz } from "@/hooks/usePCAPQuiz";
import { QuizMode } from "@/types";
import { useTheme } from "@/app/providers";
import { PCAPQuestionCard } from "./PCAPQuestionCard";
import { PCAPQuizResults } from "./PCAPQuizResults";
import { Button } from "@/components/ui/Button";
import { QuizSkeleton } from "./QuizSkeleton";
import { QuizNavbar } from "./QuizNavbar";
import { QuizSidebar } from "./QuizSidebar";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { BobAssistant } from "../quiz/BobAssistant";

interface PCAPQuizShellProps {
  mode: QuizMode;
}

export function PCAPQuizShell({ mode }: PCAPQuizShellProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const countParam = searchParams.get("count");

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
      checkAnswer
  } = usePCAPQuiz({ initialMode: mode, countParam });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  // Ref for the main scrollable area
  const mainRef = useRef<HTMLDivElement>(null);

  // Scroll to top when question changes
  useEffect(() => {
    if (mainRef.current) {
        mainRef.current.scrollTo(0, 0);
    }
  }, [currentQuestionIndex]);

  // --- Loading State ---
  if (loading) {
    return <QuizSkeleton mode={mode} isDark={isDark} />;
  }

  // --- Error/Empty State ---
  if (!questions.length) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
      }`}>
        <div className="text-center p-10">
          <p className="text-red-500 text-xl font-bold mb-4">No questions found.</p>
          <p className="text-sm mb-6 opacity-70">Check your connection or try again later.</p>
          <Button 
            onClick={() => router.push('/pcap-quiz/mode')}
            variant="primary"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // --- Results View ---
  if (isSubmitted) {
      // Need to transform calculateScore output to match PCAPQuizResults
      // Wait, calculateScore returns the object structure
      const report = calculateScore();
      // Ensure types match
      const formattedReport = {
          ...report,
          percentage: report.percentage.toString(), // ensure string
          // check other props
      };

      return (
          <PCAPQuizResults 
            report={formattedReport} 
            onRetake={() => window.location.reload()}
            mode={mode}
            questions={questions}
            userAnswers={userAnswers}
            checkAnswer={checkAnswer}
          />
      );
  }

  const currentQ = questions[currentQuestionIndex];

  return (
    <div className={`h-screen w-full flex flex-col overflow-hidden transition-colors duration-500 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950' 
        : 'bg-gradient-to-br from-blue-50 via-white to-yellow-50'
    }`}>
      
      {/* NAVBAR */}
      <QuizNavbar 
        mode={mode}
        timeRemaining={timeRemaining}
        isDark={isDark}
        toggleTheme={toggleTheme}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="flex-1 flex overflow-hidden relative">
        
        {/* SIDEBAR */}
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

        {/* MAIN QUESTION AREA */}
        <main 
          ref={mainRef}
          className="flex-1 overflow-y-auto h-full p-4 md:p-8 relative scroll-smooth"
        >
          <div className="max-w-3xl mx-auto pb-20">
            
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1 mr-4">
                <p className={`text-sm mb-1 font-medium ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Question {currentQuestionIndex + 1} of {questions.length}
                </p>
                <div className={`w-full h-2.5 rounded-full ${
                  isDark ? 'bg-gray-800' : 'bg-gray-200'
                }`}>
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-yellow-500 h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>
              <Button 
                onClick={() => toggleMark(currentQ.id)}
                variant="ghost"
                size="icon"
                className={isDark ? "text-gray-300" : "text-gray-600"}
                title={markedQuestions.includes(currentQ.id) ? "Unmark" : "Mark for Review"}
              >
                <Star className={`w-6 h-6 ${markedQuestions.includes(currentQ.id) ? "fill-yellow-500 text-yellow-500" : ""}`} />
              </Button>
            </div>

            <PCAPQuestionCard 
                question={currentQ}
                selectedAnswers={userAnswers[currentQ.id] || []}
                onAnswer={(option, isMulti) => handleAnswer(currentQ.id, option, isMulti)}
                checkAnswer={checkAnswer}
                isSubmitted={isSubmitted}
                mode={mode}
            />

            <div className="flex justify-between items-center mt-8">
              <Button
                disabled={currentQuestionIndex === 0}
                onClick={prevQuestion}
                variant="secondary"
                className={currentQuestionIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}
              >
                Previous
              </Button>

              {currentQuestionIndex < questions.length - 1 ? (
                <Button
                  onClick={nextQuestion}
                  variant="primary"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Next Question
                </Button>
              ) : (
                <Button
                  onClick={() => setShowConfirm(true)}
                  className="bg-gradient-to-r from-blue-600 to-yellow-600 hover:from-blue-700 hover:to-yellow-700 border-none text-white shadow-lg shadow-blue-600/20"
                >
                  Finish & Submit
                </Button>
              )}
            </div>
          </div>
        </main>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className={`p-8 rounded-3xl shadow-2xl max-w-md w-full ${
              isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white'
            }`}
          >
            <h3 className={`text-2xl font-bold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>Ready to Submit?</h3>
            <p className={`mb-8 text-lg ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              You have answered <span className="font-bold text-blue-500">{Object.values(userAnswers).filter(a => a && a.length > 0).length}</span> out of <span className="font-bold">{questions.length}</span> questions.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button 
                onClick={() => setShowConfirm(false)}
                variant="ghost"
              >
                Continue Quiz
              </Button>
              <Button 
                onClick={handleSubmit}
                variant="primary"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Submit {mode === "exam" ? "Exam" : "Test"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
      {/* Bob Assistant Integration */}
      <BobAssistant 
        key={currentQ.id}
        question={currentQ} 
      />
    </div>
  );
}
