import { AIProvider } from "./ai-provider";
import { GeneratedQuizQuestion } from "../models";
import { getNextKey } from "@/utils/keyManager";
import { wrapAsUserContent } from "@/utils/sanitize";
import { PromptBuilder } from "../prompt-builder";
import { parseQuizResponse, formatProviderError } from "../response-parser";

const AI_TIMEOUT_MS = 30_000;

export class OpenAIProvider implements AIProvider {
  async generateQuiz(content: string, count: number = 20, difficulty: string = "medium", customApiKey?: string, mode: "quiz" | "flashcard" = "quiz"): Promise<GeneratedQuizQuestion[]> {
    const apiKey = customApiKey || getNextKey("OPENAI_API_KEY");
    if (!apiKey) throw new Error("OpenAI API Key missing");

    const safeContent = wrapAsUserContent(content, "DOCUMENT_CONTENT");
    const prompt = PromptBuilder.buildUserPrompt(safeContent, count, difficulty, mode);

    try {
      // Timeout via AbortController
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

      let response: Response;
      try {
        response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: PromptBuilder.getSystemPrompt() },
              { role: "user", content: prompt }
            ],
            temperature: 0.7,
            response_format: { type: "json_object" }
          }),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timer);
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API Error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const rawText = data.choices[0]?.message?.content;
      
      if (!rawText) throw new Error("Empty response from OpenAI");

      const questions = parseQuizResponse(rawText);
      if (!questions) throw new Error("Failed to parse OpenAI response into valid quiz JSON");
      return questions;

    } catch (e: unknown) {
      console.error(`❌ [OpenAIProvider] Failed:`, formatProviderError("OpenAI", e));
      throw e;
    }
  }
}
