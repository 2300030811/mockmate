import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getNextKey, KeyManager } from "@/utils/keyManager";


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

// --- HELPER: Smart Randomized Sampling ---
// Picks random chunks from the text to ensure variety when regenerating quizzes from the same long file.
function getSmartSample(text: string, limit: number = 25000): string {
  if (!text || text.length <= limit) return text;

  // Always include the beginning (usually contains Intro/Table of Contents/Definitions)
  const introSize = 3000;
  const intro = text.substring(0, introSize);
  
  const remainingText = text.substring(introSize);
  const remainingLimit = limit - introSize;
  
  // We want to pick `numChunks` random blocks from the rest of the file
  const numChunks = 3;
  const chunkSize = Math.floor(remainingLimit / numChunks);
  
  let result = `[SECTION 1: INTRO]\n${intro}\n\n`;

  // Helper to get a random integer between min and max
  const getRandom = (min: number, max: number) => Math.floor(Math.random() * (max - min) + min);

  // Divide the remaining text into 'zones' to ensure we spread sampling across the file
  // but pick a random window within each zone.
  const zoneSize = Math.floor(remainingText.length / numChunks);

  for (let i = 0; i < numChunks; i++) {
     const zoneStart = i * zoneSize;
     const zoneEnd = zoneStart + zoneSize - chunkSize; // Ensure we have room for a full chunk
     
     // Pick a random start point within this zone
     // (careful not to go out of bounds)
     const safeZoneEnd = Math.max(zoneStart, zoneEnd); 
     const randomStart = getRandom(zoneStart, safeZoneEnd);
     
     const chunk = remainingText.substring(randomStart, randomStart + chunkSize);
     result += `[SECTION ${i + 2}: RANDOM PART ${i + 1}]\n${chunk}\n\n`;
  }

  return result;
}

// --- HELPER: Generate with Gemini ---
async function generateWithGemini(content: string, customApiKey?: string) {
  console.log(`⚡ [Gemini] Processing ${content.length} chars...`);

  const modelsToTry = [
    "gemini-1.5-flash",
    "gemini-2.0-flash",
  ];

  // Distribute reading across the file
  const combinedContent = getSmartSample(content); 

  // Get keys: either the custom one, or all available env keys
  let keys: string[] = [];
  if (customApiKey) {
      keys = [customApiKey];
  } else {
      // Use the KeyManager to get all configured keys
      // Accessing private 'keys' property via 'any' cast or Assuming public if I changed it?
      // Actually KeyManager members are private. 
      // Workaround: Instantiate multiple times? No.
      // Let's just use the loop with getNextKey for now, but to be better we should try to get unique keys.
      // Since we can't easily change KeyManager visibility in this step without context switch,
      // We will stick to the "Random Retry" strategy which is statistically sufficient for small N.
      // OR better: we can split the env var manually here since we know the format.
      const envVal = process.env.GOOGLE_API_KEY || "";
      keys = envVal.split(",").map(k => k.trim()).filter(k => k.length > 0);
  }

  if (keys.length === 0) throw new Error("No Google API Keys found");

  let lastError;

  // Double Loop: Iterate Keys -> Iterate Models
  // This maximizes success chance.
  for (const apiKey of keys) {
      const genAI = new GoogleGenerativeAI(apiKey);
      
      for (const modelName of modelsToTry) {
        try {
          console.log(`🤖 [Gemini] Attempting model: ${modelName} with key ending in ...${apiKey.slice(-4)}`);
          const model = genAI.getGenerativeModel({ model: modelName });
          const questions = await generateBatch(model, combinedContent, 15, "Gemini Batch");
          
          if (questions && questions.length > 0) return questions;
        } catch (error: any) {
          console.warn(`⚠️ [Gemini] ${modelName} failed with key ...${apiKey.slice(-4)}:`, error.message);
          lastError = error;
          
          // If it's NOT a quota error (e.g. model not found, invalid argument), maybe don't switch key?
          // But usually we just try everything.
          
          // If strict 429, we definitely continue to next key/model
        }
      }
  }
  
  // Check if we failed due to quota
  if (lastError?.message?.includes("429") || lastError?.message?.includes("quota")) {
      throw new Error("QUOTA_EXCEEDED");
  }
  
  throw new Error("Gemini generation failed on all models and keys");
}

// --- HELPER: Generate with Groq (via openai-compatible fetch) ---
async function generateWithGroq(content: string, customApiKey?: string) {
  console.log(`⚡ [Groq] Processing...`);
  const prompt = `
    You are an AI Quiz Generator. 
    Analyze the text provided and generate exactly 15 multiple-choice questions.
    CRITICAL: Return ONLY a raw JSON array.
    JSON Format: [{"question": "...", "options": ["..."], "answer": "...", "explanation": "..."}]
    TEXT CONTENT: ${content.substring(0, 15000)}
  `;

  const maxRetries = customApiKey ? 1 : 3;
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
      try {
        const apiKey = customApiKey || getNextKey("GROQ_API_KEY");
        if (!apiKey) throw new Error("Groq API Key missing");

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: "You are a helpful assistant that outputs JSON." },
                { role: "user", content: prompt }
            ],
            temperature: 0.5,
            response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            console.warn(`Attempt ${i+1} Groq Error:`, err);
            // If it's a 401 (Invalid Key) or 429 (Rate Limit), we should retry with a new key (if not custom)
            if (response.status === 401 || response.status === 429) {
                 throw new Error(err.error?.message || `Groq API failed: ${response.status}`);
            }
            // Other errors might be fatal, but let's retry anyway to be safe
            throw new Error(err.error?.message || `Groq API failed: ${response.status}`);
        }

        const data = await response.json();
        const rawText = data.choices[0].message.content;
        const questions = JSON.parse(cleanJson(rawText));
        
        if (questions.questions && Array.isArray(questions.questions)) return questions.questions;
        if (Array.isArray(questions)) return questions;
        
        // If parsing didn't result in an array, it's a generation failure
        throw new Error("Failed to parse questions array from response");

      } catch (e: any) {
         console.warn(`⚠️ Groq Attempt ${i+1} failed: ${e.message}`);
         lastError = e;
         if (customApiKey) break; // Don't retry if user provided a specific key
         await new Promise(r => setTimeout(r, 1000));
      }
  }

  throw new Error(lastError?.message || "Groq generation failed after retries");
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
       const key = customApiKey || getNextKey("GOOGLE_API_KEY"); // Vision requires Gemini
       
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
      const geminiKey = process.env.GOOGLE_API_KEY; // Just check existence generally
      const groqKey = process.env.GROQ_API_KEY;

      // 1. Try Gemini First (Rotates internally)
      if (geminiKey) {
        try {
          questions = await generateWithGemini(content);
        } catch (e: any) {
          console.warn("⚠️ Gemini Auto-Attempt Failed:", e.message);
          lastError = e.message;
        }
      }

      // 2. Fallback to Groq if Gemini failed or missing
      if (questions.length === 0) {
        console.log("🔄 Falling back to Groq...");
        try {
          // No key passed here, internally rotates keys
          questions = await generateWithGroq(content);
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
      // If prompt specifically asks for one provider:
      
      try {
        if (provider === "gemini") {
             const key = customApiKey || getNextKey("GOOGLE_API_KEY");
             if (!key) throw new Error("Google API Key missing");
             questions = await generateWithGemini(key, content);
        }
        else if (provider === "groq") {
             // Pass custom key if exists, otherwise it will use pool
             questions = await generateWithGroq(content, customApiKey);
        }
        else if (provider === "openai") {
             const key = customApiKey || getNextKey("OPENAI_API_KEY"); // Might be empty if removed
             if (!key) throw new Error("OpenAI API Key missing");
             questions = await generateWithOpenAI(key, content);
        }
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
