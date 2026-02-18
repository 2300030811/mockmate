import { AIProvider } from "./ai-provider";
import { GeneratedQuizQuestion, GeneratedQuizResponseSchema } from "../models";
import { getNextKey } from "@/utils/keyManager";
import { sanitizePromptInput } from "@/utils/sanitize";
import { safeJsonParse } from "@/utils/safeJson";

export class OpenAIProvider implements AIProvider {
  async generateQuiz(content: string, count: number = 20, difficulty: string = "medium", customApiKey?: string, mode: "quiz" | "flashcard" = "quiz"): Promise<GeneratedQuizQuestion[]> {
    const apiKey = customApiKey || getNextKey("OPENAI_API_KEY");
    if (!apiKey) throw new Error("OpenAI API Key missing");

    const safeContent = sanitizePromptInput(content, 30000);

    let prompt = "";
    if (mode === "flashcard") {
        prompt = `
          You are an elite Study Assistant.
          
          TASK:
          Generate FLASHCARDS from the text.
          
          RULES:
          1. STRUCTURE:
             - JSON Array: [{"question": "Front", "options": ["Back"], "answer": "Back", "explanation": "Context"}]
             - "options" must have exactly one string (the definition).
             - "answer" must match that definition.
          
          2. CONTENT:
             - Front: Term/Question.
             - Back: Definition/Answer (Brief).
             - SELF-CONTAINED: No meta-references to the source text.
          
          3. COUNT: ${Math.max(count, 15)}+ cards.
          
          TEXT CONTENT:
          ${safeContent}
        `;
    } else {
        prompt = `
          You are an elite AI Quiz Architect. 
          
          TASK:
          Create a multiple-choice quiz based on the provided text.
          
          RULES:
          1. QUESTIONS MUST BE SELF-CONTAINED.
             - Bad: "What is mentioned in the second paragraph?"
             - Good: "What is the primary function of the mitochondria?"
          
          2. DIFFICULTY: ${difficulty.toUpperCase()}
             - Target Count: ${Math.max(count, 12)}+
          
          3. OUTPUT FORMAT:
             - Raw JSON Array: [{"question": "...", "options": ["A","B","C","D"], "answer": "A", "explanation": "..."}]
             - Ensure "answer" is an exact match to one of the options.
          
          TEXT CONTENT:
          ${safeContent}
        `;
    }

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
      // Standardize robust unwrapping:
      if (!Array.isArray(json)) {
          const arrayKey = Object.keys(json).find(key => Array.isArray(json[key]));
          if (arrayKey) {
              json = json[arrayKey];
          }
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
