import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIProvider } from "./ai-provider";
import { GeneratedQuizQuestion, GeneratedQuizResponseSchema } from "../models";
import { getNextKey } from "@/utils/keyManager";
import { sanitizePromptInput } from "@/utils/sanitize";

export class GeminiProvider implements AIProvider {
  async generateQuiz(content: string, count: number = 20, difficulty: string = "medium", customApiKey?: string, mode: "quiz" | "flashcard" = "quiz"): Promise<GeneratedQuizQuestion[]> {
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

        let prompt = "";
        
        if (mode === "flashcard") {
            prompt = `
              You are an elite Study Assistant.
              
              TASK:
              Create high-quality FLASHCARDS from the provided text.
              
              CRITICAL RULES:
              1. FORMAT (Strict JSON):
                 - Return a JSON Array.
                 - Schema: [{"question": "Front of Card", "options": ["Back of Card"], "answer": "Back of Card", "explanation": "Context"}]
                 - NOTE: The "options" array must contain EXACTLY ONE string (the answer/back of card).
                 - "answer" must match that single option string.
              
              2. CONTENT QUALITY:
                 - FRONT (question): Must be a clear Term, Concept, or Question. (e.g. "Mitochondria function", "What is Isomorphism?")
                 - BACK (answer): Concise definition or answer (1-2 sentences max).
                 - SELF-CONTAINED: Do not use "According to the text". The card must make sense in isolation.
              
              3. QUANTITY:
                 - Generate AT LEAST ${Math.max(count, 15)} cards.
              
              TEXT CONTENT:
              ${safeContent}
            `;
        } else {
            prompt = `
              You are an elite AI Quiz Architect. 
              
              TASK:
              Generate a high-quality, professional-grade multiple-choice quiz from the provided text.
              
              CRITICAL INSTRUCTIONS:
              1. QUANTITY & QUALITY:
                 - Generate AT LEAST ${Math.max(count, 15)} questions.
                 - DIFFICULTY: ${difficulty.toUpperCase()}.
                 - QUESTIONS MUST BE SELF-CONTAINED. Do not ask "According to the text..." or "What does the author say...". The question should stand alone as a test of knowledge.
                 - EASY: Definitions and basic facts.
                 - MEDIUM: Application and relationships.
                 - HARD: Synthesis and complex scenarios.

              2. OPTION QUALITY:
                 - Exactly 4 options per question.
                 - Distractors must be PLAUSIBLE but clearly INCORRECT.
                 - Avoid "All of the above" unless absolutely appropriate.
              
              3. EXPLANATIONS:
                 - Explain WHY the correct answer is right.
                 - Briefly explain why the distractors are incorrect.
              
              4. JSON FORMATTING:
                 - Return ONLY a raw JSON array.
                 - Structure: [{"question": "...", "options": ["A", "B", "C", "D"], "answer": "A", "explanation": "..."}]
                 - "answer" MUST match one option EXACTLY.
              
              TEXT CONTENT:
              ${safeContent}
            `;
        }

        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.7 },
        });

        const response = await result.response;
        const text = response.text();
        
        // Cleanup Markdown
        let cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const firstOpen = cleanText.indexOf(cleanText.startsWith("[") ? "[" : "{");
        const lastClose = cleanText.lastIndexOf(cleanText.startsWith("[") ? "]" : "}");
        if (firstOpen !== -1 && lastClose !== -1) {
            cleanText = cleanText.substring(firstOpen, lastClose + 1);
        }

        let json: any;
        try {
            json = JSON.parse(cleanText);
        } catch (e) {
            console.warn(`⚠️ [GeminiProvider] JSON Parse failed for ${modelName}`);
            continue;
        }

        // Handle wrappers
        if (!Array.isArray(json)) {
            const arrayKey = Object.keys(json).find(key => Array.isArray(json[key]));
            if (arrayKey) {
                json = json[arrayKey];
            }
        }

        // Validate
        const resultParse = GeneratedQuizResponseSchema.safeParse(json);
        if (!resultParse.success) {
             console.warn(`⚠️ [GeminiProvider] Schema validation failed for ${modelName}`, resultParse.error);
             continue;
        }
        return resultParse.data;



      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        console.warn(`⚠️ [GeminiProvider] ${modelName} failed:`, msg);
        lastError = e;
        if (msg.includes("429")) {
           console.warn(`⚠️ [GeminiProvider] Quota exceeded for ${modelName}.`);
        }
      }
    }

    throw lastError || new Error("Gemini generation failed");
  }
}
