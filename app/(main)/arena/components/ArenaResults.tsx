"use client";

import { motion } from "framer-motion";
import { Zap, Target, TrendingUp, Award } from "lucide-react";
import { BattleResult } from "../types";
import { useEffect, useRef } from "react";
import { saveQuizResult } from "@/app/actions/results";
import { v4 as uuidv4 } from "uuid";

interface ArenaResultsProps {
  userScore: number;
  opponentScore: number;
  battleResults: BattleResult[];
  category: string;
  onLobby: () => void;
  onRematch: () => void;
}

export function ArenaResults({
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

      const sessionId = uuidv4();
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

  const calculateRewards = () => {
    const isWin = userScore > opponentScore;
    const isDraw = userScore === opponentScore;
    const accuracy = userScore / (battleResults.length || 1);
    
    // XP Calculation
    let xp = 50; // Participation Base
    if (isWin) xp += 150;
    if (isDraw) xp += 50;
    xp += userScore * 20; // 20 XP per correct answer
    xp += Math.round(accuracy * 100 * 2); // Accuracy bonus (up to 200 XP)

    // Credits Calculation
    let credits = 5; // Base
    if (isWin) credits += 25;
    if (isDraw) credits += 10;
    credits += userScore * 5; // 5 credits per correct answer

    // Elo Calculation (Simulated)
    let elo = 0;
    const scoreDiff = userScore - opponentScore;
    
    if (isWin) {
        elo = 25 + (scoreDiff * 2); // Win + dominance bonus
    } else if (isDraw) {
        elo = 5;
    } else {
        // Loss
        elo = -20 + userScore; // Lose less if you scored points
        if (elo > -5) elo = -5; // Minimum penalty cap
    }

    return { totalXp: xp, totalCredits: credits, eloChange: elo };
  };

  const { totalXp, totalCredits, eloChange } = calculateRewards();

  // ... useEffect for saveQuizResult (using these new values if we wanted to save them, but sticking to existing pattern for now)

  return (
    <motion.div 
      key="results"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex-1 flex flex-col items-center justify-start p-6 pt-24 relative z-10 overflow-y-auto custom-scrollbar"
    >
       <div className="w-40 h-40 rounded-full bg-gray-900 flex items-center justify-center text-7xl shadow-2xl relative">
          {userScore >= opponentScore ? "🏆" : "💀"}
       </div>

        <h2 className="text-5xl md:text-7xl font-black mb-2 italic tracking-tighter">
          {userScore > opponentScore ? "VICTORY" : userScore === opponentScore ? "DRAW" : "DEFEAT"}
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 w-full max-w-5xl my-12">
           {[
             { label: "XP Gain", val: `+${totalXp}`, color: "text-emerald-400", icon: Zap },
             { label: "Accuracy", val: `${Math.round((userScore / (battleResults.length || 1)) * 100)}%`, color: "text-blue-400", icon: Target },
             { label: "Rank Change", val: eloChange > 0 ? `+${eloChange}` : `${eloChange}`, color: eloChange >= 0 ? "text-indigo-400" : "text-red-400", icon: TrendingUp },
             { label: "Credits", val: `+${totalCredits}`, color: "text-amber-400", icon: Award }
           ].map((s, i) => (
             <div key={i} className="bg-gray-900/60 border border-white/5 p-4 md:p-6 rounded-2xl md:rounded-[2rem] text-center group hover:border-white/20 transition-all">
                <div className={`w-10 h-10 md:w-12 md:h-12 bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                   <s.icon className={s.color} size={20} />
                </div>
                <div className="text-[9px] text-gray-500 font-bold uppercase mb-1 tracking-widest">{s.label}</div>
                <div className={`text-xl md:text-3xl font-black ${s.color}`}>{s.val}</div>
             </div>
           ))}
        </div>
 
        <div className="w-full max-w-4xl bg-white/5 border border-white/10 rounded-[2.5rem] p-6 md:p-8 mb-16">
           <h3 className="text-sm font-black uppercase tracking-widest text-indigo-400 mb-8">Performance Review</h3>
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
            className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase"
          >
             Lobby
          </button>
          <button 
            onClick={onRematch}
            className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase"
          >
             Rematch
          </button>
       </div>
    </motion.div>
  );
}
