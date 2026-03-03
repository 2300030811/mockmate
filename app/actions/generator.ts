"use server";

import { QuizGenerator, AIProviderName } from "@/lib/ai/quiz-generator";
import { getNextKey } from "@/utils/keyManager";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { safeJsonParse } from "@/utils/safeJson";
import { GeneratedQuizResponseSchema, GeneratedQuizQuestion, GeneratedQuizResponse } from "@/lib/ai/models";
import { sanitizeQuizQuestions } from "@/lib/ai/quiz-cleanup";
import { StorageService } from "@/lib/services/storage";
import { OCRService } from "@/lib/services/ocr";
import { createClient } from "@/utils/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { AppError } from "@/lib/exceptions";
import { logger } from "@/lib/logger";
import { PromptBuilder } from "@/lib/ai/prompt-builder";

const VISION_TIMEOUT_MS = 45_000; // Vision is heavier — give it more time

/**
 * Server Action to convert an uploaded PDF file to text.
 */
export async function convertFileAction(formData: FormData) {
  try {
    const file = formData.get("file") as File;

    if (!file || !(file instanceof File)) {
      throw new AppError("No file uploaded", "BAD_REQUEST", 400);
    }

    // Validate file type — only accept PDFs
    const allowedTypes = ["application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      throw new AppError(`Invalid file type: ${file.type}. Only PDF files are accepted.`, "BAD_REQUEST", 400);
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new AppError("File too large. Please upload < 10MB.", "PAYLOAD_TOO_LARGE", 413);
    }

    const stream = file.stream();
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }
    const buffer = Buffer.concat(chunks);

    // --- AZURE BLOB STORAGE BACKUP (Fire & Forget) ---
    // We don't await this so it doesn't slow down the user
    void StorageService.uploadResumeBackup(buffer, file.name);

    // --- OCR EXTRACTION ---
    const { text, source } = await OCRService.extractText(buffer);

    // --- SCANNED FALLBACK CHECK ---
    if (OCRService.isScanned(text)) {
      logger.warn("Text extraction failed (< 50 chars). Vision Mode needed.");
      return {
        text: "",
        isScanned: true,
        base64: buffer.toString("base64")
      };
    }

    return { text, isScanned: false, source };

  } catch (error: unknown) {
    logger.error("Convert Action Error:", error);
    const msg = error instanceof Error ? error.message : "File conversion failed";
    return { error: msg };
  }
}

/**
 * Separate Vision Helper
 */
async function generateWithGeminiVision(apiKey: string, base64Pdf: string, count: number = 20, difficulty: string = "medium", mode: "quiz" | "flashcard" = "quiz"): Promise<GeneratedQuizQuestion[]> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

  const prompt = PromptBuilder.buildVisionPrompt(count, difficulty, mode);

  // The Gemini SDK doesn't support AbortController signals, so use
  // Promise.race to enforce a hard timeout for the vision path.
  const generatePromise = model.generateContent([
    prompt,
    { inlineData: { data: base64Pdf, mimeType: "application/pdf" } },
  ]);

  const result = await Promise.race([
    generatePromise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new DOMException("Gemini Vision request timed out", "AbortError")), VISION_TIMEOUT_MS)
    ),
  ]);

  const response = await result.response;
  const text = response.text();

  const parsed = safeJsonParse(text, GeneratedQuizResponseSchema);
  if (!parsed) {
    throw new AppError("Failed to parse AI Vision response into valid Quiz JSON.", "AI_ERROR", 500);
  }

  return parsed as GeneratedQuizResponse;
}

/**
 * Server Action to generate quiz questions from text.
 */
export async function generateQuizAction(
  content: string,
  provider: string = "auto",
  customApiKey?: string,
  base64Pdf?: string,
  count: number = 20,
  difficulty: string = "medium",
  mode: "quiz" | "flashcard" = "quiz"
) {
  try {
    // Auth guard: use user ID if logged in, otherwise let rate limit use IP for guests
    let userId: string | null = null;
    if (!customApiKey) {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;
      }
    }

    // Rate limit: 10 generations per hour for users, 10/day for guests
    const { success: withinLimit, message: limitMsg } = await rateLimit("generate", userId);
    if (!withinLimit) {
      return { error: limitMsg || "Rate limit exceeded. Please wait before generating more quizzes." };
    }

    if ((!content || content.length < 100) && !base64Pdf) {
      throw new AppError("Content too short or file empty.", "BAD_REQUEST", 400);
    }

    let rawQuestions: GeneratedQuizQuestion[] = [];

    // 1. VISION PATH (with fallback to text path on failure)
    if (base64Pdf) {
      logger.info("Taking Vision Path (Action)");
      const key = customApiKey || getNextKey("GOOGLE_API_KEY");
      if (!key) throw new AppError("Gemini Key required for Vision", "CONFIG_ERROR", 500);

      try {
        rawQuestions = await generateWithGeminiVision(key, base64Pdf, count, difficulty, mode);
      } catch (visionError) {
        logger.warn("Vision path failed, attempting text fallback:", visionError);
        // If we have enough extracted text, fall back to the standard text path
        if (content && content.length >= 100) {
          logger.info("Falling back to text-based generation from extracted content");
          rawQuestions = await QuizGenerator.generate(
            content,
            provider as AIProviderName,
            customApiKey,
            count,
            difficulty,
            mode
          );
        } else {
          // No usable text either — re-throw the original vision error
          throw visionError;
        }
      }
    }
    // 2. TEXT PATH
    else {
      rawQuestions = await QuizGenerator.generate(
        content,
        provider as AIProviderName,
        customApiKey,
        count,
        difficulty,
        mode
      );
    }

    // QuizGenerator.generate() already sanitizes internally; but the vision
    // path needs explicit sanitization to drop unanswerable questions.
    if (base64Pdf) {
      rawQuestions = sanitizeQuizQuestions(rawQuestions);
    }

    if (!rawQuestions || rawQuestions.length === 0) {
      throw new AppError("Model returned no valid questions.", "AI_ERROR", 500);
    }

    const allQuestions = rawQuestions.map((q, index) => ({
      ...q,
      id: index + 1,
    }));

    return allQuestions;

  } catch (error: unknown) {
    logger.error("Generate Action Error:", error);
    if (error && typeof error === 'object' && 'issues' in error) {
      return { error: "AI Output Validation Failed: " + JSON.stringify((error as { issues: unknown }).issues) };
    }
    const msg = error instanceof Error ? error.message : "Failed to generate quiz.";
    return { error: msg };
  }
}
