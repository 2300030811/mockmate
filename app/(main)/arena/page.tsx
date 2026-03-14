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
    <div className="h-screen bg-[#050505] text-white flex flex-col overflow-hidden selection:bg-red-500/30 font-sans">

      {/* Background Effect */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.08)_0%,rgba(0,0,0,1)_80%)] opacity-60" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent h-24 animate-[scan_4s_linear_infinite]" />
      </div>

      <NavigationPill className="absolute top-7 left-6 z-[100] text-white scale-75 sm:scale-90 origin-top-left" />

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
