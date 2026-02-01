import { NextResponse } from "next/server";
// import pdf from "pdf-parse"; // ⚠️ causing issues with some bundlers
const pdf = require("pdf-parse");

// 🛑 FORCE NODEJS RUNTIME (Critical Fix)
// This ensures the PDF library has access to the full file system and buffers
export const runtime = "nodejs"; 
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    console.log(`📂 Processing: ${file.name} | Size: ${file.size} bytes`);

    // 🛡️ OPTIMIZATION: Reject Huge Files (>10MB) to save bandwidth/memory
    if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: "File too large. Please upload < 10MB." }, { status: 400 });
    }

    // 1. Convert File to Node.js Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // -----------------------------------------------------------------------
    // ☁️ AZURE BLOB STORAGE BACKUP (Fire & Forget)
    // -----------------------------------------------------------------------
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (connectionString) {
        (async () => {
            try {
                // Dynamic import to avoid top-level issues if not strictly needed
                const { BlobServiceClient } = require("@azure/storage-blob"); 
                const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
                const containerClient = blobServiceClient.getContainerClient("resumes");
                await containerClient.createIfNotExists();

                const blobName = `resume-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
                const blockBlobClient = containerClient.getBlockBlobClient(blobName);
                
                console.log("🔹 Backing up resume to Azure Blob...");
                await blockBlobClient.uploadData(buffer);
                console.log(`✅ Resume backup success: ${blobName}`);
            } catch (uploadError: any) {
                console.error("⚠️ Azure Blob upload failed:", uploadError.message);
            }
        })();
    }

    let text = "";
    let isScanned = false;

    // -----------------------------------------------------------------------
    // 🌟 AZURE DOCUMENT INTELLIGENCE INTEGRATION (Prioritized)
    // -----------------------------------------------------------------------
    const azureEndpoint = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT;
    const azureKey = process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY;

    if (azureEndpoint && azureKey) {
      try {
        console.log("🔹 Attempting Azure Document Intelligence...");
        const { DocumentAnalysisClient, AzureKeyCredential } = require("@azure/ai-form-recognizer");
        const client = new DocumentAnalysisClient(azureEndpoint, new AzureKeyCredential(azureKey));

        // Use 'prebuilt-read' which isolates text and is great for general documents
        const poller = await client.beginAnalyzeDocument("prebuilt-read", buffer);
        const result = await poller.pollUntilDone();

        if (result && result.content) {
          text = result.content;
          console.log(`✅ Azure extraction success: ${text.length} characters.`);
          return NextResponse.json({ text, isScanned: false, source: "azure" });
        }
      } catch (azureError: any) {
        console.warn("⚠️ Azure Document Intelligence failed, falling back to local parser:", azureError.message);
        // Fallback proceeds below
      }
    } else {
        console.log("ℹ️ Azure credentials not found, using local pdf-parse.");
    }

    // -----------------------------------------------------------------------
    // 🐢 LOCAL PDF-PARSE FALLBACK
    // -----------------------------------------------------------------------
    
    // Debugging module import
    console.log(`🔍 pdf-parse type: ${typeof pdf}`);

    try {
        // 2. Parse PDF (Process all pages to ensure full coverage)
        const data = await pdf(buffer, {
        max: 0, 
        version: 'default'
        });

        text = data.text.trim();
        
        // 3. Debugging Logs
        console.log(`📄 Metadata: ${data.numpages} pages detected.`);
        console.log(`✅ Extracted ${text.length} characters (limited to 20 pages).`);
    } catch (parseError: any) {
        console.warn("⚠️ pdf-parse failed:", parseError.message);
    }

    // 4. Validation & Fallback for Scanned Files
    if (!text || text.length < 50) {
      console.warn("⚠️ Warning: Text extraction failed (< 50 chars). Switching to Vision Mode...");
      return NextResponse.json({ 
        text: "",
        isScanned: true,
        base64: buffer.toString("base64")
      });
    }

    return NextResponse.json({ text, isScanned: false, source: "local" });

  } catch (error: any) {
    console.error("❌ Convert Error:", error);
    return NextResponse.json({ 
        error: `PDF parsing failed: ${error.message}` 
    }, { status: 500 });
  }
}