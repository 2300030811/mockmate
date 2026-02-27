"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Zap } from "lucide-react";
import { ArenaQuestion, Opponent } from "../types";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { getAvatarIcon } from "@/lib/icons";

interface ArenaBattleProps {
  opponent: Opponent | null;
  questions: ArenaQuestion[];
  currentQuestion: number;
  userScore: number;
  opponentScore: number;
  timeLeft: number;
  opponentProgress: number;
  userSelected: string | null;
  handleAnswer: (option: string) => void;
  category: string;
  combo: number;
  userAvatar?: string;
}

export function ArenaBattle({
  opponent,
  questions,
  currentQuestion,
  userScore,
  opponentScore,
  timeLeft,
  opponentProgress,
  userSelected,
  handleAnswer,
  category,
  combo,
  userAvatar
}: ArenaBattleProps) {
  const UserIcon = getAvatarIcon(userAvatar);
  const currentQ = questions[currentQuestion];
  const isLowTime = timeLeft <= 5;

  // Keyboard Shortcuts (1, 2, 3, 4, a, b, c, d)
  useEffect(() => {
    if (userSelected) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      let index = -1;

      if (['1', '2', '3', '4'].includes(key)) {
        index = parseInt(key) - 1;
      } else if (['a', 'b', 'c', 'd'].includes(key)) {
        index = key.charCodeAt(0) - 97; // 'a' is 97
      }

      if (index !== -1 && currentQ?.options[index]) {
        handleAnswer(currentQ.options[index]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQ?.options, userSelected, handleAnswer]);

  return (
    <motion.div
      key="battle"
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{
        opacity: 1,
        scale: 1,
        backgroundColor: isLowTime ? ["rgba(5,5,5,1)", "rgba(153,27,27,0.1)", "rgba(5,5,5,1)"] : "rgba(5,5,5,1)"
      }}
      transition={isLowTime ? { repeat: Infinity, duration: 1 } : {}}
      className={`flex-1 flex flex-col relative z-10 ${isLowTime ? 'animate-pulse' : ''}`}
    >
      {/* Combo Indicator */}
      <AnimatePresence>
        {combo > 1 && (
          <motion.div
            initial={{ opacity: 0, x: -50, scale: 0.5 }}
            animate={{
              opacity: 1,
              x: 0,
              scale: [1, 1.2, 1],
              rotate: [-2, 2, -2]
            }}
            exit={{ opacity: 0, scale: 1.5 }}
            transition={{
              scale: { repeat: Infinity, duration: 2 },
              rotate: { repeat: Infinity, duration: 0.5 }
            }}
            className="absolute top-32 left-8 z-20"
          >
            <div className="bg-gradient-to-r from-orange-500 via-red-600 to-purple-600 px-4 py-2 rounded-full font-black italic shadow-[0_0_30px_rgba(239,68,68,0.5)] flex items-center gap-2 border border-white/20">
              <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400 animate-pulse" />
              <span className="text-2xl text-white">{combo}x</span>
              <span className="text-[10px] text-white/80 uppercase tracking-tighter">COMBO</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-20 md:h-28 border-b border-white/5 bg-gray-950/80 backdrop-blur-3xl flex items-center pl-24 pr-4 md:pl-44 md:pr-12 gap-2 md:gap-12">
        <div className="flex-1 flex items-center gap-3 md:gap-4">
          <div className="relative shrink-0 scale-75 md:scale-100">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white shadow-2xl relative z-10">
              <UserIcon size={24} />
            </div>
          </div>
          <div className="hidden sm:block">
            <div className="text-sm md:text-xl font-black text-white leading-none">{userScore} <span className="text-gray-500 text-[8px] md:text-[10px] ml-0.5 md:ml-1">PTS</span></div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center shrink-0 px-1 md:px-8">
          <div className={`relative scale-75 md:scale-100 ${isLowTime ? 'text-red-500 scale-110 transition-transform' : ''}`}>
            <svg className="w-16 h-16 md:w-20 md:h-20 -rotate-90">
              <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="3" fill="none" className="text-white/5" />
              <motion.circle
                cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="3" fill="none"
                className={isLowTime ? "text-red-600" : "text-red-500"}
                strokeLinecap="round"
                initial={{ pathLength: 1 }}
                animate={{ pathLength: timeLeft / 30 }}
                transition={{ duration: 1, ease: "linear" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-xl md:text-2xl font-black font-mono leading-none ${isLowTime ? 'animate-bounce' : ''}`}>{timeLeft}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-end gap-3 md:gap-4">
          <div className="hidden sm:block text-right">
            <div className="text-sm md:text-xl font-black text-white leading-none">{opponentScore} <span className="text-gray-500 text-[8px] md:text-[10px] ml-0.5 md:ml-1">PTS</span></div>
          </div>
          <div className="relative shrink-0 scale-75 md:scale-100">
            <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-orange-800 rounded-xl flex items-center justify-center text-2xl shadow-2xl relative z-10">{opponent?.avatar}</div>
          </div>
        </div>
      </div>

      <div className="h-1 flex w-full bg-white/5">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-700 to-blue-400"
          animate={{ width: `${(currentQuestion / questions.length) * 100}%` }}
        />
        <div className="flex-1" />
        <motion.div
          className="h-full bg-gradient-to-l from-red-700 to-red-400"
          animate={{ width: `${opponentProgress}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 overflow-y-auto">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="w-full max-w-4xl space-y-12"
        >
          <div className="text-center space-y-4">
            <div className="flex flex-col items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] md:text-[10px] font-black uppercase text-gray-400">
                <Cpu size={12} /> QUESTION {currentQuestion + 1} / {questions.length}
              </div>
              <div className="text-[10px] font-bold text-red-500/80 uppercase tracking-[0.2em]">{category} CATEGORY</div>
            </div>
            <h2 className={`font-black leading-tight text-white italic px-4 ${currentQ?.code ? 'text-lg md:text-3xl' : 'text-lg md:text-4xl'}`}>
              {currentQ?.q}
            </h2>


            {currentQ?.code && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl mx-auto mt-4 md:mt-6 text-left overflow-hidden rounded-xl md:rounded-2xl border border-white/10 shadow-2xl max-h-[40vh] overflow-y-auto custom-scrollbar"
              >
                <SyntaxHighlighter
                  language="javascript"
                  style={vscDarkPlus}
                  customStyle={{ margin: 0, padding: '1.5rem', fontSize: '0.85rem', lineHeight: '1.6', background: 'rgba(0,0,0,0.6)' }}
                  wrapLines={true}
                  wrapLongLines={true}
                >
                  {currentQ.code}
                </SyntaxHighlighter>
              </motion.div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5 px-4 md:px-0" role="group" aria-label="Multiple choice options">
            {currentQ?.options.map((opt, i) => {
              const isCorrect = userSelected && opt === currentQ.a;
              const isWrong = userSelected === opt && opt !== currentQ.a;

              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(opt)}
                  disabled={!!userSelected}
                  aria-label={`Option ${String.fromCharCode(65 + i)}: ${opt}`}
                  aria-pressed={userSelected === opt}
                  className={`relative p-4 md:p-8 rounded-xl md:rounded-[2rem] border-2 font-black text-xs md:text-xl transition-all text-left flex items-center justify-between group overflow-hidden
                          ${isCorrect ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-400' :
                      isWrong ? 'bg-red-600/20 border-red-500/50 text-red-400' :
                        userSelected ? 'bg-gray-900 border-gray-800 text-gray-800' :
                          'bg-white/5 border-white/5 hover:border-white/20 text-white/80'}
                        `}
                >
                  <span className="flex gap-3 md:gap-4 items-center">
                    <span className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-black/40 flex items-center justify-center text-[10px] md:text-xs" aria-hidden="true">
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
