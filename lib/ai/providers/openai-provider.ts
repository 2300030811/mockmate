import { AIProvider } from "./ai-provider";
import { QuizQuestion, QuizResponseSchema } from "../models";
import { getNextKey } from "@/utils/keyManager";

export class OpenAIProvider implements AIProvider {
  async generateQuiz(content: string, count: number = 20, customApiKey?: string): Promise<QuizQuestion[]> {
    const apiKey = customApiKey || getNextKey("OPENAI_API_KEY");
    if (!apiKey) throw new Error("OpenAI API Key missing");

    const prompt = `
      You are an expert AI Quiz Generator. 
      Analyze the text provided.
      
      CRITICAL REQUIREMENTS:
      1. Generate AT LEAST ${Math.max(count, 15)} questions.
      2. Return ONLY a raw JSON array.
      3. The "answer" field MUST be an EXACT string match to one of the "options".
      4. Format: [{"question": "...", "options": ["..."], "answer": "...", "explanation": "..."}]
      
      TEXT CONTENT:
      ${content.substring(0, 20000)}
    `;

    try {
      console.log(`⚡ [OpenAIProvider] Requesting...`);
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are a helpful assistant that outputs JSON." },
            { role: "user", content: prompt }
          ],
          temperature: 0.7
        })
      });

      if (!response.ok) throw new Error("OpenAI Endpoint Failed");

      const data = await response.json();
      const rawText = data.choices[0].message.content;

      const parsedInner = this.cleanJson(rawText);
      let json = JSON.parse(parsedInner);

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
               const fuzzy = q.options.find((opt: string) => opt.includes(q.answer) || q.answer.includes(opt));
               if (fuzzy) q.answer = fuzzy;
            }
            return q;
        });
      }

      return QuizResponseSchema.parse(json);

    } catch (e: any) {
      console.error(`❌ [OpenAIProvider] Failed:`, e.message);
      throw e;
    }
  }

  private cleanJson(text: string) {
    try {
      const first = text.indexOf("[");
      const last = text.lastIndexOf("]");
      if (first === -1 || last === -1) return "[]";
      return text.substring(first, last + 1);
    } catch {
      return "[]";
    }
  }
}
