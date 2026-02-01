import { AIProvider } from "./ai-provider";
import { QuizQuestion, QuizResponseSchema } from "../models";
import { getNextKey } from "@/utils/keyManager";

export class GroqProvider implements AIProvider {
  async generateQuiz(content: string, count: number = 20, customApiKey?: string): Promise<QuizQuestion[]> {
    const apiKey = customApiKey || getNextKey("GROQ_API_KEY");
    if (!apiKey) throw new Error("Groq API Key missing");

    const prompt = `
      You are an expert AI Quiz Generator. 
      Analyze the text provided.
      
      CRITICAL REQUIREMENTS:
      1. Generate AT LEAST ${Math.max(count, 15)} questions.
      2. Return ONLY a raw JSON array.
      3. The "answer" field MUST be an EXACT string match to one of the "options".
      4. Format: [{"question": "...", "options": ["..."], "answer": "...", "explanation": "..."}]
      
      TEXT CONTENT:
      ${content.substring(0, 30000)}
    `;

    try {
      console.log(`⚡ [GroqProvider] Requesting...`);
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: "You are a helpful assistant that outputs JSON." },
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(`Groq API Error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const rawText = data.choices[0].message.content;

      // Groq often wraps in a "questions" object despite instructions, checks for that
      let json = JSON.parse(rawText);
      if (json.questions && Array.isArray(json.questions)) {
          json = json.questions;
      }
      
      // --- POST-PROCESSING ---
      if (Array.isArray(json)) {
        json = json.map((q: any) => {
            if (Array.isArray(q.options)) {
                q.options = q.options.map((opt: any) => String(opt).trim());
            }
            const exactMatch = q.options.find((opt: string) => opt === q.answer?.trim());
            if (exactMatch) {
               q.answer = exactMatch;
            } else {
               // Fallback: Try to find containing string
               const fuzzy = q.options.find((opt: string) => opt.includes(q.answer) || q.answer.includes(opt));
               if (fuzzy) q.answer = fuzzy;
            }
            return q;
        });
      }

      const questions = QuizResponseSchema.parse(json);
      return questions;

    } catch (e: any) {
      console.error(`❌ [GroqProvider] Failed:`, e.message);
      throw e;
    }
  }
}
