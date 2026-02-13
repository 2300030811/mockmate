
import { parsePdf } from "@/lib/pdf-helper";

export class OCRService {
  /**
   * Extracts text from a file buffer.
   * Tries Azure Document Intelligence first, falls back to local pdf-parse.
   * Returns text and a flag indicating if it seems to be a scanned document (image-only).
   */
  static async extractText(buffer: Buffer): Promise<{ text: string; source: "azure" | "local" }> {
    let text = "";

    // 1. Try Azure Document Intelligence
    const azureEndpoint = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT;
    const azureKey = process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY;

    if (azureEndpoint && azureKey) {
      try {
        console.log("🔹 Attempting Azure Document Intelligence...");
        // Dynamic import to avoid module bundling issues if not used
        const { DocumentAnalysisClient, AzureKeyCredential } = await import("@azure/ai-form-recognizer");
        const client = new DocumentAnalysisClient(azureEndpoint, new AzureKeyCredential(azureKey));

        const poller = await client.beginAnalyzeDocument("prebuilt-read", buffer);
        const result = await poller.pollUntilDone();

        if (result && result.content) {
          text = result.content;
          console.log(`✅ Azure extraction success: ${text.length} characters.`);
          return { text, source: "azure" };
        }
      } catch (azureError: unknown) {
        const errMsg = azureError instanceof Error ? azureError.message : String(azureError);
        console.warn("⚠️ Azure Document Intelligence failed, falling back to local:", errMsg);
      }
    }

    // 2. Local Fallback (pdf-parse)
    try {
      console.log("🔹 Attempting local pdf-parse...");
      text = await parsePdf(buffer);
      console.log(`✅ Extracted ${text.length} characters (local).`);
      return { text, source: "local" };
    } catch (parseError: unknown) {
      const errMsg = parseError instanceof Error ? parseError.message : String(parseError);
      console.warn("⚠️ Local pdf-parse failed:", errMsg);
      // Return empty text so caller handles it as "failed extraction"
      return { text: "", source: "local" };
    }
  }

  /**
   * Checks if the text suggests a scanned document (too short or empty).
   */
  static isScanned(text: string): boolean {
    // If text is extremely short, it's likely an image-based PDF
    return !text || text.trim().length < 50;
  }
}
