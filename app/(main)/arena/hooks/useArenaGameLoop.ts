import { useState, useEffect, useCallback, useRef } from "react";
import { GameState, Opponent, ArenaQuestion, BattleResult, StatItem } from "../types";
import { startArenaMatch } from "@/app/actions/arena";

// ── Constants ──────────────────────────────────────────────────────────
export const OPPONENTS: Opponent[] = [
  { name: "CodeWizard_99", level: 42, avatar: "🧙‍♂️", winRate: "68%", region: "US-East", badge: "Legend" },
  { name: "FrontendNinja", level: 38, avatar: "🥷", winRate: "72%", region: "EU-West", badge: "Elite" },
  { name: "DevOpsKing", level: 51, avatar: "👑", winRate: "59%", region: "AS-South", badge: "Master" },
  { name: "BugHunter_X", level: 31, avatar: "🕵️", winRate: "61%", region: "US-West", badge: "Gold" },
  { name: "CloudMaster", level: 45, avatar: "☁️", winRate: "65%", region: "SA-East", badge: "Diamond" }
];

const BATTLE_DURATION = 30;
const BASE_POINTS = 100;
const COMBO_MULTIPLIER = 10;
const ANSWER_DELAY_MS = 800;
const MATCHMAKING_DELAY_MS = 3000;
const MATCHMAKING_TRANSITION_MS = 1000;
const OPPONENT_MIN_POINTS = 100;
const OPPONENT_POINT_RANGE = 30;
const TICK_INTERVAL_MS = 1000;

const getTimestamp = () => new Date().toLocaleTimeString([], { hour12: false });

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
  const [timeLeft, setTimeLeft] = useState(BATTLE_DURATION);
  const [userSelected, setUserSelected] = useState<string | null>(null);
  const [matchLog, setMatchLog] = useState<string[]>([]);
  const [battleResults, setBattleResults] = useState<BattleResult[]>([]);
  const [combo, setCombo] = useState(0);

  // ── Refs for stable callbacks (avoid stale closures & interval churn) ──
  const battleEndedRef = useRef(false);
  const timeLeftRef = useRef(timeLeft);
  const comboRef = useRef(combo);
  const currentQuestionRef = useRef(currentQuestion);
  const questionsRef = useRef(questions);
  const userSelectedRef = useRef(userSelected);
  const opponentProgressRef = useRef(opponentProgress);
  const opponentQARef = useRef(opponentQuestionsAnswered);

  // Keep refs in sync with state
  timeLeftRef.current = timeLeft;
  comboRef.current = combo;
  currentQuestionRef.current = currentQuestion;
  questionsRef.current = questions;
  userSelectedRef.current = userSelected;
  opponentProgressRef.current = opponentProgress;
  opponentQARef.current = opponentQuestionsAnswered;

  // ── Matchmaking abort controller ──
  const matchmakingAbortRef = useRef<AbortController | null>(null);

  const cancelMatchmaking = useCallback(() => {
    matchmakingAbortRef.current?.abort();
    matchmakingAbortRef.current = null;
    setGameState('lobby');
    setMatchLog([]);
  }, []);

  const startMatchmaking = useCallback(async () => {
    // Abort any previous matchmaking
    matchmakingAbortRef.current?.abort();
    const abortController = new AbortController();
    matchmakingAbortRef.current = abortController;

    setGameState('searching');
    setCombo(0);
    battleEndedRef.current = false;
    setMatchLog([
      `[${getTimestamp()}] Connecting to Global Server...`,
      `[${getTimestamp()}] Searching for available players...`,
      `[${getTimestamp()}] Filtering by Elo rating (1200)...`
    ]);

    try {
      const matchDataPromise = startArenaMatch(selectedCategory);

      setTimeout(async () => {
        if (abortController.signal.aborted) return;

        setMatchLog(prev => [
          ...prev,
          `[${getTimestamp()}] Peer found!`,
          `[${getTimestamp()}] Synchronizing clocks...`,
          `[${getTimestamp()}] Ready!`
        ]);

        const matchData = await matchDataPromise;
        if (abortController.signal.aborted) return;

        setTimeout(() => {
          if (abortController.signal.aborted) return;

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
            setTimeLeft(BATTLE_DURATION);
            setBattleResults([]);
          } else {
            const errorMsg = matchData?.error || "Failed to load match data.";
            setMatchLog(prev => [...prev, `[${getTimestamp()}] ❌ ${errorMsg}`, `[${getTimestamp()}] Returning to lobby...`]);
            setTimeout(() => {
              if (!abortController.signal.aborted) setGameState('lobby');
            }, 3000);
          }
        }, MATCHMAKING_TRANSITION_MS);
      }, MATCHMAKING_DELAY_MS);
    } catch (err) {
      if (abortController.signal.aborted) return;
      setMatchLog(prev => [...prev, `[${getTimestamp()}] ❌ Critical connection error.`, `[${getTimestamp()}] Returning to lobby...`]);
      setTimeout(() => {
        if (!abortController.signal.aborted) setGameState('lobby');
      }, 3000);
    }
  }, [selectedCategory]);

  // Stable handleAnswer — reads volatile values from refs so the callback identity stays fixed
  const handleAnswer = useCallback((option: string) => {
    if (userSelectedRef.current || !questionsRef.current[currentQuestionRef.current]) return;
    setUserSelected(option);

    const q = questionsRef.current[currentQuestionRef.current];
    const isCorrect = option === q.a;
    if (isCorrect) {
      const speedBonus = Math.floor(timeLeftRef.current / 2);
      const comboBonus = comboRef.current * COMBO_MULTIPLIER;
      const points = BASE_POINTS + speedBonus + comboBonus;

      setUserScore(s => s + points);
      setCombo(c => c + 1);
    } else {
      setCombo(0);
    }

    setBattleResults(prev => [...prev, {
      q: q.q,
      userAns: option,
      correctAns: q.a,
      correct: isCorrect,
      tip: q.tip
    }]);

    setTimeout(() => {
      if (currentQuestionRef.current < questionsRef.current.length - 1) {
        setCurrentQuestion(c => c + 1);
        setUserSelected(null);
      } else {
        setGameState('results');
      }
    }, ANSWER_DELAY_MS);
  }, []); // Stable — no deps needed thanks to refs

  // ── Battle tick (single stable interval, no deps on volatile state) ──
  useEffect(() => {
    if (gameState !== 'battle') return;

    const eloStat = lobbyStats.find(s => s.label === "Elo Rating")?.val || "1000";
    const eloValue = parseInt(eloStat.replace(/,/g, '') || "1000");
    const difficultyMult = Math.max(0.7, Math.min(1.6, eloValue / 1200));
    const totalQ = questionsRef.current.length;

    const timer = setInterval(() => {
      // Timer countdown
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (!battleEndedRef.current) {
            battleEndedRef.current = true;
            setGameState('results');
          }
          return 0;
        }
        return prev - 1;
      });

      // Opponent progress — reads/writes via setter to avoid stale closure
      setOpponentProgress((prev) => {
        const pauseProb = 0.25 / difficultyMult;
        if (Math.random() < pauseProb) return prev;

        const isHesitating = (Math.floor(prev) % 25 === 0 && Math.random() > 0.5);
        if (isHesitating) return prev + 0.5;

        const baseIncrement = Math.random() * 4 + 1.5;
        const speedBoost = Math.random() > 0.85 ? 1.8 : 1.0;
        const increment = baseIncrement * difficultyMult * speedBoost;

        const next = prev + increment;
        return next >= 100 ? 100 : next;
      });

      // Opponent scoring — use refs for cross-state reads
      const scoreProb = 0.85 + (difficultyMult * 0.05);
      if (Math.random() > scoreProb && opponentQARef.current < totalQ) {
        const maxScoreForProgress = Math.floor(opponentProgressRef.current / (100 / totalQ)) + 1;
        if (opponentQARef.current < maxScoreForProgress) {
          const opponentPoints = Math.floor(OPPONENT_MIN_POINTS + (Math.random() * OPPONENT_POINT_RANGE));
          setOpponentScore(s => s + opponentPoints);
          setOpponentQuestionsAnswered(q => q + 1);
        }
      }
    }, TICK_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [gameState, lobbyStats]); // Only re-creates when game starts or lobby stats change

  // Detect opponent completion
  useEffect(() => {
    if (opponentProgress >= 100 && gameState === 'battle' && !battleEndedRef.current) {
      battleEndedRef.current = true;
      const finishDelay = Math.random() * 1000 + 500;
      setTimeout(() => setGameState('results'), finishDelay);
    }
  }, [opponentProgress, gameState]);

  // Forfeit: zero user score so opponent is guaranteed winner
  const forfeitBattle = useCallback(() => {
    if (gameState !== 'battle') return;
    battleEndedRef.current = true;
    setUserScore(0);
    setGameState('results');
  }, [gameState]);

  // Cleanup matchmaking on unmount
  useEffect(() => {
    return () => { matchmakingAbortRef.current?.abort(); };
  }, []);

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
    cancelMatchmaking,
    forfeitBattle,
    handleAnswer
  };
}
