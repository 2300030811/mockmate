import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { QuizQuestion, QuizMode } from "@/types";
import { fetchPCAPQuestions } from "@/app/actions/quiz";
import { useQuizEngine, UserAnswer } from "./useQuizEngine";

interface UsePCAPQuizProps {
  initialMode?: QuizMode;
  countParam?: string | null;
}

export function usePCAPQuiz({ initialMode = 'practice', countParam = null }: UsePCAPQuizProps = {}) {
  const [mode, setMode] = useState<QuizMode>(initialMode);

  const { data: questions = [], isLoading: loading } = useQuery<QuizQuestion[]>({
    queryKey: ['pcap-quiz', initialMode, countParam],
    queryFn: async () => {
      return await fetchPCAPQuestions(initialMode, countParam) as unknown as QuizQuestion[];
    },
    staleTime: 1000 * 60 * 30, // 30 mins
    refetchOnWindowFocus: false,
  });

  const engine = useQuizEngine({
      questions,
      mode,
      initialTimeRemaining: 90 * 60,
      onSubmit: () => {
          // Optional callback if needed when timer expires
      }
  });

  const handleAnswer = useCallback((questionId: string | number, option: string, isMulti: boolean) => {
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
        // If single choice, replace any existing answer
        return { ...prev, [questionId]: [option] };
      }
    }); 
  }, [engine.isSubmitted, engine.setUserAnswers]);

  const checkAnswer = useCallback((q: QuizQuestion, userAns: UserAnswer = []) => {
      const answerArray = Array.isArray(userAns) ? userAns as string[] : [];

      if (!answerArray || answerArray.length === 0) return false;

      let correctAnswers: string[] = [];
      if (Array.isArray(q.answer)) {
          correctAnswers = q.answer as string[];
      } else if (typeof q.answer === 'string') {
          correctAnswers = [q.answer];
      } else {
          return false;
      }

      const sortedUser = [...answerArray].sort();
      const sortedCorrect = [...correctAnswers].sort();

      if (sortedUser.length !== sortedCorrect.length) return false;
      return sortedUser.every((val, index) => val === sortedCorrect[index]);
  }, []);

  const calculateScore = useCallback(() => {
    let correct = 0;
    let attempted = 0;
    
    questions.forEach((q) => {
        const uAns = engine.userAnswers[q.id];
        // Check if answers is present and is non-empty array
        if (uAns && Array.isArray(uAns) && uAns.length > 0) {
            attempted++;
            if (checkAnswer(q, uAns)) {
                correct++;
            }
        }
    });

    const total = questions.length;
    // Avoid division by zero
    const percentage = total > 0 ? (correct / total) * 100 : 0;
    
    // Scaled score if needed, but percentages are clearer
    // const score = (correct / total) * 1000; 

    return {
        correct,
        attempted,
        wrong: attempted - correct,
        skipped: total - attempted,
        percentage: percentage.toFixed(1),
        passed: percentage >= 70, // 70% passing
        totalQuestions: total
    };
  }, [questions, engine.userAnswers, checkAnswer]);

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
    mode,
    clearProgress: engine.clearProgress
  };
}

