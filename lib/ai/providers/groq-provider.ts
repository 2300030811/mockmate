import { AIProvider } from "./ai-provider";
import { GeneratedQuizQuestion } from "../models";
import { wrapAsUserContent } from "@/utils/sanitize";
import { PromptBuilder } from "../prompt-builder";
import { parseQuizResponse, formatProviderError } from "../response-parser";
import { generateText, AI_MODELS } from "../gateway";

export class GroqProvider implements AIProvider {
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
        "groq",
        {
          model: AI_MODELS.DEFAULT,
          temperature: 0.5,
          maxTokens: 4096,
          responseFormat: { type: "json_object" },
          customApiKey,
        }
      );

      const questions = parseQuizResponse(result.content);
      if (!questions) {
        throw new Error("Failed to parse Groq response into valid quiz JSON");
      }
      return questions;
    } catch (e: unknown) {
      console.error(`❌ [GroqProvider] Failed:`, formatProviderError("Groq", e));
      throw e;
    }
  }
}
