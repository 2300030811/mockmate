import { OCRService } from "@/lib/services/ocr";
import { normalizeTextForATS } from "@/utils/sanitize";
import mammoth from "mammoth";

const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";


export interface ResumeExtractionOptions {
  minLength?: number;
  minWords?: number;
  maxSizeBytes?: number;
  allowOnlyPdf?: boolean;
  extractor?: (buffer: Buffer) => Promise<{ text: string; source: "azure" | "local" }>;
}

export interface ResumeExtractionResult {
  text: string;
  source: "azure" | "local" | "text";
  buffer?: Buffer;
  wordCount: number;
  characterCount: number;
}

export const resumeExtractor = {
  /**
   * Validates file size constraints, returning the file buffer.
   */
  async readFile(file: File, maxSizeBytes: number): Promise<Buffer> {
    if (file.size > maxSizeBytes) {
      throw new Error(`File too large. Please upload < ${Math.round(maxSizeBytes / (1024 * 1024))}MB.`);
    }
    const arrayBuffer = await file.arrayBuffer();
    return Buffer.from(arrayBuffer);
  },

  /**
   * Extracts raw text from a PDF/DOCX buffer or directly reads text from plain-text files.
   */
  async extractText(
    file: File,
    buffer?: Buffer,
    extractor?: (buffer: Buffer) => Promise<{ text: string; source: "azure" | "local" }>
  ): Promise<{ text: string; source: "azure" | "local" | "text" }> {
    if (file.type === "application/pdf") {
      if (!buffer) {
        throw new Error("Buffer required for PDF text extraction");
      }
      const extractFn = extractor || OCRService.extractText;
      const result = await extractFn(buffer);
      return {
        text: result.text,
        source: result.source,
      };
    } else if (file.type === DOCX_MIME) {
      if (!buffer) {
        throw new Error("Buffer required for DOCX text extraction");
      }
      const result = await mammoth.extractRawText({ buffer });
      return {
        text: result.value,
        source: "local",
      };
    } else {
      const text = await file.text();
      return {
        text,
        source: "text",
      };
    }
  },

  /**
   * Performs minimum length and word count validation on the text.
   */
  validateText(text: string, minLength: number, minWords: number): void {
    if (text.length < minLength) {
      throw new Error("Resume content too short or unreadable.");
    }
    if (minWords > 0) {
      const words = text.split(/\s+/).filter((w) => w.length > 0);
      if (words.length < minWords) {
        throw new Error("Extracted text has too few words. Ensure the PDF is not an image scan.");
      }
    }
  },

  /**
   * Convenience wrapper that reads the file, extracts text, normalizes it, and runs validations.
   */
  async extractResume(
    file: File | unknown,
    options: ResumeExtractionOptions = {}
  ): Promise<ResumeExtractionResult> {
    const minLength = options.minLength ?? 50;
    const minWords = options.minWords ?? 0;
    const maxSizeBytes = options.maxSizeBytes ?? 10 * 1024 * 1024; // 10MB default
    const allowOnlyPdf = options.allowOnlyPdf ?? false;

    // 1. Validate file exists and is of correct type
    if (!file || !(file instanceof File)) {
      throw new Error("No valid file uploaded");
    }

    if (allowOnlyPdf && file.type !== "application/pdf" && file.type !== DOCX_MIME) {
      throw new Error(`Invalid file type: ${file.type}. Only PDF and DOCX files are accepted.`);
    }

    // 2. Read File
    let buffer: Buffer | undefined;
    if (file.type === "application/pdf" || file.type === DOCX_MIME) {
      buffer = await this.readFile(file, maxSizeBytes);
    } else {
      if (file.size > maxSizeBytes) {
        throw new Error(`File too large. Please upload < ${Math.round(maxSizeBytes / (1024 * 1024))}MB.`);
      }
    }

    // 3. Extract Text
    const extraction = await this.extractText(file, buffer, options.extractor);

    // 4. Normalization (Must happen BEFORE validation)
    const normalizedText = normalizeTextForATS(extraction.text || "");

    // 5. Validation
    this.validateText(normalizedText, minLength, minWords);

    // 6. Metadata metrics
    const wordCount = normalizedText.split(/\s+/).filter((w) => w.length > 0).length;
    const characterCount = normalizedText.length;

    return {
      text: normalizedText,
      source: extraction.source,
      wordCount,
      characterCount,
      ...(file.type === "application/pdf" || file.type === DOCX_MIME ? { buffer } : {}),
    };
  }
};
export type { ResumeExtractionResult as ExtractionResult };
