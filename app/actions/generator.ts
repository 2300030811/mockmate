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
async function generateWithGeminiVision(apiKey: string, base64Pdf: string, count: number = 20, difficulty: string = "medium"): Promise<GeneratedQuizQuestion[]> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    You are an expert AI Quiz Generator. 
    Analyze the provided PDF document (which may contain scanned images, handwritten notes, or complex diagrams).
    
    TASK:
    EXTRACT and GENERATE high-quality multiple-choice questions from the content.
    
    CRITICAL INSTRUCTIONS:
    1. QUANTITY & QUALITY:
       - Target: ${Math.max(count, 15)} questions.
       - DIFFICULTY: ${difficulty.toUpperCase()}.
       - Use factual recall, conceptual understanding, and scenario-based questions.
    2. FORMAT: Return ONLY a raw JSON array.
    3. STRUCTURE: [{"question": "...", "options": ["..."], "answer": "...", "explanation": "..."}]
    4. ACCURACY: Ensure the "answer" field EXACTLY matches one of the "options" strings.
  `;

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
    difficulty: string = "medium"
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
       
       rawQuestions = await generateWithGeminiVision(key, base64Pdf, count, difficulty);
    } 
    // 2. TEXT PATH
    else {
       rawQuestions = await QuizGenerator.generate(
         content, 
         provider as AIProviderName, 
         customApiKey, 
         count, 
         difficulty
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
