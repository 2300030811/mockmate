"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAWSQuiz, QuizMode } from "@/hooks/useAWSQuiz";
import { useTheme } from "@/app/providers";
import { AWSQuestionCard } from "./AWSQuestionCard";
import { AWSQuizResults } from "./AWSQuizResults";
import { motion } from "framer-motion";

// --- Icons ---
const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const StarIcon = ({ filled }: { filled: boolean }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${filled ? "fill-yellow-500 text-yellow-500" : "fill-none"}`} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>;
const XMarkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;

interface AWSQuizShellProps {
  mode: QuizMode;
}

export function AWSQuizShell({ mode }: AWSQuizShellProps) {
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
      checkAnswer
  } = useAWSQuiz({ initialMode: mode });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // --- Format Time Helper ---
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // --- Loading State ---
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${
        isDark 
          ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950' 
          : 'bg-gradient-to-br from-gray-50 via-white to-blue-50'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Loading {mode === "exam" ? "Real Exam" : "Mock Test"}...
          </h2>
        </div>
      </div>
    );
  }

  // --- Error/Empty State ---
  if (!questions.length) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
      }`}>
        <div className="text-center p-10">
          <p className="text-red-500 text-xl">No questions found. Check connection.</p>
          <button 
            onClick={() => router.push('/aws-quiz/mode')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // --- Results View ---
  if (isSubmitted) {
      return (
          <AWSQuizResults 
            report={calculateScore()} 
            onRetake={() => window.location.reload()}
            mode={mode}
          />
      );
  }

  const currentQ = questions[currentQuestionIndex];

  return (
    <div className={`h-screen w-full flex flex-col overflow-hidden transition-colors duration-500 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950' 
        : 'bg-gradient-to-br from-gray-50 via-white to-blue-50'
    }`}>
      
      {/* NAVBAR */}
      <nav className={`h-16 flex-none shadow-md z-50 flex items-center justify-between px-4 lg:px-8 ${
        isDark 
          ? 'bg-gray-900/80 backdrop-blur-sm border-b border-gray-800' 
          : 'bg-white/80 backdrop-blur-sm border-b border-gray-200'
      }`}>
        <div className="flex items-center gap-4">
          {mode !== "exam" && (
            <button
            onClick={() => router.push("/")}
            className={`p-2 rounded-lg transition ${
              isDark ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-600"
            }`}
            title="Home"
            >
              <HomeIcon />
            </button>
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className={`lg:hidden p-2 rounded-lg transition ${
              isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
            }`}
          >
            <MenuIcon />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">☁️</span>
            <h1 className={`text-lg font-bold hidden sm:block ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {mode === "exam" ? "AWS Exam Mode" : "AWS Practice"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full transition-all duration-300 ${isDark ? 'hover:bg-gray-800 text-yellow-400' : 'hover:bg-gray-100 text-gray-600'}`}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 transform rotate-[-90deg]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          
          {mode === "exam" && (
            <div className={`flex items-center gap-2 font-mono text-xl ${
              timeRemaining < 300 ? 'text-red-500 animate-pulse' : isDark ? 'text-white' : 'text-gray-900'
            }`}>
              <ClockIcon />
              {formatTime(timeRemaining)}
            </div>
          )}
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden relative">
        
        {/* SIDEBAR */}
        <aside className={`
          absolute lg:static inset-y-0 left-0 z-40 w-72 h-full
          transform transition-transform duration-300 ease-in-out border-r shadow-xl lg:shadow-none
          overflow-y-auto custom-scrollbar
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isDark 
            ? 'bg-gray-900/80 backdrop-blur-sm border-gray-800' 
            : 'bg-white/80 backdrop-blur-sm border-gray-200'
          }
        `}>
          <div className="p-4 flex flex-col h-full">
            <div className="flex justify-between items-center mb-4 lg:hidden">
              <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Navigator</span>
              <button onClick={() => setSidebarOpen(false)}>
                <XMarkIcon />
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2 pb-20">
              {questions.map((q, idx) => {
                const isAnswered = !!userAnswers[q.id]?.length;
                const isCurrent = currentQuestionIndex === idx;
                const isMarked = markedQuestions.includes(q.id);
                
                let bgClass = isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200';
                let textClass = isDark ? 'text-gray-200' : 'text-gray-700';

                if (isCurrent) {
                  bgClass = isDark 
                    ? 'ring-2 ring-blue-500 bg-blue-900/40' 
                    : 'ring-2 ring-blue-500 bg-blue-50';
                } else if (isAnswered) {
                  bgClass = isDark 
                    ? 'bg-blue-900/40 border border-blue-500/50' 
                    : 'bg-blue-100 border border-blue-300';
                  textClass = isDark ? 'text-blue-200' : 'text-blue-800';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => { setCurrentQuestionIndex(idx); if(window.innerWidth < 1024) setSidebarOpen(false); }}
                    className={`relative w-full aspect-square rounded-lg text-sm font-semibold transition-all ${bgClass} ${textClass}`}
                  >
                    {idx + 1}
                    {isMarked && <span className="absolute top-0 right-0 text-yellow-500 text-xs">★</span>}
                  </button>
                );
              })}
            </div>
            
            <div className={`mt-auto pt-4 sticky bottom-0 ${
              isDark ? 'bg-gray-900/80' : 'bg-white/80'
            } backdrop-blur-sm`}>
              <button 
                onClick={() => setShowConfirm(true)}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-bold transition shadow-lg hover:scale-105"
              >
                Submit {mode === "exam" ? "Exam" : "Test"}
              </button>
            </div>
          </div>
        </aside>

        {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        {/* MAIN QUESTION AREA */}
        <main className="flex-1 overflow-y-auto h-full p-4 md:p-8 relative scroll-smooth">
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
                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>
              <button 
                onClick={() => toggleMark(currentQ.id)}
                className={`p-2 rounded-full transition ${
                  isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                }`}
                title={markedQuestions.includes(currentQ.id) ? "Unmark" : "Mark for Review"}
              >
                <StarIcon filled={markedQuestions.includes(currentQ.id)} />
              </button>
            </div>

            <AWSQuestionCard 
                question={currentQ}
                selectedAnswers={userAnswers[currentQ.id] || []}
                onAnswer={(option, isMulti) => handleAnswer(currentQ.id, option, isMulti)}
                checkAnswer={checkAnswer}
                isSubmitted={isSubmitted}
                mode={mode}
            />

            <div className="flex justify-between items-center mt-8">
              <button
                disabled={currentQuestionIndex === 0}
                onClick={prevQuestion}
                className={`px-8 py-3 rounded-xl font-semibold transition ${
                  currentQuestionIndex === 0 
                    ? 'opacity-0 pointer-events-none' 
                    : isDark
                      ? 'bg-gray-800 text-white hover:bg-gray-700'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                Previous
              </button>

              {currentQuestionIndex < questions.length - 1 ? (
                <button
                  onClick={nextQuestion}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition shadow-lg shadow-blue-600/20 hover:scale-105"
                >
                  Next Question
                </button>
              ) : (
                <button
                  onClick={() => setShowConfirm(true)}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold transition shadow-lg shadow-green-600/20 hover:scale-105"
                >
                  Finish & Submit
                </button>
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
              <button 
                onClick={() => setShowConfirm(false)}
                className={`px-6 py-3 rounded-xl transition font-medium ${
                  isDark
                    ? 'text-gray-300 hover:bg-gray-800'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Continue Quiz
              </button>
              <button 
                onClick={handleSubmit}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition font-bold shadow-lg hover:scale-105"
              >
                Submit {mode === "exam" ? "Exam" : "Test"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
