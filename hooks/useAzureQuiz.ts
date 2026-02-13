import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { QuizQuestion, QuizMode } from "@/types";
import { fetchAzureQuestionsAction } from "@/app/actions/quiz";
import { useQuizEngine, UserAnswer } from "./useQuizEngine";
import { getSessionId, getStoredNickname } from "@/utils/session";
import { saveQuizResult } from "@/app/actions/results";

type AzureQuizMode = QuizMode | 'review';
// Re-export for backward compatibility with components that import QuizMode from this hook
export type { AzureQuizMode as QuizMode };

interface UseAzureQuizProps {
  initialMode?: AzureQuizMode;
}

export function useAzureQuiz({ initialMode = 'practice' }: UseAzureQuizProps = {}) {
  const [mode, setMode] = useState<AzureQuizMode>(initialMode);

  // React Query for caching raw data
  const { data: rawQuestions, isLoading: isFetching } = useQuery({
    queryKey: ['azure-questions-raw'],
    queryFn: async () => {
      return await fetchAzureQuestionsAction();
    },
    staleTime: 1000 * 60 * 60, // Cache raw questions for 1 hour
    refetchOnWindowFocus: false,
  });

  // Derive questions from raw data to avoid redundant state
  const questions = useMemo(() => {
    if (!rawQuestions) return [];
    if (initialMode === 'exam') {
      const shuffled = [...rawQuestions].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 40) as QuizQuestion[];
    }
    return rawQuestions as QuizQuestion[];
  }, [rawQuestions, initialMode]);

  const loading = isFetching && questions.length === 0;

  const engine = useQuizEngine({
      questions,
      mode: mode === 'review' ? 'practice' : (mode as 'practice' | 'exam'), // Map review to practice for engine mechanics (no timer kill)
      category: 'azure',
      initialTimeRemaining: 45 * 60,
      onSubmit: () => {
          setMode('review');
          if (mode === 'exam') {
            saveQuizResult({
              sessionId: getSessionId(),
              category: 'azure',
              score: calculateScore(),
              totalQuestions: questions.length,
              nickname: getStoredNickname() || undefined
            });
          }
      }
  });

  const handleAnswer = (questionId: string | number, answer: UserAnswer) => {
    if (engine.isSubmitted && mode !== 'practice') return; 
    
    // In Azure quiz, answer structure varies by type (string, object, array)
    engine.handleAnswer(questionId, answer);
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q) => {
      const uAns = engine.userAnswers[q.id];
      if (uAns === undefined) return;

      if (q.type === 'mcq') {
        if (typeof uAns === 'string' && uAns === q.answer) score++;
        // Handle MSQ if applicable for 'mcq' type
        if (Array.isArray(uAns) && Array.isArray(q.answer)) {
            // simplistic array compare
             if (uAns.length === q.answer.length && uAns.every(v => (q.answer as string[]).includes(v))) {
                 score++;
             }
        }
      } else if (q.type === 'hotspot') {
        if (typeof q.answer === 'object' && q.answer !== null && uAns && typeof uAns === 'object' && !Array.isArray(uAns)) {
            const answerRecord = q.answer as Record<string, "Yes" | "No">;
            const userRecord = uAns as Record<string, string>;
            const isCorrect = Object.entries(answerRecord).every(([key, val]) => userRecord[key] === val);
            if (isCorrect) score++;
        }
      } else if (q.type === 'case_table') {
        if (Array.isArray(q.statements) && typeof uAns === 'object' && !Array.isArray(uAns)) {
             const userRecord = uAns as Record<string, string>;
             // userRecord keys might be indices
            const allMatch = q.statements.every((st, idx) => {
                return userRecord[idx] === st.answer;
            });
            if (allMatch) score++;
        }
      } else if (q.type === 'drag_drop') {
         if (Array.isArray(q.answer)) {
             if (Array.isArray(uAns) && 
                 q.answer.length === uAns.length && 
                 q.answer.every((val) => (uAns as string[]).includes(val))) {
                 score++;
             }
         } else if (q.answer_mapping && typeof uAns === 'object' && !Array.isArray(uAns)) {
             const userRecord = uAns as Record<string, string>;
             const isCorrect = Object.entries(q.answer_mapping).every(([zone, item]) => userRecord[zone] === item);
             if (isCorrect) score++;
         }
      }
    });
    return score;
  };

  const score = useMemo(() => calculateScore(), [questions, engine.userAnswers]);

  return {
    questions,
    loading,
    currentQuestionIndex: engine.currentQuestionIndex,
    setCurrentQuestionIndex: engine.setCurrentQuestionIndex,
    userAnswers: engine.userAnswers,
    handleAnswer,
    nextQuestion: engine.nextQuestion,
    prevQuestion: engine.prevQuestion,
    timeRemaining: engine.timeRemaining,
    handleSubmitExam: engine.handleSubmit,
    isSubmitted: engine.isSubmitted,
    score,
    mode,
    setMode,
    clearProgress: engine.clearProgress
  };
}

