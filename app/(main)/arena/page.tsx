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
import { StatItem, Opponent } from "./types";
import { getArenaStats } from "@/app/actions/arena";
import { useArenaGameLoop } from "./hooks/useArenaGameLoop";

// --- Data ---
const OPPONENTS: Opponent[] = [
  { name: "CodeWizard_99", level: 42, avatar: "🧙‍♂️", winRate: "68%", region: "US-East", badge: "Legend" },
  { name: "FrontendNinja", level: 38, avatar: "🥷", winRate: "72%", region: "EU-West", badge: "Elite" },
  { name: "DevOpsKing", level: 51, avatar: "👑", winRate: "59%", region: "AS-South", badge: "Master" },
  { name: "BugHunter_X", level: 31, avatar: "🕵️", winRate: "61%", region: "US-West", badge: "Gold" },
  { name: "CloudMaster", level: 45, avatar: "☁️", winRate: "65%", region: "SA-East", badge: "Diamond" }
];

const LOBBY_STATS: StatItem[] = [
  { icon: Flame, label: "Win Streak", val: "2", color: "text-orange-500", bg: "bg-orange-500/10" },
  { icon: Trophy, label: "Elo Rating", val: "1,245", color: "text-blue-500", bg: "bg-blue-500/10" },
  { icon: Activity, label: "Global Rank", val: "#382", color: "text-emerald-500", bg: "bg-emerald-500/10", hideOnMobile: true }
];

export default function ArenaPage() {
  const [lobbyStats, setLobbyStats] = useState<StatItem[]>(LOBBY_STATS);
  const [selectedCategory, setSelectedCategory] = useState<string>("random");
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const [avatarIcon, setAvatarIcon] = useState<string>("User");

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
    startMatchmaking,
    handleAnswer
  } = useArenaGameLoop(selectedCategory, lobbyStats);

  // Fetch real stats on mount
  useEffect(() => {
    const fetchStats = async () => {
      const stats = await getArenaStats();
      if (stats) {
        setLobbyStats([
          { icon: Trophy, label: "Elo Rating", val: stats.elo.toLocaleString(), color: "text-blue-500", bg: "bg-blue-500/10" },
          { icon: Flame, label: "Arena Win Streak", val: stats.winStreak.toString(), color: "text-orange-500", bg: "bg-orange-500/10" },
          { icon: Activity, label: "Global Rank", val: stats.rank, color: "text-emerald-500", bg: "bg-emerald-500/10", hideOnMobile: true }
        ]);
        setRecentMatches(stats.recentArenaMatches || []);
        if (stats.avatarIcon) setAvatarIcon(stats.avatarIcon);
      }
    };
    fetchStats();
  }, []);


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
          />
        )}

        {gameState === 'searching' && (
          <ArenaMatchmaking matchLog={matchLog} />
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
            userAvatar={avatarIcon}
          />
        )}

        {gameState === 'results' && (
          <ArenaResults 
            userScore={userScore}
            opponentScore={opponentScore}
            battleResults={battleResults}
            category={category}
            onLobby={() => setGameState('lobby')}
            onRematch={startMatchmaking}
          />
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes scan { from { transform: translateY(-100%); } to { transform: translateY(100vh); } }
        @keyframes wiggle { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(-5deg); } 75% { transform: rotate(5deg); } }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}
