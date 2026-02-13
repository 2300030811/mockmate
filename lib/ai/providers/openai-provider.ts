import { AIProvider } from "./ai-provider";
import { GeneratedQuizQuestion, GeneratedQuizResponseSchema } from "../models";
import { getNextKey } from "@/utils/keyManager";
import { sanitizePromptInput } from "@/utils/sanitize";
import { safeJsonParse } from "@/utils/safeJson";

export class OpenAIProvider implements AIProvider {
  async generateQuiz(content: string, count: number = 20, difficulty: string = "medium", customApiKey?: string): Promise<GeneratedQuizQuestion[]> {
    const apiKey = customApiKey || getNextKey("OPENAI_API_KEY");
    if (!apiKey) throw new Error("OpenAI API Key missing");

    const safeContent = sanitizePromptInput(content, 30000);

    const prompt = `
      You are an expert AI Quiz Generator. 
      Analyze the text provided.
      
      CRITICAL REQUIREMENTS:
      1. QUANTITY & QUALITY:
         - Generate AT LEAST ${Math.max(count, 12)} questions.
         - DIFFICULTY LEVEL: ${difficulty.toUpperCase()}.
         - Create a mix of question types (conceptual, factual, scenario-based).
      2. Return ONLY a raw JSON array.
      3. The "answer" field MUST be an EXACT string match to one of the "options".
      4. Format: [{"question": "...", "options": ["..."], "answer": "...", "explanation": "..."}]
      
      TEXT CONTENT:
      ${safeContent}
    `;

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini", // Use mini for better rate limits on free accounts
          messages: [
            { role: "system", content: "You are a helpful assistant that outputs JSON." },
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
          response_format: { type: "json_object" }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API Error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const rawText = data.choices[0]?.message?.content;
      
      if (!rawText) throw new Error("Empty response from OpenAI");

      let json = JSON.parse(rawText);
      // OpenAI sometimes wraps in a "quiz" or "questions" object if it feels like it
      if (json.questions && Array.isArray(json.questions)) {
          json = json.questions;
      } else if (json.quiz && Array.isArray(json.quiz)) {
          json = json.quiz;
      }

      const questions = GeneratedQuizResponseSchema.parse(json);
      return questions;

    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`❌ [OpenAIProvider] Failed:`, msg);
      throw e;
    }
  }
}
