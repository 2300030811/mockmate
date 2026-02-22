import { AIProvider } from "./ai-provider";
import { GeneratedQuizQuestion, GeneratedQuizResponseSchema } from "../models";
import { getNextKey } from "@/utils/keyManager";
import { sanitizePromptInput } from "@/utils/sanitize";
import Groq from "groq-sdk";

export class GroqProvider implements AIProvider {
  async generateQuiz(content: string, count: number = 20, difficulty: string = "medium", customApiKey?: string, mode: "quiz" | "flashcard" = "quiz"): Promise<GeneratedQuizQuestion[]> {
    const apiKey = customApiKey || getNextKey("GROQ_API_KEY");
    if (!apiKey) throw new Error("Groq API Key missing");

    const safeContent = sanitizePromptInput(content, 30000);

    let prompt = "";
    if (mode === "flashcard") {
      prompt = `
        You are an elite Study Assistant.
        
        TASK:
        Create high-quality FLASHCARDS from the text.
        
        RULES:
        1. JSON STRUCTURE (CRITICAL):
           - Format: [{"question": "Front", "options": ["Back"], "answer": "Back", "explanation": "Context"}]
           - "options" is a 1-item array containing the answer/definition.
           - "answer" must match "options[0]".
        
        2. QUALITY:
           - Front: Clear Term or Question.
           - Back: Concise Definition.
           - NO "Text says..." or "Author mentions...".
        
        3. QUANTITY: ${Math.max(count, 15)}+ cards.
        
        TEXT CONTENT:
        ${safeContent}
      `;
    } else {
      prompt = `
        You are an elite AI Quiz Architect. 
        Analyze the text provided.
        
        CORE OBJECTIVE:
        Generate a professional-grade multiple-choice quiz.
        
        CRITICAL RULES:
        1. SELF-CONTAINED QUESTIONS:
           - NEVER use phrases like "According to the text", "In the passage", or "The author mentions".
           - Questions must test knowledge as if it were a standard exam.
        
        2. DIFFICULTY: ${difficulty.toUpperCase()}
           - ${difficulty === 'hard' ? "Focus on complex scenarios and multi-step reasoning." : "Focus on conceptual understanding and application."}
           - Generate AT LEAST ${Math.max(count, 15)} questions.

        3. STRUCTURE:
           - 4 distinct options per question.
           - "answer" must be an EXACT string match to one option.
           - Return ONLY valid JSON: [{"question": "...", "options": [...], "answer": "...", "explanation": "..."}]

        TEXT CONTENT:
        ${safeContent}
      `;
    }

    // --- KEY ROTATION LOGIC ---
    // If no custom key is provided, we will try up to 3 keys from the env
    // to handle rate limits.
    const MAX_RETRIES = customApiKey ? 1 : 3;
    let lastError: unknown;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            const currentKey = customApiKey || getNextKey("GROQ_API_KEY");
            if (!currentKey) throw new Error("Groq API Key missing");

            const groq = new Groq({ apiKey: currentKey, dangerouslyAllowBrowser: true }); // Enable browser usage if needed (though this is server action)

            console.log(`🤖 [GroqProvider] Attempt ${attempt + 1}/${MAX_RETRIES} using key ending in ...${currentKey.slice(-4)}`);

            const completion = await groq.chat.completions.create({
                messages: [
                    { role: "system", content: "You are a helpful assistant that outputs JSON." },
                    { role: "user", content: prompt }
                ],
                model: "llama-3.3-70b-versatile",
                temperature: 0.5,
                response_format: { type: "json_object" },
            });

            const content = completion.choices[0]?.message?.content;
            if (!content) throw new Error("Empty response from Groq");

            let json = JSON.parse(content);
            
            // Handle { "questions": [...] } or { "flashcards": [...] } wrapper logic
            if (!Array.isArray(json)) {
                // If it's an object, look for the first key that is an array
                const arrayKey = Object.keys(json).find(key => Array.isArray(json[key]));
                if (arrayKey) {
                    json = json[arrayKey];
                }
            }

            // Validate schema
            const questions = GeneratedQuizResponseSchema.parse(json);
            return questions;

        } catch (e: unknown) {
            lastError = e;
            const msg = e instanceof Error ? e.message : String(e);
            
            // Detailed Logging for Debugging
            console.error(`❌ [GroqProvider] Attempt ${attempt + 1} Failed. Error Details:`, {
                message: msg,
                type: (e as Record<string, unknown>)?.type,
                code: (e as Record<string, unknown>)?.code,
                param: (e as Record<string, unknown>)?.param,
                status: (e as Record<string, unknown>)?.status,
            });

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
