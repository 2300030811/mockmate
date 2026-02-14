"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Send, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { saveQuizResult } from "@/app/actions/results";
import { getSessionId, getStoredNickname, setStoredNickname } from "@/utils/session";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
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
    <Card className="mt-8 overflow-hidden border-blue-500/20 bg-blue-50/50 dark:bg-blue-500/5 backdrop-blur-md">
      <div className="p-6">
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key="prompt"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col md:flex-row items-center gap-6"
            >
              <div className="bg-blue-600 dark:bg-blue-500 p-4 rounded-2xl shadow-lg shadow-blue-500/20">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  Claim your spot!
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Great job! Enter a nickname to show up on the global leaderboard.
                </p>
              </div>

                <div className="flex w-full md:w-auto gap-2 relative">
                  <div className="relative flex-1 md:flex-initial">
                    <input
                      type="text"
                      placeholder="Your nickname..."
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="w-full md:w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium pr-10"
                      maxLength={20}
                      onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    />
                    {syncing && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <RefreshCw className="w-3 h-3 animate-spin text-blue-500" />
                      </div>
                    )}
                  </div>
                  <Button 
                      onClick={handleSubmit} 
                      disabled={!nickname.trim() || loading}
                      size="sm"
                      className="shrink-0 h-[38px]"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                  {syncing && <p className="absolute -bottom-5 left-0 text-[10px] text-blue-500 font-bold animate-pulse px-1">Syncing profile...</p>}
                  {error && <p className="absolute -bottom-5 left-0 text-[10px] text-red-500 font-bold px-1">{error}</p>}
                </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-3 py-2 text-green-600 dark:text-green-400"
            >
              <CheckCircle2 className="w-6 h-6" />
              <span className="font-bold">You&apos;re on the board, {nickname}!</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}
