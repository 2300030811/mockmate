"use client";

import React from "react";
import { m } from "framer-motion";
import { Zap, Target, TrendingUp, Award } from "lucide-react";
import { BattleResult } from "../types";
import { useEffect, useRef, useMemo } from "react";
import { saveQuizResult } from "@/app/actions/results";
import { calculateArenaXP, calculateEloChange } from "@/lib/scoring";

interface ArenaResultsProps {
  userScore: number;
  opponentScore: number;
  battleResults: BattleResult[];
  category: string;
  onLobby: () => void;
  onRematch: () => void;
}

export const ArenaResults = React.memo(function ArenaResults({
  userScore,
  opponentScore,
  battleResults,
  category,
  onLobby,
  onRematch
}: ArenaResultsProps) {
  const displayCategory = category.replace('arena_', '').toUpperCase();
  const hasSaved = useRef(false);
  
  useEffect(() => {
    // Persist results on mount
    const persistResults = async () => {
      if (hasSaved.current) return;
      hasSaved.current = true;

      const sessionId = crypto.randomUUID();
      const userAnswers: Record<string, any> = {};
      
      // Arena results don't have IDs in the same way, but let's mock the structure saveQuizResult expects
      // if possible, or we might need to adjust saveQuizResult to handle arena specifically if it's different.
      // For now, we'll try to follow the standard format.
      battleResults.forEach((res, idx) => {
        userAnswers[idx] = res.userAns;
      });

      const winStatus = userScore > opponentScore ? 'win' : userScore === opponentScore ? 'tie' : 'loss';

      await saveQuizResult({
        sessionId,
        category: `arena:${winStatus}:${category}`, // Encode win status in category
        userAnswers,
        totalQuestions: battleResults.length
      });
    };

    persistResults();
  }, [battleResults, category, userScore, opponentScore]);

  const { totalXp, totalCredits, eloChange, actualAccuracy } = useMemo(() => {
    const isWin = userScore > opponentScore;
    const isDraw = userScore === opponentScore;
    const winStatus: "win" | "loss" | "tie" = isWin ? "win" : isDraw ? "tie" : "loss";

    const correctCount = battleResults.filter(r => r.correct).length;
    const accuracy = correctCount / (battleResults.length || 1);

    const xp = calculateArenaXP(correctCount, accuracy, winStatus);
    const elo = calculateEloChange(userScore, opponentScore, winStatus);

    let credits = 5;
    if (isWin) credits += 25;
    if (isDraw) credits += 10;
    credits += correctCount * 10;

    return { totalXp: xp, totalCredits: credits, eloChange: elo, actualAccuracy: accuracy };
  }, [userScore, opponentScore, battleResults]);

  return (
    <m.div 
      key="results"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex-1 flex flex-col items-center justify-start p-6 pt-24 relative z-10 overflow-y-auto custom-scrollbar"
    >
       <div className="w-40 h-40 rounded-full bg-gray-900 flex items-center justify-center text-7xl shadow-2xl relative">
          {userScore >= opponentScore ? "🏆" : "💀"}
       </div>

        <div aria-live="assertive" aria-atomic="true" className="text-center">
          <h2 className="text-5xl md:text-7xl font-black mb-2 italic tracking-tighter">
            {userScore > opponentScore ? "VICTORY" : userScore === opponentScore ? "DRAW" : "DEFEAT"}
          </h2>
        </div>
        
        {actualAccuracy === 1 && (
           <m.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="mt-2 text-white bg-gradient-to-r from-yellow-500 to-orange-500 px-4 py-1 rounded-full font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(234,179,8,0.5)] border border-yellow-300/50"
           >
              Perfect Combat ✨
           </m.div>
        )}
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 w-full max-w-5xl my-12">
           {[
             { label: "XP Gain", val: `+${totalXp}`, color: "text-emerald-400", icon: Zap },
             { label: "Accuracy", val: `${Math.round(actualAccuracy * 100)}%`, color: "text-blue-400", icon: Target },
             { label: "Rank Change", val: eloChange > 0 ? `+${eloChange}` : `${eloChange}`, color: eloChange >= 0 ? "text-indigo-400" : "text-red-400", icon: TrendingUp },
             { label: "Credits", val: `+${totalCredits}`, color: "text-amber-400", icon: Award }
           ].map((s, i) => (
             <div key={i} className="bg-gray-900/60 border border-white/5 p-4 md:p-6 rounded-2xl md:rounded-[2rem] text-center group hover:border-white/20 transition-all" aria-label={`${s.label}: ${s.val}`}>
                <div className={`w-10 h-10 md:w-12 md:h-12 bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                   <s.icon className={s.color} size={20} aria-hidden="true" />
                </div>
                <div className="text-xs text-gray-400 font-bold uppercase mb-1 tracking-widest">{s.label}</div>
                <div className={`text-xl md:text-3xl font-black ${s.color}`}>{s.val}</div>
             </div>
           ))}
        </div>
 
        <div className="w-full max-w-4xl bg-white/5 border border-white/10 rounded-[2.5rem] p-6 md:p-8 mb-16">
           <h3 className="text-sm font-black uppercase tracking-widest text-indigo-400 mb-8">Battle Report</h3>
           <div className="space-y-4">
             {battleResults.map((r, i) => (
               <div key={i} className="space-y-3 p-5 rounded-2xl bg-black/40 border border-white/5">
                 <div className="flex gap-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${r.correct ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                      {r.correct ? "✓" : "✗"}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white/90">{r.q}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Your answer: <span className={r.correct ? "text-emerald-400" : "text-red-400"}>{r.userAns}</span>
                      </p>
                      {!r.correct && r.correctAns && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          Correct answer: <span className="text-emerald-400">{r.correctAns}</span>
                        </p>
                      )}
                    </div>
                 </div>
                 {r.tip && (
                   <div className="pl-12">
                     <div className="p-3 bg-white/5 rounded-xl text-[10px] md:text-xs text-gray-400 border border-white/5 italic">
                       {r.tip}
                     </div>
                   </div>
                 )}
               </div>
             ))}
           </div>
        </div>

       <div className="flex flex-col md:flex-row gap-4 w-full max-w-md pb-20">
          <button 
            onClick={onLobby}
            className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase hover:bg-gray-800 transition-colors active:scale-95"
            aria-label="Return to lobby"
          >
             Lobby
          </button>
          <button 
            onClick={onRematch}
            className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase hover:bg-red-700 transition-colors active:scale-95"
            aria-label="Play another match"
          >
             Rematch
          </button>
       </div>
    </m.div>
  );
});
