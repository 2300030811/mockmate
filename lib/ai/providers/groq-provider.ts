import { AIProvider } from "./ai-provider";
import { GeneratedQuizQuestion, GeneratedQuizResponseSchema } from "../models";
import { getNextKey } from "@/utils/keyManager";
import { sanitizePromptInput } from "@/utils/sanitize";
import Groq from "groq-sdk";

export class GroqProvider implements AIProvider {
  async generateQuiz(content: string, count: number = 20, customApiKey?: string): Promise<GeneratedQuizQuestion[]> {
    const apiKey = customApiKey || getNextKey("GROQ_API_KEY");
    if (!apiKey) throw new Error("Groq API Key missing");

    const safeContent = sanitizePromptInput(content, 30000);

    const prompt = `
      You are an expert AI Quiz Generator. 
      Analyze the text provided.
      
      CRITICAL REQUIREMENTS:
      1. Generate AT LEAST ${Math.max(count, 15)} questions.
      2. Return ONLY a raw JSON array.
      3. The "answer" field MUST be an EXACT string match to one of the "options".
      4. Format: [{"question": "...", "options": ["..."], "answer": "...", "explanation": "..."}]
      
      TEXT CONTENT:
      ${safeContent}
    `;

    try {
      const groq = new Groq({ apiKey });

      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are a helpful assistant that outputs JSON." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      });

      const rawText = response.choices[0]?.message?.content;
      if (!rawText) throw new Error("Empty response from Groq");

      // Groq often wraps in a "questions" object despite instructions, checks for that
      let json = JSON.parse(rawText);
      if (json.questions && Array.isArray(json.questions)) {
          json = json.questions;
      }

      // Validate with Zod — cleanup is handled by QuizGenerator.sanitizeQuizQuestions()
      const questions = GeneratedQuizResponseSchema.parse(json);
      return questions;

    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`❌ [GroqProvider] Failed:`, msg);
      throw e;
    }
  }
}
