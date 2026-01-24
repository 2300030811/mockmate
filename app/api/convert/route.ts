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

    if (!file) {
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

    // Debugging module import
    console.log(`🔍 pdf-parse type: ${typeof pdf}`);

    // 2. Parse PDF (Process all pages to ensure full coverage)
    // We will handle token limits by sampling the text later.
    const data = await pdf(buffer, {
      max: 0, 
      version: 'default'
    });

    const text = data.text.trim();

    // 3. Debugging Logs
    console.log(`📄 Metadata: ${data.numpages} pages detected.`);
    console.log(`✅ Extracted ${text.length} characters (limited to 20 pages).`);

    // 4. Validation
    // 4. Validation & Fallback for Scanned Files
    if (!text || text.length < 50) {
      console.warn("⚠️ Warning: Text extraction failed (< 50 chars). Switching to Vision Mode...");
      return NextResponse.json({ 
        text: "",
        isScanned: true,
        base64: buffer.toString("base64")
      });
    }

    return NextResponse.json({ text, isScanned: false });

  } catch (error: any) {
    console.error("❌ Convert Error:", error);
    return NextResponse.json({ 
        error: `PDF parsing failed: ${error.message}` 
    }, { status: 500 });
  }
}