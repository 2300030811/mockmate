
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
    });
});
