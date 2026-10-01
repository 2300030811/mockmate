"use client";

import { useState, useEffect, useMemo, memo } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Cpu, Zap, X } from "lucide-react";
import { ArenaQuestion, Opponent, BattleResult } from "../types";
import { getAvatarIcon } from "@/lib/icons";
import { useReducedMotion } from "@/hooks/useReducedMotion";

import { SyntaxBlock } from "@/components/quiz/SyntaxBlock";

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
    <div className="space-y-4 w-full">
      {isMulti && !hasSubmitted && (
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-xs font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Select all that apply
          </span>
        </div>
      )}

      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 px-2 md:px-0"
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
              className={`relative p-3.5 md:p-4 rounded-xl border font-medium text-xs md:text-sm transition-all text-left flex items-center justify-between group overflow-hidden shadow-subtle cursor-pointer select-none
                ${
                  isCorrect
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300"
                    : isWrong
                    ? "bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-300"
                    : isSelectedForMulti
                    ? "bg-amber-500/10 border-amber-500/40 text-amber-700 dark:text-amber-300"
                    : hasSubmitted
                    ? "bg-zinc-100 dark:bg-[#14141e] border-zinc-200 dark:border-[#1e1e2a] text-zinc-400 opacity-60"
                    : "bg-white dark:bg-[#14141e] border-zinc-200 dark:border-[#1e1e2a] hover:border-[#5e6ad2] text-zinc-800 dark:text-[#ebebef] hover:shadow-md"
                }`}
            >
              <span className="flex gap-3 md:gap-3.5 items-center flex-1">
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold flex-shrink-0 transition-colors
                    ${isCorrect
                      ? "bg-emerald-500 text-white"
                      : isWrong
                      ? "bg-rose-500 text-white"
                      : isSelectedForMulti
                      ? "bg-amber-500 text-white"
                      : "bg-zinc-100 dark:bg-[#181824] text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-[#1e1e2a]"}`}
                  aria-hidden="true"
                >
                  {isSelectedForMulti ? "✓" : String.fromCharCode(65 + i)}
                </span>
                <span className="leading-snug">{typeof opt === 'string' ? opt : String(opt)}</span>
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
            className={`px-8 py-2.5 rounded-xl font-semibold text-xs uppercase tracking-wider transition-all cursor-pointer
              ${
                multiSelected.length > 0
                  ? "bg-[#5e6ad2] hover:bg-[#4f5ac4] text-white active:scale-95 shadow-subtle"
                  : "bg-zinc-100 dark:bg-[#181824] text-zinc-400 cursor-not-allowed border border-zinc-200 dark:border-[#1e1e2a]"
              }`}
          >
            Confirm Selection ({multiSelected.length})
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
  battleResults: BattleResult[];
  userAvatar?: string;
  onForfeit?: () => void;
}

// ─── Sub-components for better performance ───

const BattleHUD = memo(function BattleHUD({
  userScore,
  opponentScore,
  timeLeft,
  isLowTime,
  opponent,
  userAvatar,
  onForfeit,
}: {
  userScore: number;
  opponentScore: number;
  timeLeft: number;
  isLowTime: boolean;
  opponent: Opponent | null;
  userAvatar?: string;
  onForfeit?: () => void;
}) {
  const UserIcon = getAvatarIcon(userAvatar);
  return (
    <div className="h-16 md:h-20 border-b border-zinc-200 dark:border-[#1e1e2a] bg-white/95 dark:bg-[#14141e]/95 backdrop-blur-md flex items-center px-4 sm:px-8 justify-between shrink-0 shadow-subtle">
      {/* User score side */}
      <div className="flex-1 flex items-center gap-3">
        <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 flex items-center justify-center text-[#5e6ad2] shadow-sm shrink-0">
          <UserIcon size={20} />
        </div>
        <div>
          <div className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-semibold">You</div>
          <div className="text-base md:text-xl font-bold tracking-tight text-zinc-900 dark:text-[#ebebef] leading-none" aria-live="polite">
            {userScore} <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500 font-normal">PTS</span>
          </div>
        </div>
      </div>

      {/* Center: Timer */}
      <div className="flex flex-col items-center justify-center shrink-0 px-2 sm:px-6">
        <div className="relative w-12 h-12 md:w-14 md:h-14 flex items-center justify-center" role="timer" aria-label={`${timeLeft} seconds remaining`}>
          <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r="23" stroke="currentColor" strokeWidth="3" fill="none" className="text-zinc-200 dark:text-zinc-800" />
            <m.circle
              cx="28" cy="28" r="23" stroke="currentColor" strokeWidth="3" fill="none"
              className={isLowTime ? "text-rose-500" : "text-[#5e6ad2]"}
              strokeLinecap="round"
              initial={{ pathLength: 1 }}
              animate={{ pathLength: Math.max(0, timeLeft / 30) }}
              transition={{ duration: 0.5, ease: "linear" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-sm md:text-base font-bold font-mono ${isLowTime ? 'text-rose-500 animate-pulse' : 'text-zinc-900 dark:text-[#ebebef]'}`}>
              {timeLeft}
            </span>
          </div>
        </div>
      </div>

      {/* Opponent score side */}
      <div className="flex-1 flex items-center justify-end gap-3">
        <div className="text-right">
          <div className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-semibold truncate max-w-[100px] sm:max-w-none">
            {opponent?.name || "Opponent"}
          </div>
          <div className="text-base md:text-xl font-bold tracking-tight text-zinc-900 dark:text-[#ebebef] leading-none" aria-live="polite">
            {opponentScore} <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500 font-normal">PTS</span>
          </div>
        </div>
        <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-gradient-to-br from-rose-500/10 to-orange-500/10 border border-rose-500/20 flex items-center justify-center text-xl shadow-sm shrink-0">
          {opponent?.avatar}
        </div>

        {onForfeit && (
          <button
            onClick={onForfeit}
            className="shrink-0 p-2 text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors border border-transparent hover:border-rose-500/20 ml-1 cursor-pointer"
            aria-label="Forfeit battle"
            title="Forfeit battle"
          >
            <X className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        )}
      </div>
    </div>
  );
});

const ScoreDeltaBar = memo(function ScoreDeltaBar({ userScore, opponentScore }: { userScore: number, opponentScore: number }) {
  const isAhead = userScore > opponentScore;
  const isTied = userScore === opponentScore;
  const delta = Math.abs(userScore - opponentScore);

  return (
    <div className="flex items-center justify-center gap-3 px-4 py-1.5 bg-zinc-50/80 dark:bg-[#14141e]/50 border-b border-zinc-200/80 dark:border-[#1e1e2a] text-[11px] font-mono">
      <span className="text-[#5e6ad2] font-semibold">{userScore} pts</span>
      <span className="text-zinc-400 uppercase tracking-widest text-[9px] font-sans">YOU</span>
      {isTied ? (
        <span className="px-2.5 py-0.5 bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-full text-[10px] font-sans font-medium">TIED</span>
      ) : (
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-sans font-semibold border ${
          isAhead
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
            : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
        }`}>
          {isAhead ? `+${delta} ahead` : `-${delta} behind`}
        </span>
      )}
      <span className="text-zinc-400 uppercase tracking-widest text-[9px] font-sans">THEM</span>
      <span className="text-rose-500 dark:text-rose-400 font-semibold">{opponentScore} pts</span>
    </div>
  );
});

const ProgressDots = memo(function ProgressDots({ currentQuestion, totalQuestions }: { currentQuestion: number, totalQuestions: number }) {
  return (
    <div className="flex items-center justify-center gap-1.5 pt-3 pb-1">
      {Array.from({ length: totalQuestions }).map((_, i) => (
        <div
          key={i}
          className={`h-1 rounded-full transition-all duration-300
            ${i < currentQuestion
              ? "w-6 bg-emerald-500"
              : i === currentQuestion
              ? "w-8 bg-[#5e6ad2]"
              : "w-6 bg-zinc-200 dark:bg-zinc-800"}`}
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
    <div className="max-w-3xl mx-auto w-full px-4 mt-2">
      <div className="flex items-center gap-2.5 px-3 py-1.5 bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] rounded-xl text-xs shadow-subtle">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse flex-shrink-0" />
        <span className="text-zinc-600 dark:text-[#8b8b9e] truncate">
          <span className="text-zinc-900 dark:text-[#ebebef] font-bold mr-1">{opponentName}</span>
          {hasAnsweredCurrent ? "has answered this question" : "is answering..."}
        </span>
        <div className="ml-auto flex gap-1 shrink-0">
          {Array.from({ length: currentQuestion }).map((_, i) => (
            <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-[#181824] border border-zinc-200 dark:border-[#1e1e2a] text-zinc-600 dark:text-zinc-400 font-mono">
              Q{i + 1} ✓
            </span>
          ))}
        </div>
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
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-100 dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] rounded-full text-xs font-mono font-semibold uppercase text-zinc-600 dark:text-[#8b8b9e] shadow-subtle">
          <Cpu size={12} className="text-[#5e6ad2]" /> QUESTION {currentIdx + 1} / {totalCount}
        </div>
        <div className="text-[11px] font-mono font-bold text-[#5e6ad2] uppercase tracking-wider">{category} Category</div>
      </div>
      <h2 className={`font-bold tracking-tight text-zinc-900 dark:text-[#ebebef] px-4 leading-tight ${question?.code ? 'text-lg md:text-2xl' : 'text-xl md:text-3xl'}`}>
        {typeof question?.q === 'string' ? question.q : String(question?.q || '')}
      </h2>

      {question?.code && (
        <m.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 8 }}
          animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          className="w-full max-w-2xl mx-auto mt-4 text-left max-h-[42vh] overflow-y-auto custom-scrollbar"
        >
          <SyntaxBlock
            code={question.code}
            language={
              category.toLowerCase().includes("python") || category.toLowerCase() === "pcap"
                ? "python"
                : category.toLowerCase().includes("java")
                ? "java"
                : category.toLowerCase().includes("sql")
                ? "sql"
                : "javascript"
            }
          />
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
  opponentName,
  battleResults
}: { 
  userScore: number, 
  opponentScore: number, 
  currentQuestion: number, 
  totalQuestions: number, 
  opponentName: string,
  battleResults: BattleResult[]
}) {
  return (
    <div className="max-w-3xl mx-auto w-full px-4 mb-3">
      <div className="bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] rounded-xl overflow-hidden shadow-subtle shrink-0">
        <div className="px-3.5 py-1.5 border-b border-zinc-100 dark:border-[#1e1e2a] text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Round Scoreboard
        </div>
        {[
          { label: "You", color: "text-[#5e6ad2]", score: userScore, isUser: true },
          { label: opponentName, color: "text-rose-500", score: opponentScore, isUser: false },
        ].map((player, pi) => (
          <div key={pi} className="flex items-center gap-3 px-3.5 py-1.5 border-b border-zinc-100 dark:border-[#1e1e2a]/50 last:border-none">
            <span className={`text-xs font-bold min-w-[70px] truncate ${player.color}`}>{player.label}</span>
            <div className="flex gap-1.5 flex-1">
              {Array.from({ length: totalQuestions }).map((_, qi) => {
                const hasResult = qi < currentQuestion;
                const isCurrent = qi === currentQuestion;
                const wonRound = player.isUser ? battleResults[qi]?.correct : !battleResults[qi]?.correct;

                return (
                  <div
                    key={qi}
                    className={`flex-1 h-5 rounded text-[10px] flex items-center justify-center font-bold font-mono transition-colors
                      ${hasResult 
                        ? (wonRound
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" 
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20")
                        : isCurrent 
                          ? "bg-[#5e6ad2]/10 text-[#5e6ad2] border border-[#5e6ad2]/30" 
                          : "bg-zinc-100 dark:bg-zinc-800/40 text-zinc-400"}`}
                  >
                    {hasResult ? (wonRound ? "✓" : "✗") : isCurrent ? `${qi + 1}` : "—"}
                  </div>
                );
              })}
            </div>
            <span className={`text-xs font-mono font-bold min-w-[45px] text-right ${player.color}`}>{player.score} pts</span>
          </div>
        ))}
      </div>
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
  battleResults,
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
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex-1 flex flex-col min-h-0 relative z-10"
    >
      <AnimatePresence>
        {combo > 1 && (
          <m.div
            initial={prefersReducedMotion ? {} : { opacity: 0, x: -30, scale: 0.8 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, x: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 1.2 }}
            transition={prefersReducedMotion ? {} : { type: "spring", stiffness: 250, damping: 20 }}
            className="absolute top-24 left-6 z-20 pointer-events-none"
          >
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-3.5 py-1.5 rounded-full font-bold shadow-lg flex items-center gap-1.5 border border-white/20">
              <Zap className="w-4 h-4 fill-white animate-pulse" />
              <span className="text-sm font-mono tracking-tight">{combo}x COMBO</span>
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
      />

      <div className="h-1 flex w-full bg-zinc-200 dark:bg-[#1e1e2a] shrink-0">
        <m.div
          className="h-full bg-[#5e6ad2]"
          animate={{ width: `${(currentQuestion / questions.length) * 100}%` }}
        />
        <div className="flex-1" />
        <m.div
          className="h-full bg-rose-500"
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
        <div className="min-h-full p-4 md:p-8 flex flex-col items-center">
          <AnimatePresence>
            {showForfeitConfirm && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <m.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                >
                  <h3 className="text-base font-bold text-zinc-900 dark:text-[#ebebef] mb-1.5">Forfeit Battle?</h3>
                  <p className="text-xs text-zinc-500 dark:text-[#8b8b9e] mb-6 leading-relaxed">
                    Are you sure you want to forfeit? You will lose this match and conclude the duel immediately.
                  </p>
                  <div className="flex gap-2.5">
                    <button
                      onClick={() => setShowForfeitConfirm(false)}
                      className="flex-1 py-2 px-3 bg-zinc-100 dark:bg-[#181824] hover:bg-zinc-200 dark:hover:bg-[#1e1e2a] text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        setShowForfeitConfirm(false);
                        onForfeit?.();
                      }}
                      className="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Forfeit
                    </button>
                  </div>
                </m.div>
              </div>
            )}
          </AnimatePresence>
          
          <m.div
            key={currentQuestion}
            initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.97 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
            transition={prefersReducedMotion ? {} : { duration: 0.25, ease: "easeOut" }}
            className="w-full max-w-3xl space-y-6 md:space-y-8 my-auto"
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
              <p className="text-center text-xs text-zinc-500 dark:text-zinc-400 mt-4 flex items-center justify-center gap-1.5">
                <span>💡 Tip: Press</span>
                <kbd className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-zinc-700 dark:text-zinc-300 font-mono text-[11px]">1</kbd>
                <span>–</span>
                <kbd className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-zinc-700 dark:text-zinc-300 font-mono text-[11px]">4</kbd>
                <span>or</span>
                <kbd className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-zinc-700 dark:text-zinc-300 font-mono text-[11px]">A</kbd>
                <span>–</span>
                <kbd className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-zinc-700 dark:text-zinc-300 font-mono text-[11px]">D</kbd>
                <span>to answer</span>
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
        battleResults={battleResults}
      />
    </m.div>
  );
}
