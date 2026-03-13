import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { GameState, Opponent, ArenaQuestion, BattleResult, StatItem } from "../types";
import { startArenaMatch } from "@/app/actions/arena";

// ── Constants ──────────────────────────────────────────────────────────
export const OPPONENTS: Opponent[] = [
  { name: "CodeWizard_99", level: 42, avatar: "🧙‍♂️", winRate: "68%", region: "US-East", badge: "Legend", speed: 0.8, accuracy: 0.95 },
  { name: "FrontendNinja", level: 38, avatar: "🥷", winRate: "72%", region: "EU-West", badge: "Elite", speed: 0.9, accuracy: 0.85 },
  { name: "DevOpsKing", level: 51, avatar: "👑", winRate: "59%", region: "AS-South", badge: "Master", speed: 0.6, accuracy: 0.8 },
  { name: "BugHunter_X", level: 31, avatar: "🕵️", winRate: "61%", region: "US-West", badge: "Gold", speed: 0.7, accuracy: 0.9 },
  { name: "CloudMaster", level: 45, avatar: "☁️", winRate: "65%", region: "SA-East", badge: "Diamond", speed: 0.75, accuracy: 0.88 }
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
  const [battleId, setBattleId] = useState<string>("");

  // ── Refs for stable callbacks (avoid stale closures & interval churn) ──
  const battleEndedRef = useRef(false);
  const timeLeftRef = useRef(timeLeft);
  const comboRef = useRef(combo);
  const currentQuestionRef = useRef(currentQuestion);
  const questionsRef = useRef(questions);
  const userSelectedRef = useRef(userSelected);
  const opponentProgressRef = useRef(opponentProgress);
  const opponentQARef = useRef(opponentQuestionsAnswered);
  const lastOpponentActionRef = useRef(Date.now());

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
    setCombo(0);
    setBattleResults([]);
    setQuestions([]);
  }, []);

  // Pre-calculate current question based on state to simplify usage
  const currentQ = questions[currentQuestion];

  // ── Matchmaking logic (Cleaned up) ──
  const startMatchmaking = useCallback(async () => {
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
      // Start fetching match data immediately
      const matchPromise = startArenaMatch(selectedCategory);
      
      // Delay for fake "searching" feel
      await new Promise(resolve => setTimeout(resolve, MATCHMAKING_DELAY_MS));
      if (abortController.signal.aborted) return;

      setMatchLog(prev => [
        ...prev,
        `[${getTimestamp()}] Peer found!`,
        `[${getTimestamp()}] Synchronizing clocks...`,
        `[${getTimestamp()}] Ready!`
      ]);

      const matchData = await matchPromise;
      if (abortController.signal.aborted) return;

      // Final transition delay
      await new Promise(resolve => setTimeout(resolve, MATCHMAKING_TRANSITION_MS));
      if (abortController.signal.aborted) return;

      if (matchData?.success && matchData.questions) {
        setQuestions(matchData.questions);
        setCategory(matchData.category || "");
        setOpponent(OPPONENTS[Math.floor(Math.random() * OPPONENTS.length)]);
        setGameState('battle');
        if (lastOpponentActionRef.current) {
          lastOpponentActionRef.current = Date.now();
        }
        setCurrentQuestion(0);
        setUserScore(0);
        setOpponentScore(0);
        setOpponentQuestionsAnswered(0);
        setOpponentProgress(0);
        setTimeLeft(BATTLE_DURATION);
        setBattleId(crypto.randomUUID());
        setBattleResults([]);
      } else {
        const errorMsg = matchData?.error || "Failed to load match data.";
        setMatchLog(prev => [...prev, `[${getTimestamp()}] ❌ ${errorMsg}`, `[${getTimestamp()}] Returning to lobby...`]);
        await new Promise(resolve => setTimeout(resolve, 3000));
        if (lastOpponentActionRef.current) {
          lastOpponentActionRef.current = Date.now();
        }
        if (!abortController.signal.aborted) setGameState('lobby');
      }
    } catch (err) {
      if (abortController.signal.aborted) return;
      setMatchLog(prev => [...prev, `[${getTimestamp()}] ❌ Critical connection error.`, `[${getTimestamp()}] Returning to lobby...`]);
      await new Promise(resolve => setTimeout(resolve, 3000));
      if (lastOpponentActionRef.current) {
        lastOpponentActionRef.current = Date.now();
      }
      if (!abortController.signal.aborted) setGameState('lobby');
    }
  }, [selectedCategory]);

  // Stable handleAnswer
  const handleAnswer = useCallback((option: string) => {
    const q = questionsRef.current[currentQuestionRef.current];
    if (userSelectedRef.current || !q) return;
    
    setUserSelected(option);

    const correctAnswers = q.multipleCorrect
      ? (Array.isArray(q.a) ? q.a : (q.a as string).split("|||")).sort()
      : [q.a];

    const submittedAnswers = option.includes("|||")
      ? option.split("|||").sort()
      : [option];

    const isCorrect = JSON.stringify(correctAnswers) === JSON.stringify(submittedAnswers);

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
      questionId: String(q.id),
      q: q.q,
      userAns: option,
      correctAns: q.a,
      correct: isCorrect,
      tip: q.tip
    }]);

    setTimeout(() => {
      setCurrentQuestion(c => {
        const next = c + 1;
        if (next < questionsRef.current.length) {
          setUserSelected(null);
          return next;
        }
        setGameState('results');
        return c;
      });
    }, ANSWER_DELAY_MS);
  }, []);

  // ── Battle tick interval ──
  useEffect(() => {
    if (gameState !== 'battle') return;

    const eloValue = parseInt((lobbyStats.find(s => s.label === "Elo Rating")?.val || "1000").replace(/,/g, ''));
    const difficultyMult = Math.max(0.7, Math.min(1.6, eloValue / 1200));
    const totalQ = questionsRef.current.length;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (!battleEndedRef.current) {
            battleEndedRef.current = true;
            setGameState('results');
          }
          return 0;
        }
        return prev - 1;
      });

      setOpponentProgress(prev => {
        if (Math.random() < (0.25 / difficultyMult)) return prev;
        const isHesitating = (Math.floor(prev) % 25 === 0 && Math.random() > 0.5);
        if (isHesitating) return prev + 0.5;
        const baseIncrement = Math.random() * 4 + 1.5;
        const speedBoost = Math.random() > 0.85 ? 1.8 : 1.0;
        const inc = baseIncrement * difficultyMult * speedBoost;
        return Math.min(100, prev + inc);
      });

      // Higher speed means lower delay
      const now = Date.now();
      const elapsed = now - lastOpponentActionRef.current;
      const baseDelay = (1 - (opponent?.speed || 0.5)) * 5000 + 1000;
      const randomJitter = Math.random() * 1000;
      const nextTickTime = baseDelay + randomJitter;

      if (elapsed > nextTickTime && !battleEndedRef.current) {
        lastOpponentActionRef.current = now;
        
        const maxQAAllowed = questionsRef.current.length;
        if (opponentQARef.current < maxQAAllowed) {
          // Bot answer logic: roll for accuracy
          const isCorrectBot = Math.random() < (opponent?.accuracy || 0.85);
          
          if (isCorrectBot) {
            const points = Math.floor(OPPONENT_MIN_POINTS + (Math.random() * OPPONENT_POINT_RANGE));
            setOpponentScore(s => s + points);
          }
          
          setOpponentQuestionsAnswered(q => {
            const next = q + 1;
            opponentQARef.current = next;
            return next;
          });
        }
      }
    }, TICK_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [gameState, lobbyStats, opponent]);

  // Opponent Auto-Finish
  useEffect(() => {
    if (opponentProgress >= 100 && gameState === 'battle' && !battleEndedRef.current) {
      battleEndedRef.current = true;
      setTimeout(() => setGameState('results'), Math.random() * 1000 + 500);
    }
  }, [opponentProgress, gameState]);

  const forfeitBattle = useCallback(() => {
    if (gameState !== 'battle') return;
    battleEndedRef.current = true;
    setUserScore(0);
    setGameState('results');
  }, [gameState]);

  useEffect(() => {
    return () => matchmakingAbortRef.current?.abort();
  }, []);

  return useMemo(() => ({
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
  }), [
    gameState, opponent, questions, category, currentQuestion, userScore, 
    opponentScore, opponentProgress, timeLeft, userSelected, matchLog, 
    battleResults, combo, battleId, startMatchmaking, cancelMatchmaking, forfeitBattle, handleAnswer
  ]);
}
