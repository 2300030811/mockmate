import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API Key missing" }, { status: 500 });
    }

    const formData = await req.formData();
    const audioFile = formData.get("file") as File;

    if (!audioFile) {
        return NextResponse.json({ error: "No audio file uploaded" }, { status: 400 });
    }

    // Convert file to base64
    const buffer = await audioFile.arrayBuffer();
    const base64Audio = Buffer.from(buffer).toString("base64");

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Fallback models for transcription
    const modelsToTry = [
        "gemini-2.0-flash-lite-preview-02-05", 
        "gemini-1.5-flash",
        "gemini-1.5-pro"
    ];

    let lastError = null;

    for (const modelName of modelsToTry) {
        try {
            console.log(`Trying transcription with model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent({
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      text: `Transcribe the following audio exactly. 
                             Do not add any commentary, timestamps, or speaker labels.
                             If the audio is silent or unintelligible, return an empty string.
                             Return ONLY the raw transcription text.` 
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
            console.log(`Success with ${modelName}:`, text.substring(0, 50) + "...");
            return NextResponse.json({ text });

        } catch (e: any) {
            console.error(`Model ${modelName} failed:`, e.message);
            lastError = e;
            // Short delay before next retry to avoid hammering api
            await new Promise(r => setTimeout(r, 1000));
        }
    }

    // Return detailed error to help debugging
    const errorMessage = lastError?.message || "All models failed";
    console.error("All transcription attempts failed:", errorMessage);
    
    // Check for specific common errors
    if (errorMessage.includes("API Key missing")) {
        return NextResponse.json({ error: "Server Configuration Error: API Key missing" }, { status: 500 });
    }
    
    if (errorMessage.includes("429")) {
        return NextResponse.json({ error: "Service Busy: Rate limit exceeded for all models. Please wait a moment." }, { status: 429 });
    }

    return NextResponse.json({ error: `Transcription failed: ${errorMessage}` }, { status: 500 });

  } catch (error: any) {
    console.error("Transcription error:", error);
    return NextResponse.json({ error: "Transcription failed: " + error.message }, { status: 500 });
  }
}
