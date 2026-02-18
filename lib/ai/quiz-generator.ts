import { GeminiProvider } from "./providers/gemini-provider";
import { GroqProvider } from "./providers/groq-provider";
import { OpenAIProvider } from "./providers/openai-provider";
import { GeneratedQuizQuestion } from "./models";
import { sanitizeQuizQuestions } from "./quiz-cleanup";

export type AIProviderName = "gemini" | "groq" | "openai" | "auto";

export class QuizGenerator {
  private static findSafeBoundary(text: string, targetIndex: number, window: number = 500): number {
    // Look for sentence endings (.!?) or newlines within the window around the target
    const searchArea = text.substring(Math.max(0, targetIndex - window), Math.min(text.length, targetIndex + window));
    
    // Prefer paragraph breaks
    const paragraphBreak = searchArea.lastIndexOf("\n\n");
    if (paragraphBreak !== -1) return Math.max(0, targetIndex - window) + paragraphBreak + 2;

    // Fallback to sentence endings
    const sentenceEnd = searchArea.lastIndexOf(". ");
    if (sentenceEnd !== -1) return Math.max(0, targetIndex - window) + sentenceEnd + 2;

    // Last resort: search for space
    const space = searchArea.lastIndexOf(" ");
    if (space !== -1) return Math.max(0, targetIndex - window) + space + 1;

    return targetIndex;
  }

  private static getSmartSample(text: string, limit: number = 25000): string {
    if (!text || text.length <= limit) return text;

    // 1. Get a solid intro (approx 3k chars, but safe cut)
    const introTarget = 3000;
    const introCut = this.findSafeBoundary(text, introTarget);
    const intro = text.substring(0, introCut);

    const remainingText = text.substring(introCut);
    const remainingLimit = limit - intro.length;
    
    // If we have plenty of space, just take the next chunk
    if (remainingText.length <= remainingLimit) {
        return intro + "\n\n" + remainingText;
    }

    // 2. Pick 3 distinct "Zones" from the rest of the text
    const numChunks = 3;
    const chunkSize = Math.floor(remainingLimit / numChunks);
    const zoneSize = Math.floor(remainingText.length / numChunks);

    let result = `[SECTION 1: INTRODUCTION]\n${intro}\n\n`;

    for (let i = 0; i < numChunks; i++) {
       // Define the zone (start to end)
       const zoneStart = i * zoneSize;
       // We want a random start point within this zone, but leaving room for the chunk
       const maxRandomStart = Math.max(zoneStart, zoneStart + zoneSize - chunkSize);
       
       let randomStart = Math.floor(Math.random() * (maxRandomStart - zoneStart) + zoneStart);
       
       // Align randomStart to a safe boundary
       randomStart = this.findSafeBoundary(remainingText, randomStart, 200);

       // Ensure we don't go out of bounds
       const actualEnd = Math.min(remainingText.length, randomStart + chunkSize);
       const safeEnd = this.findSafeBoundary(remainingText, actualEnd, 200);

       const chunk = remainingText.substring(randomStart, safeEnd);
       result += `[SECTION ${i + 2}: CONTENT PART ${i + 1}]\n${chunk}\n\n`;
    }

    return result;
  }

  /**
   * Shuffles questions and their options using Fisher-Yates algorithm.
   * Ensures the "answer" string remains synced with the shuffled options.
   */
  private static shuffleQuiz(questions: GeneratedQuizQuestion[]): GeneratedQuizQuestion[] {
    const shuffledQuestions = [...questions];

    // 1. Shuffle the order of questions
    for (let i = shuffledQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledQuestions[i], shuffledQuestions[j]] = [shuffledQuestions[j], shuffledQuestions[i]];
    }

    // 2. Shuffle options within each question
    return shuffledQuestions.map(q => {
      const options = [...q.options];
      const correctAnswer = q.answer; // Store original answer text

      // Shuffle options
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }

      return {
        ...q,
        options,
        // The answer is the text string itself, so as long as options still contains it, we are fine.
        // However, if the answer was an index (like "A"), we'd be in trouble. 
        // Our schema enforces the answer is the *text content* of the option.
        answer: correctAnswer 
      };
    });
  }

  static async generate(
    content: string, 
    providerName: AIProviderName = "auto", 
    customApiKey?: string,
    count: number = 20,
    difficulty: string = "medium",
    mode: "quiz" | "flashcard" = "quiz"
  ): Promise<GeneratedQuizQuestion[]> {
    
    // Define strategy
    const providers = [];

    if (providerName === "gemini") {
      providers.push(new GeminiProvider());
    } else if (providerName === "groq") {
      providers.push(new GroqProvider());
    } else if (providerName === "openai") {
      providers.push(new OpenAIProvider());
    } else {
      // Auto Strategy: Gemini -> Groq
      providers.push(new GeminiProvider());
      providers.push(new GroqProvider());
    }

    let lastError;
    
    // Request fewer questions if we are just testing, otherwise ask for a buffer!
    // We request count + 30% to allow for filtering and randomness.
    const targetCount = Math.ceil(count * 1.3);

    for (const provider of providers) {
      try {
        console.log(`🤖 Attempting ${mode} generation with ${provider.constructor.name}...`);
        
        // --- SMART CONTEXT LOGIC ---
        // Gemini supports 1M+ tokens. We can send the WHOLE file (up to ~500k chars safely).
        // Groq/OpenAI have smaller limits (approx 8k-128k). We must truncate/sample.
        let providerContext = content;
        
        if (provider instanceof GeminiProvider) {
             console.log("🌌 Gemini Limit: Using Large Context (Up to 500k chars)");
             providerContext = this.getSmartSample(content, 500000); 
        } else {
             console.log("✂️ Standard Limit: Sampling Text (40k chars)");
             providerContext = this.getSmartSample(content, 40000);
        }
        
        const questions = await provider.generateQuiz(providerContext, targetCount, difficulty, customApiKey, mode);
        
        if (questions && questions.length > 0) {
          const sanitized = sanitizeQuizQuestions(questions);
          // Shuffle and slice to the requested count
          const finalQuiz = this.shuffleQuiz(sanitized).slice(0, count);
          return finalQuiz;
        }
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        console.warn(`⚠️ [QuizGenerator] Provider failed:`, msg);
        lastError = error;
        
        // If it's a quota error or explicit limit, skip to next
        if (msg.toLowerCase().includes("limit") || msg.includes("429")) {
           continue;
        }
        
        if (providerName === "auto") continue;
        throw error;
      }
    }

    // Capture the last error details more robustly
    let lastMsg = "Unknown error";
    if (lastError) {
        if (lastError instanceof Error) {
            lastMsg = lastError.message;
        } else if (typeof lastError === 'object') {
            try {
                lastMsg = JSON.stringify(lastError);
            } catch {
                lastMsg = String(lastError);
            }
        } else {
            lastMsg = String(lastError);
        }
    }

    console.error("❌ [QuizGenerator] Final Failure. Last Error:", lastError);
    throw new Error(`All providers failed. Last error: ${lastMsg}`);
  }
}
