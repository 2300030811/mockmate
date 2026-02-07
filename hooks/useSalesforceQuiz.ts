
import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { QuizMode, QuizQuestion } from "@/types";
import { fetchSalesforceQuestions } from "@/app/actions/quiz";

interface UseSalesforceQuizProps {
  initialMode?: QuizMode;
  count?: string | null;
}

export function useSalesforceQuiz({ initialMode = 'practice', count = null }: UseSalesforceQuizProps = {}) {
  const { data: questions = [], isLoading: loading } = useQuery({
    queryKey: ['salesforce-quiz', initialMode, count],
    queryFn: async () => {
      // Fetch questions using server action
      return await fetchSalesforceQuestions(initialMode, count);
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
  const handleAnswer = useCallback((questionId: number | string, option: string, isMulti: boolean) => {
    if (isSubmitted) return;

    // Ensure ID is number for state key if possible, but keep string compatibility
    const qId = Number(questionId);

    setUserAnswers((prev) => {
      const currentAnswers = prev[qId] || [];
      if (isMulti) {
        if (currentAnswers.includes(option)) {
          return { ...prev, [qId]: currentAnswers.filter((a) => a !== option) };
        } else {
          return { ...prev, [qId]: [...currentAnswers, option] };
        }
      } else {
        // Single selection logic
        return { ...prev, [qId]: [option] };
      }
    });
  }, [isSubmitted]);

  const toggleMark = useCallback((questionId: number | string) => {
    const qId = Number(questionId);
    setMarkedQuestions((prev) => 
      prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId]
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

  // Check Answer Logic
  const checkAnswer = (q: QuizQuestion, answers: string[] = []) => {
    if (!answers || answers.length === 0) return false;
    
    // Sort and join to compare with answer string
    // Assuming q.answer is exact string or parsed to be one
    if (!q.answer) return false;

    // Handle string or object answer
    let correctAnswerStr = "";
    if (typeof q.answer === 'string') {
        correctAnswerStr = q.answer;
    } else if (Array.isArray(q.answer)) {
        // Sort correct answers to match user's sorted answers
        correctAnswerStr = [...q.answer].sort().join("");
    }
    
    // For single choice, simple comparison
    if (answers.length === 1 && typeof q.answer === 'string') {
        return answers[0] === correctAnswerStr;
    }

    // For multi choice
    const sortedUserAnswers = [...answers].sort().join("");
    return sortedUserAnswers === correctAnswerStr;
  };

  const calculateScore = () => {
    let correct = 0;
    let attempted = 0;
    
    questions.forEach(q => {
        const qId = Number(q.id);
        if (userAnswers[qId]?.length > 0) attempted++;
        if (checkAnswer(q, userAnswers[qId])) correct++;
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
