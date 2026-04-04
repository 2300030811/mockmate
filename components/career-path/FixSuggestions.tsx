"use client";

import { useState } from "react";
import { m } from "framer-motion";
import { AtsScoreResult } from "@/types/ats-score";
import { Hammer, Check, Sparkles, ArrowRight, CornerDownRight, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface FixSuggestionsProps {
  suggestions: AtsScoreResult['fixSuggestions'];
}

export function FixSuggestions({ suggestions }: FixSuggestionsProps) {
  const [completed, setCompleted] = useState<number[]>([]);

  const toggle = (idx: number) => {
    setCompleted(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const copyToClipboard = (e: React.MouseEvent, text: string) => {
    e.stopPropagation(); // Prevent card toggle
    navigator.clipboard.writeText(text);
    toast.success("Improved text copied to clipboard!");
  };

  if (!suggestions || suggestions.length === 0) return null;

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-900/40 border border-gray-200 dark:border-white/5 rounded-3xl p-8 md:p-10 shadow-sm transition-colors duration-300"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Hammer size={24} className="text-white" />
          </div>
          Actionable Fix Suggestions
        </h3>
        <div className="flex items-center gap-4">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            {completed.length} / {suggestions.length} Improvements Made
          </div>
          <div className="w-32 h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
            <m.div 
              initial={{ width: 0 }}
              animate={{ width: `${(completed.length / suggestions.length) * 100}%` }}
              className="h-full bg-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {suggestions.map((s, i) => {
          const isDone = completed.includes(i);
          return (
            <button
              key={i}
              onClick={() => toggle(i)}
              className={cn(
                "group relative flex flex-col p-6 rounded-2xl border transition-all text-left w-full",
                isDone 
                  ? "bg-emerald-50/50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 shadow-sm" 
                  : "bg-gray-50 dark:bg-gray-900/40 border-gray-200 dark:border-white/5 hover:border-blue-400 dark:hover:border-blue-500/30"
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter",
                    s.priority === 'High' ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                    s.priority === 'Medium' ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" :
                    "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  )}>
                    {s.priority} Priority
                  </span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{s.category}</span>
                </div>
                <div className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center transition-all",
                  isDone ? "bg-emerald-500 text-white" : "bg-gray-200 dark:bg-white/5 text-gray-500 dark:text-gray-600 group-hover:bg-blue-500/20 group-hover:text-blue-500 dark:group-hover:text-blue-400"
                )}>
                  {isDone ? <Check size={18} strokeWidth={3} /> : <Sparkles size={16} />}
                </div>
              </div>

              <p className={cn(
                "text-base font-medium leading-relaxed mb-6",
                isDone ? "text-gray-400 dark:text-gray-500 line-through opacity-50" : "text-gray-800 dark:text-gray-200"
              )}>
                {s.suggestion}
              </p>

              {(s.before || s.after) && !isDone && (
                <div className="space-y-3 mt-auto">
                  {s.before && (
                    <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl">
                      <div className="text-[9px] font-black uppercase text-red-500/50 mb-1">Current</div>
                      <div className="text-xs text-gray-400 italic line-through decoration-red-500/30">{s.before}</div>
                    </div>
                  )}
                  {s.after && (
                    <div className="group/after relative p-3 bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10 rounded-xl overflow-hidden">
                      <div className="flex justify-between items-start mb-1">
                        <div className="text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-500/50">Improved</div>
                        <button
                          onClick={(e) => copyToClipboard(e, s.after!)}
                          className="p-1.5 bg-white dark:bg-white/5 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg transition-all opacity-0 group-hover/after:opacity-100"
                          title="Copy improved text"
                        >
                          <Copy size={12} />
                        </button>
                      </div>
                      <div className="text-xs text-gray-800 dark:text-gray-200 flex gap-2 pr-8">
                        <CornerDownRight size={14} className="text-emerald-500 shrink-0" />
                        {s.after}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </m.div>
  );
}
