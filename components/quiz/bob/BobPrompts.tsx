"use client";

import { Lightbulb, X, Code2 } from "lucide-react";

interface BobPromptsProps {
  onPromptClick: (prompt: string) => void;
}

export function BobPrompts({ onPromptClick }: BobPromptsProps) {
  return (
    <div className="px-3.5 py-2 flex gap-1.5 overflow-x-auto no-scrollbar border-t border-zinc-200/80 dark:border-[#1e1e2a] bg-zinc-50/80 dark:bg-[#101018]">
      <button
        onClick={() => onPromptClick("Can you explain why the correct answer is correct?")}
        className="whitespace-nowrap flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono border border-zinc-200 dark:border-[#20202e] bg-white dark:bg-[#14141e] text-zinc-600 dark:text-[#8b8b9e] hover:text-[#5e6ad2] dark:hover:text-[#ebebef] hover:border-[#5e6ad2]/40 transition-colors cursor-pointer shadow-subtle"
      >
        <Lightbulb className="w-3 h-3 text-[#5e6ad2]" /> Explain Logic
      </button>
      <button
        onClick={() => onPromptClick("Why are the other options wrong?")}
        className="whitespace-nowrap flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono border border-zinc-200 dark:border-[#20202e] bg-white dark:bg-[#14141e] text-zinc-600 dark:text-[#8b8b9e] hover:text-rose-500 dark:hover:text-rose-400 hover:border-rose-500/30 transition-colors cursor-pointer shadow-subtle"
      >
        <X className="w-3 h-3 text-rose-500" /> Why others wrong?
      </button>
      <button
        onClick={() => onPromptClick("Give me a similar example.")}
        className="whitespace-nowrap flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono border border-zinc-200 dark:border-[#20202e] bg-white dark:bg-[#14141e] text-zinc-600 dark:text-[#8b8b9e] hover:text-[#5e6ad2] dark:hover:text-[#ebebef] hover:border-[#5e6ad2]/40 transition-colors cursor-pointer shadow-subtle"
      >
        <Code2 className="w-3 h-3 text-[#5e6ad2]" /> Give Example
      </button>
    </div>
  );
}

