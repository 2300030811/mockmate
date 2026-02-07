import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { QuizQuestion, QuizMode } from "@/types";
import { fetchPCAPQuestions } from "@/app/actions/quiz";

interface UsePCAPQuizProps {
  initialMode?: QuizMode;
  countParam?: string | null;
}

export function usePCAPQuiz({ initialMode = 'practice', countParam = null }: UsePCAPQuizProps = {}) {
  const { data: questions = [], isLoading: loading } = useQuery({
    queryKey: ['pcap-quiz', initialMode, countParam],
    queryFn: async () => {
      return await fetchPCAPQuestions(initialMode, countParam);
    },
    staleTime: 1000 * 60 * 30, // 30 mins
    refetchOnWindowFocus: false,
  });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string | number, string[]>>({});
  const [markedQuestions, setMarkedQuestions] = useState<(string | number)[]>([]);
  const [mode, setMode] = useState<QuizMode>(initialMode);
  const [timeRemaining, setTimeRemaining] = useState(90 * 60); // 90 minutes standard
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Timer Logic
  useEffect(() => {
    if (mode === 'exam' && !isSubmitted && !loading && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSubmit(); // Auto submit
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
        // If single choice, replace any existing answer
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

  const checkAnswer = useCallback((q: QuizQuestion, userAns: string[]) => {
      if (!userAns || userAns.length === 0) return false;

      let correctAnswers: string[] = [];
      if (Array.isArray(q.answer)) {
          correctAnswers = q.answer as string[];
      } else if (typeof q.answer === 'string') {
          correctAnswers = [q.answer];
      } else {
          return false;
      }

      const sortedUser = [...userAns].sort();
      const sortedCorrect = [...correctAnswers].sort();

      if (sortedUser.length !== sortedCorrect.length) return false;
      return sortedUser.every((val, index) => val === sortedCorrect[index]);
  }, []);

  const calculateScore = useCallback(() => {
    let correct = 0;
    let attempted = 0;
    
    questions.forEach(q => {
        const uAns = userAnswers[q.id];
        if (uAns && uAns.length > 0) {
            attempted++;
            if (checkAnswer(q, uAns)) {
                correct++;
            }
        }
    });

    const total = questions.length;
    const score = (correct / total) * 1000; // Scaled score (e.g. out of 1000 like some exams)
    const percentage = total > 0 ? (correct / total) * 100 : 0;

    return {
        correct,
        attempted,
        wrong: attempted - correct,
        skipped: total - attempted,
        percentage: percentage.toFixed(1),
        passed: percentage >= 70, // 70% passing
        totalQuestions: total
    };
  }, [questions, userAnswers, checkAnswer]);

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
