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
  // 1. Strip markdown code fences
  let text = raw.replace(/```json/g, "").replace(/```/g, "").trim();

  // 2. Find outermost JSON boundary
  //    Check for both array and object starts, pick whichever comes first
  const firstBracket = text.indexOf("[");
  const firstBrace = text.indexOf("{");
  
  let openChar: string;
  let closeChar: string;
  let firstOpen: number;

  if (firstBracket === -1 && firstBrace === -1) {
    return null;
  } else if (firstBracket === -1) {
    openChar = "{"; closeChar = "}"; firstOpen = firstBrace;
  } else if (firstBrace === -1) {
    openChar = "["; closeChar = "]"; firstOpen = firstBracket;
  } else {
    // Both exist — pick the one that appears first
    if (firstBracket < firstBrace) {
      openChar = "["; closeChar = "]"; firstOpen = firstBracket;
    } else {
      openChar = "{"; closeChar = "}"; firstOpen = firstBrace;
    }
  }

  const lastClose = text.lastIndexOf(closeChar);
  if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
    text = text.substring(firstOpen, lastClose + 1);
  }

  // 3. Parse JSON
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch (err) {
    console.error("❌ [ResponseParser] JSON.parse failed. Text snippet:", text.substring(0, 100) + "...");
    console.error("Error details:", err);
    return null;
  }

  // 4. Unwrap { "questions": [...] } / { "flashcards": [...] } wrappers
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

  // 5. Validate with Zod schema
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
