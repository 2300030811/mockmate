import { beforeEach, describe, expect, it, vi } from "vitest";
import { resumeExtractor } from "./resume-extractor";
import { OCRService } from "./ocr";

vi.mock("./ocr", () => ({
  OCRService: {
    extractText: vi.fn(),
  },
}));

function buildMockPdfFile(content: string, size?: number): File {
  const file = new File([content], "resume.pdf", { type: "application/pdf" });
  if (size !== undefined) {
    Object.defineProperty(file, "size", { value: size });
  }
  Object.defineProperty(file, "arrayBuffer", {
    value: async () => new TextEncoder().encode(content).buffer,
  });
  return file;
}

function buildMockTextFile(content: string, size?: number): File {
  const file = new File([content], "resume.txt", { type: "text/plain" });
  if (size !== undefined) {
    Object.defineProperty(file, "size", { value: size });
  }
  Object.defineProperty(file, "text", {
    value: async () => content,
  });
  return file;
}

describe("resumeExtractor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("readFile", () => {
    it("throws size error if file exceeds limit", async () => {
      const file = buildMockPdfFile("a".repeat(100), 100);
      await expect(resumeExtractor.readFile(file, 50)).rejects.toThrow("File too large");
    });

    it("returns buffer if file is within limit", async () => {
      const file = buildMockPdfFile("a".repeat(10), 10);
      const buffer = await resumeExtractor.readFile(file, 50);
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.toString()).toBe("aaaaaaaaaa");
    });
  });

  describe("extractText", () => {
    it("uses pluggable extractor if provided", async () => {
      const file = buildMockPdfFile("pdf content");
      const buffer = Buffer.from("pdf content");
      const customExtractor = vi.fn().mockResolvedValue({ text: "custom parsed", source: "azure" });

      const res = await resumeExtractor.extractText(file, buffer, customExtractor);

      expect(customExtractor).toHaveBeenCalledWith(buffer);
      expect(res).toEqual({ text: "custom parsed", source: "azure" });
      expect(OCRService.extractText).not.toHaveBeenCalled();
    });

    it("falls back to OCRService if extractor not provided", async () => {
      const file = buildMockPdfFile("pdf content");
      const buffer = Buffer.from("pdf content");
      vi.mocked(OCRService.extractText).mockResolvedValue({ text: "service parsed", source: "local" });

      const res = await resumeExtractor.extractText(file, buffer);

      expect(OCRService.extractText).toHaveBeenCalledWith(buffer);
      expect(res).toEqual({ text: "service parsed", source: "local" });
    });

    it("reads standard text directly for non-pdf files", async () => {
      const file = buildMockTextFile("plain text resume");
      const res = await resumeExtractor.extractText(file);

      expect(res).toEqual({ text: "plain text resume", source: "text" });
      expect(OCRService.extractText).not.toHaveBeenCalled();
    });
  });

  describe("validateText", () => {
    it("throws error if length is too short", () => {
      expect(() => resumeExtractor.validateText("abc", 5, 0)).toThrow("Resume content too short or unreadable.");
    });

    it("throws error if word count is too low", () => {
      expect(() => resumeExtractor.validateText("one two three", 0, 5)).toThrow("Extracted text has too few words.");
    });

    it("passes if criteria are met", () => {
      expect(() => resumeExtractor.validateText("one two three four five six", 5, 5)).not.toThrow();
    });
  });

  describe("extractResume", () => {
    it("performs complete validation, normalization, and metrics parsing", async () => {
      const file = buildMockTextFile("\u201Csmart quotes\u201D and en\u2013dash");
      
      const res = await resumeExtractor.extractResume(file, {
        minLength: 10,
        minWords: 3,
      });

      expect(res.text).toBe('"smart quotes" and en-dash');
      expect(res.source).toBe("text");
      expect(res.wordCount).toBe(4);
      expect(res.characterCount).toBe(26);
      expect(res.buffer).toBeUndefined(); // No buffer populated for text files
    });

    it("populates buffer only for PDF inputs", async () => {
      const file = buildMockPdfFile("pdf content");
      vi.mocked(OCRService.extractText).mockResolvedValue({ text: "extracted text from PDF", source: "local" });

      const res = await resumeExtractor.extractResume(file, {
        minLength: 5,
      });

      expect(res.text).toBe("extracted text from PDF");
      expect(res.buffer).toBeDefined();
      expect(res.buffer?.toString()).toBe("pdf content");
    });
  });
});
