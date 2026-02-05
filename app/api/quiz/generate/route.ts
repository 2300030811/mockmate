import { NextResponse } from "next/server";
import { QuizService, AIProviderName } from "@/lib/ai/quiz-service";
import { getNextKey } from "@/utils/keyManager";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { safeJsonParse } from "@/utils/safeJson";
import { QuizResponseSchema, QuizQuestion } from "@/lib/ai/models";
import { sanitizeQuizQuestions } from "@/lib/ai/quiz-cleanup";

export const dynamic = "force-dynamic";

// --- VISION HELPER (Kept separate for now, as it's specific) ---
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
    
    // Use Safe Parse
    const parsed = safeJsonParse(text, QuizResponseSchema);
    if (!parsed) {
        throw new Error("Failed to parse AI response into valid Quiz JSON.");
    }

    return parsed;
}


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { content, apiKey: customApiKey, provider = "auto", base64Pdf } = body;

    // Validation
    if ((!content || content.length < 500) && !base64Pdf) {
      return NextResponse.json({ error: "Content too short or file empty." }, { status: 400 });
    }

    let rawQuestions: QuizQuestion[] = [];

    // 1. VISION PATH
    if (base64Pdf) {
       console.log("👁️ Taking Vision Path");
       const key = customApiKey || getNextKey("GOOGLE_API_KEY");
       if (!key) return NextResponse.json({ error: "Gemini Key required for Vision" }, { status: 500 });
       
       try {
         rawQuestions = await generateWithGeminiVision(key, base64Pdf);
       } catch (e: any) {
         return NextResponse.json({ error: "Vision Error: " + e.message }, { status: 500 });
       }
    } 
    // 2. TEXT PATH (Using New Service)
    else {
       rawQuestions = await QuizService.generate(content, provider as AIProviderName, customApiKey);
    }

    // Sanitize results (Fix mismatched answers, trim strings)
    // Note: QuizService.generate already does this, but doing it again is harmless and safer for Vision path
    const sanitizedQuestions = sanitizeQuizQuestions(rawQuestions);

    // Final Validation & ID Assignment
    if (!sanitizedQuestions || sanitizedQuestions.length === 0) {
       return NextResponse.json({ error: "Model returned no valid questions." }, { status: 500 });
    }

    const allQuestions = sanitizedQuestions.map((q, index) => ({
      ...q,
      id: index + 1,
    }));

    return NextResponse.json({ questions: allQuestions });

  } catch (error: any) {
    console.error("🔥 Server Error:", error);
    // Handle Zod Errors specifically to give better feedback
    if (error.constructor.name === "ZodError") {
         return NextResponse.json({ error: "AI Output Validation Failed: " + JSON.stringify(error.issues) }, { status: 500 });
    }
    return NextResponse.json({ error: error.message || "Failed to generate quiz." }, { status: 500 });
  }
}
