import { GeminiProvider } from "./providers/gemini-provider";
import { GroqProvider } from "./providers/groq-provider";
import { GeneratedQuizQuestion } from "./models";
import { sanitizeQuizQuestions } from "./quiz-cleanup";

export type AIProviderName = "gemini" | "groq" | "auto";

export class QuizGenerator {
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
  ): Promise<GeneratedQuizQuestion[]> {
    
    const context = this.getSmartSample(content);
    
    // Define strategy
    const providers = [];

    if (providerName === "gemini") {
      providers.push(new GeminiProvider());
    } else if (providerName === "groq") {
      providers.push(new GroqProvider());
    } else {
      // Auto: Gemini -> Groq
      providers.push(new GeminiProvider());
      providers.push(new GroqProvider());
    }

    let lastError;

    for (const provider of providers) {
      try {
        const questions = await provider.generateQuiz(context, 20, customApiKey);
        if (questions && questions.length > 0) {
          // Robustly sanitize/fix answers before returning
          return sanitizeQuizQuestions(questions);
        }
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        console.warn(`⚠️ [QuizGenerator] Provider failed:`, msg);
        lastError = error;
        // Continue to next provider
      }
    }

    const lastMsg = lastError instanceof Error ? lastError.message : "Unknown";
    throw new Error(`All providers failed. Last error: ${lastMsg}`);
  }
}
