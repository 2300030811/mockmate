import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { QuizMode, QuizQuestion } from "@/types";
import { fetchOracleQuestions } from "@/app/actions/quiz";
import { useQuizEngine, UserAnswer } from "./useQuizEngine";
import { getSessionId, getStoredNickname } from "@/utils/session";
import { saveQuizResult } from "@/app/actions/results";

interface UseOracleQuizProps {
  initialMode?: QuizMode;
}

export function useOracleQuiz({ initialMode = 'practice' }: UseOracleQuizProps = {}) {
  const [mode, setMode] = useState<QuizMode>(initialMode);

  const { data: questions = [], isLoading: loading } = useQuery<QuizQuestion[]>({
    queryKey: ['oracle-quiz', initialMode],
    queryFn: async () => {
      // Fetch Oracle questions using the new server action
      return (await fetchOracleQuestions(initialMode, null));
    },
    staleTime: 1000 * 60 * 30, // 30 mins
    refetchOnWindowFocus: false,
  });

  const engine = useQuizEngine({
      questions,
      mode,
      category: 'oracle',
      initialTimeRemaining: 90 * 60, // 90 minutes for standard exam
      onSubmit: () => {
        if (mode === 'exam') {
          const scoreData = calculateScore();
          saveQuizResult({
            sessionId: getSessionId(),
            category: 'oracle',
            score: scoreData.correct,
            totalQuestions: questions.length,
            nickname: getStoredNickname() || undefined
          });
        }
      }
  });

  // Custom Answer Handler for Oracle (Multi-select logic)
  const handleAnswer = useCallback((questionId: number, option: string, isMulti: boolean) => {
    // Prevent answering if submitted
    if (engine.isSubmitted) return;

    engine.setUserAnswers((prev) => {
      const currentAnswers = (prev[questionId] as string[]) || [];
      if (isMulti) {
        if (currentAnswers.includes(option)) {
          return { ...prev, [questionId]: currentAnswers.filter((a: string) => a !== option) };
        } else {
          return { ...prev, [questionId]: [...currentAnswers, option] };
        }
      } else {
        return { ...prev, [questionId]: [option] };
      }
    });
  }, [engine.isSubmitted, engine.setUserAnswers]);

  // Scoring Helper
  const checkAnswer = (q: QuizQuestion, answers: UserAnswer = []) => {
    const answerArray = Array.isArray(answers) ? answers as string[] : [];
    
    if (!answerArray || answerArray.length === 0) return false;
    
    // Sort selected options to ensure order doesn't matter for comparison
    const sortedUserAnswers = [...answerArray].sort();
    
    // Extract letters from user answers assume format "A. Answer text"
    // If options don't start with "A.", we fallback to full string matching?
    // But Oracle JSON usually has "A." prefixes.
    const userLetters = sortedUserAnswers.map(ans => {
        const match = ans.match(/^([A-Z])\./);
        return match ? match[1] : ans; // Fallback to full string if no letter found
    }).sort().join(", ");
    
    // Normalize correct answer from JSON (e.g., "A, B" or "C, D, F")
    let correctLetters = "";
    if (typeof q.answer === 'string') {
        correctLetters = q.answer.split(",").map(s => s.trim().toUpperCase()).sort().join(", ");
    } else if (Array.isArray(q.answer)) {
        correctLetters = q.answer.join(", "); 
    }

    // If direct match fails, try full string matching (in case answer is full string)
    if (userLetters !== correctLetters) {
         const combinedUserAnswer = sortedUserAnswers.join("");
         if (typeof q.answer === 'string' && combinedUserAnswer === q.answer) return true;
    }

    return userLetters === correctLetters;
  };

  const calculateScore = () => {
    let correct = 0;
    let attempted = 0;
    
    questions.forEach((q) => {
        const answers = engine.userAnswers[q.id];
        if (answers && Array.isArray(answers) && answers.length > 0) {
            attempted++;
            if (checkAnswer(q, answers)) correct++;
        }
    });

    return {
        correct,
        attempted,
        wrong: attempted - correct,
        skipped: questions.length - attempted,
        percentage: attempted > 0 ? ((correct / attempted) * 100).toFixed(1) : "0.0",
        passed: attempted > 0 && (correct / attempted) >= 0.65 // Oracle pass is usually 65%
    };
  };

  return {
    questions,
    loading,
    currentQuestionIndex: engine.currentQuestionIndex,
    setCurrentQuestionIndex: engine.setCurrentQuestionIndex,
    userAnswers: engine.userAnswers as Record<string | number, string[]>,
    markedQuestions: engine.markedQuestions,
    handleAnswer,
    toggleMark: engine.toggleMark,
    nextQuestion: engine.nextQuestion,
    prevQuestion: engine.prevQuestion,
    handleSubmit: engine.handleSubmit,
    timeRemaining: engine.timeRemaining,
    isSubmitted: engine.isSubmitted,
    checkAnswer,
    calculateScore,
    mode
  };
}
