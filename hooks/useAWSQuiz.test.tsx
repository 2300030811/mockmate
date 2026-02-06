
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAWSQuiz } from './useAWSQuiz';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect } from 'vitest';
import React from 'react';

// Mock the server action
const { fetchQuestionsMock } = vi.hoisted(() => ({
    fetchQuestionsMock: vi.fn()
}));

vi.mock('@/app/actions/quiz', () => ({
    fetchAWSQuestions: fetchQuestionsMock
}));

// Query Client Wrapper
const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } }
    });
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
};

describe('useAWSQuiz', () => {
    it('should fetch questions and initialize', async () => {
        const mockQuestions = [
            { id: 1, question: 'Q1', options: ['A', 'B'], answer: 'A', explanation: 'exp' }
        ];
        fetchQuestionsMock.mockResolvedValue(mockQuestions);

        const { result } = renderHook(() => useAWSQuiz(), { wrapper: createWrapper() });

        // Initially loading
        expect(result.current.loading).toBe(true);

        // Wait for data
        await waitFor(() => expect(result.current.questions).toEqual(mockQuestions));
        expect(result.current.loading).toBe(false);
    });

    it('should handle answering', async () => {
       const mockQuestions = [
            { id: 1, question: 'Q1', options: ['A', 'B'], answer: 'A', explanation: 'exp' }
       ];
       fetchQuestionsMock.mockResolvedValue(mockQuestions);
       
       const { result } = renderHook(() => useAWSQuiz(), { wrapper: createWrapper() });
       await waitFor(() => expect(result.current.loading).toBe(false));

       act(() => {
           result.current.handleAnswer(1, 'A', false);
       });

       expect(result.current.userAnswers[1]).toEqual(['A']);
    });

    it('should calculate score correctly', async () => {
        const mockQuestions = [
             { id: 1, question: 'Q1', options: ['A', 'B'], answer: 'A', explanation: 'exp' },
             { id: 2, question: 'Q2', options: ['X', 'Y'], answer: 'X', explanation: 'exp' }
        ];
        fetchQuestionsMock.mockResolvedValue(mockQuestions);
        
        const { result } = renderHook(() => useAWSQuiz(), { wrapper: createWrapper() });
        await waitFor(() => expect(result.current.loading).toBe(false));
 
        act(() => {
            // Correct answer
            result.current.handleAnswer(1, 'A', false);
            // Wrong answer
            result.current.handleAnswer(2, 'Y', false);
        });
 
        const score = result.current.calculateScore();
        expect(score.correct).toBe(1);
        expect(score.wrong).toBe(1);
        expect(score.attempted).toBe(2);
     });
});
