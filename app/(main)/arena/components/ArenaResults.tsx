"use client";

import React from "react";
import { m } from "framer-motion";
import {
  Trophy,
  Swords,
  Scale,
  Zap,
  Target,
  TrendingUp,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Home,
  FileText
} from "lucide-react";
import { BattleResult, ArenaQuestion } from "../types";
import { useEffect, useRef, useMemo } from "react";
import { saveQuizResult } from "@/app/actions/results";
import { calculateArenaXP, calculateEloChange } from "@/lib/scoring";
import { parseArenaBaseCategory } from "@/lib/arena-category";

interface ArenaResultsProps {
  userScore: number;
  opponentScore: number;
  battleResults: BattleResult[];
  allQuestions?: ArenaQuestion[];
  category: string;
  battleId: string;
  onLobby: () => void;
  onRematch: () => void;
}

/**
 * Safely converts any value (string, array, object, boolean, number)
 * into a renderable string to prevent "Objects are not valid as a React child" errors.
 */
function safeString(val: unknown): string {
  if (val == null) return "";
  if (typeof val === "string") return val;
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  if (Array.isArray(val)) return val.map(safeString).join(", ");
  if (typeof val === "object") {
    try {
      return Object.entries(val as Record<string, unknown>)
        .map(([k, v]) => (v === true ? k : v === false ? `Not ${k}` : `${k}: ${safeString(v)}`))
        .join(" • ");
    } catch {
      return JSON.stringify(val);
    }
  }
  return String(val);
}

export const ArenaResults = React.memo(function ArenaResults({
  userScore,
  opponentScore,
  battleResults,
  allQuestions,
  category,
  battleId,
  onLobby,
  onRematch
}: ArenaResultsProps) {
  const displayCategory = parseArenaBaseCategory(category).toUpperCase();
  const hasSaved = useRef<string | null>(null);

  const totalQuestionsCount = (allQuestions && allQuestions.length > 0) 
    ? allQuestions.length 
    : (battleResults.length || 1);

  useEffect(() => {
    // Persist results on mount
    const persistResults = async () => {
      if (hasSaved.current === battleId) return;
      hasSaved.current = battleId;

      const userAnswers: Record<string, any> = {};
      
      battleResults.forEach((res) => {
        userAnswers[res.questionId] = safeString(res.userAns);
      });

      const winStatus = userScore > opponentScore ? 'win' : userScore === opponentScore ? 'tie' : 'loss';

      await saveQuizResult({
        sessionId: battleId,
        category,
        userAnswers,
        totalQuestions: totalQuestionsCount,
        arenaStatus: winStatus,
        arenaTotalQuestions: totalQuestionsCount,
        arenaUserScore: userScore,
        arenaOpponentScore: opponentScore
      });
    };

    if (battleId) persistResults();
  }, [battleResults, category, userScore, opponentScore, battleId, totalQuestionsCount]);

  const { totalXp, totalCredits, eloChange, actualAccuracy } = useMemo(() => {
    const isWin = userScore > opponentScore;
    const isDraw = userScore === opponentScore;
    const winStatus: "win" | "loss" | "tie" = isWin ? "win" : isDraw ? "tie" : "loss";

    const correctCount = battleResults.filter(r => r.correct).length;
    const accuracy = totalQuestionsCount > 0 ? correctCount / totalQuestionsCount : 0;

    const xp = calculateArenaXP(correctCount, accuracy, winStatus);
    const elo = calculateEloChange(userScore, opponentScore, winStatus);

    let credits = 5;
    if (isWin) credits += 25;
    if (isDraw) credits += 10;
    credits += correctCount * 10;

    return { totalXp: xp, totalCredits: credits, eloChange: elo, actualAccuracy: accuracy };
  }, [userScore, opponentScore, battleResults, totalQuestionsCount]);

  const reviewItems = useMemo(() => {
    if (allQuestions && allQuestions.length > 0) {
      return allQuestions.map((q, idx) => {
        const found = battleResults.find(r => r.questionId === String(q.id) || r.q === q.q);
        if (found) {
          return {
            id: String(found.questionId || idx),
            q: safeString(found.q),
            userAns: safeString(found.userAns),
            correctAns: safeString(found.correctAns),
            correct: Boolean(found.correct),
            tip: found.tip || q.tip ? safeString(found.tip || q.tip) : undefined,
            status: found.correct ? 'correct' : 'wrong'
          };
        }
        return {
          id: String(q.id || idx),
          q: safeString(q.q),
          userAns: 'Unanswered (time expired or forfeited)',
          correctAns: safeString(q.a),
          correct: false,
          tip: q.tip ? safeString(q.tip) : undefined,
          status: 'unanswered'
        };
      });
    }

    return battleResults.map((r, idx) => ({
      id: String(r.questionId || idx),
      q: safeString(r.q),
      userAns: safeString(r.userAns),
      correctAns: safeString(r.correctAns),
      correct: Boolean(r.correct),
      tip: r.tip ? safeString(r.tip) : undefined,
      status: r.correct ? 'correct' : 'wrong'
    }));
  }, [battleResults, allQuestions]);

  const isWin = userScore > opponentScore;
  const isDraw = userScore === opponentScore;

  const ResultIcon = isWin ? Trophy : isDraw ? Scale : Swords;

  return (
    <m.div 
      key="results"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex-1 flex flex-col items-center justify-start p-4 sm:p-8 py-8 relative z-10 overflow-y-auto custom-scrollbar max-w-5xl mx-auto w-full"
    >
      {/* Icon Badge: Crossed Swords for Defeat, Trophy for Victory, Scale for Draw */}
      <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center shadow-subtle mb-3.5 border transition-all ${
        isWin
          ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-500 shadow-[0_0_24px_rgba(16,185,129,0.18)]"
          : isDraw
          ? "bg-amber-500/10 border-amber-500/25 text-amber-500 shadow-[0_0_24px_rgba(245,158,11,0.18)]"
          : "bg-rose-500/10 border-rose-500/25 text-rose-500 shadow-[0_0_24px_rgba(244,63,94,0.18)]"
      }`}>
        <ResultIcon className="w-8 h-8 sm:w-10 sm:h-10 stroke-[2.2]" />
      </div>

      {/* Title & Combat Score Summary */}
      <div className="text-center mb-6">
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1.5 block">
          COMBAT ENGAGEMENT // {displayCategory} SECTOR
        </span>
        <h2 className={`text-4xl sm:text-5xl font-black tracking-tight mb-2 ${
          isWin ? "text-emerald-500" : isDraw ? "text-amber-500" : "text-rose-500"
        }`}>
          {isWin ? "Victory" : isDraw ? "Match Draw" : "Defeat"}
        </h2>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-[#8b8b9e]">
          Score: <span className="font-bold text-zinc-900 dark:text-[#ebebef]">{userScore} pts</span> vs <span className="font-bold text-zinc-900 dark:text-[#ebebef]">{opponentScore} pts</span> • <span className="font-semibold text-zinc-800 dark:text-zinc-200">{Math.round(actualAccuracy * 100)}% accuracy</span>
        </p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full mb-6">
        {[
          { label: "XP Gain", val: `+${totalXp}`, color: "text-emerald-500", icon: Zap },
          { label: "Accuracy", val: `${Math.round(actualAccuracy * 100)}%`, color: "text-[#5e6ad2]", icon: Target },
          { label: "Elo Change", val: eloChange > 0 ? `+${eloChange}` : `${eloChange}`, color: eloChange >= 0 ? "text-emerald-500" : "text-rose-500", icon: TrendingUp },
          { label: "Credits", val: `+${totalCredits}`, color: "text-amber-500", icon: Award }
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] p-4 sm:p-4.5 rounded-xl text-center shadow-subtle">
            <div className="flex items-center justify-center gap-1.5 text-zinc-400 dark:text-zinc-500 text-xs font-mono uppercase tracking-wider mb-1.5">
              <s.icon className={s.color} size={14} />
              <span>{s.label}</span>
            </div>
            <div className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${s.color}`}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Quick Action Bar (Accessible without having to scroll down) */}
      <div className="flex items-center justify-center gap-3 w-full max-w-md mb-8">
        <button 
          onClick={onLobby}
          className="flex-1 py-3 px-4 border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] hover:bg-zinc-100 dark:hover:bg-[#181824] text-zinc-800 dark:text-zinc-200 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-subtle cursor-pointer"
          aria-label="Return to lobby"
        >
          <Home size={16} />
          <span>Return to Lobby</span>
        </button>
        <button 
          onClick={onRematch}
          className="flex-1 py-3 px-4 bg-[#5e6ad2] hover:bg-[#4f5ac4] text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-subtle cursor-pointer active:scale-95"
          aria-label="Play another match"
        >
          <RotateCcw size={16} />
          <span>Play Again</span>
        </button>
      </div>

      {/* Battle Questions Review Breakdown */}
      <div className="w-full bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] rounded-2xl p-5 sm:p-6 mb-8 shadow-subtle">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-100 dark:border-[#1e1e2a]">
          <div className="flex items-center gap-2.5">
            <FileText size={18} className="text-[#5e6ad2]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-[#ebebef]">
              Question Review Breakdown
            </h3>
          </div>
          <span className="text-xs font-mono text-zinc-400 font-bold">{reviewItems.length} QUESTIONS</span>
        </div>

        {reviewItems.length === 0 ? (
          <div className="p-8 text-center text-zinc-400 text-sm">
            No questions recorded for this session.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {reviewItems.map((r, i) => {
              const isLastSingle = i === reviewItems.length - 1 && reviewItems.length % 2 !== 0;

              return (
                <div 
                  key={i} 
                  className={`p-4 sm:p-5 rounded-xl bg-zinc-50 dark:bg-[#0d0d12] border border-zinc-200 dark:border-[#1e1e2a] space-y-3 flex flex-col justify-between ${
                    isLastSingle ? "lg:col-span-2" : ""
                  }`}
                >
                  <div className="space-y-2">
                    {/* Header badge & status */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                          r.status === 'correct'
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : r.status === 'wrong'
                            ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        }`}>
                          {r.status === 'correct' ? (
                            <CheckCircle2 size={15} />
                          ) : r.status === 'wrong' ? (
                            <XCircle size={15} />
                          ) : (
                            <Clock size={15} />
                          )}
                        </div>
                        <span className="text-xs font-mono font-bold text-zinc-400 dark:text-zinc-500">QUESTION {i + 1}</span>
                      </div>
                      
                      <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold uppercase tracking-wider ${
                        r.status === 'correct'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : r.status === 'wrong'
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      }`}>
                        {r.status === 'correct' ? 'Correct' : r.status === 'wrong' ? 'Incorrect' : 'Unanswered'}
                      </span>
                    </div>

                    {/* Question prompt (prominent, readable font size) */}
                    <p className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-[#ebebef] leading-relaxed pt-1">
                      {safeString(r.q)}
                    </p>

                    {/* Answers line */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1 text-xs sm:text-sm font-mono">
                      <span className="text-zinc-500 dark:text-[#8b8b9e]">
                        Your answer:{" "}
                        <span className={
                          r.status === 'correct' 
                            ? "text-emerald-600 dark:text-emerald-400 font-bold" 
                            : r.status === 'wrong'
                            ? "text-rose-600 dark:text-rose-400 font-bold"
                            : "text-zinc-400 italic"
                        }>
                          {safeString(r.userAns)}
                        </span>
                      </span>
                      {r.correctAns && (
                        <span className="text-zinc-500 dark:text-[#8b8b9e]">
                          Correct:{" "}
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                            {safeString(r.correctAns)}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Explanation card */}
                  {r.tip && (
                    <div className="text-xs sm:text-sm text-zinc-600 dark:text-[#8b8b9e] bg-white dark:bg-[#14141e] p-3 sm:p-3.5 rounded-lg border border-zinc-200 dark:border-[#1e1e2a] leading-relaxed">
                      💡 <span className="font-semibold text-zinc-800 dark:text-zinc-200">Explanation:</span> {safeString(r.tip)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Action Buttons */}
      <div className="flex items-center justify-center gap-3 w-full max-w-md pb-8">
        <button 
          onClick={onLobby}
          className="flex-1 py-3 px-4 border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] hover:bg-zinc-100 dark:hover:bg-[#181824] text-zinc-800 dark:text-zinc-200 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-subtle cursor-pointer"
          aria-label="Return to lobby"
        >
          <Home size={16} />
          <span>Return to Lobby</span>
        </button>
        <button 
          onClick={onRematch}
          className="flex-1 py-3 px-4 bg-[#5e6ad2] hover:bg-[#4f5ac4] text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-subtle cursor-pointer active:scale-95"
          aria-label="Play another match"
        >
          <RotateCcw size={16} />
          <span>Play Again</span>
        </button>
      </div>
    </m.div>
  );
});
