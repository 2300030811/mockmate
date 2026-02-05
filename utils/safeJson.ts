import { z } from "zod";

/**
 * Tries to parse a string as JSON, handling common AI output issues like
 * markdown code blocks (```json ... ```) or extra text surrounding the JSON.
 */
export function safeJsonParse<T>(
  text: string,
  schema: z.ZodSchema<T>,
): T | null {
  try {
    // 1. Try direct parse
    const json = JSON.parse(text);
    const result = schema.safeParse(json);
    if (result.success) return result.data;
  } catch (e) {
    // Continue to cleanup strategies
  }

  // 2. Remove Markdown code blocks
  let cleanText = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  // 3. Find array or object boundaries if still not valid
  const firstOpen = cleanText.indexOf(cleanText.startsWith("[") ? "[" : "{");
  const lastClose = cleanText.lastIndexOf(
    cleanText.startsWith("[") ? "]" : "}",
  );

  if (firstOpen !== -1 && lastClose !== -1) {
    cleanText = cleanText.substring(firstOpen, lastClose + 1);
  }

  try {
    const json = JSON.parse(cleanText);
    const result = schema.safeParse(json);
    if (result.success) return result.data;
    console.error("SafeJSON Validation Failed:", result.error);
  } catch (e) {
    console.error("SafeJSON Parse Failed:", e);
  }

  return null;
}
