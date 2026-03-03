"use client";

import { useState, useEffect, memo, lazy, Suspense } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Cpu, Zap, X } from "lucide-react";
import { ArenaQuestion, Opponent } from "../types";
import { getAvatarIcon } from "@/lib/icons";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// Lazy-load syntax highlighter (~70KB) — only loaded when a question has code
const LazyCodeBlock = lazy(() =>
  import('react-syntax-highlighter/dist/esm/prism').then(mod => {
    const SyntaxHighlighter = mod.default || (mod as any).Prism;
    return import('react-syntax-highlighter/dist/esm/styles/prism').then(styles => ({
      default: ({ code }: { code: string }) => (
        <SyntaxHighlighter
          language="javascript"
          style={styles.vscDarkPlus}
          customStyle={{ margin: 0, padding: '1.5rem', fontSize: '0.85rem', lineHeight: '1.6', background: 'rgba(0,0,0,0.6)' }}
          wrapLines={true}
          wrapLongLines={true}
        >
          {code}
        </SyntaxHighlighter>
      )
    }));
  })
);

interface AnswerOptionsProps {
  question: ArenaQuestion;
  userSelected: string | null;
  onAnswer: (option: string) => void;
}

// Memoized options grid to prevent re-renders when parent updates (e.g., timer tick)
const AnswerOptions = memo(function AnswerOptions({
  question,
  userSelected,
  onAnswer,
}: AnswerOptionsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5 px-4 md:px-0" role="group" aria-label="Multiple choice options">
      {question?.options.map((opt, i) => {
        const isCorrect = userSelected && opt === question.a;
        const isWrong = userSelected === opt && opt !== question.a;

        return (
          <button
            key={i}
            onClick={() => onAnswer(opt)}
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
  );
});

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
  onForfeit?: () => void;
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
  userAvatar,
  onForfeit
}: ArenaBattleProps) {
  const UserIcon = getAvatarIcon(userAvatar);
  const currentQ = questions[currentQuestion];
  const isLowTime = timeLeft <= 5;
  const prefersReducedMotion = useReducedMotion();
  const [showForfeitConfirm, setShowForfeitConfirm] = useState(false);

  // Keyboard Shortcuts (1, 2, 3, 4, a, b, c, d)
  useEffect(() => {
    if (userSelected) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input or textarea
      const activeElement = document.activeElement;
      if (activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA') {
        return;
      }

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
    <m.div
      key="battle"
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{
        opacity: 1,
        scale: 1,
        backgroundColor: !prefersReducedMotion && isLowTime ? ["rgba(5,5,5,1)", "rgba(153,27,27,0.15)", "rgba(5,5,5,1)"] : "rgba(5,5,5,1)"
      }}
      transition={!prefersReducedMotion && isLowTime ? { repeat: Infinity, duration: 1 } : {}}
      className="flex-1 flex flex-col relative z-10"
    >
      {/* Combo Indicator */}
      <AnimatePresence>
        {combo > 1 && (
          <m.div
            initial={prefersReducedMotion ? {} : { opacity: 0, x: -50, scale: 0.5 }}
            animate={prefersReducedMotion ? { opacity: 1 } : {
              opacity: 1,
              x: 0,
              scale: 1
            }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 1.5 }}
            transition={prefersReducedMotion ? {} : {
              type: "spring",
              stiffness: 200,
              damping: 20
            }}
            className="absolute top-32 left-8 z-20"
          >
            <div className="bg-gradient-to-r from-orange-500 via-red-600 to-purple-600 px-4 py-2 rounded-full font-black italic shadow-[0_0_30px_rgba(239,68,68,0.5)] flex items-center gap-2 border border-white/20">
              <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400 animate-pulse" />
              <span className="text-2xl text-white">{combo}x</span>
              <span className="text-xs text-white/80 uppercase tracking-tighter">COMBO</span>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      <div className="h-20 md:h-28 border-b border-white/5 bg-gray-950/80 backdrop-blur-3xl flex items-center pl-4 sm:pl-12 md:pl-44 pr-4 md:pr-12 gap-2 md:gap-12">
        <div className="flex-1 flex items-center gap-3 md:gap-4">
          <div className="relative shrink-0 scale-75 md:scale-100">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white shadow-2xl relative z-10">
              <UserIcon size={24} />
            </div>
          </div>
          <div className="block" aria-live="polite" aria-label={`Your score: ${userScore} points`}>
            <div className="text-xs md:text-xl font-black text-white leading-none">{userScore} <span className="text-gray-400 text-xs md:text-sm ml-0.5 md:ml-1">PTS</span></div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center shrink-0 px-1 md:px-8">
          <div className={`relative scale-75 md:scale-100 ${isLowTime ? 'text-red-500 scale-110 transition-transform' : ''}`} role="timer" aria-label={`${timeLeft} seconds remaining`} aria-live="polite">
            <svg className="w-16 h-16 md:w-20 md:h-20 -rotate-90">
              <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="3" fill="none" className="text-white/5" />
              <m.circle
                cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="3" fill="none"
                className={isLowTime ? "text-red-600" : "text-red-500"}
                strokeLinecap="round"
                initial={{ pathLength: 1 }}
                animate={{ pathLength: timeLeft / 30 }}
                transition={{ duration: 1, ease: "linear" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-xl md:text-2xl font-black font-mono leading-none ${!prefersReducedMotion && isLowTime ? 'animate-bounce' : ''}`} aria-hidden="true">{timeLeft}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-end gap-3 md:gap-4">
          <div className="block text-right" aria-live="polite" aria-label={`${opponent?.name || 'Opponent'} score: ${opponentScore} points`}>
            <div className="text-xs md:text-xl font-black text-white leading-none">{opponentScore} <span className="text-gray-400 text-xs md:text-sm ml-0.5 md:ml-1">PTS</span></div>
          </div>
          <div className="relative shrink-0 scale-75 md:scale-100">
            <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-orange-800 rounded-xl flex items-center justify-center text-2xl shadow-2xl relative z-10">{opponent?.avatar}</div>
          </div>
        </div>

        {/* Forfeit Button */}
        {onForfeit && (
          <button
            onClick={() => setShowForfeitConfirm(true)}
            className="shrink-0 p-2 hover:bg-red-900/30 rounded-lg transition-colors ml-2"
            aria-label="Forfeit battle"
            title="Forfeit battle"
          >
            <X className="w-5 h-5 md:w-6 md:h-6 text-red-500 hover:text-red-400" />
          </button>
        )}
      </div>

      <div className="h-1 flex w-full bg-white/5">
        <m.div
          className="h-full bg-gradient-to-r from-blue-700 to-blue-400"
          animate={{ width: `${(currentQuestion / questions.length) * 100}%` }}
        />
        <div className="flex-1" />
        <m.div
          className="h-full bg-gradient-to-l from-red-700 to-red-400"
          animate={{ width: `${opponentProgress}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 overflow-y-auto">
        {showForfeitConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
            <m.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gray-900 border border-white/10 rounded-2xl p-6 md:p-8 max-w-sm shadow-2xl"
            >
              <h3 className="text-lg md:text-xl font-black text-white mb-2">Forfeit Battle?</h3>
              <p className="text-sm md:text-base text-gray-400 mb-6">Are you sure you want to forfeit? You will lose this match and receive no points.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowForfeitConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-black transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowForfeitConfirm(false);
                    onForfeit?.();
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-black transition-colors"
                >
                  Forfeit
                </button>
              </div>
            </m.div>
          </div>
        )}
        
        <m.div
          key={currentQuestion}
          initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
          animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
          transition={prefersReducedMotion ? {} : { duration: 0.3, ease: "easeOut" }}
          className="w-full max-w-4xl space-y-12"
        >
          <div className="text-center space-y-4">
            <div className="flex flex-col items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs md:text-sm font-black uppercase text-gray-400">
                <Cpu size={12} /> QUESTION {currentQuestion + 1} / {questions.length}
              </div>
              <div className="text-sm font-bold text-red-500/80 uppercase tracking-[0.2em]">{category} CATEGORY</div>
            </div>
            <h2 className={`font-black leading-tight text-white italic px-4 ${currentQ?.code ? 'text-lg md:text-3xl' : 'text-lg md:text-4xl'}`}>
              {currentQ?.q}
            </h2>


            {currentQ?.code && (
              <m.div
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                className="w-full max-w-2xl mx-auto mt-4 md:mt-6 text-left overflow-hidden rounded-xl md:rounded-2xl border border-white/10 shadow-2xl max-h-[40vh] overflow-y-auto custom-scrollbar"
              >
                <Suspense fallback={<div className="p-6 bg-black/60 rounded-xl animate-pulse h-24" />}>
                  <LazyCodeBlock code={currentQ.code} />
                </Suspense>
              </m.div>
            )}
          </div>

          <AnswerOptions 
            question={currentQ}
            userSelected={userSelected}
            onAnswer={handleAnswer}
          />

          {!userSelected && (
            <p className="text-center text-xs md:text-sm text-gray-500 mt-6 opacity-60">
              💡 Tip: Press <kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-600 rounded text-white text-xs">1</kbd>-<kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-600 rounded text-white text-xs">4</kbd> or <kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-600 rounded text-white text-xs">A</kbd>-<kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-600 rounded text-white text-xs">D</kbd> to answer
            </p>
          )}
        </m.div>
      </div>
    </m.div>
  );
}
