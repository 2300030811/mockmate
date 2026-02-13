import { GeneratedQuizQuestion } from "../models";

export interface AIProvider {
  /**
   * Generates a list of quiz questions based on the provided content.
   * @param content The text content or context to generate the quiz from.
   * @param count Target number of questions (advisory, provider may return fewer or more).
   * @param customApiKey Optional specific API key to use.
   */
  generateQuiz(content: string, count?: number, difficulty?: string, customApiKey?: string): Promise<GeneratedQuizQuestion[]>;
}
