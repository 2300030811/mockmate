
import { describe, it, expect } from 'vitest';
import { findBestMatch, sanitizeQuizQuestions } from './quiz-cleanup';

describe('Quiz Cleanup Logic', () => {
    describe('findBestMatch', () => {
        const options = ['Option A', 'Option B', 'Option C'];

        it('should find exact match', () => {
            expect(findBestMatch(options, 'Option A')).toBe('Option A');
        });

        it('should find case insensitive match', () => {
            expect(findBestMatch(options, 'option a')).toBe('Option A');
        });

        it('should find whitespace mismatch match', () => {
            expect(findBestMatch(['720 kg', '60 kg'], '720kg')).toBe('720 kg');
        });

        it('should find substring match from AI verbosity', () => {
            expect(findBestMatch(options, 'Answer is Option A')).toBe('Option A');
        });

        it('should find fuzzy match for typos', () => {
            expect(findBestMatch(['Photosynthesis', 'Respiration'], 'Phtosynthesisa')).toBe('Photosynthesis');
        });

        it('should return null if no match', () => {
            expect(findBestMatch(options, 'Zebra')).toBeNull();
        });
    });

    describe('sanitizeQuizQuestions', () => {
        it('should fix answers using best match', () => {
            const raw = [{
                question: 'Q',
                options: ['A', 'B'],
                answer: 'a', // lowercase
                explanation: 'exp'
            }];
            const result = sanitizeQuizQuestions(raw);
            expect(result[0].answer).toBe('A');
        });

        it('should rescue answer from explanation if direct match fails', () => {
             const raw = [{
                question: 'Q',
                options: ['Correct', 'Wrong'],
                answer: 'Invalid', 
                explanation: 'The answer is Correct because...'
            }];
            const result = sanitizeQuizQuestions(raw);
            expect(result[0].answer).toBe('Correct');
        });

        it('should drop questions where answer cannot be matched to any option', () => {
            const raw = [
                {
                    question: 'Good Question',
                    options: ['A', 'B'],
                    answer: 'A',
                    explanation: 'exp'
                },
                {
                    question: 'Bad Question',
                    options: ['X', 'Y'],
                    answer: 'Zebra',
                    explanation: 'no mention of any option'
                },
            ];
            const result = sanitizeQuizQuestions(raw);
            expect(result).toHaveLength(1);
            expect(result[0].question).toBe('Good Question');
        });

        it('should drop questions with empty question text', () => {
            const raw = [{
                question: '',
                options: ['A', 'B'],
                answer: 'A',
                explanation: 'exp'
            }];
            const result = sanitizeQuizQuestions(raw);
            expect(result).toHaveLength(0);
        });

        it('should drop questions with no options', () => {
            const raw = [{
                question: 'Q',
                options: [],
                answer: 'A',
                explanation: 'exp'
            }];
            const result = sanitizeQuizQuestions(raw);
            expect(result).toHaveLength(0);
        });

        it('should keep all questions when all answers are valid', () => {
            const raw = [
                { question: 'Q1', options: ['A', 'B'], answer: 'A', explanation: 'e1' },
                { question: 'Q2', options: ['C', 'D'], answer: 'D', explanation: 'e2' },
                { question: 'Q3', options: ['E', 'F'], answer: 'E', explanation: 'e3' },
            ];
            const result = sanitizeQuizQuestions(raw);
            expect(result).toHaveLength(3);
        });

        it('should deduplicate near-identical questions', () => {
            const raw = [
                { question: 'What is photosynthesis?', options: ['A', 'B'], answer: 'A', explanation: 'e1' },
                { question: 'What is  photosynthesis ?', options: ['A', 'B'], answer: 'A', explanation: 'e2' },
                { question: 'What is Photosynthesis?', options: ['C', 'D'], answer: 'C', explanation: 'e3' },
                { question: 'How does respiration work?', options: ['X', 'Y'], answer: 'X', explanation: 'e4' },
            ];
            const result = sanitizeQuizQuestions(raw);
            expect(result).toHaveLength(2);
            expect(result[0].question).toBe('What is photosynthesis?');
            expect(result[1].question).toBe('How does respiration work?');
        });
    });
});
