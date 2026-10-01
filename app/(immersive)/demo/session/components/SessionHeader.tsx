
import { memo } from "react";
import { ClockIcon, HomeIcon, Zap, Pause, Play } from "lucide-react";
import { UserAuthSection } from "@/components/UserAuthSection";

interface SessionHeaderProps {
  type: string;
  azureConfig: { token: string; region: string } | null;
  isAISpeaking: boolean;
  isProcessing: boolean;
  isListening: boolean;
  isUserActive: boolean;
  debugStatus: string;
  elapsedSeconds: number;
  mobileTab: 'chat' | 'code';
  setMobileTab: (tab: 'chat' | 'code') => void;
  isSummarizing: boolean;
  isPaused?: boolean;
  onPauseResume?: () => void;
  onEndSession: () => void;
  onHomeClick: () => void;
}

// Pure utility — defined once at module level
function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export const SessionHeader = memo(function SessionHeader({
  type,
  azureConfig,
  isAISpeaking,
  isProcessing,
  isListening,
  isUserActive,
  debugStatus,
  elapsedSeconds,
  mobileTab,
  setMobileTab,
  isSummarizing,
  isPaused,
  onPauseResume,
  onEndSession,
  onHomeClick
}: SessionHeaderProps) {

  return (
    <header className="h-14 px-4 sm:px-6 border-b border-zinc-200 dark:border-[#1e1e2a] bg-white/95 dark:bg-[#0d0d12]/95 backdrop-blur-md flex items-center justify-between z-20 transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={onHomeClick}
          className="flex items-center gap-2 group text-left"
          aria-label="Return to platform"
        >
          <div className="w-[22px] h-[22px] rounded-[5px] bg-[#5e6ad2] flex items-center justify-center text-[10px] font-bold text-white shadow-subtle group-hover:bg-[#4f5ac4] transition-colors">
            M
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="text-[13px] font-semibold text-zinc-900 dark:text-[#ebebef]">MockMate</span>
            <span className="px-1 py-[0.5px] rounded text-[9.5px] font-mono uppercase bg-zinc-100 dark:bg-[#181824] text-zinc-500 dark:text-[#8b8b9e] border border-zinc-200 dark:border-[#1e1e2a]">
              Studio
            </span>
          </div>
        </button>

        <div className="h-4 w-px bg-zinc-200 dark:bg-[#1e1e2a] hidden sm:block" />

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-900 dark:text-[#ebebef] capitalize flex items-center gap-1.5">
            {type.replace("-", " ")} Interview
            {azureConfig && (
              <span className="px-1.5 py-0.5 bg-[#5e6ad2]/10 text-[#5e6ad2] text-[9.5px] font-mono font-bold rounded border border-[#5e6ad2]/20 uppercase">
                Pro
              </span>
            )}
          </span>

          <div
            className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-[#181824] border border-zinc-200 dark:border-[#1e1e2a]"
            role="status"
            aria-live="polite"
          >
            <div
              className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                isAISpeaking || isProcessing
                  ? "bg-amber-400 animate-pulse"
                  : isListening && isUserActive
                  ? "bg-emerald-500 scale-125"
                  : "bg-[#5e6ad2]"
              }`}
              aria-hidden="true"
            />
            <span className="text-[10px] font-mono text-zinc-500 dark:text-[#8b8b9e]">{debugStatus}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden xl:flex items-center">
          <UserAuthSection />
          <div className="w-px h-4 bg-zinc-200 dark:bg-[#1e1e2a] mx-3" />
        </div>

        {/* Mobile Tab Toggle */}
        <div className="flex md:hidden bg-zinc-100 dark:bg-[#181824] border border-zinc-200 dark:border-[#1e1e2a] p-0.5 rounded-md">
          <button
            onClick={() => setMobileTab("chat")}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-all ${
              mobileTab === "chat"
                ? "bg-white dark:bg-[#1e1e2a] text-zinc-900 dark:text-white shadow-sm"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700"
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => setMobileTab("code")}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-all flex items-center gap-1 ${
              mobileTab === "code"
                ? "bg-white dark:bg-[#1e1e2a] text-zinc-900 dark:text-white shadow-sm"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700"
            }`}
          >
            Editor
          </button>
        </div>

        {/* Session Timer */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 dark:bg-[#181824] rounded-md border border-zinc-200 dark:border-[#1e1e2a]">
          <ClockIcon className="text-zinc-400" size={13} />
          <span className={`text-xs font-mono font-medium ${isPaused ? "text-amber-500" : "text-zinc-700 dark:text-zinc-300"}`}>
            {formatTime(elapsedSeconds)}
            {isPaused && <span className="ml-1 text-[9px] uppercase tracking-wider text-amber-500">PAUSED</span>}
          </span>
        </div>

        {onPauseResume && (
          <button
            onClick={onPauseResume}
            disabled={isSummarizing}
            className={`px-2.5 py-1 rounded-md border text-xs font-medium transition-all flex items-center gap-1.5 ${
              isPaused
                ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                : "bg-zinc-100 dark:bg-[#181824] hover:bg-zinc-200 dark:hover:bg-[#222232] text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-[#1e1e2a]"
            } ${isSummarizing ? "opacity-50 cursor-not-allowed" : ""}`}
            aria-label={isPaused ? "Resume interview" : "Pause interview"}
          >
            {isPaused ? <Play size={12} /> : <Pause size={12} />}
            <span className="hidden sm:inline">{isPaused ? "Resume" : "Pause"}</span>
          </button>
        )}

        <button
          onClick={onEndSession}
          disabled={isSummarizing}
          className={`px-3 py-1.5 rounded-md border font-semibold text-xs transition-all flex items-center gap-1.5 shadow-subtle ${
            isSummarizing
              ? "bg-zinc-100 dark:bg-[#181824] text-zinc-400 border-zinc-200 dark:border-[#1e1e2a] cursor-not-allowed"
              : "bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/25 active:scale-95"
          }`}
        >
          {isSummarizing ? <Zap className="animate-spin text-rose-500" size={13} /> : null}
          <span>{isSummarizing ? "Analyzing..." : "End & Analyze"}</span>
        </button>
      </div>
    </header>
  );
});
