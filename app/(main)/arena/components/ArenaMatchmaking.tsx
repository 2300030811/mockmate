"use client";

import React from "react";
import { m } from "framer-motion";
import { Globe, Swords, Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";

interface ArenaMatchmakingProps {
  matchLog: string[];
  onCancel?: () => void;
}

export const ArenaMatchmaking = React.memo(function ArenaMatchmaking({ matchLog, onCancel }: ArenaMatchmakingProps) {
  const logRef = useRef<HTMLDivElement>(null);
  const progress = (matchLog.length / 6) * 100;

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [matchLog]);

  return (
    <m.div 
      key="searching"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex-1 flex flex-col items-center justify-center p-6 relative z-10"
      aria-label="Finding opponent"
      role="status"
    >
      {/* Radar Pulse Animation */}
      <div className="relative mb-8 flex items-center justify-center" aria-hidden="true">
        <div className="w-24 h-24 rounded-full border-2 border-[#5e6ad2]/20 border-t-[#5e6ad2] animate-spin" />
        <div className="w-32 h-32 rounded-full border border-[#5e6ad2]/20 absolute animate-ping [animation-duration:2.5s]" />
        <div className="absolute inset-0 flex items-center justify-center text-[#5e6ad2]">
          <Swords size={28} className="animate-pulse" />
        </div>
      </div>
      
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono tracking-wide uppercase bg-[#5e6ad2]/10 text-[#5e6ad2] border border-[#5e6ad2]/20 mb-3">
        <span className="w-1.5 h-1.5 rounded-full bg-[#5e6ad2] animate-pulse" />
        MATCHMAKING IN PROGRESS
      </div>

      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-[#ebebef] mb-1">
        Searching for Opponent
      </h2>
      <p className="text-xs sm:text-sm text-zinc-500 dark:text-[#8b8b9e] font-mono mb-8">
        Scanning active players within your Elo rating bracket...
      </p>
      
      <div className="w-full max-w-md space-y-4">
        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-zinc-200 dark:bg-[#181824] rounded-full overflow-hidden" aria-label={`Matchmaking progress: ${Math.min(progress, 100).toFixed(0)}%`}>
          <m.div 
            className="h-full bg-[#5e6ad2] rounded-full transition-all duration-300"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        {/* Console Log */}
        <div className="h-32 bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] rounded-xl p-3.5 font-mono text-xs text-zinc-700 dark:text-zinc-300 overflow-hidden flex flex-col shadow-subtle" aria-live="polite" aria-label="Matchmaking log">
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1" ref={logRef}>
            {matchLog.map((log, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px]">
                <span className="text-[#5e6ad2]">›</span>
                <span className="text-zinc-600 dark:text-[#8b8b9e]">{log}</span>
              </div>
            ))}
          </div>
        </div>

        {onCancel && (
          <div className="text-center pt-2">
            <button
              onClick={onCancel}
              className="px-5 py-2 border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#181824] hover:bg-zinc-100 dark:hover:bg-[#222232] text-zinc-600 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-white rounded-lg text-xs font-semibold transition-all shadow-subtle cursor-pointer"
              aria-label="Cancel matchmaking"
            >
              Cancel Matchmaking
            </button>
          </div>
        )}
      </div>
    </m.div>
  );
});
