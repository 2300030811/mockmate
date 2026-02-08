import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { QuizMode, AWSQuestion } from "@/types";
import { fetchAWSQuestions } from "@/app/actions/quiz";
import { useQuizEngine, UserAnswer } from "./useQuizEngine";

interface UseAWSQuizProps {
  initialMode?: QuizMode;
}

export function useAWSQuiz({ initialMode = 'practice' }: UseAWSQuizProps = {}) {
  const [mode, setMode] = useState<QuizMode>(initialMode);

  const { data: questions = [], isLoading: loading } = useQuery<AWSQuestion[]>({
    queryKey: ['aws-quiz', initialMode],
    queryFn: async () => {
      // Cast the result to AWSQuestion[] as we know the fetch returns that structure for AWS
      return (await fetchAWSQuestions(initialMode, null)) as unknown as AWSQuestion[];
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

  // Custom Answer Handler for AWS (Multi-select logic)
  const handleAnswer = useCallback((questionId: number, option: string, isMulti: boolean) => {
    // Prevent answering if submitted
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
  const checkAnswer = (q: AWSQuestion, answers: UserAnswer = []) => {
    // Type guard: AWS answers should be string arrays
    const answerArray = Array.isArray(answers) ? answers as string[] : [];
    
    if (!answerArray || answerArray.length === 0) return false;
    
    // Sort and join to compare with answer string
    // Assuming q.answer is exact string like "OptionAOptionB" or single "OptionA"
    const sortedUserAnswers = [...answerArray].sort((a, b) => {
      return q.options.indexOf(a) - q.options.indexOf(b);
    });
    const combinedUserAnswer = sortedUserAnswers.join("");
    return combinedUserAnswer === q.answer;
  };

  const calculateScore = () => {
    let correct = 0;
    let attempted = 0;
    
    questions.forEach((q) => {
        const answers = engine.userAnswers[q.id];
        // Check if answers is not undefined and is an array with length > 0
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
    userAnswers: engine.userAnswers as Record<string | number, string[]>, // Cast for consumer convenience
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
    mode
  };
}

