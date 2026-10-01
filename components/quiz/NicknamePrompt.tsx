"use client";

import { useState, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Trophy, Send, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { saveQuizResult } from "@/app/actions/results";
import { getSessionId, getStoredNickname, setStoredNickname } from "@/utils/session";
import { useAuth } from "@/components/providers/auth-provider";

interface NicknamePromptProps {
  userAnswers: Record<string | number, any>;
  totalQuestions: number;
  category: string;
}

export function NicknamePrompt({ userAnswers, totalQuestions, category }: NicknamePromptProps) {
  const { user, profile, loading: authLoading } = useAuth();
  const [nickname, setNickname] = useState(() => getStoredNickname() || "");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (user || profile) {
      const name = profile?.nickname || user?.user_metadata?.nickname;
      if (name) {
        setNickname(name);
        setStoredNickname(name);
      }
    }
  }, [user, profile]);

  const handleSubmit = async () => {
    if (!nickname.trim()) return;
    setError(null);
    
    // Save locally for other quizzes
    setStoredNickname(nickname.trim());
    
    setLoading(true);
    const result = await saveQuizResult({
      sessionId: getSessionId(),
      category,
      userAnswers,
      totalQuestions,
      nickname: nickname.trim()
    });
    
    setLoading(false);
    if (result.success) {
      setSubmitted(true);
    } else {
      setError(result.error || "Failed to save score. Please try again.");
    }
  };

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50/70 dark:bg-[#101017] p-4 sm:p-5 shadow-sm text-left">
      <AnimatePresence mode="wait">
        {!submitted ? (
          <m.div
            key="prompt"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 flex items-center justify-center text-[#5e6ad2] shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-semibold tracking-[-0.01em] text-zinc-900 dark:text-[#ebebef]">
                  Claim your spot!
                </h4>
                <p className="text-xs text-zinc-500 dark:text-[#8b8b9e] mt-0.5 leading-relaxed">
                  Enter a callsign or nickname to publish your score to the global {category.toUpperCase()} leaderboard.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 relative shrink-0">
              <div className="relative w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Enter nickname..."
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full sm:w-44 bg-white dark:bg-[#151522] border border-zinc-300 dark:border-[#262638] rounded-lg px-3 py-1.5 text-xs font-mono text-zinc-900 dark:text-[#ebebef] placeholder:text-zinc-400 dark:placeholder:text-[#6e6e84] outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2] transition-colors pr-7 h-8.5"
                  maxLength={20}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
                {syncing && (
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                    <RefreshCw className="w-3 h-3 animate-spin text-[#5e6ad2]" />
                  </div>
                )}
              </div>
              <button
                onClick={handleSubmit}
                disabled={!nickname.trim() || loading}
                className="shrink-0 h-8.5 px-3 rounded-lg bg-[#5e6ad2] hover:bg-[#525ec2] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <span>Submit</span>
                    <Send className="w-3 h-3" />
                  </>
                )}
              </button>
              {syncing && <p className="absolute -bottom-4.5 left-0 text-[10px] text-[#5e6ad2] font-mono animate-pulse">Syncing profile...</p>}
              {error && <p className="absolute -bottom-4.5 left-0 text-[10px] text-rose-500 font-mono">{error}</p>}
            </div>
          </m.div>
        ) : (
          <m.div
            key="success"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-medium"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Score published to leaderboard for callsign: <strong className="font-semibold text-emerald-700 dark:text-emerald-300">{nickname}</strong></span>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
