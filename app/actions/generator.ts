"use server";

import { QuizService, AIProviderName } from "@/lib/ai/quiz-service";
import { getNextKey } from "@/utils/keyManager";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { safeJsonParse } from "@/utils/safeJson";
import { QuizResponseSchema, QuizQuestion } from "@/lib/ai/models";
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

    console.log(`📂 Processing: ${file.name} | Size: ${file.size} bytes`);

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

  } catch (error: any) {
    console.error("❌ Convert Action Error:", error);
    throw new Error(error.message || "File conversion failed");
  }
}

/**
 * Separate Vision Helper
 */
async function generateWithGeminiVision(apiKey: string, base64Pdf: string): Promise<QuizQuestion[]> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    You are an AI Quiz Generator. 
    Analyze the provided PDF document (which may be scanned images).
    EXTRACT recognized multiple-choice questions.
    Return ONLY a raw JSON array.
    Format: [{"question": "...", "options": ["..."], "answer": "...", "explanation": "..."}]
  `;

  const result = await model.generateContent([
    prompt,
    { inlineData: { data: base64Pdf, mimeType: "application/pdf" } },
  ]);

  const response = await result.response;
  const text = response.text();
  
  const parsed = safeJsonParse(text, QuizResponseSchema);
  if (!parsed) {
      throw new Error("Failed to parse AI response into valid Quiz JSON.");
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
    base64Pdf?: string
) {
  try {
    if ((!content || content.length < 500) && !base64Pdf) {
      throw new Error("Content too short or file empty.");
    }

    let rawQuestions: QuizQuestion[] = [];

    // 1. VISION PATH
    if (base64Pdf) {
       console.log("👁️ Taking Vision Path (Action)");
       const key = customApiKey || getNextKey("GOOGLE_API_KEY");
       if (!key) throw new Error("Gemini Key required for Vision");
       
       rawQuestions = await generateWithGeminiVision(key, base64Pdf);
    } 
    // 2. TEXT PATH
    else {
       rawQuestions = await QuizService.generate(content, provider as AIProviderName, customApiKey);
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

  } catch (error: any) {
    console.error("🔥 Generate Action Error:", error);
    if (error.constructor.name === "ZodError") {
         throw new Error("AI Output Validation Failed: " + JSON.stringify(error.issues));
    }
    throw new Error(error.message || "Failed to generate quiz.");
  }
}
