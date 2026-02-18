"use client";

import { motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";

interface ScoreCardProps {
  score: number;
  isSpeaking: boolean;
  onSpeak: () => void;
}

export const ScoreCard = ({ score, isSpeaking, onSpeak }: ScoreCardProps) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="lg:col-span-4 bg-gradient-to-br from-orange-600 via-red-600 to-red-700 rounded-[3rem] p-8 flex flex-col items-center justify-center text-center shadow-2xl relative group overflow-hidden"
  >
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] opacity-30 animate-pulse" />
    <span className="relative z-10 text-[10px] font-black uppercase tracking-[0.3em] text-orange-100/70 mb-2">Hireability Score</span>
    <div className="relative z-10 text-8xl font-black text-white mb-6 tabular-nums">{score}</div>
    
    <div className="relative z-10 w-full px-4 mb-6">
      <div className="w-full h-3 bg-black/30 rounded-full p-1 shadow-inner">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ delay: 0.5, duration: 1.5, ease: "easeOut" }}
          className="h-full bg-white rounded-full shadow-[0_0_20px_white]"
        />
      </div>
    </div>
    <p className="relative z-10 text-[10px] font-black text-orange-100 uppercase italic tracking-widest bg-black/10 px-4 py-1.5 rounded-full mb-4">
      Judge Level: {score > 80 ? 'Elite' : score > 50 ? 'Average Joe' : 'Unemployed Behavior'}
    </p>
    <button 
      onClick={onSpeak}
      className={`relative z-10 flex items-center gap-2 px-6 py-2 rounded-full transition-all text-xs font-bold ${isSpeaking ? 'bg-white text-orange-600' : 'bg-black/20 text-white hover:bg-black/40'}`}
    >
      {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
      {isSpeaking ? "STOP ROASTING" : "LISTEN TO ROAST"}
    </button>
  </motion.div>
);
