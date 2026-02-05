import { NextResponse } from "next/server";
import { Configuration, OpenAIApi } from "openai";
import { getNextKey } from "@/utils/keyManager";
import { BlobServiceClient } from "@azure/storage-blob";
import fs from "fs";
import path from "path";
import os from "os";

// Helper for cleanup
const safeUnlink = (path: string) => {
    try {
        if (fs.existsSync(path)) fs.unlinkSync(path);
    } catch (e) {
        console.error("Error deleting temp file:", e);
    }
};

export async function POST(req: Request) {
  let tempFilePath = "";
  
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Save to temp file strictly for OpenAI v3 compatibility (it likes file streams)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const tempDir = os.tmpdir();
    const fileName = `rec-${Date.now()}-${file.name}`;
    tempFilePath = path.join(tempDir, fileName);
    
    fs.writeFileSync(tempFilePath, buffer);
    console.log("Transcribing file:", tempFilePath);

    // -----------------------------------------------------------------------
    // ☁️ AZURE BLOB STORAGE BACKUP (Adapted from legacy)
    // -----------------------------------------------------------------------
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (connectionString) {
        try {
            const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
            const containerClient = blobServiceClient.getContainerClient("recordings");
            await containerClient.createIfNotExists({ access: 'blob' });

            const blobName = fileName;
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);
            
            console.log("🔹 Backing up audio to Azure Blob...");
            await blockBlobClient.uploadFile(tempFilePath);
            console.log(`✅ Upload success: ${blockBlobClient.url}`);
        } catch (uploadError: any) {
            console.error("⚠️ Azure Blob upload failed:", uploadError.message);
        }
    }

    // -----------------------------------------------------------------------
    // 🗣️ TRANSCRIPTION (Groq)
    // -----------------------------------------------------------------------
    const maxRetries = 3;
    let lastError = null;

    for (let i = 0; i < maxRetries; i++) {
        try {
            const apiKey = getNextKey("GROQ_API_KEY");
            if (!apiKey) throw new Error("No GROQ_API_KEY found");

            const configuration = new Configuration({
                apiKey: apiKey,
                basePath: "https://api.groq.com/openai/v1"
            });
            const openai = new OpenAIApi(configuration);

            console.log(`Attempt ${i+1}: Transcribing with Groq...`);
            
            // OpenAI v3 createTranscription expects full ReadStream
            const resp = await openai.createTranscription(
                fs.createReadStream(tempFilePath) as any, // Cast to any because v3 types are strict/finicky with fs streams
                "distil-whisper-large-v3-en"
            );

            const transcript = resp?.data?.text;
            
            // Success! Cleanup and return
            safeUnlink(tempFilePath);
            return NextResponse.json({ transcript });

        } catch (error: any) {
            console.warn(`Attempt ${i+1} failed:`, error.message);
            lastError = error;
            await new Promise(r => setTimeout(r, 1000));
        }
    }

    // If we're here, all retries failed
    safeUnlink(tempFilePath); // Cleanup even on failure
    console.error("All transcription attempts failed", lastError);
    return NextResponse.json({ error: "Creating transcription failed after retries." }, { status: 500 });
    
  } catch (error: any) {
     console.error("Global Transcription Error:", error);
     safeUnlink(tempFilePath);
     return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
