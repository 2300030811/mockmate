"use server";

import { QuizGenerator, AIProviderName } from "@/lib/ai/quiz-generator";
import { getNextKey } from "@/utils/keyManager";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { safeJsonParse } from "@/utils/safeJson";
import { GeneratedQuizResponseSchema, GeneratedQuizQuestion } from "@/lib/ai/models";
import { sanitizeQuizQuestions } from "@/lib/ai/quiz-cleanup";
import { StorageService } from "@/lib/services/storage";
import { OCRService } from "@/lib/services/ocr";

// ⚠️ FORCE NODEJS RUNTIME
// export const runtime = "nodejs";



/**
 * Server Action to convert an uploaded PDF file to text.
 */
export async function convertFileAction(formData: FormData) {
  try {
    const file = formData.get("file") as File;

    if (!file || !(file instanceof File)) {
      throw new Error("No file uploaded");
    }

    // Validate file type — only accept PDFs
    const allowedTypes = ["application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Invalid file type: ${file.type}. Only PDF files are accepted.`);
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new Error("File too large. Please upload < 10MB.");
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // --- AZURE BLOB STORAGE BACKUP (Fire & Forget) ---
    // We don't await this so it doesn't slow down the user
    void StorageService.uploadResumeBackup(buffer, file.name);

    // --- OCR EXTRACTION ---
    const { text, source } = await OCRService.extractText(buffer);

    // --- SCANNED FALLBACK CHECK ---
    if (OCRService.isScanned(text)) {
      console.warn("⚠️ Text extraction failed (< 50 chars). Vision Mode needed.");
      return { 
        text: "",
        isScanned: true,
        base64: buffer.toString("base64")
      };
    }

    return { text, isScanned: false, source };

  } catch (error: unknown) {
    console.error("❌ Convert Action Error:", error);
    const msg = error instanceof Error ? error.message : "File conversion failed";
    throw new Error(msg);
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
      throw new Error("Failed to parse AI Vision response into valid Quiz JSON.");
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
    if ((!content || content.length < 100) && !base64Pdf) {
      throw new Error("Content too short or file empty.");
    }

    let rawQuestions: GeneratedQuizQuestion[] = [];

    // 1. VISION PATH
    if (base64Pdf) {
       console.log("👁️ Taking Vision Path (Action)");
       const key = customApiKey || getNextKey("GOOGLE_API_KEY");
       if (!key) throw new Error("Gemini Key required for Vision");
       
       // Vision doesn't strictly support mode yet, but we can assume 'quiz' or add it later if needed.
       // For now, let's keep Vision as Quiz-only or modify generateWithGeminiVision if requested.
       // Given user requested flashcards, let's update Vision too or fallback?
       // Let's pass mode to Vision function if we update it. For now, assuming text path for flashcards mostly.
       // Actually, let's update generateWithGeminiVision signature too for consistency.
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
       throw new Error("Model returned no valid questions.");
    }

    const allQuestions = sanitizedQuestions.map((q, index) => ({
      ...q,
      id: index + 1,
    }));

    return allQuestions;

  } catch (error: unknown) {
    console.error("🔥 Generate Action Error:", error);
    if (error && typeof error === 'object' && 'issues' in error) {
      throw new Error("AI Output Validation Failed: " + JSON.stringify((error as { issues: unknown }).issues));
    }
    const msg = error instanceof Error ? error.message : "Failed to generate quiz.";
    throw new Error(msg);
  }
}
