import { GeminiProvider } from "./providers/gemini-provider";
import { GroqProvider } from "./providers/groq-provider";
import { OpenAIProvider } from "./providers/openai-provider";
import { GeneratedQuizQuestion } from "./models";
import { sanitizeQuizQuestions } from "./quiz-cleanup";

export type AIProviderName = "gemini" | "groq" | "openai" | "auto";

export class QuizGenerator {
  private static getSmartSample(text: string, limit: number = 25000): string {
    if (!text || text.length <= limit) return text;

    const introSize = 3000;
    const intro = text.substring(0, introSize);
    const remainingText = text.substring(introSize);
    const remainingLimit = limit - introSize;
    
    const numChunks = 3;
    const chunkSize = Math.floor(remainingLimit / numChunks);
    
    let result = `[SECTION 1: INTRODUCTION & OVERVIEW]\n${intro}\n\n`;

    const getRandom = (min: number, max: number) => Math.floor(Math.random() * (max - min) + min);
    const zoneSize = Math.floor(remainingText.length / numChunks);

    for (let i = 0; i < numChunks; i++) {
       const zoneStart = i * zoneSize;
       const zoneEnd = zoneStart + zoneSize - chunkSize;
       const safeZoneEnd = Math.max(zoneStart, zoneEnd); 
       const randomStart = getRandom(zoneStart, safeZoneEnd);
       
       const chunk = remainingText.substring(randomStart, randomStart + chunkSize);
       result += `[SECTION ${i + 2}: CORE CONTENT PART ${i + 1}]\n${chunk}\n\n`;
    }

    return result;
  }

  static async generate(
    content: string, 
    providerName: AIProviderName = "auto", 
    customApiKey?: string,
    count: number = 20,
    difficulty: string = "medium"
  ): Promise<GeneratedQuizQuestion[]> {
    
    const context = this.getSmartSample(content);
    
    // Define strategy
    const providers = [];

    if (providerName === "gemini") {
      providers.push(new GeminiProvider());
    } else if (providerName === "groq") {
      providers.push(new GroqProvider());
    } else if (providerName === "openai") {
      providers.push(new OpenAIProvider());
    } else {
      // Auto Strategy: Gemini -> Groq -> OpenAI (OpenAI last due to tight limits on free accounts)
      providers.push(new GeminiProvider());
      providers.push(new GroqProvider());
      providers.push(new OpenAIProvider());
    }

    let lastError;

    for (const provider of providers) {
      try {
        console.log(`🤖 Attempting generation with ${provider.constructor.name}...`);
        const questions = await provider.generateQuiz(context, count, difficulty, customApiKey);
        if (questions && questions.length > 0) {
          return sanitizeQuizQuestions(questions);
        }
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        console.warn(`⚠️ [QuizGenerator] Provider failed:`, msg);
        lastError = error;
        
        // If it's a quota error (429), or specifically "limit", we definitely want to fall back
        if (msg.toLowerCase().includes("limit") || msg.includes("429")) {
           continue;
        }
        
        // For other errors, we still continue to next provider in "auto" mode
        if (providerName === "auto") continue;
        
        // If specific provider was requested and failed, throw immediately
        throw error;
      }
    }

    const lastMsg = lastError instanceof Error ? lastError.message : "Unknown";
    throw new Error(`All providers failed. Last error: ${lastMsg}`);
  }
}
