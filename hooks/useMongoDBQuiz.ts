
import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';

export type QuizMode = 'practice' | 'exam';

import { QuizQuestion, AWSQuestion } from "@/types";

interface UseMongoDBQuizProps {
  initialMode?: QuizMode;
  countParam?: string | null;
}

import { fetchMongoDBQuestions } from "@/app/actions/quiz";

export function useMongoDBQuiz({ initialMode = 'practice', countParam = null }: UseMongoDBQuizProps = {}) {
  const { data: questions = [], isLoading: loading } = useQuery({
    queryKey: ['mongodb-quiz', initialMode, countParam],
    queryFn: async () => {
      // Pass countParam to actions to correctly slice questions
      return await fetchMongoDBQuestions(initialMode, countParam);
    },
    staleTime: 1000 * 60 * 30, // 30 mins
    refetchOnWindowFocus: false,
  });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string | number, string[]>>({}); // MongoDB ID might be number but handled as generic
  const [markedQuestions, setMarkedQuestions] = useState<(string | number)[]>([]);
  const [mode, setMode] = useState<QuizMode>(initialMode);
  const [timeRemaining, setTimeRemaining] = useState(90 * 60); // 90 minutes
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Timer Logic
  useEffect(() => {
    if (mode === 'exam' && !isSubmitted && !loading && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [mode, isSubmitted, loading, timeRemaining]);

  // Actions
  const handleAnswer = useCallback((questionId: string | number, option: string, isMulti: boolean) => {
    if (isSubmitted) return;

    setUserAnswers((prev) => {
      const currentAnswers = prev[questionId] || [];
      if (isMulti) {
        if (currentAnswers.includes(option)) {
          return { ...prev, [questionId]: currentAnswers.filter((a) => a !== option) };
        } else {
          return { ...prev, [questionId]: [...currentAnswers, option] };
        }
      } else {
        return { ...prev, [questionId]: [option] };
      }
    }); 
  }, [isSubmitted]);

  const toggleMark = useCallback((questionId: string | number) => {
    setMarkedQuestions((prev) => 
      prev.includes(questionId) ? prev.filter((id) => id !== questionId) : [...prev, questionId]
    );
  }, []);

  const nextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  }, [currentQuestionIndex, questions.length]);

  const prevQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  }, [currentQuestionIndex]);

  const handleSubmit = useCallback(() => {
    setIsSubmitted(true);
  }, []);

  // Scoring Helper
  const checkAnswer = (q: QuizQuestion, answers: string[] = []) => {
    if (!answers || answers.length === 0) return false;
    
    // Check if q.answer is array or string.
    let correctAnswers: string[] = [];
    if (Array.isArray(q.answer)) {
        correctAnswers = q.answer as string[];
    } else if (typeof q.answer === 'string') {
        correctAnswers = [q.answer];
    } else {
        // Fallback for object/weird formats if any, though normalizing catches most
        return false;
    }

    // Sort to compare regardless of order
    const sortedUser = [...answers].sort();
    const sortedCorrect = [...correctAnswers].sort();
    
    // For single string joined answer (AWS legacy), we might have issues if we changed normalizing logic.
    // My normalizing change ensures `newQ.answer = mappedAnswers` (array) for multiple choice.
    // If it was a single string, standard string comparison works.
    
    // However, let's look at `hooks/useAWSQuiz.ts` line 88 checkAnswer. 
    // It sorts and joins user answers, then compares to q.answer string.
    // For MongoDB, I set `newQ.answer` to array if multiple.
    
    // Let's make this robust.
    if (sortedUser.length !== sortedCorrect.length) return false;
    return sortedUser.every((val, index) => val === sortedCorrect[index]);
  };

  const calculateScore = () => {
    let correct = 0;
    let attempted = 0;
    
    questions.forEach(q => {
        if (userAnswers[q.id]?.length > 0) attempted++;
        if (checkAnswer(q, userAnswers[q.id])) correct++;
    });

    return {
        correct,
        attempted,
        wrong: attempted - correct,
        skipped: questions.length - attempted,
        percentage: attempted > 0 ? ((correct / attempted) * 100).toFixed(1) : "0.0",
        passed: attempted > 0 && (correct / attempted) >= 0.7
    };
  };

  return {
    questions,
    loading,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    userAnswers,
    markedQuestions,
    handleAnswer,
    toggleMark,
    nextQuestion,
    prevQuestion,
    handleSubmit,
    timeRemaining,
    isSubmitted,
    checkAnswer,
    calculateScore,
    mode
  };
}
