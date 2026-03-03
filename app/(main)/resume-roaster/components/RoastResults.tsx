"use client";

import { m } from "framer-motion";
import { Flame, Volume2, VolumeX, AlertCircle, Trophy, Target, Hammer, Check, Copy, RotateCcw, ArrowRight, Trash2, Sparkles } from "lucide-react";
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
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-10 pb-20"
    >
      {/* Top Score & Verdict Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         <m.div 
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
                  aria-label={isSpeaking ? "Stop speaking" : "Listen to roast"}
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
              {Object.entries(roastData.skillBreakdown || {}).map(([skill, score]: [string, number], idx) => (
                <div key={skill} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider whitespace-nowrap">{skill}</span>
                    <span className="text-sm font-black text-white">{score}%</span>
                  </div>
                  <div
                    className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden"
                    role="progressbar"
                    aria-valuenow={score}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${skill}: ${score}%`}
                  >
                    <m.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${score}%` }}
                      transition={{ delay: 0.8 + (idx * 0.1) }}
                      className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
         </m.div>

         <ScoreCard 
           score={roastData.professionalScore} 
           isSpeaking={isSpeaking} 
           onSpeak={onSpeak} 
         />
      </div>

      {/* Analysis Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {/* Flaws Card */}
         <m.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="bg-gray-900/50 border border-red-500/10 rounded-[2.5rem] p-8 hover:border-red-500/30 transition-all flex flex-col"
         >
            <h3 className="text-xl font-bold text-red-400 mb-8 flex items-center gap-3">
              <AlertCircle size={24} className="text-red-500" /> Critical Flaws
            </h3>
            <ul className="space-y-6 flex-1">
              {roastData.criticalFlaws.length > 0 ? (
                roastData.criticalFlaws.map((flaw: string, i: number) => (
                  <li key={i} className="flex gap-4 group/item">
                    <span className="text-red-500/50 shrink-0 font-black text-lg group-hover/item:text-red-500 transition-colors">{i+1}</span>
                    <p className="text-base text-gray-300 leading-relaxed font-medium">{flaw}</p>
                  </li>
                ))
              ) : (
                <li className="text-gray-500 italic text-sm">No critical flaws detected — impressive!</li>
              )}
            </ul>
         </m.div>

         {/* Wins Card */}
         <m.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3 }}
           className="bg-gray-900/50 border border-emerald-500/10 rounded-[2.5rem] p-8 hover:border-emerald-500/30 transition-all flex flex-col"
         >
            <h3 className="text-xl font-bold text-emerald-400 mb-8 flex items-center gap-3">
              <Trophy size={24} className="text-emerald-500" /> Winning Points
            </h3>
            <ul className="space-y-6 flex-1">
              {roastData.winningPoints.length > 0 ? (
                roastData.winningPoints.map((win: string, i: number) => (
                  <li key={i} className="flex gap-4 group/item">
                    <span className="text-emerald-500/50 shrink-0 font-black text-lg group-hover/item:text-emerald-500 transition-colors">{i+1}</span>
                    <p className="text-base text-gray-300 leading-relaxed font-medium">{win}</p>
                  </li>
                ))
              ) : (
                <li className="text-gray-500 italic text-sm">No standout strengths found — see suggestions below.</li>
              )}
            </ul>
         </m.div>

         {/* ATS Analysis */}
         <m.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.4 }}
           className="bg-gray-900/50 border border-blue-500/10 rounded-[2.5rem] p-8 hover:border-blue-500/30 transition-all"
         >
            <h3 className="text-xl font-bold text-blue-400 mb-6 flex items-center gap-3">
              <Target size={24} className="text-blue-500" /> ATS Survival
            </h3>

            {/* Disclaimer when no JD provided */}
            {!roastData.atsAnalysis.jobDescriptionProvided && (
              <div className="mb-6 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400 text-xs flex items-start gap-2">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>No job description provided — ATS score is based on general best practices only. Add a job description for accurate keyword match analysis.</span>
              </div>
            )}

            <div className="space-y-6">
              {/* ATS Score + Match Rating */}
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <span className="text-[10px] font-black uppercase text-gray-500 block mb-3 tracking-[0.2em]">ATS Score</span>
                <div className="flex items-end gap-3 mb-3">
                  <span className={`text-4xl font-black tabular-nums ${
                    roastData.atsAnalysis.atsScore >= 75 ? 'text-emerald-400' :
                    roastData.atsAnalysis.atsScore >= 45 ? 'text-blue-400' : 'text-red-400'
                  }`}>
                    {roastData.atsAnalysis.atsScore}
                  </span>
                  <span className="text-gray-500 text-sm font-bold mb-1">/100</span>
                  <span className={`ml-auto text-xs font-black uppercase px-3 py-1 rounded-lg ${
                    roastData.atsAnalysis.matchRating === 'High' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                    roastData.atsAnalysis.matchRating === 'Medium' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {roastData.atsAnalysis.matchRating}
                  </span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <m.div
                    initial={{ width: 0 }}
                    animate={{ width: `${roastData.atsAnalysis.atsScore}%` }}
                    transition={{ delay: 0.6, duration: 1 }}
                    className={`h-full rounded-full ${
                      roastData.atsAnalysis.atsScore >= 75 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' :
                      roastData.atsAnalysis.atsScore >= 45 ? 'bg-gradient-to-r from-blue-500 to-blue-400' : 'bg-gradient-to-r from-red-500 to-red-400'
                    }`}
                  />
                </div>
              </div>

              {/* Present Keywords */}
              {roastData.atsAnalysis.presentKeywords?.length > 0 && (
                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase text-gray-400 block tracking-[0.2em]">Keywords Found</span>
                  <div className="flex flex-wrap gap-2">
                    {roastData.atsAnalysis.presentKeywords.map((tag: string, i: number) => (
                      <span key={i} className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-bold rounded-xl">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Missing Hard Skills */}
              {roastData.atsAnalysis.missingHardSkills?.length > 0 && (
                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase text-gray-400 block tracking-[0.2em]">Hard Skills Missing</span>
                  <div className="flex flex-wrap gap-2">
                    {roastData.atsAnalysis.missingHardSkills.map((tag: string, i: number) => (
                      <span key={i} className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-300 text-[11px] font-bold rounded-xl">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Soft Skills */}
              {roastData.atsAnalysis.missingSoftSkills?.length > 0 && (
                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase text-gray-400 block tracking-[0.2em]">Soft Skills Missing</span>
                  <div className="flex flex-wrap gap-2">
                    {roastData.atsAnalysis.missingSoftSkills.map((tag: string, i: number) => (
                      <span key={i} className="px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-300 text-[11px] font-bold rounded-xl">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Content & Structure Issues */}
              {roastData.atsAnalysis.contentIssues?.length > 0 && (
                <div className="pt-4 border-t border-white/5">
                  <span className="text-[10px] font-black uppercase text-gray-500 block mb-3 tracking-[0.2em]">Content & Structure Issues</span>
                  <ul className="space-y-2">
                    {roastData.atsAnalysis.contentIssues.map((issue: string, i: number) => (
                      <li key={i} className="text-xs text-gray-400 leading-relaxed flex gap-2">
                        <span className="text-blue-500 shrink-0">•</span>
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* ATS Tips */}
              {roastData.atsAnalysis.atsTips?.length > 0 && (
                <div className="pt-4 border-t border-white/5">
                  <span className="text-[10px] font-black uppercase text-gray-500 block mb-3 tracking-[0.2em]">ATS Improvement Tips</span>
                  <ul className="space-y-2">
                    {roastData.atsAnalysis.atsTips.map((tip: string, i: number) => (
                      <li key={i} className="text-xs text-blue-300 leading-relaxed flex gap-2">
                        <span className="text-blue-500 shrink-0">{i + 1}.</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
         </m.div>
      </div>

      {/* Suggestions */}
      <m.div 
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
               aria-label={copied ? "Copied to clipboard" : "Copy roast to clipboard"}
               className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all font-bold text-sm"
             >
               {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
               {copied ? 'COPIED!' : 'COPY ROAST'}
             </button>
           </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roastData.suggestions.length > 0 ? (
              roastData.suggestions.map((s: string, i: number) => {
                const isDone = completedSuggestions.includes(i);
                return (
                  <button 
                    key={i}
                    onClick={() => onToggleSuggestion(i)}
                    role="checkbox"
                    aria-checked={isDone}
                    className={`flex gap-5 p-6 rounded-3xl border transition-all cursor-pointer group select-none text-left w-full ${
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
                  </button>
                );
              })
            ) : (
              <p className="text-gray-500 italic text-sm col-span-2">No suggestions generated.</p>
            )}
         </div>
      </m.div>

      {/* Footer Actions */}
      <m.div 
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
      </m.div>
    </m.div>
  );
}
