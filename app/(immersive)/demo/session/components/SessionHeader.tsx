
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
    <header className="h-16 px-6 border-b border-gray-800 bg-gray-900/50 backdrop-blur-md flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={onHomeClick}
            className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
            aria-label="Go home"
          >
            <HomeIcon size={20} />
          </button>
          <div className="h-6 w-px bg-gray-800 hidden sm:block"></div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-200 capitalize flex items-center gap-2">
              {type.replace("-", " ")} Interview
              {azureConfig && (
                <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] font-bold rounded border border-blue-500/30 uppercase tracking-tighter">
                  Pro
                </span>
              )}
            </span>
            <div className="flex items-center gap-2" role="status" aria-live="polite">
              <div
                className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${isAISpeaking || isProcessing ? "bg-amber-400 animate-pulse" : isListening && isUserActive ? "bg-green-500 scale-125" : "bg-blue-500"}`}
                aria-hidden="true"
              ></div>
              <span className="text-xs text-gray-500">{debugStatus}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center">
              <UserAuthSection />
              <div className="w-px h-6 bg-gray-800 mx-4"></div>
          </div>

          {/* Mobile Tab Toggle */}
          <div className="flex md:hidden bg-gray-900 border border-gray-800 p-1 rounded-lg">
            <button
               onClick={() => setMobileTab('chat')}
               className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${mobileTab === 'chat' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
            >
              Chat
            </button>
            <button
               onClick={() => setMobileTab('code')}
               className={`px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${mobileTab === 'code' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
            >
               Editor
            </button>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 bg-gray-900 rounded-full border border-gray-800">
            <ClockIcon className="text-gray-500" size={16} />
            <span className={`text-sm font-mono ${isPaused ? 'text-amber-400' : 'text-gray-300'}`}>
              {formatTime(elapsedSeconds)}
              {isPaused && <span className="ml-1 text-[10px] uppercase">paused</span>}
            </span>
          </div>
          {onPauseResume && (
            <button
              onClick={onPauseResume}
              disabled={isSummarizing}
              className={`p-2 rounded-lg border font-medium text-sm transition-all flex items-center gap-1.5
                ${isPaused
                  ? 'bg-green-500/10 hover:bg-green-500/20 text-green-400 hover:text-green-300 border-green-500/20'
                  : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 border-amber-500/20'}
                ${isSummarizing ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              aria-label={isPaused ? "Resume interview" : "Pause interview"}
            >
              {isPaused ? <Play size={14} /> : <Pause size={14} />}
              <span className="hidden sm:inline">{isPaused ? 'Resume' : 'Pause'}</span>
            </button>
          )}
          <button
            onClick={onEndSession}
            disabled={isSummarizing}
            className={`px-4 py-1.5 rounded-lg border font-medium text-sm transition-all flex items-center gap-2
              ${isSummarizing 
                ? 'bg-gray-800 text-gray-500 border-gray-700' 
                : 'bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-400 border-red-500/20'}
            `}
          >
            {isSummarizing ? <Zap className="animate-spin" size={14} /> : null}
            {isSummarizing ? "Analyzing..." : "End & Analyze"}
          </button>
        </div>
      </header>
  );
});
