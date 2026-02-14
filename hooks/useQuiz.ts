"use client";

import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { QuizQuestion, QuizMode } from "@/types";
import { fetchQuizQuestions } from "@/app/actions/quiz";
import { useQuizEngine, UserAnswer } from "./useQuizEngine";
import { getSessionId, getStoredNickname } from "@/utils/session";
import { saveQuizResult } from "@/app/actions/results";

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
      onSubmit: () => {
        if (mode === 'exam') {
          saveQuizResult({
            sessionId: getSessionId(),
            category,
            score: calculateScore().correct,
            totalQuestions: questions.length,
            nickname: getStoredNickname() || undefined
          });
        }
      }
  });

  const checkAnswer = useCallback((q: QuizQuestion, uAns: UserAnswer) => {
    if (uAns === undefined) return false;

    if (q.type === 'mcq' || !q.type) { // Default to MCQ if no type
      if (typeof uAns === 'string' && uAns === q.answer) return true;
      if (Array.isArray(uAns) && Array.isArray(q.answer)) {
          return uAns.length === q.answer.length && uAns.every(v => (q.answer as string[]).includes(v));
      }
      // AWS legacy check
      if (Array.isArray(uAns) && typeof q.answer === 'string') {
          const sorted = [...uAns].sort().join("");
          return sorted === q.answer;
      }
    } else if (q.type === 'hotspot') {
      if (typeof q.answer === 'object' && q.answer !== null && uAns && typeof uAns === 'object' && !Array.isArray(uAns)) {
          const answerRecord = q.answer as Record<string, "Yes" | "No">;
          const userRecord = uAns as Record<string, string>;
          return Object.entries(answerRecord).every(([key, val]) => userRecord[key] === val);
      }
    } else if (q.type === 'case_table') {
      if ('statements' in q && Array.isArray(q.statements) && typeof uAns === 'object' && !Array.isArray(uAns)) {
           const userRecord = uAns as Record<string, string>;
           return q.statements.every((st, idx) => userRecord[idx] === st.answer);
      }
    } else if (q.type === 'drag_drop') {
       if (Array.isArray(q.answer)) {
           return Array.isArray(uAns) && q.answer.length === uAns.length && q.answer.every((val) => (uAns as string[]).includes(val));
       } else if ('answer_mapping' in q && q.answer_mapping && typeof uAns === 'object' && !Array.isArray(uAns)) {
           const userRecord = uAns as Record<string, string>;
           return Object.entries(q.answer_mapping).every(([zone, item]) => userRecord[zone] === item);
       }
    }
    return false;
  }, []);

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
  }, [questions, engine.userAnswers, checkAnswer]);

  return {
    questions,
    loading,
    ...engine,
    calculateScore,
    mode,
    setMode
  };
}
