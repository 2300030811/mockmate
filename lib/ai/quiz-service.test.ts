
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QuizService } from './quiz-service';
import { GeminiProvider } from './providers/gemini-provider';
import { GroqProvider } from './providers/groq-provider';

// Hoist mocks
const { geminiGenerateMock, groqGenerateMock, openaiGenerateMock } = vi.hoisted(() => {
  return {
    geminiGenerateMock: vi.fn(),
    groqGenerateMock: vi.fn(),
    openaiGenerateMock: vi.fn(),
  };
});

// Mock Key Manager
vi.mock('@/utils/keyManager', () => ({
  getNextKey: vi.fn().mockReturnValue('mock-key'),
}));

// Mock Providers using classes
vi.mock('./providers/gemini-provider', () => {
  return {
    GeminiProvider: class {
      generateQuiz = geminiGenerateMock;
    }
  };
});

vi.mock('./providers/groq-provider', () => {
  return {
    GroqProvider: class {
      generateQuiz = groqGenerateMock;
    }
  };
});

vi.mock('./providers/openai-provider', () => {
  return {
    OpenAIProvider: class {
      generateQuiz = openaiGenerateMock;
    }
  };
});

describe('QuizService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Helper to get valid question that passes sanitizer
  const getValidQuestion = (prefix: string) => ({
    question: `${prefix} Question?`,
    options: ['Option A', 'Option B'],
    answer: 'Option A',
    explanation: 'Explanation'
  });

  it('should use GeminiProvider by default', async () => {
    const mockQuestions = [getValidQuestion('Gemini')];
    geminiGenerateMock.mockResolvedValue(mockQuestions);

    const result = await QuizService.generate('content', 'gemini');

    expect(geminiGenerateMock).toHaveBeenCalled();
    expect(result).toEqual(mockQuestions);
  });
  
  it('should use GroqProvider when specified', async () => {
    const mockQuestions = [getValidQuestion('Groq')];
    groqGenerateMock.mockResolvedValue(mockQuestions);

    const result = await QuizService.generate('content', 'groq');

    expect(groqGenerateMock).toHaveBeenCalled();
    expect(result).toEqual(mockQuestions);
  });

  it('should fallback to Groq if Gemini fails in auto mode', async () => {
    geminiGenerateMock.mockRejectedValue(new Error('Gemini Fail'));
    const mockQuestions = [getValidQuestion('Fallback')];
    groqGenerateMock.mockResolvedValue(mockQuestions);

    const result = await QuizService.generate('content', 'auto');

    expect(geminiGenerateMock).toHaveBeenCalled();
    expect(groqGenerateMock).toHaveBeenCalled();
    expect(result).toEqual(mockQuestions);
  });
});
