import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIProvider } from "./ai-provider";
import { QuizQuestion, QuizResponseSchema } from "../models";
import { getNextKey } from "@/utils/keyManager";

export class GeminiProvider implements AIProvider {
  async generateQuiz(content: string, count: number = 20, customApiKey?: string): Promise<QuizQuestion[]> {
    const apiKey = customApiKey || getNextKey("GOOGLE_API_KEY");
    if (!apiKey) throw new Error("Gemini API Key missing");

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Rotation of models for reliability
    const models = ["gemini-1.5-flash", "gemini-2.0-flash"];

    let lastError;
    
    for (const modelName of models) {
      try {
        console.log(`🤖 [GeminiProvider] Attempting ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });

        const isMathOrTechnical = content.includes("math") || content.includes("formula") || content.includes("kg") || content.includes("boiler");

        const prompt = `
          You are an expert AI Quiz Generator. 
          
          TASK:
          Generate a high-quality multiple-choice quiz from the provided text.
          
          CRITICAL INSTRUCTIONS:
          1. QUANTITY: Generate AT LEAST ${Math.max(count, 15)} questions. Do not stop early.
             - If the text is short, exhaustively extract every possible fact.
             - If the text is long, cover different sections significantly.
          
          2. FORMATTING:
             - Return ONLY a raw JSON array.
             - Structure: [{"question": "...", "options": ["Option A", "Option B", "Option C", "Option D"], "answer": "Option A", "explanation": "..."}]
          
          3. ANSWER MATCHING (VERY IMPORTANT):
             - The "answer" field MUST be an EXACT string copy of the correct option.
             - Do NOT return just "A" or "Option 1". It MUST match the text keys exactly.
             - Example: If options is ["10 kg", "20 kg"], answer MUST be "10 kg", NOT "10" or "A".
          
          4. CONTENT:
             - Ignore headers/footers.
             - Solving math problems is allowed and encouraged.
          
          TEXT CONTENT:
          ${content.substring(0, 50000)}
        `;

        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.7 },
        });

        const response = await result.response;
        const text = response.text();
        
        // Clean and Parse
        const cleaned = this.cleanJson(text);
        let json = JSON.parse(cleaned);

        // Handle case where AI wraps in { "questions": [...] }
        if (!Array.isArray(json) && json.questions && Array.isArray(json.questions)) {
            json = json.questions;
        }
        
        // --- POST-PROCESSING & SANITIZATION ---
        // Fixes "Red Answer" bug by ensuring exact string matches
        if (Array.isArray(json)) {
            json = json.map((q: any) => {
                // Ensure options are strings
                if (Array.isArray(q.options)) {
                    q.options = q.options.map((opt: any) => String(opt).trim());
                }
                
                // Fix Answer Mismatch (e.g. "720 kg " vs "720 kg")
                const exactMatch = q.options.find((opt: string) => opt === q.answer?.trim());
                if (!exactMatch) {
                   // Fuzzy match attempt
                   const fuzzyMatch = q.options.find((opt: string) => 
                       opt.toLowerCase().includes(q.answer?.toLowerCase()) || 
                       q.answer?.toLowerCase().includes(opt.toLowerCase())
                   );
                   if (fuzzyMatch) q.answer = fuzzyMatch;
                } else {
                   q.answer = exactMatch;
                }
                return q;
            });
        }

        // Validate with Zod
        const questions = QuizResponseSchema.parse(json);
        if (questions.length > 0) return questions;

      } catch (e: any) {
        console.warn(`⚠️ [GeminiProvider] ${modelName} failed:`, e.message);
        lastError = e;
        if (e.message.includes("429")) return []; // Stop trying if quota exceeded to let fallback handle it
      }
    }

    throw lastError || new Error("Gemini generation failed");
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
