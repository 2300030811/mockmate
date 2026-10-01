"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import {
  Trophy,
  Flame,
  Activity,
} from "lucide-react";
import { NavigationPill } from "@/components/ui/NavigationPill";
import { ArenaLobby } from "./components/ArenaLobby";
import { ArenaMatchmaking } from "./components/ArenaMatchmaking";
import { ArenaBattle } from "./components/ArenaBattle";
import { ArenaResults } from "./components/ArenaResults";
import { StatItem, RecentMatch } from "./types";
import { getArenaStats } from "@/app/actions/arena";
import { useArenaGameLoop } from "./hooks/useArenaGameLoop";
import { useTheme } from "next-themes";

const DEFAULT_LOBBY_STATS: StatItem[] = [
  { icon: Flame, label: "Win Streak", val: "2", color: "text-orange-500", bg: "bg-orange-500/10" },
  { icon: Trophy, label: "Elo Rating", val: "1,245", color: "text-blue-500", bg: "bg-blue-500/10" },
  { icon: Activity, label: "Global Rank", val: "#382", color: "text-emerald-500", bg: "bg-emerald-500/10", hideOnMobile: true }
];

export default function ArenaPage() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";
  const [lobbyStats, setLobbyStats] = useState<StatItem[]>(DEFAULT_LOBBY_STATS);
  const [selectedCategory, setSelectedCategory] = useState<string>("random");
  const [recentMatches, setRecentMatches] = useState<RecentMatch[]>([]);
  const [avatarIcon, setAvatarIcon] = useState<string>("User");
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  const {
    gameState,
    setGameState,
    opponent,
    questions,
    category,
    currentQuestion,
    userScore,
    opponentScore,
    opponentProgress,
    timeLeft,
    userSelected,
    matchLog,
    battleResults,
    combo,
    battleId,
    startMatchmaking,
    cancelMatchmaking,
    forfeitBattle,
    handleAnswer
  } = useArenaGameLoop(selectedCategory, lobbyStats);

  // Fetch real stats on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        setStatsError(null);
        const stats = await getArenaStats();
        if (stats) {
          setIsAuthenticated(true);
          setLobbyStats([
            { icon: Trophy, label: "Elo Rating", val: stats.elo.toLocaleString(), color: "text-blue-500", bg: "bg-blue-500/10" },
            { icon: Flame, label: "Arena Win Streak", val: stats.winStreak.toString(), color: "text-orange-500", bg: "bg-orange-500/10" },
            { icon: Activity, label: "Global Rank", val: stats.rank, color: "text-emerald-500", bg: "bg-emerald-500/10", hideOnMobile: true }
          ]);
          setRecentMatches(stats.recentArenaMatches || []);
          if (stats.avatarIcon) setAvatarIcon(stats.avatarIcon);
        } else {
          setIsAuthenticated(false);
          // For guests, we don't show an error, we just keep default stats
          setStatsError(null);
        }
      } catch (err) {
        console.error("Failed to fetch arena stats:", err);
        setStatsError("Connection error. Using default values.");
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Warn before leaving during battle
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (gameState === 'battle') {
        e.preventDefault();
        e.returnValue = "You're in the middle of a battle. Leaving will forfeit the match.";
        return "You're in the middle of a battle. Leaving will forfeit the match.";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [gameState]);


  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0d0d12] text-zinc-900 dark:text-[#ebebef] flex flex-col font-sans relative selection:bg-[#5e6ad2]/20 pt-14 transition-colors overflow-x-hidden">

      {/* 28px Precision Grid Background & Horizon Illumination */}
      <div className="fixed inset-0 pointer-events-none select-none overflow-hidden" aria-hidden="true">
        <div
          className="absolute inset-0 opacity-40 dark:opacity-20 text-zinc-400 dark:text-zinc-600"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "28px 28px",
            maskImage: "linear-gradient(to bottom, black 25%, transparent 95%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 25%, transparent 95%)",
          }}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[1px] bg-gradient-to-r from-transparent via-[#5e6ad2]/50 to-transparent" />
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[180px] opacity-25 dark:opacity-20 blur-3xl pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 50% 0%, #5e6ad2 0%, transparent 70%)",
          }}
        />
      </div>

      <AnimatePresence mode="wait">
        {gameState === 'lobby' && (
          <ArenaLobby
            stats={lobbyStats}
            recentMatches={recentMatches}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            onStart={startMatchmaking}
            userAvatar={avatarIcon}
            statsLoading={statsLoading}
            statsError={statsError}
            isAuthenticated={isAuthenticated}
          />
        )}

        {gameState === 'searching' && (
          <ArenaMatchmaking matchLog={matchLog} onCancel={cancelMatchmaking} />
        )}

        {gameState === 'battle' && (
          <ArenaBattle
            opponent={opponent}
            questions={questions}
            currentQuestion={currentQuestion}
            userScore={userScore}
            opponentScore={opponentScore}
            timeLeft={timeLeft}
            opponentProgress={opponentProgress}
            userSelected={userSelected}
            handleAnswer={handleAnswer}
            category={category}
            combo={combo}
            battleResults={battleResults}
            userAvatar={avatarIcon}
            onForfeit={forfeitBattle}
          />
        )}

        {gameState === 'results' && (
          <ArenaResults
            userScore={userScore}
            opponentScore={opponentScore}
            battleResults={battleResults}
            allQuestions={questions}
            category={category}
            battleId={battleId}
            onLobby={() => setGameState('lobby')}
            onRematch={startMatchmaking}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
