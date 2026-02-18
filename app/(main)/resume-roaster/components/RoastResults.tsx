"use client";

import { motion } from "framer-motion";
import { Flame, Volume2, VolumeX, AlertCircle, Trophy, Target, Hammer, Check, Copy, RotateCcw, ArrowRight, Trash2, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { ScoreCard } from "./ScoreCard";
import { RoastData } from "../types";

interface RoastResultsProps {
  roastData: RoastData;
  selectedTone: string;
  isSpeaking: boolean;
  onSpeak: () => void;
  completedSuggestions: number[];
  onToggleSuggestion: (idx: number) => void;
  onCopy: () => void;
  copied: boolean;
  onReset: () => void;
  onClearHistory: () => void;
}

export function RoastResults({
  roastData,
  selectedTone,
  isSpeaking,
  onSpeak,
  completedSuggestions,
  onToggleSuggestion,
  onCopy,
  copied,
  onReset,
  onClearHistory
}: RoastResultsProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-10 pb-20"
    >
      {/* Top Score & Verdict Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         <motion.div 
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           className="lg:col-span-8 bg-gray-900/80 border border-gray-800 rounded-[3rem] p-10 backdrop-blur-3xl relative overflow-hidden group hover:border-orange-500/20 transition-colors flex flex-col justify-between"
         >
            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
              <Flame size={200} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-orange-500 flex items-center gap-2">
                  <Flame size={14} className="animate-pulse" /> The Brutal Verdict ({selectedTone})
                </h2>
                <button 
                  onClick={onSpeak}
                  className={`p-2 rounded-xl transition-all ${isSpeaking ? 'bg-orange-500 text-white animate-pulse' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
                  title={isSpeaking ? "Stop Speaking" : "Listen to Roast"}
                >
                  {isSpeaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
              </div>
              <div className="text-3xl md:text-4xl font-black italic text-white leading-[1.3] drop-shadow-sm mb-12">
                &quot;{roastData.brutalRoast}&quot;
              </div>
            </div>

            {/* Skill Breakdown Chart */}
            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-white/5">
              {Object.entries(roastData.skillBreakdown || {}).map(([skill, score]: [string, any], idx) => (
                <div key={skill} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider whitespace-nowrap">{skill}</span>
                    <span className="text-sm font-black text-white">{score}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${score}%` }}
                      transition={{ delay: 0.8 + (idx * 0.1) }}
                      className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
         </motion.div>

         <ScoreCard 
           score={roastData.professionalScore} 
           isSpeaking={isSpeaking} 
           onSpeak={onSpeak} 
         />
      </div>

      {/* Analysis Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {/* Flaws Card */}
         <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="bg-gray-900/50 border border-red-500/10 rounded-[2.5rem] p-8 hover:border-red-500/30 transition-all flex flex-col"
         >
            <h3 className="text-xl font-bold text-red-400 mb-8 flex items-center gap-3">
              <AlertCircle size={24} className="text-red-500" /> Critical Flaws
            </h3>
            <ul className="space-y-6 flex-1">
              {roastData.criticalFlaws.map((flaw: string, i: number) => (
                <li key={i} className="flex gap-4 group/item">
                  <span className="text-red-500/50 shrink-0 font-black text-lg group-hover/item:text-red-500 transition-colors">{i+1}</span>
                  <p className="text-base text-gray-300 leading-relaxed font-medium">{flaw}</p>
                </li>
              ))}
            </ul>
         </motion.div>

         {/* Wins Card */}
         <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3 }}
           className="bg-gray-900/50 border border-emerald-500/10 rounded-[2.5rem] p-8 hover:border-emerald-500/30 transition-all flex flex-col"
         >
            <h3 className="text-xl font-bold text-emerald-400 mb-8 flex items-center gap-3">
              <Trophy size={24} className="text-emerald-500" /> Winning Points
            </h3>
            <ul className="space-y-6 flex-1">
              {roastData.winningPoints.map((win: string, i: number) => (
                <li key={i} className="flex gap-4 group/item">
                  <span className="text-emerald-500/50 shrink-0 font-black text-lg group-hover/item:text-emerald-500 transition-colors">{i+1}</span>
                  <p className="text-base text-gray-300 leading-relaxed font-medium">{win}</p>
                </li>
              ))}
            </ul>
         </motion.div>

         {/* ATS Analysis */}
         <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.4 }}
           className="bg-gray-900/50 border border-blue-500/10 rounded-[2.5rem] p-8 hover:border-blue-500/30 transition-all"
         >
            <h3 className="text-xl font-bold text-blue-400 mb-8 flex items-center gap-3">
              <Target size={24} className="text-blue-500" /> ATS Survival
            </h3>
            <div className="space-y-8">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <span className="text-[10px] font-black uppercase text-gray-500 block mb-3 tracking-[0.2em]">Suitability Check</span>
                <div className={`text-2xl font-black uppercase italic ${
                  roastData.atsAnalysis.matchRating === 'High' ? 'text-emerald-400' : 
                  roastData.atsAnalysis.matchRating === 'Medium' ? 'text-blue-400' : 'text-red-400'
                }`}>
                  {roastData.atsAnalysis.matchRating}
                </div>
              </div>
              
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase text-gray-400 block tracking-[0.2em]">Hard Skills Missing</span>
                <div className="flex flex-wrap gap-2">
                  {roastData.atsAnalysis.missingKeywords.map((tag: string, i: number) => (
                    <span key={i} className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] font-bold rounded-xl hover:bg-blue-500/20 transition-colors">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/5">
                 <span className="text-[10px] font-black uppercase text-gray-500 block mb-2 tracking-[0.2em]">Formatting Notes</span>
                 <p className="text-xs text-gray-400 leading-relaxed">{roastData.atsAnalysis.formattingIssues}</p>
              </div>
            </div>
         </motion.div>
      </div>

      {/* Suggestions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gray-900/80 border border-white/5 rounded-[3rem] p-10 backdrop-blur-3xl"
      >
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
           <h3 className="text-2xl font-black text-white flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Hammer size={24} className="text-white" />
              </div>
              Roadmap to Redemption
           </h3>
           <div className="flex items-center gap-4">
             <div className="text-xs font-bold text-gray-500 uppercase">
               {completedSuggestions.length} / {roastData.suggestions.length} Fixed
             </div>
             <button 
               onClick={onCopy}
               className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all font-bold text-sm"
             >
               {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
               {copied ? 'COPIED!' : 'COPY ROAST'}
             </button>
           </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roastData.suggestions.map((s: string, i: number) => {
              const isDone = completedSuggestions.includes(i);
              return (
                <motion.div 
                  key={i} 
                  onClick={() => onToggleSuggestion(i)}
                  whileHover={{ x: 5 }}
                  className={`flex gap-5 p-6 rounded-3xl border transition-all cursor-pointer group select-none ${
                    isDone 
                      ? 'bg-emerald-500/10 border-emerald-500/30' 
                      : 'bg-white/5 border-white/5 hover:border-indigo-500/30'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                    isDone ? 'bg-emerald-500 text-white' : 'bg-indigo-500/10 text-indigo-400 group-hover:scale-110'
                  }`}>
                    {isDone ? <Check size={24} strokeWidth={3} /> : <Sparkles size={20} />}
                  </div>
                  <p className={`text-base leading-relaxed font-medium transition-all ${
                    isDone ? 'text-gray-400 line-through opacity-50' : 'text-gray-300'
                  }`}>{s}</p>
                </motion.div>
              );
            })}
         </div>
      </motion.div>

      {/* Footer Actions */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="flex flex-col md:flex-row items-center justify-center gap-6 pt-10"
      >
         <button 
           onClick={onReset}
           className="w-full md:w-auto px-12 py-5 bg-gray-900 border border-gray-800 hover:border-white/20 text-white rounded-[2rem] font-black text-sm flex items-center justify-center gap-3 transition-all hover:scale-105"
         >
           <RotateCcw size={20} /> ROAST ANOTHER
         </button>
         <Link 
           href="/arena"
           className="w-full md:w-auto px-12 py-5 bg-white text-black hover:bg-gray-200 rounded-[2rem] font-black text-sm flex items-center justify-center gap-3 transition-all hover:scale-105 shadow-xl shadow-white/10"
         >
           GO TO INTERVIEW ARENA <ArrowRight size={20} />
         </Link>
         <button 
           onClick={onClearHistory}
           className="w-full md:w-auto px-8 py-5 text-gray-500 hover:text-red-500 rounded-[2rem] font-black text-[10px] flex items-center justify-center gap-3 transition-all uppercase tracking-widest"
         >
           <Trash2 size={16} /> Clear History
         </button>
      </motion.div>
    </motion.div>
  );
}
