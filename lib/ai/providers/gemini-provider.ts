import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIProvider } from "./ai-provider";
import { GeneratedQuizQuestion } from "../models";
import { getNextKey } from "@/utils/keyManager";
import { wrapAsUserContent } from "@/utils/sanitize";
import { PromptBuilder } from "../prompt-builder";
import { parseQuizResponse, formatProviderError } from "../response-parser";

const AI_TIMEOUT_MS = 30_000;

export class GeminiProvider implements AIProvider {
  async generateQuiz(content: string, count: number = 20, difficulty: string = "medium", customApiKey?: string, mode: "quiz" | "flashcard" = "quiz"): Promise<GeneratedQuizQuestion[]> {
    const apiKey = customApiKey || getNextKey("GOOGLE_API_KEY");
    if (!apiKey) throw new Error("Gemini API Key missing");

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Rotation of models for reliability
    const models = ["gemini-2.0-flash-lite", "gemini-2.0-flash"];

    let lastError;
    
    for (const modelName of models) {
      try {

        const model = genAI.getGenerativeModel({ model: modelName });

        const safeContent = wrapAsUserContent(content, "DOCUMENT_CONTENT");
        const prompt = PromptBuilder.buildUserPrompt(safeContent, count, difficulty, mode);

        // The Gemini SDK doesn't support AbortController signals, so use
        // Promise.race to enforce a hard timeout.
        const generatePromise = model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.7 },
        });

        const result = await Promise.race([
          generatePromise,
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new DOMException("Gemini request timed out", "AbortError")), AI_TIMEOUT_MS)
          ),
        ]);

        const response = await result.response;
        const text = response.text();

        const questions = parseQuizResponse(text);
        if (!questions) {
          console.warn(`⚠️ [GeminiProvider] Parse/validation failed for ${modelName}`);
          continue;
        }
        return questions;



      } catch (e: unknown) {
        console.warn(`⚠️ [GeminiProvider] ${modelName} failed:`, formatProviderError("Gemini", e));
        lastError = e;
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.includes("429")) {
           console.warn(`⚠️ [GeminiProvider] Quota exceeded for ${modelName}.`);
        }
      }
    }

    throw lastError || new Error("Gemini generation failed");
  }
}
