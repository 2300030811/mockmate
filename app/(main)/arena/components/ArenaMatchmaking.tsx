"use client";

import React from "react";
import { m } from "framer-motion";
import { Globe } from "lucide-react";
import { useEffect, useRef } from "react";

interface ArenaMatchmakingProps {
  matchLog: string[];
  onCancel?: () => void;
}

export const ArenaMatchmaking = React.memo(function ArenaMatchmaking({ matchLog, onCancel }: ArenaMatchmakingProps) {
  const logRef = useRef<HTMLDivElement>(null);
  const progress = (matchLog.length / 6) * 100; // Mock progress based on log length

  useEffect(() => {
    if (logRef.current) {
        logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [matchLog]);

  return (
    <m.div 
      key="searching"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col items-center justify-center p-6 relative z-10"
      aria-label="Finding opponent"
      role="status"
    >
       <div className="relative mb-12 scale-150" aria-hidden="true">
          <div className="w-32 h-32 rounded-full border-[12px] border-red-500/10 border-t-red-600 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-red-500">
             <Globe className="animate-pulse" size={56} strokeWidth={1.2} />
          </div>
       </div>
       
       <h2 className="text-4xl font-black mb-1 tracking-tighter italic">INITIATING COMBAT</h2>
       <p className="text-gray-400 text-sm uppercase font-bold tracking-[0.3em] mb-12">Synchronizing with neural uplink...</p>
       
       <div className="w-full max-w-sm space-y-4">
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden" aria-label={`Matchmaking progress: ${Math.min(progress, 100).toFixed(0)}%`}>
             <m.div 
                className="h-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
             />
          </div>

          <div className="h-32 bg-black/50 border border-white/10 rounded-2xl p-4 font-mono text-xs text-emerald-500/80 overflow-hidden flex flex-col" aria-live="polite" aria-label="Matchmaking log">
             <div className="flex-1 overflow-y-auto custom-scrollbar" ref={logRef}>
                {matchLog.map((log, i) => (
                  <div key={i} className="flex gap-2 text-emerald-500/80">
                     <span>{log}</span>
                  </div>
                ))}
             </div>
          </div>

          {onCancel && (
            <button
              onClick={onCancel}
              className="mt-4 px-6 py-2 border border-white/10 text-gray-400 hover:text-white hover:border-white/30 rounded-full text-xs font-black uppercase tracking-widest transition-all"
              aria-label="Cancel matchmaking"
            >
              Cancel
            </button>
          )}
       </div>
    </m.div>
  );
});
