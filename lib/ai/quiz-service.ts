import { GeminiProvider } from "./providers/gemini-provider";
import { GroqProvider } from "./providers/groq-provider";
import { OpenAIProvider } from "./providers/openai-provider";
import { QuizQuestion } from "./models";
import { sanitizeQuizQuestions } from "./quiz-cleanup";

export type AIProviderName = "gemini" | "groq" | "openai" | "auto";

export class QuizService {
  private static getSmartSample(text: string, limit: number = 25000): string {
    if (!text || text.length <= limit) return text;

    const introSize = 3000;
    const intro = text.substring(0, introSize);
    const remainingText = text.substring(introSize);
    const remainingLimit = limit - introSize;
    
    const numChunks = 3;
    const chunkSize = Math.floor(remainingLimit / numChunks);
    
    let result = `[SECTION 1: INTRO]\n${intro}\n\n`;

    const getRandom = (min: number, max: number) => Math.floor(Math.random() * (max - min) + min);
    const zoneSize = Math.floor(remainingText.length / numChunks);

    for (let i = 0; i < numChunks; i++) {
       const zoneStart = i * zoneSize;
       const zoneEnd = zoneStart + zoneSize - chunkSize;
       const safeZoneEnd = Math.max(zoneStart, zoneEnd); 
       const randomStart = getRandom(zoneStart, safeZoneEnd);
       
       const chunk = remainingText.substring(randomStart, randomStart + chunkSize);
       result += `[SECTION ${i + 2}: RANDOM PART ${i + 1}]\n${chunk}\n\n`;
    }

    return result;
  }

  static async generate(
    content: string, 
    providerName: AIProviderName = "auto", 
    customApiKey?: string
  ): Promise<QuizQuestion[]> {
    
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
      // Auto: Gemini -> Groq -> OpenAI (if configured)
      providers.push(new GeminiProvider());
      providers.push(new GroqProvider());
      providers.push(new OpenAIProvider()); // Optional fallback
    }

    let lastError;

    for (const provider of providers) {
      try {
        const questions = await provider.generateQuiz(context, 20, customApiKey);
        if (questions && questions.length > 0) {
          // Robustly sanitize/fix answers before returning
          return sanitizeQuizQuestions(questions);
        }
      } catch (error: any) {
        console.warn(`⚠️ [QuizService] Provider failed:`, error.message);
        lastError = error;
        // Continue to next provider
      }
    }

    throw new Error(`All providers failed. Last error: ${lastError?.message || "Unknown"}`);
  }
}
