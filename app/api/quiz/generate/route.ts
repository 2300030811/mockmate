import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";


export const dynamic = "force-dynamic";

function cleanJson(text: string) {
  try {
    const firstBracket = text.indexOf("[");
    const lastBracket = text.lastIndexOf("]");
    if (firstBracket === -1 || lastBracket === -1) return "[]";
    return text.substring(firstBracket, lastBracket + 1);
  } catch (e) {
    return "[]";
  }
}

async function generateBatch(
  model: any,
  content: string,
  count: number,
  batchName: string,
) {
  const prompt = `
    You are an AI Quiz Generator. 
    Analyze the text provided and generate exactly ${count} multiple-choice questions.
    
    CRITICAL: Return ONLY a raw JSON array.
    
    JSON Format:
    [
      {
        "question": "Question text?",
        "options": ["A", "B", "C", "D"],
        "answer": "A",
        "explanation": "Why A is correct."
      }
    ]

    TEXT CONTENT:
    ${content.substring(0, 15000)}
  `;

  try {
    console.log(`⏳ ${batchName} sending request...`);
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" },
    });
    const response = await result.response;
    const text = response.text();

    const cleanedText = cleanJson(text);
    const data = JSON.parse(cleanedText);

    if (!Array.isArray(data)) return [];
    return data;
  } catch (error: any) {
    // RETHROW 404 (Not Found) and 429 (Quota Exceeded) errors
    // distinct from generation failures
    const errMsg = error.message.toLowerCase();
    if (
      errMsg.includes("404") || 
      errMsg.includes("not found") || 
      errMsg.includes("429") || 
      errMsg.includes("quota") || 
      errMsg.includes("too many requests")
    ) {
      throw error;
    }
    console.error(`❌ ${batchName} Failed:`, error.message);
    return [];
  }
}

// --- HELPER: Generate with Gemini Vision (for Scanned PDFs) ---
async function generateWithGeminiVision(apiKey: string, base64Pdf: string) {
  const genAI = new GoogleGenerativeAI(apiKey);
  console.log(`⚡ [Gemini Vision] Processing PDF...`);

  const modelsToTry = [
    "gemini-1.5-flash-8b",     // ✅ Ultra-fast, highest rate limits
    "gemini-1.5-flash",        // ✅ Standard stable version
    "gemini-1.5-pro",          // ✅ High intelligence fallback
  ];

  const prompt = `
    You are an AI Quiz Generator. 
    Analyze the provided PDF document (which may be scanned images).
    Identify the multiple-choice questions visible in the document.
    
    Generate exactly 15 multiple-choice questions based on the content.
    If the document contains questions, extract them or generate similar ones.
    
    CRITICAL: Return ONLY a raw JSON array.
    
    JSON Format:
    [
      {
        "question": "Question text?",
        "options": ["A", "B", "C", "D"],
        "answer": "A",
        "explanation": "Why A is correct."
      }
    ]
  `;

  let lastError = null;
  let quotaErrorOccurred = false;

  for (const modelName of modelsToTry) {
    try {
      console.log(`👁️ [Gemini Vision] Attempting model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Pdf,
            mimeType: "application/pdf",
          },
        },
      ]);
      
      const response = await result.response;
      const text = response.text();
      const cleanedText = cleanJson(text);
      const data = JSON.parse(cleanedText);
      
      if (Array.isArray(data) && data.length > 0) return data;
      
    } catch (error: any) {
       console.warn(`⚠️ [Gemini Vision] ${modelName} failed:`, error.message);
       lastError = error;
       
       if (error.message.includes("429")) {
         quotaErrorOccurred = true;
         console.log("⏳ Quota hit, waiting 5s before retry...");
         await new Promise(r => setTimeout(r, 5000));
       }
    }
  }
  
  if (quotaErrorOccurred) {
      throw new Error("Daily AI Quota Exceeded. Please try again later or use a different API Key.");
  }
  
  throw new Error(lastError?.message || "Vision generation failed on all models");
}

// --- HELPER: Smart Content Sampling ---
// Takes chunks from start, middle, and end to ensure questions cover the full syllabus
function getSmartSample(text: string, limit: number = 25000): string {
  if (!text || text.length <= limit) return text;

  const chunkSize = Math.floor(limit / 3);
  const midPoint = Math.floor(text.length / 2);
  
  const startChunk = text.substring(0, chunkSize);
  const middleChunk = text.substring(midPoint, midPoint + chunkSize);
  const endChunk = text.substring(text.length - chunkSize);

  return `
    [SECTION 1: BEGINNING]
    ${startChunk}
    
    [SECTION 2: MIDDLE]
    ${middleChunk}
    
    [SECTION 3: END]
    ${endChunk}
  `;
}

// --- HELPER: Generate with Gemini ---
async function generateWithGemini(apiKey: string, content: string) {
  const genAI = new GoogleGenerativeAI(apiKey);
  console.log(`⚡ [Gemini] Processing ${content.length} chars...`);

  const modelsToTry = [
    "gemini-1.5-flash",
    "gemini-2.0-flash",
  ];

  // Distribute reading across the file
  const combinedContent = getSmartSample(content); 

  for (const modelName of modelsToTry) {
    try {
      console.log(`🤖 [Gemini] Attempting model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const questions = await generateBatch(model, combinedContent, 15, "Gemini Batch");
      
      if (questions && questions.length > 0) return questions;
    } catch (error: any) {
      console.error(`⚠️ [Gemini] ${modelName} failed:`, error.message);
      // Propagate 429 quota errors immediately so we can fallback
      if (error.message.includes("429") || error.message.includes("quota")) {
        throw new Error("QUOTA_EXCEEDED");
      }
    }
  }
  throw new Error("Gemini generation failed on all models");
}

// --- HELPER: Generate with Groq (via openai-compatible fetch) ---
async function generateWithGroq(apiKey: string, content: string) {
  console.log(`⚡ [Groq] Processing...`);
  const prompt = `
    You are an AI Quiz Generator. 
    Analyze the text provided and generate exactly 15 multiple-choice questions.
    CRITICAL: Return ONLY a raw JSON array.
    JSON Format: [{"question": "...", "options": ["..."], "answer": "...", "explanation": "..."}]
    TEXT CONTENT: ${content.substring(0, 15000)}
  `;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile", // Or llama3-70b-8192
      messages: [
        { role: "system", content: "You are a helpful assistant that outputs JSON." },
        { role: "user", content: prompt }
      ],
      temperature: 0.5,
      response_format: { type: "json_object" } // Force JSON mode
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    console.error("Groq Error:", err);
    throw new Error(err.error?.message || `Groq API failed: ${response.status}`);
  }

  const data = await response.json();
  const rawText = data.choices[0].message.content;
  const questions = JSON.parse(cleanJson(rawText));
  
  // Clean up format if needed
  if (questions.questions && Array.isArray(questions.questions)) return questions.questions;
  if (Array.isArray(questions)) return questions;
  return [];
}

// --- HELPER: Generate with OpenAI ---
async function generateWithOpenAI(apiKey: string, content: string) {
  console.log(`⚡ [OpenAI] Processing...`);
  const prompt = `
    You are an AI Quiz Generator. 
    Analyze the text provided and generate exactly 15 multiple-choice questions.
    Return ONLY a raw JSON array.
    TEXT CONTENT: ${content.substring(0, 10000)}
  `;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant that outputs JSON." },
        { role: "user", content: prompt }
      ]
    })
  });

  if (!response.ok) throw new Error("OpenAI API failed");

  const data = await response.json();
  const rawText = data.choices[0].message.content;
  return JSON.parse(cleanJson(rawText));
}

// --- MAIN HANDLER ---
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { content, apiKey: customApiKey, provider = "auto", base64Pdf } = body;

    // Validation: Require either text content OR a base64 PDF
    if ((!content || content.length < 500) && !base64Pdf) {
      return NextResponse.json({ error: "Content too short or file empty." }, { status: 400 });
    }

    let questions: any[] = [];
    let lastError = "";

    // --- STRATEGY: VISION (Scanned PDF) ---
    if (base64Pdf) {
       console.log("👁️ Taking Vision Path (Scanned PDF)");
       const key = customApiKey || process.env.GOOGLE_API_KEY; // Vision requires Gemini
       
       if (!key) return NextResponse.json({ error: "Gemini API Key required for scanned PDFs" }, { status: 500 });

       try {
         questions = await generateWithGeminiVision(key, base64Pdf);
         if (questions.length > 0) {
            return NextResponse.json({ 
                questions: questions.map((q: any, index: number) => ({ ...q, id: index + 1 })) 
            });
         }
       } catch (e: any) {
          console.error("Vision Error:", e);
          return NextResponse.json({ error: "Failed to read scanned PDF: " + e.message }, { status: 500 });
       }
    }

    // --- STRATEGY: TEXT (Standard) ---
    // ... existing text strategy ...
    if (provider === "auto") {
      const geminiKey = process.env.GOOGLE_API_KEY;
      const groqKey = process.env.GROQ_API_KEY;

      // 1. Try Gemini First
      if (geminiKey) {
        try {
          questions = await generateWithGemini(geminiKey, content);
        } catch (e: any) {
          console.warn("⚠️ Gemini Auto-Attempt Failed:", e.message);
          lastError = e.message;
        }
      }

      // 2. Fallback to Groq if Gemini failed or missing
      if (questions.length === 0 && groqKey) {
        console.log("🔄 Falling back to Groq...");
        try {
          questions = await generateWithGroq(groqKey, content);
        } catch (e: any) {
          console.warn("⚠️ Groq Auto-Attempt Failed:", e.message);
          lastError = e.message;
        }
      }

      if (questions.length === 0) {
         return NextResponse.json({ 
           error: `Auto-generation failed. Gemini Error: ${lastError || "Unknown"}` 
         }, { status: 429 });
      }
    } 
    
    // --- STRATEGY: MANUAL ---
    else {
      const key = customApiKey || 
                 (provider === "gemini" ? process.env.GOOGLE_API_KEY : 
                  provider === "groq" ? process.env.GROQ_API_KEY : "");

      if (!key) return NextResponse.json({ error: `${provider} API Key missing` }, { status: 500 });
      
      try {
        if (provider === "gemini") questions = await generateWithGemini(key, content);
        else if (provider === "groq") questions = await generateWithGroq(key, content);
        else if (provider === "openai") questions = await generateWithOpenAI(key, content);
      } catch (e: any) {
         return NextResponse.json({ error: e.message }, { status: 500 });
      }
    }

    // Final Validation
    if (!questions || questions.length === 0) {
       return NextResponse.json({ error: "Model returned no valid questions." }, { status: 500 });
    }

    const allQuestions = questions.map((q: any, index: number) => ({
      ...q,
      id: index + 1,
    }));

    return NextResponse.json({ questions: allQuestions });

  } catch (error: any) {
    console.error("🔥 Server Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate quiz." },
      { status: 500 },
    );
  }
}
