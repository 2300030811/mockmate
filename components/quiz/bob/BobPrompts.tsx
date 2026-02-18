"use client";

import { Lightbulb, X, Code2 } from "lucide-react";

interface BobPromptsProps {
  isDark: boolean;
  onPromptClick: (prompt: string) => void;
}

export function BobPrompts({ isDark, onPromptClick }: BobPromptsProps) {
  return (
    <div className={`px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar border-t ${
      isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-100 bg-gray-50'
    }`}>
      <button 
        onClick={() => onPromptClick("Can you explain why the correct answer is correct?")} 
        className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors"
      >
        <Lightbulb className="w-3 h-3" /> Explain Logic
      </button>
      <button 
        onClick={() => onPromptClick("Why are the other options wrong?")} 
        className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50 transition-colors"
      >
        <X className="w-3 h-3" /> Why others wrong?
      </button>
      <button 
        onClick={() => onPromptClick("Give me a similar example.")} 
        className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50 transition-colors"
      >
        <Code2 className="w-3 h-3" /> Give Example
      </button>
    </div>
  );
}
