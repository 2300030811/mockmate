"use client";

import { motion, AnimatePresence } from "framer-motion";
import { UserAuthSection } from "@/components/UserAuthSection";
import dynamic from 'next/dynamic';
import { useState, useEffect, useCallback, useMemo } from "react";

const BobAssistant = dynamic(() => import("@/components/quiz/BobAssistant").then(mod => mod.BobAssistant), {
  ssr: false,
});
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface QuizGameProps {
  quiz: any[];
  current: number;
  setCurrent: (c: number | ((prev: number) => number)) => void;
  answers: Record<number, string>;
  setAnswers: (a: Record<number, string>) => void;
  setShowResults: (s: boolean) => void;
  isDark: boolean;
  toggleTheme: () => void;
}

export function QuizGame({
  quiz,
  current,
  setCurrent,
  answers,
  setAnswers,
  setShowResults,
  isDark,
  toggleTheme,
}: QuizGameProps) {
  const [isBobOpen, setIsBobOpen] = useState(false);
  const [streak, setStreak] = useState(0);
  
  const q = quiz[current];
  const progress = useMemo(() => ((current + 1) / quiz.length) * 100, [current, quiz.length]);

  const handleAnswer = useCallback((option: string) => {
    if (answers[q.id]) return; // Prevent changing answer

    const normalizeStr = (s: string) => s.replace(/\s+/g, "").toLowerCase();
    const isCorrect = q.answer === option || normalizeStr(q.answer) === normalizeStr(option);
    
    setAnswers({ ...answers, [q.id]: option });

    if (isCorrect) {
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }
  }, [answers, q, setAnswers]);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (["1", "2", "3", "4"].includes(e.key)) {
            const index = parseInt(e.key) - 1;
            if (q.options[index]) {
                handleAnswer(q.options[index]);
            }
        }
        if (e.key === "Enter" && answers[q.id]) {
            if (current < quiz.length - 1) {
                setCurrent(prev => prev + 1);
            } else {
                setShowResults(true);
            }
        }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [q, answers, handleAnswer, current, quiz.length, setCurrent, setShowResults]);

  if (!q) return <div className="p-10 text-center">Loading question...</div>;

  return (
    <div className={`h-screen overflow-hidden flex flex-col transition-colors duration-500 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950' 
        : 'bg-gradient-to-br from-gray-50 via-white to-blue-50'
    }`}>
      
      {/* Navbar */}
      <nav className={`h-16 flex-none shadow-md z-50 flex items-center justify-between px-4 lg:px-8 ${
        isDark 
          ? 'bg-gray-900/80 backdrop-blur-sm border-b border-gray-800' 
          : 'bg-white/80 backdrop-blur-sm border-b border-gray-200'
      }`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          <h1 className={`text-lg font-bold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            AI Quiz Generator
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center">
              <UserAuthSection />
              <div className="w-px h-6 bg-gray-200 dark:bg-white/10 mx-4"></div>
          </div>

          <button 
            onClick={() => setShowResults(true)}
            className={`text-sm font-bold px-3 py-2 rounded-lg transition ${
              isDark 
                ? 'text-red-400 hover:bg-red-900/20' 
                : 'text-red-500 hover:bg-red-50'
            }`}
          >
            Finish Now
          </button>
          <button 
            onClick={toggleTheme} 
            className={`p-2 rounded-lg transition ${
              isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
            }`}
          >
            {isDark ? "☀️" : "🌙"}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto py-10 px-4">
        <div className="max-w-3xl mx-auto">
          
          {/* Progress Bar */}
          <div className="mb-8">
            <div className={`flex justify-between text-sm font-medium mb-2 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <span>Question {current + 1} of {quiz.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className={`h-2.5 w-full rounded-full ${
              isDark ? 'bg-gray-800' : 'bg-gray-200'
            }`}>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2.5 rounded-full transition-all duration-300"
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ x: 50, opacity: 0, scale: 0.95 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: -50, opacity: 0, scale: 0.95 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30 
              }}
              className={`p-8 rounded-3xl shadow-xl border relative overflow-hidden ${
                isDark 
                  ? 'bg-gray-900/60 border-gray-800 backdrop-blur-md' 
                  : 'bg-white/80 border-gray-200 backdrop-blur-md'
              }`}
            >
              {/* Background Glow */}
              <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none ${
                  isDark ? 'bg-blue-500' : 'bg-blue-300'
              }`}></div>

              <div className="flex justify-between items-start mb-6 relative z-10">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full border ${
                  isDark 
                    ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' 
                    : 'bg-blue-50 border-blue-200 text-blue-700'
                }`}>
                  <span>✨</span> AI Generated
                </span>
                
                {/* Streak Counter */}
                <div className="flex items-center gap-4">
                     {streak > 1 && (
                        <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            key={streak}
                            className="flex items-center gap-1 px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 font-bold border border-orange-500/20"
                        >
                            <span className="text-lg">🔥</span> 
                            <span>{streak} Streak!</span>
                        </motion.div>
                     )}
                </div>
              </div>
              
              <h2 className={`text-2xl md:text-3xl font-bold mb-8 leading-snug relative z-10 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {q.question}
              </h2>

              <div className="space-y-3 relative z-10">
                {q.options.map((opt: string, i: number) => {
                  const normalizeStr = (s: string) => s.replace(/\s+/g, "").toLowerCase();
                  const isSelected = answers[q.id] === opt;
                  const isCorrect = q.answer === opt || normalizeStr(q.answer) === normalizeStr(opt);
                  const isWrong = isSelected && !isCorrect;
                  const showFeedback = !!answers[q.id];

                  let buttonStyle = "";
                  
                  if (showFeedback) {
                    if (isCorrect) {
                      buttonStyle = isDark
                        ? "border-green-500/50 bg-green-500/20 text-green-200 shadow-green-500/10"
                        : "border-green-500 bg-green-50 text-green-700 shadow-green-200";
                    } else if (isWrong) {
                      buttonStyle = isDark
                        ? "border-red-500/50 bg-red-500/20 text-red-200 shadow-red-500/10"
                        : "border-red-500 bg-red-50 text-red-700 shadow-red-200";
                    } else {
                      buttonStyle = isDark
                        ? "opacity-50 border-gray-800 text-gray-500 bg-gray-900/20 grayscale"
                        : "opacity-50 border-gray-200 text-gray-400 bg-gray-50 grayscale";
                    }
                  } else if (isSelected) {
                    buttonStyle = isDark
                      ? "border-blue-500 bg-blue-500/20 text-blue-300 shadow-blue-500/20"
                      : "border-blue-500 bg-blue-50 text-blue-700 shadow-blue-200";
                  } else {
                    buttonStyle = isDark
                      ? "border-gray-800 bg-gray-800/40 hover:bg-gray-700/60 hover:border-gray-600 text-gray-300"
                      : "border-gray-200 bg-white hover:bg-gray-50 hover:border-blue-300 text-gray-700";
                  }

                  return (
                    <motion.button
                      key={i}
                      disabled={showFeedback}
                      whileHover={!showFeedback ? { scale: 1.02, x: 4 } : {}}
                      whileTap={!showFeedback ? { scale: 0.98 } : {}}
                      onClick={() => handleAnswer(opt)}
                      className={cn(
                        "w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 font-medium text-lg relative overflow-hidden group shadow-sm hover:shadow-md",
                        buttonStyle
                      )}
                    >
                      <div className="flex items-center justify-between relative z-10">
                        <span className="flex-1 pr-4">{opt}</span>
                        {showFeedback && isCorrect && (
                          <motion.div
                             initial={{ scale: 0, rotate: -45 }}
                             animate={{ scale: 1, rotate: 0 }}
                             className="bg-green-500 rounded-full p-1"
                          >
                             <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                             </svg>
                          </motion.div>
                        )}
                         {showFeedback && isWrong && (
                             <motion.div
                             initial={{ scale: 0 }}
                             animate={{ scale: 1 }}
                             className="text-red-500"
                          >
                             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                             </svg>
                          </motion.div>
                         )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Explanation Box */}
              <AnimatePresence>
                {answers[q.id] && (
                    <motion.div 
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className={`rounded-2xl border overflow-hidden ${
                        isDark 
                        ? "bg-blue-900/10 border-blue-500/20 text-blue-200" 
                        : "bg-blue-50/50 border-blue-200 text-blue-800"
                    }`}
                    >
                        <div className="p-5 flex items-start gap-4">
                            <div className="p-2 bg-blue-500/10 rounded-xl">
                                <span className="text-xl">💡</span>
                            </div>
                            <div>
                                <p className="font-bold text-xs uppercase tracking-wider opacity-60 mb-1">Explanation</p>
                                <p className="leading-relaxed opacity-90">{q.explanation}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              disabled={current === 0}
              onClick={() => setCurrent(prev => prev - 1)}
              className={`px-8 py-3 rounded-xl font-semibold transition-all ${
                current === 0 
                  ? 'opacity-0 pointer-events-none' 
                  : isDark
                    ? 'bg-gray-800 text-white hover:bg-gray-700'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Previous
            </button>

            {current < quiz.length - 1 ? (
              <button
                onClick={() => setCurrent(prev => prev + 1)}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition shadow-lg shadow-blue-600/20 hover:scale-105"
              >
                Next Question
              </button>
            ) : (
              <button
                onClick={() => setShowResults(true)}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold transition shadow-lg shadow-green-600/20 hover:scale-105"
              >
                Finish Quiz
              </button>
            )}
          </div>
        
          <BobAssistant 
            question={q} 
            isOpen={isBobOpen} 
            onClose={() => setIsBobOpen(false)} 
          />

          <button
              onClick={() => setIsBobOpen(true)}
              className="fixed bottom-6 right-6 z-40 bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-full shadow-xl transition-transform hover:scale-110 active:scale-95 group"
              title="Ask Bob"
          >
              <div className="text-2xl leading-none">🦁</div>
              <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-black/75 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Ask Bob
              </span>
          </button>
        </div>
      </div>
    </div>
  );
}
