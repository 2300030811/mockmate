"use client";

import { useState } from "react";
import { m } from "framer-motion";
import { AtsScoreResult } from "@/types/ats-score";
import { Hammer, Check, Sparkles, CornerDownRight, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface FixSuggestionsProps {
  suggestions: AtsScoreResult["fixSuggestions"];
}

export function FixSuggestions({ suggestions }: FixSuggestionsProps) {
  const [completed, setCompleted] = useState<number[]>([]);

  const toggle = (idx: number) => {
    setCompleted((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const copyToClipboard = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    toast.success("Improved bullet point copied to clipboard");
  };

  if (!suggestions || suggestions.length === 0) return null;

  return (
    <m.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#14141e] border border-zinc-200/80 dark:border-[#1e1e2a] rounded-2xl p-6 sm:p-8 shadow-subtle"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-zinc-100 dark:border-[#1e1e2a]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 flex items-center justify-center text-[#5e6ad2] shrink-0">
            <Hammer size={18} />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-[#ebebef]">
              High-Impact Resume Improvements
            </h3>
            <p className="text-xs text-zinc-500 dark:text-[#8b8b9e]">
              Click any recommendation as you update your resume to track ATS score elevation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <span className="text-xs font-mono font-semibold text-zinc-500 dark:text-[#8b8b9e]">
            {completed.length} / {suggestions.length} Completed
          </span>
          <div className="w-24 sm:w-28 h-2 bg-zinc-100 dark:bg-[#0d0d12] border border-zinc-200/60 dark:border-[#1e1e2a] rounded-full overflow-hidden">
            <m.div
              initial={{ width: 0 }}
              animate={{ width: `${(completed.length / suggestions.length) * 100}%` }}
              className="h-full bg-[#5e6ad2]"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {suggestions.map((s, i) => {
          const isDone = completed.includes(i);
          return (
            <button
              key={i}
              type="button"
              onClick={() => toggle(i)}
              className={cn(
                "group relative flex flex-col p-5 rounded-xl border text-left w-full transition-all cursor-pointer",
                isDone
                  ? "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/30"
                  : "bg-zinc-50/60 dark:bg-[#0d0d12] border-zinc-200/80 dark:border-[#1e1e2a] hover:border-[#5e6ad2]/50 hover:bg-white dark:hover:bg-[#12121a] shadow-subtle"
              )}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider border",
                      s.priority === "High"
                        ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                        : s.priority === "Medium"
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                        : "bg-[#5e6ad2]/10 text-[#5e6ad2] border-[#5e6ad2]/20"
                    )}
                  >
                    {s.priority} Priority
                  </span>
                  <span className="text-[10px] font-mono uppercase text-zinc-400">
                    {s.category}
                  </span>
                </div>

                <div
                  className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center transition-all shrink-0",
                    isDone
                      ? "bg-emerald-500 text-white"
                      : "bg-zinc-200/70 dark:bg-[#1e1e2a] text-zinc-400 group-hover:bg-[#5e6ad2]/10 group-hover:text-[#5e6ad2]"
                  )}
                >
                  {isDone ? <Check size={14} strokeWidth={2.5} /> : <Sparkles size={13} />}
                </div>
              </div>

              <p
                className={cn(
                  "text-xs sm:text-sm font-medium leading-relaxed mb-4",
                  isDone
                    ? "text-zinc-400 dark:text-zinc-500 line-through opacity-70"
                    : "text-zinc-800 dark:text-[#c4c4d4]"
                )}
              >
                {s.suggestion}
              </p>

              {(s.before || s.after) && !isDone && (
                <div className="space-y-2 mt-auto w-full pt-1">
                  {s.before && (
                    <div className="p-2.5 bg-rose-500/5 border border-rose-500/15 rounded-lg">
                      <div className="text-[9px] font-mono font-bold uppercase text-rose-500/80 mb-0.5">
                        Current Phrasing
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 italic line-through decoration-rose-500/40">
                        {s.before}
                      </div>
                    </div>
                  )}

                  {s.after && (
                    <div className="group/after relative p-2.5 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                      <div className="flex justify-between items-start mb-0.5">
                        <div className="text-[9px] font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400">
                          Optimized Alternative
                        </div>
                        <button
                          type="button"
                          onClick={(e) => copyToClipboard(e, s.after!)}
                          className="p-1 bg-white dark:bg-[#1e1e2a] hover:bg-emerald-50 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-zinc-200/80 dark:border-[#2a2a3c] rounded-md transition-all cursor-pointer"
                          title="Copy phrasing to clipboard"
                        >
                          <Copy size={11} />
                        </button>
                      </div>
                      <div className="text-xs text-zinc-800 dark:text-[#ebebef] font-medium flex items-start gap-1.5 pr-6">
                        <CornerDownRight size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>{s.after}</span>
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
