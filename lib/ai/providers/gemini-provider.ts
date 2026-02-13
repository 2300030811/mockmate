import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIProvider } from "./ai-provider";
import { GeneratedQuizQuestion, GeneratedQuizResponseSchema } from "../models";
import { getNextKey } from "@/utils/keyManager";
import { sanitizePromptInput } from "@/utils/sanitize";

export class GeminiProvider implements AIProvider {
  async generateQuiz(content: string, count: number = 20, difficulty: string = "medium", customApiKey?: string): Promise<GeneratedQuizQuestion[]> {
    const apiKey = customApiKey || getNextKey("GOOGLE_API_KEY");
    if (!apiKey) throw new Error("Gemini API Key missing");

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Rotation of models for reliability
    const models = ["gemini-1.5-flash", "gemini-2.0-flash"];

    let lastError;
    
    for (const modelName of models) {
      try {

        const model = genAI.getGenerativeModel({ model: modelName });

        const safeContent = sanitizePromptInput(content, 50000);

        const prompt = `
          You are an expert AI Quiz Generator. 
          
          TASK:
          Generate a high-quality multiple-choice quiz from the provided text.
          
          CRITICAL INSTRUCTIONS:
          1. QUANTITY & QUALITY:
             - Generate AT LEAST ${Math.max(count, 15)} questions.
             - DIFFICULTY LEVEL: ${difficulty.toUpperCase()}.
             - Create a mix of question types: 
               * Factual (direct recall)
               * Conceptual (understanding principles)
               * Scenario-based (applying knowledge in context)
          
          2. FORMATTING:
             - Return ONLY a raw JSON array.
             - Structure: [{"question": "...", "options": ["Option A", "Option B", "Option C", "Option D"], "answer": "Option A", "explanation": "..."}]
          
          3. ANSWER MATCHING (VERY IMPORTANT):
             - The "answer" field MUST be an EXACT string copy of the correct option.
             - Do NOT return just "A" or "Option 1". It MUST match the text keys exactly.
          
          4. CONTENT:
             - Ignore headers/footers.
             - Ensure questions are distinct and cover different sections of the text.
          
          TEXT CONTENT:
          ${safeContent}
        `;

        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.7 },
        });

        const response = await result.response;
        const text = response.text();
        
        // Clean and Parse using safeJsonParse
        const { safeJsonParse } = await import("@/utils/safeJson");
        const json = safeJsonParse(text, GeneratedQuizResponseSchema);

        if (!json) {
            console.warn(`⚠️ [GeminiProvider] Failed to parse JSON from ${modelName}`);
            continue; // Try next model
        }
        
        if (Array.isArray(json) && json.length > 0) return json;



      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        console.warn(`⚠️ [GeminiProvider] ${modelName} failed:`, msg);
        lastError = e;
        if (msg.includes("429")) return []; // Stop trying if quota exceeded to let fallback handle it
      }
    }

    throw lastError || new Error("Gemini generation failed");
  }
}
