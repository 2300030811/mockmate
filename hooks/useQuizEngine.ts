import { useState, useCallback, useEffect, useRef } from "react";
import { QuizMode } from "@/types";

// Define a union type for possible user answers based on supported question types
export type UserAnswer = 
  | string 
  | string[] 
  | Record<string, string> 
  | boolean 
  | number;

interface UseQuizEngineProps<T> {
  questions: T[];
  mode: QuizMode;
  category: string; // New: To make the persistence key unique across categories
  initialTimeRemaining?: number; // seconds
  onSubmit?: (userAnswers: Record<string | number, UserAnswer>) => void;
}

export function useQuizEngine<T extends { id: string | number }>({
  questions,
  mode,
  category,
  initialTimeRemaining = 90 * 60,
  onSubmit
}: UseQuizEngineProps<T>) {
  // State
  // Initialize state lazy-loading from localStorage if available
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string | number, UserAnswer>>({});
  const [markedQuestions, setMarkedQuestions] = useState<(string | number)[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(initialTimeRemaining);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);

  // Persistence Key uses category, mode and first question ID for uniqueness
  const firstId = questions.length > 0 ? questions[0].id : 'empty';
  const PERSISTENCE_KEY = `quiz_progress_${category}_${mode}_${firstId}`;

  // Load state on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && questions.length > 0) {
      const saved = localStorage.getItem(PERSISTENCE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Only restore if valid index
          if (parsed.currentQuestionIndex < questions.length) {
              setCurrentQuestionIndex(parsed.currentQuestionIndex ?? 0);
          }
          setUserAnswers(parsed.userAnswers ?? {});
          setMarkedQuestions(parsed.markedQuestions ?? []);
          
          // Only restore timer if not expired
          if (parsed.timeRemaining > 0) {
              setTimeRemaining(parsed.timeRemaining);
          }
          
          setIsSubmitted(parsed.isSubmitted ?? false);
        } catch (e: unknown) {
          console.error("Failed to parse saved quiz state", e);
        }
      }
      setHasHydrated(true);
    }
  }, [questions.length, mode, initialTimeRemaining, PERSISTENCE_KEY]);

  // Save state on change (debounced to avoid excessive writes during timer countdown)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!hasHydrated || questions.length === 0) return;

    if (!isSubmitted) {
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
            const stateToSave = {
                currentQuestionIndex,
                userAnswers,
                markedQuestions,
                timeRemaining,
                isSubmitted
            };
            localStorage.setItem(PERSISTENCE_KEY, JSON.stringify(stateToSave));
        }, 2000); // Debounce: save at most once per 2 seconds
    }

    return () => {
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [currentQuestionIndex, userAnswers, markedQuestions, timeRemaining, isSubmitted, hasHydrated, questions.length, PERSISTENCE_KEY]);

  const clearProgress = useCallback(() => {
      localStorage.removeItem(PERSISTENCE_KEY);
      // Reset state
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setMarkedQuestions([]);
      setTimeRemaining(initialTimeRemaining);
      setIsSubmitted(false);
  }, [PERSISTENCE_KEY, initialTimeRemaining]);

  // Handle Submit wrapper to clear local storage if desired, or keep it for result view
  const handleSubmitInternal = useCallback(() => {
     setIsSubmitted(true);
     // We keep the state in localStorage even after submit so results persist on refresh.
     // If user wants to "Retake", they should call clearProgress.
     if (onSubmit) onSubmit(userAnswers);
  }, [onSubmit, userAnswers]);

  const handleSubmit = useCallback(() => {
    // Only submit if not already submitted
    if (!isSubmitted) {
        handleSubmitInternal();
    }
  }, [isSubmitted, handleSubmitInternal]);

  // Timer
  useEffect(() => {
    if (mode === 'exam' && !isSubmitted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Use function reference to avoid stale closure
            handleSubmitInternal(); 
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [mode, isSubmitted, timeRemaining, handleSubmitInternal]);

  // Navigation
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
  
  const jumpToQuestion = useCallback((index: number) => {
      if (index >= 0 && index < questions.length) {
          setCurrentQuestionIndex(index);
      }
  }, [questions.length]);

  // Actions
  const handleAnswer = useCallback((questionId: string | number, answer: UserAnswer) => {
    if (isSubmitted && mode === 'exam') return; 
    
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answer
    }));
  }, [isSubmitted, mode]);

  const toggleMark = useCallback((questionId: string | number) => {
    setMarkedQuestions((prev) => 
      prev.includes(questionId) ? prev.filter((id) => id !== questionId) : [...prev, questionId]
    );
  }, []);

  return {
    currentQuestionIndex,
    setCurrentQuestionIndex,
    userAnswers,
    setUserAnswers,
    markedQuestions,
    timeRemaining,
    isSubmitted,
    handleAnswer,
    toggleMark,
    nextQuestion,
    prevQuestion,
    jumpToQuestion,
    handleSubmit,
    clearProgress
  };
}

