import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { QuizMode, QuizQuestion } from "@/types";
import { fetchMongoDBQuestions } from "@/app/actions/quiz";
import { useQuizEngine, UserAnswer } from "./useQuizEngine";

interface UseMongoDBQuizProps {
  initialMode?: QuizMode;
  countParam?: string | null;
}

export function useMongoDBQuiz({ initialMode = 'practice', countParam = null }: UseMongoDBQuizProps = {}) {
  const [mode, setMode] = useState<QuizMode>(initialMode);

  const { data: questions = [], isLoading: loading } = useQuery<QuizQuestion[]>({
    queryKey: ['mongodb-quiz', initialMode, countParam],
    queryFn: async () => {
      // Pass countParam to actions to correctly slice questions
      return await fetchMongoDBQuestions(initialMode, countParam) as unknown as QuizQuestion[];
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
        return { ...prev, [questionId]: [option] };
      }
    }); 
  }, [engine.isSubmitted, engine.setUserAnswers]);

  // Scoring Helper
  const checkAnswer = (q: QuizQuestion, answers: UserAnswer = []) => {
    const answerArray = Array.isArray(answers) ? answers as string[] : [];
    
    if (!answerArray || answerArray.length === 0) return false;
    
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
    const sortedUser = [...answerArray].sort();
    const sortedCorrect = [...correctAnswers].sort();
    
    if (sortedUser.length !== sortedCorrect.length) return false;
    return sortedUser.every((val, index) => val === sortedCorrect[index]);
  };

  const calculateScore = () => {
    let correct = 0;
    let attempted = 0;
    
    questions.forEach((q) => {
        const answers = engine.userAnswers[q.id];
        // Check if answers is present and is non-empty array
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
        passed: attempted > 0 && (correct / attempted) >= 0.7
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
    mode,
    clearProgress: engine.clearProgress
  };
}

