import { useState, useEffect, useCallback } from "react";
import { GameState, Opponent, ArenaQuestion, BattleResult, StatItem } from "../types";
import { startArenaMatch } from "@/app/actions/arena";

export const OPPONENTS: Opponent[] = [
  { name: "CodeWizard_99", level: 42, avatar: "🧙‍♂️", winRate: "68%", region: "US-East", badge: "Legend" },
  { name: "FrontendNinja", level: 38, avatar: "🥷", winRate: "72%", region: "EU-West", badge: "Elite" },
  { name: "DevOpsKing", level: 51, avatar: "👑", winRate: "59%", region: "AS-South", badge: "Master" },
  { name: "BugHunter_X", level: 31, avatar: "🕵️", winRate: "61%", region: "US-West", badge: "Gold" },
  { name: "CloudMaster", level: 45, avatar: "☁️", winRate: "65%", region: "SA-East", badge: "Diamond" }
];

export function useArenaGameLoop(selectedCategory: string, lobbyStats: StatItem[]) {
  const [gameState, setGameState] = useState<GameState>('lobby');
  const [opponent, setOpponent] = useState<Opponent | null>(null);
  const [questions, setQuestions] = useState<ArenaQuestion[]>([]);
  const [category, setCategory] = useState<string>("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userScore, setUserScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [opponentProgress, setOpponentProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [userSelected, setUserSelected] = useState<string | null>(null);
  const [matchLog, setMatchLog] = useState<string[]>([]);
  const [battleResults, setBattleResults] = useState<BattleResult[]>([]);
  const [combo, setCombo] = useState(0);

  const startMatchmaking = useCallback(async () => {
    setGameState('searching');
    setCombo(0);
    setMatchLog(["Connecting to Global Server...", "Searching for available players...", "Filtering by Elo rating (1200)..."]);
    
    // Start fetching questions in background
    const matchDataPromise = startArenaMatch(selectedCategory);

    setTimeout(async () => {
      setMatchLog(prev => [...prev, "Peer found!", "Synchronizing clocks...", "Ready!"]);
      
      const matchData = await matchDataPromise;

      setTimeout(() => {
        if (matchData.success && matchData.questions) {
          setQuestions(matchData.questions);
          setCategory(matchData.category || "");
          const randomOpponent = OPPONENTS[Math.floor(Math.random() * OPPONENTS.length)];
          setOpponent(randomOpponent);
          setGameState('battle');
          setCurrentQuestion(0);
          setUserScore(0);
          setOpponentScore(0);
          setOpponentProgress(0);
          setTimeLeft(30);
          setBattleResults([]);
        } else {
          setMatchLog(prev => [...prev, "❌ Failed to load match data. Returning to lobby..."]);
          setTimeout(() => setGameState('lobby'), 2000);
        }
      }, 1000);
    }, 3000);
  }, [selectedCategory]);

  const handleAnswer = useCallback((option: string) => {
    if (userSelected || !questions[currentQuestion]) return;
    setUserSelected(option);
    
    const isCorrect = option === questions[currentQuestion].a;
    if (isCorrect) {
      setUserScore(s => s + 1);
      setCombo(c => c + 1);
    } else {
      setCombo(0);
    }

    setBattleResults(prev => [...prev, { 
      q: questions[currentQuestion].q, 
      userAns: option, 
      correct: isCorrect,
      tip: questions[currentQuestion].tip
    }]);

    setTimeout(() => {
       if (currentQuestion < questions.length - 1) {
          setCurrentQuestion(c => c + 1);
          setUserSelected(null);
       } else {
          setGameState('results');
       }
    }, 1200);
  }, [currentQuestion, questions, userSelected]);

  // Battle Logic Effect
  useEffect(() => {
    if (gameState === 'battle') {
      const eloValue = parseInt(lobbyStats.find(s => s.label === "Elo Rating")?.val.replace(',', '') || "1000");
      const difficultyMult = Math.max(0.8, Math.min(1.5, eloValue / 1200));

      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
             setGameState('results');
             return 0;
          }
          return prev - 1;
        });

        setOpponentProgress((prev) => {
           const baseIncrement = Math.random() * 5; 
           const increment = baseIncrement * difficultyMult;
           const next = prev + increment;
           if (next >= 100) return 100;
           return next;
        });

        const scoreProb = 0.85 + (difficultyMult * 0.05);
        if (Math.random() > scoreProb && opponentScore < questions.length) {
            setOpponentScore(s => s + 1);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameState, opponentScore, questions.length, lobbyStats]);

  useEffect(() => {
    if (opponentProgress >= 100 && gameState === 'battle') {
        setTimeout(() => setGameState('results'), 1500);
    }
  }, [opponentProgress, gameState]);

  return {
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
  };
}
