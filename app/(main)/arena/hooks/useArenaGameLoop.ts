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
  const [opponentQuestionsAnswered, setOpponentQuestionsAnswered] = useState(0);
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

    try {
      // Start fetching questions in background
      const matchDataPromise = startArenaMatch(selectedCategory);

      setTimeout(async () => {
        setMatchLog(prev => [...prev, "Peer found!", "Synchronizing clocks...", "Ready!"]);

        const matchData = await matchDataPromise;

        setTimeout(() => {
          if (matchData && matchData.success && matchData.questions) {
            setQuestions(matchData.questions);
            setCategory(matchData.category || "");
            const randomOpponent = OPPONENTS[Math.floor(Math.random() * OPPONENTS.length)];
            setOpponent(randomOpponent);
            setGameState('battle');
            setCurrentQuestion(0);
            setUserScore(0);
            setOpponentScore(0);
            setOpponentQuestionsAnswered(0);
            setOpponentProgress(0);
            setTimeLeft(30);
            setBattleResults([]);
          } else {
            const errorMsg = matchData?.error || "Failed to load match data.";
            setMatchLog(prev => [...prev, `❌ ${errorMsg}`, "Returning to lobby..."]);
            setTimeout(() => setGameState('lobby'), 3000);
          }
        }, 1000);
      }, 3000);
    } catch (err) {
      // Error is communicated via matchLog UI
      setMatchLog(prev => [...prev, "❌ Critical connection error.", "Returning to lobby..."]);
      setTimeout(() => setGameState('lobby'), 3000);
    }
  }, [selectedCategory]);

  const handleAnswer = useCallback((option: string) => {
    if (userSelected || !questions[currentQuestion]) return;
    setUserSelected(option);

    const isCorrect = option === questions[currentQuestion].a;
    if (isCorrect) {
      // Points = Base (100) + Speed Bonus (up to 50) + Combo Bonus (10 * combo)
      const speedBonus = Math.floor(timeLeft / 2); // Max 15 if 30s left
      const comboBonus = combo * 10;
      const points = 100 + speedBonus + comboBonus;

      setUserScore(s => s + points);
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
      const eloStat = lobbyStats.find(s => s.label === "Elo Rating")?.val || "1000";
      const eloValue = parseInt(eloStat.replace(/,/g, '') || "1000");
      const difficultyMult = Math.max(0.7, Math.min(1.6, eloValue / 1200));

      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setGameState('results');
            return 0;
          }
          return prev - 1;
        });

        // Opponent progress logic
        setOpponentProgress((prev) => {
          // Simulating thinking speed based on elo
          // Increased pause probability for more variety
          const pauseProb = 0.25 / difficultyMult;
          if (Math.random() < pauseProb) return prev;

          // Slight "hesitation" logic if they just scored or at certain milestones
          const isHesitating = (Math.floor(prev) % 25 === 0 && Math.random() > 0.5);
          if (isHesitating) return prev + 0.5;

          const baseIncrement = Math.random() * 4 + 1.5; // 1.5-5.5% per tick
          const speedBoost = Math.random() > 0.85 ? 1.8 : 1.0; // Rare speed bursts
          const increment = baseIncrement * difficultyMult * speedBoost;

          const next = prev + increment;
          return next >= 100 ? 100 : next;
        });

        // Opponent scoring logic
        const scoreProb = 0.85 + (difficultyMult * 0.05);
        if (Math.random() > scoreProb && opponentQuestionsAnswered < questions.length) {
          // Only score if they have progress "banked"
          const maxScoreForProgress = Math.floor(opponentProgress / (100 / questions.length)) + 1;
          if (opponentQuestionsAnswered < maxScoreForProgress) {
            // Opponent scoring should also look realistic (around 100-130 pts)
            const opponentPoints = Math.floor(100 + (Math.random() * 30));
            setOpponentScore(s => s + opponentPoints);
            setOpponentQuestionsAnswered(q => q + 1);
          }
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameState, opponentQuestionsAnswered, questions.length, lobbyStats, opponentProgress]);

  useEffect(() => {
    if (opponentProgress >= 100 && gameState === 'battle') {
      const finishDelay = Math.random() * 1000 + 500;
      setTimeout(() => setGameState('results'), finishDelay);
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
