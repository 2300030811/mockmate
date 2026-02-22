"use server";

import { QuizGenerator, AIProviderName } from "@/lib/ai/quiz-generator";
import { getNextKey } from "@/utils/keyManager";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { safeJsonParse } from "@/utils/safeJson";
import { GeneratedQuizResponseSchema, GeneratedQuizQuestion } from "@/lib/ai/models";
import { sanitizeQuizQuestions } from "@/lib/ai/quiz-cleanup";
import { StorageService } from "@/lib/services/storage";
import { OCRService } from "@/lib/services/ocr";
import { createClient } from "@/utils/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { AppError } from "@/lib/exceptions";
import { logger } from "@/lib/logger";

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
    throw new AppError(msg, "CONVERT_ERROR", 500);
  }
}

/**
 * Separate Vision Helper
 */
async function generateWithGeminiVision(apiKey: string, base64Pdf: string, count: number = 20, difficulty: string = "medium", mode: "quiz" | "flashcard" = "quiz"): Promise<GeneratedQuizQuestion[]> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  let prompt = "";
  if (mode === "flashcard") {
    prompt = `
      You are an elite Study Assistant.
      Analyze the provided PDF document.
      
      TASK:
      Extract key concepts, definitions, and visual facts to create high-quality FLASHCARDS.
      
      CRITICAL INSTRUCTIONS:
      1. QUANTITY: Generate AT LEAST ${Math.max(count, 15)} flashcards.
      2. FORMAT:
         - Return a JSON array.
         - Structure: [{"question": "Concept", "options": ["Definition"], "answer": "Definition", "explanation": "Context"}]
         - 'question' is the Front. 'answer' is the Back.
      3. QUALITY:
         - Front: Clear term/concept/diagram query.
         - Back: Concise, accurate definition/answer.
    `;
  } else {
    prompt = `
      You are an elite AI Quiz Architect. 
      Analyze the provided PDF document (which may contain text, images, handwritten notes, or diagrams).
      
      CORE OBJECTIVE:
      EXTRACT and GENERATE high-quality, professional-grade multiple-choice questions (MCQs) that accurately reflect the document's content.
      
      CRITICAL INSTRUCTIONS:
      1. QUESTION DIVERSITY & DEPTH:
         - Target: ${Math.max(count, 15)} questions.
         - DIFFICULTY: ${difficulty.toUpperCase()}.
         - EASY: Focus on terminology and basic concepts.
         - MEDIUM: Focus on application, relationships between concepts, and analysis.
         - HARD: Focus on synthesis, edge cases, complex diagrams, and multi-step reasoning.
         - Use a mix of:
           * Direct identification from text/images.
           * Concept synthesis across pages.
           * Scenario-based problem solving.
      
      2. OPTION QUALITY:
         - Provide exactly 4 options per question.
         - Distractors (wrong answers) MUST be plausible and related to the content, not obviously silly.
         - Avoid "All of the above" or "None of the above" unless absolutely necessary.
      
      3. EXPLANATIONS:
         - Provide a comprehensive explanation for EACH question.
         - Explain WHY the correct answer is right and why major distractors are wrong.
      
      4. TECHNICAL SPECIFICATIONS:
         - Return ONLY a raw JSON array.
         - NO markdown formatting (no \`\`\`json blocks).
         - STRUCTURE: [{"question": "...", "options": ["...", "...", "...", "..."], "answer": "...", "explanation": "..."}]
         - ACCURACY: The "answer" field MUST be a CHARACTER-FOR-CHARACTER match with one of the strings in the "options" array.
    `;
  }

  const result = await model.generateContent([
    prompt,
    { inlineData: { data: base64Pdf, mimeType: "application/pdf" } },
  ]);

  const response = await result.response;
  const text = response.text();
  
  const parsed = safeJsonParse(text, GeneratedQuizResponseSchema);
  if (!parsed) {
      throw new AppError("Failed to parse AI Vision response into valid Quiz JSON.", "AI_ERROR", 500);
  }

  return parsed;
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
    // Auth guard: require login unless user provides their own API key
    let userId: string | null = null;
    if (!customApiKey) {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new AppError("Authentication required. Please sign in or provide your own API key.", "UNAUTHORIZED", 401);
      }
      userId = user.id;
    }

    // Rate limit: 10 generations per hour
    const { success: withinLimit } = await rateLimit("generate", userId);
    if (!withinLimit) {
      throw new AppError("Rate limit exceeded. Please wait before generating more quizzes.", "TOO_MANY_REQUESTS", 429);
    }

    if ((!content || content.length < 100) && !base64Pdf) {
      throw new AppError("Content too short or file empty.", "BAD_REQUEST", 400);
    }

    let rawQuestions: GeneratedQuizQuestion[] = [];

    // 1. VISION PATH
    if (base64Pdf) {
       logger.info("Taking Vision Path (Action)");
       const key = customApiKey || getNextKey("GOOGLE_API_KEY");
       if (!key) throw new AppError("Gemini Key required for Vision", "CONFIG_ERROR", 500);
       
       rawQuestions = await generateWithGeminiVision(key, base64Pdf, count, difficulty, mode);
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

    const sanitizedQuestions = sanitizeQuizQuestions(rawQuestions);

    if (!sanitizedQuestions || sanitizedQuestions.length === 0) {
       throw new AppError("Model returned no valid questions.", "AI_ERROR", 500);
    }

    const allQuestions = sanitizedQuestions.map((q, index) => ({
      ...q,
      id: index + 1,
    }));

    return allQuestions;

  } catch (error: unknown) {
    logger.error("Generate Action Error:", error);
    if (error && typeof error === 'object' && 'issues' in error) {
      throw new AppError("AI Output Validation Failed: " + JSON.stringify((error as { issues: unknown }).issues), "AI_VALIDATION_ERROR", 500);
    }
    const msg = error instanceof Error ? error.message : "Failed to generate quiz.";
    throw new AppError(msg, "GENERATE_ERROR", 500);
  }
}
