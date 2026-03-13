"use client";

import { useState, useEffect, useMemo, memo, lazy, Suspense } from "react";
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

const AnswerOptions = memo(function AnswerOptions({
  question,
  userSelected,
  onAnswer,
}: AnswerOptionsProps) {
  const isMulti = question?.multipleCorrect === true;
  const [multiSelected, setMultiSelected] = useState<string[]>([]);
  const hasSubmitted = !!userSelected;

  const correctAnswers = useMemo(() => {
    if (!question) return [];
    return isMulti
      ? (question.a as string).split("|||")
      : [question.a];
  }, [question, isMulti]);

  useEffect(() => {
    setMultiSelected([]);
  }, [question?.q]);

  const toggleMulti = (opt: string) => {
    if (hasSubmitted) return;
    setMultiSelected(prev =>
      prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]
    );
  };

  const submitMulti = () => {
    if (multiSelected.length === 0) return;
    onAnswer(multiSelected.join("|||"));
  };

  return (
    <div className="space-y-4">
      {isMulti && !hasSubmitted && (
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-xs font-black uppercase tracking-widest text-amber-400">
            Select all that apply
          </span>
        </div>
      )}

      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5 px-4 md:px-0"
        role="group"
        aria-label={isMulti ? "Select all correct answers" : "Multiple choice options"}
      >
        {question?.options.map((opt, i) => {
          const isCorrect = hasSubmitted && correctAnswers.includes(opt);
          const isWrong =
            hasSubmitted &&
            (isMulti
              ? multiSelected.includes(opt) && !correctAnswers.includes(opt)
              : userSelected === opt && opt !== question.a);
          const isSelectedForMulti =
            !hasSubmitted && isMulti && multiSelected.includes(opt);

          return (
            <button
              key={i}
              onClick={() => (isMulti ? toggleMulti(opt) : onAnswer(opt))}
              disabled={hasSubmitted}
              aria-label={`Option ${String.fromCharCode(65 + i)}: ${opt}`}
              aria-pressed={
                isMulti ? multiSelected.includes(opt) : userSelected === opt
              }
              className={`relative p-4 md:p-8 rounded-xl md:rounded-[2rem] border-2 font-black text-xs md:text-xl transition-all text-left flex items-center justify-between group overflow-hidden
                ${
                  isCorrect
                    ? "bg-emerald-600/20 border-emerald-500/50 text-emerald-400"
                    : isWrong
                    ? "bg-red-600/20 border-red-500/50 text-red-400"
                    : isSelectedForMulti
                    ? "bg-amber-500/10 border-amber-500/40 text-amber-300"
                    : hasSubmitted
                    ? "bg-gray-900 border-gray-800 text-gray-800"
                    : "bg-white/5 border-white/5 hover:border-white/20 text-white/80"
                }`}
            >
              <span className="flex gap-3 md:gap-4 items-center">
                <span
                  className={`w-6 h-6 md:w-8 md:h-8 rounded-lg flex items-center justify-center text-[10px] md:text-xs flex-shrink-0
                    ${isSelectedForMulti ? "bg-amber-500/30 border border-amber-400" : "bg-black/40"}`}
                  aria-hidden="true"
                >
                  {isSelectedForMulti ? "✓" : String.fromCharCode(65 + i)}
                </span>
                {opt}
              </span>
            </button>
          );
        })}
      </div>

      {isMulti && !hasSubmitted && (
        <div className="flex justify-center pt-2">
          <button
            onClick={submitMulti}
            disabled={multiSelected.length === 0}
            className={`px-10 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all
              ${
                multiSelected.length > 0
                  ? "bg-red-600 hover:bg-red-700 text-white active:scale-95"
                  : "bg-white/5 text-gray-600 cursor-not-allowed border border-white/5"
              }`}
          >
            Confirm ({multiSelected.length} selected)
          </button>
        </div>
      )}
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

// ─── Sub-components for better performance (Extracted to top-level for stable references) ───

const BattleHUD = memo(function BattleHUD({
  userScore,
  opponentScore,
  timeLeft,
  isLowTime,
  opponent,
  userAvatar,
  onForfeit,
  prefersReducedMotion
}: {
  userScore: number;
  opponentScore: number;
  timeLeft: number;
  isLowTime: boolean;
  opponent: Opponent | null;
  userAvatar?: string;
  onForfeit?: () => void;
  prefersReducedMotion: boolean;
}) {
  const UserIcon = getAvatarIcon(userAvatar);
  return (
    <div className="h-20 md:h-28 border-b border-white/5 bg-gray-950/80 backdrop-blur-3xl flex items-center pl-4 sm:pl-12 md:pl-44 pr-4 md:pr-12 gap-2 md:gap-12 shrink-0">
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

      {onForfeit && (
        <button
          onClick={onForfeit}
          className="shrink-0 p-2 hover:bg-red-900/30 rounded-lg transition-colors ml-2"
          aria-label="Forfeit battle"
          title="Forfeit battle"
        >
          <X className="w-5 h-5 md:w-6 md:h-6 text-red-500 hover:text-red-400" />
        </button>
      )}
    </div>
  );
});

const ScoreDeltaBar = memo(function ScoreDeltaBar({ userScore, opponentScore }: { userScore: number, opponentScore: number }) {
  const isAhead = userScore > opponentScore;
  const isTied = userScore === opponentScore;
  const delta = Math.abs(userScore - opponentScore);

  return (
    <div className="flex items-center justify-center gap-3 px-4 py-2 bg-white/[0.02] border-b border-white/5 text-[10px] md:text-xs font-black">
      <span className="text-blue-400">{userScore} pts</span>
      <span className="text-gray-600 uppercase tracking-widest text-[9px]">you</span>
      {isTied ? (
        <span className="px-3 py-0.5 bg-white/5 border border-white/10 rounded-full text-gray-400">tied</span>
      ) : (
        <span className={`px-3 py-0.5 rounded-full border ${isAhead ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
          {isAhead ? `+${delta} ahead` : `-${delta} behind`}
        </span>
      )}
      <span className="text-gray-600 uppercase tracking-widest text-[9px]">them</span>
      <span className="text-red-400">{opponentScore} pts</span>
    </div>
  );
});

const ProgressDots = memo(function ProgressDots({ currentQuestion, totalQuestions }: { currentQuestion: number, totalQuestions: number }) {
  return (
    <div className="flex items-center justify-center gap-2 pt-3 pb-1">
      {Array.from({ length: totalQuestions }).map((_, i) => (
        <div
          key={i}
          className={`h-1 rounded-full transition-all duration-300
            ${i < currentQuestion ? "w-6 bg-emerald-500" : i === currentQuestion ? "w-8 bg-red-500" : "w-6 bg-white/10"}`}
        />
      ))}
    </div>
  );
});

const OpponentStatusStrip = memo(function OpponentStatusStrip({ 
  opponentName, 
  opponentProgress, 
  currentQuestion, 
  totalQuestions 
}: { 
  opponentName: string, 
  opponentProgress: number, 
  currentQuestion: number, 
  totalQuestions: number 
}) {
  const hasAnsweredCurrent = opponentProgress >= ((currentQuestion + 1) / totalQuestions) * 100;
  return (
    <div className="mx-4 mt-3 flex items-center gap-2 px-3 py-2 bg-white/[0.02] border border-white/5 rounded-xl text-xs">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
      <span className="text-gray-500 truncate">
        <span className="text-red-400 font-black mr-1">{opponentName}</span>
        {hasAnsweredCurrent ? "has answered this question" : "is answering..."}
      </span>
      <div className="ml-auto flex gap-1 shrink-0">
        {Array.from({ length: currentQuestion }).map((_, i) => (
          <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-gray-500 font-mono">Q{i + 1} ✓</span>
        ))}
      </div>
    </div>
  );
});

const QuestionDisplay = memo(function QuestionDisplay({ 
  question, 
  currentIdx, 
  totalCount, 
  category, 
  prefersReducedMotion 
}: { 
  question: ArenaQuestion, 
  currentIdx: number, 
  totalCount: number, 
  category: string, 
  prefersReducedMotion: boolean 
}) {
  return (
    <div className="text-center space-y-4">
      <div className="flex flex-col items-center gap-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-black uppercase text-gray-400">
          <Cpu size={12} /> QUESTION {currentIdx + 1} / {totalCount}
        </div>
        <div className="text-[10px] md:text-sm font-bold text-red-500/80 uppercase tracking-[0.2em]">{category} CATEGORY</div>
      </div>
      <h2 className={`font-black leading-tight text-white italic px-4 ${question?.code ? 'text-lg md:text-3xl' : 'text-lg md:text-4xl'}`}>
        {question?.q}
      </h2>

      {question?.code && (
        <m.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
          animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          className="w-full max-w-2xl mx-auto mt-4 md:mt-6 text-left overflow-hidden rounded-xl md:rounded-2xl border border-white/10 shadow-2xl max-h-[40vh] overflow-y-auto custom-scrollbar"
        >
          <Suspense fallback={<div className="p-6 bg-black/60 rounded-xl animate-pulse h-24" />}>
            <LazyCodeBlock code={question.code} />
          </Suspense>
        </m.div>
      )}
    </div>
  );
});

const RoundScoreboard = memo(function RoundScoreboard({ 
  userScore, 
  opponentScore, 
  currentQuestion, 
  totalQuestions, 
  opponentName 
}: { 
  userScore: number, 
  opponentScore: number, 
  currentQuestion: number, 
  totalQuestions: number, 
  opponentName: string 
}) {
  return (
    <div className="mx-4 mb-4 bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden shrink-0">
      <div className="px-3 py-1.5 border-b border-white/5 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-600">
        Round scoreboard
      </div>
      {[
        { label: "You", color: "text-blue-400", score: userScore },
        { label: opponentName, color: "text-red-400", score: opponentScore },
      ].map((player, pi) => (
        <div key={pi} className="flex items-center gap-3 px-3 py-2 border-b border-white/[0.03] last:border-none">
          <span className={`text-[10px] md:text-xs font-black min-w-[60px] md:min-w-[70px] truncate ${player.color}`}>{player.label}</span>
          <div className="flex gap-1 flex-1">
            {Array.from({ length: totalQuestions }).map((_, qi) => (
              <div
                key={qi}
                className={`flex-1 h-4 md:h-5 rounded text-[8px] md:text-[9px] flex items-center justify-center font-black
                  ${qi < currentQuestion ? (pi === 0 ? "bg-blue-500/20 text-blue-400" : "bg-red-500/20 text-red-400") : 
                    qi === currentQuestion ? "bg-white/5 text-gray-600 border border-white/10" : "bg-white/[0.03] text-gray-800"}`}
              >
                {qi < currentQuestion ? (pi === 0 ? "W" : "L") : qi === currentQuestion ? `${qi + 1}` : "—"}
              </div>
            ))}
          </div>
          <span className={`text-[10px] md:text-xs font-black min-w-[35px] md:min-w-[40px] text-right ${player.color}`}>{player.score} pts</span>
        </div>
      ))}
    </div>
  );
});

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
  const currentQ = questions[currentQuestion];
  const isLowTime = timeLeft <= 5;
  const prefersReducedMotion = useReducedMotion();
  const [showForfeitConfirm, setShowForfeitConfirm] = useState(false);

  useEffect(() => {
    if (userSelected) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      if (activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA') return;

      const key = e.key.toLowerCase();
      let index = -1;

      if (['1', '2', '3', '4'].includes(key)) index = parseInt(key) - 1;
      else if (['a', 'b', 'c', 'd'].includes(key)) index = key.charCodeAt(0) - 97;

      if (index !== -1 && currentQ?.options[index]) {
        if (currentQ.multipleCorrect) return;
        handleAnswer(currentQ.options[index]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQ?.options, currentQ?.multipleCorrect, userSelected, handleAnswer]);

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
      className="flex-1 flex flex-col min-h-0 relative z-10"
    >
      <AnimatePresence>
        {combo > 1 && (
          <m.div
            initial={prefersReducedMotion ? {} : { opacity: 0, x: -50, scale: 0.5 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, x: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 1.5 }}
            transition={prefersReducedMotion ? {} : { type: "spring", stiffness: 200, damping: 20 }}
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

      <BattleHUD 
        userScore={userScore} 
        opponentScore={opponentScore} 
        timeLeft={timeLeft} 
        isLowTime={isLowTime} 
        opponent={opponent} 
        userAvatar={userAvatar} 
        onForfeit={() => setShowForfeitConfirm(true)} 
        prefersReducedMotion={prefersReducedMotion} 
      />

      <div className="h-1 flex w-full bg-white/5 shrink-0">
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

      <ScoreDeltaBar userScore={userScore} opponentScore={opponentScore} />

      <ProgressDots currentQuestion={currentQuestion} totalQuestions={questions.length} />

      <OpponentStatusStrip 
        opponentName={opponent?.name || "Opponent"} 
        opponentProgress={opponentProgress} 
        currentQuestion={currentQuestion} 
        totalQuestions={questions.length} 
      />

      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        <div className="min-h-full p-4 md:p-12 flex flex-col items-center">
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
            className="w-full max-w-4xl space-y-8 md:space-y-12 my-auto"
          >
            <QuestionDisplay 
              question={currentQ} 
              currentIdx={currentQuestion} 
              totalCount={questions.length} 
              category={category} 
              prefersReducedMotion={prefersReducedMotion} 
            />

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
      </div>

      <RoundScoreboard 
        userScore={userScore} 
        opponentScore={opponentScore} 
        currentQuestion={currentQuestion} 
        totalQuestions={questions.length} 
        opponentName={opponent?.name || "Opponent"} 
      />
    </m.div>
  );
}
