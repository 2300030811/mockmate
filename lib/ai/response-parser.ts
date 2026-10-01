/**
 * Shared utilities for parsing AI model responses across providers.
 *
 * Every provider produces slightly different JSON wrappers — this module
 * normalises them all into a validated array of quiz questions.
 */

import { GeneratedQuizQuestion, GeneratedQuizResponseSchema } from "./models";

/**
 * Strips markdown fences, finds the JSON boundary, parses, and validates
 * the response against `GeneratedQuizResponseSchema`.
 *
 * @returns The validated array of questions, or `null` if parsing / validation fails.
 */
export function parseQuizResponse(raw: string): GeneratedQuizQuestion[] | null {
  const jsonStr = extractJsonObject(raw);
  if (!jsonStr) return null;

  // Parse JSON
  let json: unknown;
  try {
    json = JSON.parse(jsonStr);
  } catch (err) {
    console.error("❌ [ResponseParser] JSON.parse failed. Text snippet:", jsonStr.substring(0, 100) + "...");
    console.error("Error details:", err);
    return null;
  }

  // Unwrap { "questions": [...] } / { "flashcards": [...] } wrappers
  if (!Array.isArray(json) && json && typeof json === "object") {
    const obj = json as Record<string, unknown>;
    
    // Prioritize known question keys
    const priorityKeys = ["questions", "flashcards", "quiz", "cards"];
    const priorityKey = priorityKeys.find(key => Array.isArray(obj[key]));
    
    if (priorityKey) {
      json = obj[priorityKey];
    } else {
      // Fallback: search for ANY array
      const anyArrayKey = Object.keys(obj).find((key) => Array.isArray(obj[key]));
      if (anyArrayKey) {
        json = obj[anyArrayKey];
      }
    }
  }

  // Validate with Zod schema
  const result = GeneratedQuizResponseSchema.safeParse(json);
  if (!result.success) {
    console.warn("⚠️ [ResponseParser] Zod validation failed for AI response.");
    return null;
  }
  return result.data;
}

/**
 * Wraps an AI provider error with a clear source label.
 * Recognises `AbortError` from timeouts.
 */
export function formatProviderError(provider: string, error: unknown): string {
  if (
    (error instanceof DOMException && error.name === "AbortError") ||
    (error instanceof Error && error.name === "AbortError")
  ) {
    return `${provider} request timed out`;
  }
  if (error instanceof Error) return `${provider}: ${error.message}`;
  return `${provider}: ${String(error)}`;
}

export function cleanJsonMarkdown(raw: string): string {
  return raw
    .replace(/```json\n?/gi, "")
    .replace(/```\n?/gi, "")
    .trim();
}

export function extractJsonObject(text: string): string | null {
  const cleaned = cleanJsonMarkdown(text);
  const firstCurly = cleaned.indexOf("{");
  const lastCurly = cleaned.lastIndexOf("}");
  const firstBracket = cleaned.indexOf("[");
  const lastBracket = cleaned.lastIndexOf("]");

  if (firstCurly !== -1 && firstBracket !== -1) {
    if (firstCurly < firstBracket) {
      return cleaned.substring(firstCurly, lastCurly + 1);
    } else {
      return cleaned.substring(firstBracket, lastBracket + 1);
    }
  } else if (firstCurly !== -1) {
    return cleaned.substring(firstCurly, lastCurly + 1);
  } else if (firstBracket !== -1) {
    return cleaned.substring(firstBracket, lastBracket + 1);
  }
  return null;
}

import { z } from "zod";

export function safeParseStructured<Output, Def extends z.ZodTypeDef = z.ZodTypeDef, Input = any>(
  text: string,
  schema: z.ZodType<Output, Def, Input>
): { success: true; data: Output } | { success: false; error: string } {
  const jsonStr = extractJsonObject(text);
  if (!jsonStr) {
    return { success: false, error: "No JSON object or array found in the response." };
  }

  try {
    const parsed = JSON.parse(jsonStr);
    const validated = schema.safeParse(parsed);
    if (!validated.success) {
      return { success: false, error: `JSON validation failed: ${validated.error.message}` };
    }
    return { success: true, data: validated.data };
  } catch (err: any) {
    return { success: false, error: `JSON parsing failed: ${err.message}` };
  }
}
