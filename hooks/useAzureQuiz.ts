import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { QuizQuestion } from "@/types";
import { fetchAzureQuestionsAction } from "@/app/actions/quiz";
import { useQuizEngine, UserAnswer } from "./useQuizEngine";

export type QuizMode = 'practice' | 'exam' | 'review';

interface UseAzureQuizProps {
  initialMode?: QuizMode;
}

export function useAzureQuiz({ initialMode = 'practice' }: UseAzureQuizProps = {}) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<QuizMode>(initialMode);

  // React Query for caching raw data
  const { data: rawQuestions, isLoading: isFetching } = useQuery({
    queryKey: ['azure-questions-raw'],
    queryFn: async () => {
      // Use imported action directly
      return await fetchAzureQuestionsAction();
    },
    staleTime: 1000 * 60 * 60, // Cache raw questions for 1 hour
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!rawQuestions) return;

    setLoading(true);
    let loadedQuestions = rawQuestions;
    if (initialMode === 'exam') {
      const shuffled = [...rawQuestions].sort(() => 0.5 - Math.random());
      loadedQuestions = shuffled.slice(0, 40);
    }
    setQuestions(loadedQuestions as QuizQuestion[]);
    setLoading(false);
  }, [rawQuestions, initialMode]);

  // Sync loading state
  useEffect(() => {
     if (isFetching && questions.length === 0) {
         setLoading(true);
     }
  }, [isFetching, questions.length]);

  const engine = useQuizEngine({
      questions,
      mode: mode === 'review' ? 'practice' : (mode as 'practice' | 'exam'), // Map review to practice for engine mechanics (no timer kill)
      initialTimeRemaining: 45 * 60,
      onSubmit: () => {
          setMode('review');
      }
  });

  const handleAnswer = (questionId: string | number, answer: UserAnswer) => {
    if (engine.isSubmitted && mode !== 'practice') return; 
    
    // In Azure quiz, answer structure varies by type (string, object, array)
    engine.handleAnswer(questionId, answer);
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q) => {
      const uAns = engine.userAnswers[q.id];
      if (uAns === undefined) return;

      if (q.type === 'mcq') {
        if (typeof uAns === 'string' && uAns === q.answer) score++;
        // Handle MSQ if applicable for 'mcq' type
        if (Array.isArray(uAns) && Array.isArray(q.answer)) {
            // simplistic array compare
             if (uAns.length === q.answer.length && uAns.every(v => (q.answer as string[]).includes(v))) {
                 score++;
             }
        }
      } else if (q.type === 'hotspot') {
        if (typeof q.answer === 'object' && q.answer !== null && uAns && typeof uAns === 'object' && !Array.isArray(uAns)) {
            const answerRecord = q.answer as Record<string, "Yes" | "No">;
            const userRecord = uAns as Record<string, string>;
            const isCorrect = Object.entries(answerRecord).every(([key, val]) => userRecord[key] === val);
            if (isCorrect) score++;
        }
      } else if (q.type === 'case_table') {
        if (Array.isArray(q.statements) && typeof uAns === 'object' && !Array.isArray(uAns)) {
             const userRecord = uAns as Record<string, string>;
             // userRecord keys might be indices
            const allMatch = q.statements.every((st, idx) => {
                return userRecord[idx] === st.answer;
            });
            if (allMatch) score++;
        }
      } else if (q.type === 'drag_drop') {
         if (Array.isArray(q.answer)) {
             if (Array.isArray(uAns) && 
                 q.answer.length === uAns.length && 
                 q.answer.every((val) => (uAns as string[]).includes(val))) {
                 score++;
             }
         } else if (q.answer_mapping && typeof uAns === 'object' && !Array.isArray(uAns)) {
             const userRecord = uAns as Record<string, string>;
             const isCorrect = Object.entries(q.answer_mapping).every(([zone, item]) => userRecord[zone] === item);
             if (isCorrect) score++;
         }
      }
    });
    return score;
  };

  return {
    questions,
    loading,
    currentQuestionIndex: engine.currentQuestionIndex,
    setCurrentQuestionIndex: engine.setCurrentQuestionIndex,
    userAnswers: engine.userAnswers,
    handleAnswer,
    nextQuestion: engine.nextQuestion,
    prevQuestion: engine.prevQuestion,
    timeRemaining: engine.timeRemaining,
    handleSubmitExam: engine.handleSubmit,
    isSubmitted: engine.isSubmitted,
    score: calculateScore(),
    mode,
    setMode,
    clearProgress: engine.clearProgress
  };
}

