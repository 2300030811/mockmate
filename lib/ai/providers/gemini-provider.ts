import { AIProvider } from "./ai-provider";
import { GeneratedQuizQuestion } from "../models";
import { wrapAsUserContent } from "@/utils/sanitize";
import { PromptBuilder } from "../prompt-builder";
import { parseQuizResponse, formatProviderError } from "../response-parser";
import { generateText } from "../gateway";

export class GeminiProvider implements AIProvider {
  async generateQuiz(
    content: string,
    count: number = 20,
    difficulty: string = "medium",
    customApiKey?: string,
    mode: "quiz" | "flashcard" = "quiz"
  ): Promise<GeneratedQuizQuestion[]> {
    const safeContent = wrapAsUserContent(content, "DOCUMENT_CONTENT");
    const prompt = PromptBuilder.buildUserPrompt(safeContent, count, difficulty, mode);

    try {
      const result = await generateText(
        prompt,
        PromptBuilder.getSystemPrompt(),
        "gemini",
        {
          model: "gemini-2.0-flash",
          temperature: 0.7,
          maxTokens: 4096,
          customApiKey,
        }
      );

      const questions = parseQuizResponse(result.content);
      if (!questions) {
        throw new Error("Failed to parse Gemini response into valid quiz JSON");
      }
      return questions;
    } catch (e: unknown) {
      console.warn(`⚠️ [GeminiProvider] generation failed:`, formatProviderError("Gemini", e));
      throw e;
    }
  }
}
