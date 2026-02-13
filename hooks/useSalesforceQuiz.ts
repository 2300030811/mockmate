import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { QuizMode, QuizQuestion } from "@/types";
import { fetchSalesforceQuestions } from "@/app/actions/quiz";
import { useQuizEngine, UserAnswer } from "./useQuizEngine";
import { getSessionId, getStoredNickname } from "@/utils/session";
import { saveQuizResult } from "@/app/actions/results";

interface UseSalesforceQuizProps {
  initialMode?: QuizMode;
  count?: string | null;
}

export function useSalesforceQuiz({ initialMode = 'practice', count = null }: UseSalesforceQuizProps = {}) {
  const [mode, setMode] = useState<QuizMode>(initialMode);

  const { data: questions = [], isLoading: loading } = useQuery<QuizQuestion[]>({
    queryKey: ['salesforce-quiz', initialMode, count],
    queryFn: async () => {
      // Fetch questions using server action
      return await fetchSalesforceQuestions(initialMode, count) as unknown as QuizQuestion[];
    },
    staleTime: 1000 * 60 * 30, // 30 mins
    refetchOnWindowFocus: false,
  });

  const engine = useQuizEngine({
      questions,
      mode,
      category: 'salesforce',
      initialTimeRemaining: 90 * 60,
      onSubmit: () => {
        if (mode === 'exam') {
          const scoreData = calculateScore();
          saveQuizResult({
            sessionId: getSessionId(),
            category: 'salesforce',
            score: scoreData.correct,
            totalQuestions: questions.length,
            nickname: getStoredNickname() || undefined
          });
        }
      }
  });

  const handleAnswer = useCallback((questionId: number | string, option: string, isMulti: boolean) => {
    if (engine.isSubmitted) return;

    // Ensure ID is number for state key if possible, but keep string compatibility
    const qId = Number(questionId);

    engine.setUserAnswers((prev) => {
      const currentAnswers = (prev[qId] as string[]) || [];
      if (isMulti) {
        if (currentAnswers.includes(option)) {
          return { ...prev, [qId]: currentAnswers.filter((a: string) => a !== option) };
        } else {
          return { ...prev, [qId]: [...currentAnswers, option] };
        }
      } else {
        // Single selection logic
        return { ...prev, [qId]: [option] };
      }
    });
  }, [engine.isSubmitted, engine.setUserAnswers]);

  // Check Answer Logic
  const checkAnswer = (q: QuizQuestion, answers: UserAnswer = []) => {
    // Cast to string array as SF quiz uses only strings
    const answerArray = Array.isArray(answers) ? answers as string[] : [];
    
    if (!answerArray || answerArray.length === 0) return false;
    
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
    if (answerArray.length === 1 && typeof q.answer === 'string') {
        return answerArray[0] === correctAnswerStr;
    }

    // For multi choice
    const sortedUserAnswers = [...answerArray].sort().join("");
    return sortedUserAnswers === correctAnswerStr;
  };

  const calculateScore = () => {
    let correct = 0;
    let attempted = 0;
    
    questions.forEach((q) => {
        const qId = Number(q.id);
        const answers = engine.userAnswers[qId];
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
    userAnswers: engine.userAnswers as Record<number, string[]>,
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

