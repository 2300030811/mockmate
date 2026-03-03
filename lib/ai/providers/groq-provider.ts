import { AIProvider } from "./ai-provider";
import { GeneratedQuizQuestion } from "../models";
import { getNextKey } from "@/utils/keyManager";
import { wrapAsUserContent } from "@/utils/sanitize";
import { PromptBuilder } from "../prompt-builder";
import { parseQuizResponse, formatProviderError } from "../response-parser";
import Groq from "groq-sdk";

const AI_TIMEOUT_MS = 30_000;

export class GroqProvider implements AIProvider {
  async generateQuiz(content: string, count: number = 20, difficulty: string = "medium", customApiKey?: string, mode: "quiz" | "flashcard" = "quiz"): Promise<GeneratedQuizQuestion[]> {
    const safeContent = wrapAsUserContent(content, "DOCUMENT_CONTENT");
    const prompt = PromptBuilder.buildUserPrompt(safeContent, count, difficulty, mode);

    // --- KEY ROTATION LOGIC ---
    // If no custom key is provided, we will try up to 3 keys from the env
    // to handle rate limits.
    const MAX_RETRIES = customApiKey ? 1 : 3;
    let lastError: unknown;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            const currentKey = customApiKey || getNextKey("GROQ_API_KEY");
            if (!currentKey) throw new Error("Groq API Key missing");

            const groq = new Groq({ apiKey: currentKey });

            console.log(`🤖 [GroqProvider] Attempt ${attempt + 1}/${MAX_RETRIES} using key ending in ...${currentKey.slice(-4)}`);

            // Timeout via AbortController
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

            let completion;
            try {
              completion = await groq.chat.completions.create({
                  messages: [
                      { role: "system", content: PromptBuilder.getSystemPrompt() },
                      { role: "user", content: prompt }
                  ],
                  model: "llama-3.3-70b-versatile",
                  temperature: 0.5,
                  response_format: { type: "json_object" },
              }, { signal: controller.signal });
            } finally {
              clearTimeout(timer);
            }

            const rawText = completion.choices[0]?.message?.content;
            if (!rawText) throw new Error("Empty response from Groq");

            const questions = parseQuizResponse(rawText);
            if (!questions) throw new Error("Failed to parse Groq response into valid quiz JSON");
            return questions;

        } catch (e: unknown) {
            const errorMsg = formatProviderError("Groq", e);
            lastError = e;
            
            // Detailed Logging for Debugging
            console.error(`❌ [GroqProvider] Attempt ${attempt + 1} Failed:`, errorMsg);

            // If it's a 401 (Auth) or 400 (Bad Request), retrying might not help unless it's a different key
            // but for 429 (Rate Limit) or 500 (Server Error), retrying is good.
            
            if (customApiKey) break; // Don't retry if user provided a specific key
        }
    }

    // Ensure we throw a real Error object with the last message
    const finalMsg = lastError instanceof Error ? lastError.message : (lastError ? String(lastError) : "Groq generation failed after retries.");
    throw new Error(`Groq Failed: ${finalMsg}`);
  }
}
