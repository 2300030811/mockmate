import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { convertFileAction } from "./generator";

// Hoisted mocks
const rateLimitMock = vi.hoisted(() => vi.fn());
const extractTextMock = vi.hoisted(() => vi.fn());
const isScannedMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: rateLimitMock,
}));

vi.mock("@/lib/services/ocr", () => ({
  OCRService: {
    extractText: extractTextMock,
    isScanned: isScannedMock,
  },
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

const originalEnv = process.env;

function buildFormData(content: string, type: string = "application/pdf"): FormData {
  const file = new File([content], "resume.pdf", { type });
  Object.defineProperty(file, "arrayBuffer", {
    value: async () => new TextEncoder().encode(content).buffer,
  });
  Object.defineProperty(file, "stream", {
    value: () => {
      const uint8 = new TextEncoder().encode(content);
      let read = false;
      return {
        getReader: () => ({
          read: async () => {
            if (read) {
              return { done: true, value: undefined };
            }
            read = true;
            return { done: false, value: uint8 };
          },
        }),
      };
    },
  });

  return {
    get: (key: string) => (key === "file" ? file : null),
  } as unknown as FormData;
}

describe("convertFileAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("throws bad request if no file uploaded", async () => {
    const result = await convertFileAction(new FormData());
    expect(result.error).toBe("No file uploaded");
  });

  it("throws bad request for non-pdf file types", async () => {
    const result = await convertFileAction(buildFormData("resume data", "image/png"));
    expect(result.error).toContain("Only PDF files are accepted");
  });

  it("returns scanned state and base64 for image-based PDFs", async () => {
    extractTextMock.mockResolvedValueOnce({
      text: "short",
      source: "local",
    });
    isScannedMock.mockReturnValueOnce(true);

    const result = await convertFileAction(buildFormData("scanned resume PDF data"));

    expect(result.isScanned).toBe(true);
    expect(result.text).toBe("");
    expect(result.base64).toBeDefined();
  });

  it("returns extracted text when PDF is readable", async () => {
    extractTextMock.mockResolvedValueOnce({
      text: "This is a readable resume with more than fifty characters and normal text structure.",
      source: "local",
    });
    isScannedMock.mockReturnValueOnce(false);

    const result = await convertFileAction(buildFormData("readable resume PDF data"));

    expect(result.isScanned).toBe(false);
    expect(result.text).toBe("This is a readable resume with more than fifty characters and normal text structure.");
    expect(result.source).toBe("local");
  });
});
