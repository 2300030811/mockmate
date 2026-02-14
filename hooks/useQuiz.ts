"use client";

import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { QuizQuestion, QuizMode } from "@/types";
import { fetchQuizQuestions } from "@/app/actions/quiz";
import { useQuizEngine, UserAnswer } from "./useQuizEngine";
import { getSessionId, getStoredNickname } from "@/utils/session";
import { saveQuizResult } from "@/app/actions/results";
import { checkAnswer } from "@/utils/quiz-helpers";

interface UseQuizProps {
  category: "aws" | "azure" | "salesforce" | "mongodb" | "pcap" | "oracle";
  initialMode?: QuizMode;
  countParam?: string | null;
}

export function useQuiz({ category, initialMode = 'practice', countParam = null }: UseQuizProps) {
  const [mode, setMode] = useState<QuizMode>(initialMode);

  const { data: questions = [], isLoading: loading } = useQuery<QuizQuestion[]>({
    queryKey: ['quiz', category, mode, countParam],
    queryFn: async () => {
      return await fetchQuizQuestions(category, mode, countParam);
    },
    staleTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });

  const engine = useQuizEngine({
      questions,
      mode,
      category,
      initialTimeRemaining: category === 'azure' ? 45 * 60 : 90 * 60,
      onSubmit: (answers) => {
        if (mode === 'exam') {
          saveQuizResult({
            sessionId: getSessionId(),
            category,
            userAnswers: answers,
            totalQuestions: questions.length,
            nickname: getStoredNickname() || undefined
          });
        }
      }
  });

  const calculateScore = useCallback(() => {
    let correct = 0;
    let attempted = 0;
    
    questions.forEach((q) => {
        const answers = engine.userAnswers[q.id];
        if (answers !== undefined) {
            attempted++;
            if (checkAnswer(q, answers)) correct++;
        }
    });

    return {
        correct,
        attempted,
        wrong: attempted - correct,
        skipped: questions.length - attempted,
        percentage: attempted > 0 ? ((correct / questions.length) * 100).toFixed(1) : "0.0",
        passed: attempted > 0 && (correct / questions.length) >= 0.7
    };
  }, [questions, engine.userAnswers]);

  return {
    questions,
    loading,
    ...engine,
    calculateScore,
    mode,
    setMode
  };
}
