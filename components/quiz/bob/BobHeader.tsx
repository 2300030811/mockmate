"use client";

import { X, Trash2, Bot } from "lucide-react";

interface BobHeaderProps {
  onClose: () => void;
  onClear: () => void;
}

export function BobHeader({ onClose, onClear }: BobHeaderProps) {
  return (
    <div className="p-3.5 sm:p-4 flex items-center justify-between border-b cursor-grab active:cursor-grabbing bg-zinc-50/80 dark:bg-[#101018] border-zinc-200 dark:border-[#1e1e2a] select-none">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-[#5e6ad2]/10 border border-[#5e6ad2]/30 flex items-center justify-center text-[#5e6ad2] dark:text-[#7f8cf8] shrink-0">
          <Bot className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="font-semibold text-xs text-zinc-900 dark:text-[#ebebef]">Bob Assistant</h3>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="Online" />
          </div>
          <p className="text-[10.5px] font-mono text-zinc-500 dark:text-[#8b8b9e]">AI Certification Copilot</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={onClear}
          className="p-1.5 rounded-md hover:bg-zinc-200/60 dark:hover:bg-[#1e1e2a] text-zinc-400 hover:text-rose-500 dark:text-[#8b8b9e] dark:hover:text-rose-400 transition-colors cursor-pointer"
          title="Clear Chat History"
          aria-label="Clear Chat History"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onClose}
          className="p-1.5 rounded-md hover:bg-zinc-200/60 dark:hover:bg-[#1e1e2a] text-zinc-400 hover:text-zinc-900 dark:text-[#8b8b9e] dark:hover:text-[#ebebef] transition-colors cursor-pointer"
          title="Close Bob"
          aria-label="Close Assistant"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

