import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';

export type QuizMode = 'practice' | 'exam';

export interface AWSQuestion {
  id: number;
  question: string;
  options: string[];
  answer?: string;
  explanation?: string;
}

interface UseAWSQuizProps {
  initialMode?: QuizMode;
}

export function useAWSQuiz({ initialMode = 'practice' }: UseAWSQuizProps = {}) {
  const { data: questions = [], isLoading: loading } = useQuery({
    queryKey: ['aws-quiz', initialMode],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/quiz/aws?mode=${initialMode}`);
        if (!res.ok) {
           throw new Error(`Failed to fetch questions: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Quiz Fetch Error:", error);
        // Fallback or re-throw based on preference. For now returning empty array so app doesn't crash.
        // Queries usually handle errors by state, so re-throwing is better for useQuery's `isError`
        throw error;
      }
    },
    staleTime: 1000 * 60 * 30, // 30 mins
    refetchOnWindowFocus: false,
  });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string[]>>({});
  const [markedQuestions, setMarkedQuestions] = useState<number[]>([]);
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
  const handleAnswer = useCallback((questionId: number, option: string, isMulti: boolean) => {
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

  const toggleMark = useCallback((questionId: number) => {
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
  const checkAnswer = (q: AWSQuestion, answers: string[] = []) => {
    if (!answers || answers.length === 0) return false;
    // Sort and join to compare with answer string
    // Assuming q.answer is exact string like "OptionAOptionB" or single "OptionA"
    // We need to match the logic from the original file
    const sortedUserAnswers = [...answers].sort((a, b) => {
      return q.options.indexOf(a) - q.options.indexOf(b);
    });
    const combinedUserAnswer = sortedUserAnswers.join("");
    return combinedUserAnswer === q.answer;
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
