import { useEffect } from "react";

interface KeyboardShortcutsOptions {
    currentQuestionIndex: number;
    totalQuestions: number;
    viewingResults: boolean;
    showConfirm: boolean;
    prevQuestion: () => void;
    nextQuestion: () => void;
    onSubmit: () => void;
}

export function useQuizKeyboardShortcuts({
    currentQuestionIndex,
    totalQuestions,
    viewingResults,
    showConfirm,
    prevQuestion,
    nextQuestion,
    onSubmit,
}: KeyboardShortcutsOptions) {
    useEffect(() => {
        if (viewingResults || showConfirm) return;

        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            // Don't trigger if user is typing in inputs or textareas
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            switch (e.key) {
                case 'ArrowLeft':
                    if (currentQuestionIndex > 0) prevQuestion();
                    break;
                case 'ArrowRight':
                    if (currentQuestionIndex < totalQuestions - 1) nextQuestion();
                    break;
                case 'Enter':
                    if (currentQuestionIndex < totalQuestions - 1) {
                        nextQuestion();
                    } else {
                        onSubmit();
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [currentQuestionIndex, totalQuestions, viewingResults, showConfirm, prevQuestion, nextQuestion, onSubmit]);
}
