import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("file") as File;

    if (!audioFile) {
        return NextResponse.json({ error: "No audio file uploaded" }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // -------------------------------------------------------------------------
    // 📢 FREE TIER PRIORITY: GOOGLE GEMINI (Flash/Pro)
    // -------------------------------------------------------------------------
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "No AI Configured (Missing Google Key)" }, { status: 500 });
    }

    const base64Audio = buffer.toString("base64");
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // We try the fastest model first for near real-time performance
    const modelsToTry = [
        "gemini-2.0-flash-lite-preview-02-05", 
        "gemini-1.5-flash",
    ];

    let lastError = null;

    for (const modelName of modelsToTry) {
        try {
            console.log(`🎙️ Transcribing with free model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent({
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      text: `Transcribe the following audio exactly. 
                             Return ONLY the raw text. Empty string if silence.` 
                    },
                    {
                      inlineData: {
                        mimeType: audioFile.type || "audio/webm",
                        data: base64Audio
                      }
                    }
                  ]
                }
              ]
            });

            const response = await result.response;
            const text = response.text().trim();
            return NextResponse.json({ text });

        } catch (e: any) {
            console.error(`Model ${modelName} failed:`, e.message);
            lastError = e;
        }
    }

    throw new Error(lastError?.message || "Transcription failed");

  } catch (error: any) {
    console.error("Transcription error:", error);
    return NextResponse.json({ error: "Transcription failed: " + error.message }, { status: 500 });
  }
}
