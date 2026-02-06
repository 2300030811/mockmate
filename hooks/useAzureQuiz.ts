"use client";

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { QuizQuestion } from "@/lib/azure-quiz-service";

export type QuizMode = 'practice' | 'exam' | 'review';

interface UseAzureQuizProps {
  initialMode?: QuizMode;
}

export function useAzureQuiz({ initialMode = 'practice' }: UseAzureQuizProps = {}) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, any>>({});
  const [mode, setMode] = useState<QuizMode>(initialMode);
  const [timeRemaining, setTimeRemaining] = useState(45 * 60); // 45 minutes for exam
  const [isSubmitted, setIsSubmitted] = useState(false);

  // React Query for caching raw data
  const { data: rawQuestions, isLoading: isFetching } = useQuery({
    queryKey: ['azure-questions-raw'],
    queryFn: async () => {
      const { fetchAzureQuestionsAction } = await import("@/app/actions/quiz");
      return await fetchAzureQuestionsAction();
    },
    staleTime: 1000 * 60 * 60, // Cache raw questions for 1 hour
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!rawQuestions) return;

    setLoading(true);
    if (initialMode === 'exam') {
      const shuffled = [...rawQuestions].sort(() => 0.5 - Math.random());
      setQuestions(shuffled.slice(0, 40));
    } else {
      setQuestions(rawQuestions);
    }
    setLoading(false);
  }, [rawQuestions, initialMode]);

  // Sync loading state combining query and processing
  useEffect(() => {
     // If fetching logic changes, ensure loading reflects that
     if (isFetching && questions.length === 0) {
         setLoading(true);
     }
  }, [isFetching, questions.length]);

  useEffect(() => {
    if (mode === 'exam' && !isSubmitted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeRemaining === 0 && mode === 'exam' && !isSubmitted) {
      handleSubmitExam();
    }
  }, [mode, timeRemaining, isSubmitted]);

  const handleAnswer = (questionId: number, answer: any) => {
    if (isSubmitted && mode !== 'practice') return; // Prevent changing after submit in exam
    // In practice mode, we might allow changing, but usually we show feedback immediately. 
    // Let's store the answer.
    setUserAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmitExam = () => {
    setIsSubmitted(true);
    setMode('review');
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q) => {
      const uAns = userAnswers[q.id];
      if (!uAns) return;

      if (q.type === 'mcq') {
        if (uAns === q.answer) score++;
      } else if (q.type === 'hotspot') {
        // Exact match of object
        // q.answer is { Box1: "Yes", ... }
        // uAns should be { Box1: "Yes", ... }
        const isCorrect = Object.entries(q.answer).every(([key, val]) => uAns[key] === val);
        if (isCorrect) score++;
      } else if (q.type === 'case_table') {
        // q.statements: [{text, answer}, ...]
        // uAns: { 0: "Yes", 1: "No" } or something similar mapping index to answer
        // Actually for case_table, we'll probably store it as an object or array locally.
        // Let's assume uAns is an array or object matching indices.
        // Check logic later in component. For now default score update.
        // Simple scoring: All Correct = 1 point? Or partial?
        // Usually AZ-900 is 1 point per correct sub-item or 1 point per question. 
        // Let's assume 1 point per question for simplicity unless specified.
        // For Case Study, usually it's "Each correct selection is worth one point" in real exams.
        // But let's stick to Question = 1 Point for general scoring to keep it simple first.
        
        // Let's assume "Correct" if ALL match for now.
        const allMatch = q.statements.every((st: any, idx: number) => {
            // we need to know how we store the answer. 
            // In component we will store { [idx]: "Yes"|"No" }
            return uAns[idx] === st.answer;
        });
        if (allMatch) score++;
      } else if (q.type === 'drag_drop') {
         // Complex matching
         // Format A (Multi-select): answer is array. uAns is array.
         if (Array.isArray(q.answer)) {
             // Check if arrays have same elements
             if (Array.isArray(uAns) && 
                 q.answer.length === uAns.length && 
                 q.answer.every(val => uAns.includes(val))) {
                 score++;
             }
         } else if (q.answer_mapping) {
             // Format B (Matching): answer_mapping { "Zone": "Item" }
             // uAns { "Zone": "Item" }
             const isCorrect = Object.entries(q.answer_mapping).every(([zone, item]) => uAns[zone] === item);
             if (isCorrect) score++;
         }
      }
    });
    return score;
  };

  return {
    questions,
    loading,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    userAnswers,
    handleAnswer,
    nextQuestion,
    prevQuestion,
    timeRemaining,
    handleSubmitExam,
    isSubmitted,
    score: calculateScore(),
    mode,
    setMode
  };
}
