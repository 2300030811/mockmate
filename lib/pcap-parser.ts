import { z } from "zod";

// Zod schemas for validation
const PCAPOptionSchema = z.record(z.string());
const PCAPQuestionSchema = z.object({
  id: z.number(),
  type: z.string(),
  question: z.string(),
  code: z.string().optional(),
  options: PCAPOptionSchema.optional(),
  correctAnswer: z.array(z.string()).optional(),
  explanation: z.string().optional(),
});

const PCAPBatchSchema = z.object({
  batchId: z.union([z.string(), z.number()]).optional(),
  questions: z.array(PCAPQuestionSchema),
});

type PCAPBatch = z.infer<typeof PCAPBatchSchema>;

/**
 * Robustly parses PCAP data which might be:
 * 1. A valid JSON array of batches
 * 2. A single valid JSON batch object
 * 3. A stream of concatenated JSON batch objects (e.g. {...} {...})
 * 4. Contains invalid markers like [cite_start]
 */
export function parsePCAPData(text: string): PCAPBatch[] {
  if (!text) return [];

  // 1. Clean known artifacts
  let cleanText = text.replace(/\[cite_start\]/g, '').trim();

  // 2. Try standard JSON parse first
  try {
    const parsed = JSON.parse(cleanText);
    return normalizeToBatches(parsed);
  } catch (e) {
    // Continue to robust parsing
  }

  // 3. Handle Concatenated JSON Objects
  // Strategy: Find top-level balancing braces { } 
  // This is safer than regex which might match braces inside strings
  const batches: PCAPBatch[] = [];
  let braceCount = 0;
  let startIndex = -1;
  let inString = false;
  let escape = false;

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];

    if (escape) {
      escape = false;
      continue;
    }

    if (char === '\\') {
      escape = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (!inString) {
      if (char === '{') {
        if (braceCount === 0) startIndex = i;
        braceCount++;
      } else if (char === '}') {
        braceCount--;
        if (braceCount === 0 && startIndex !== -1) {
          // Found a potential object
          const jsonChunk = cleanText.substring(startIndex, i + 1);
          try {
            const parsed = JSON.parse(jsonChunk);
            const normalized = normalizeToBatches(parsed);
            batches.push(...normalized);
          } catch (e) {
            console.warn("Failed to parse chunk in PCAP data:", e);
          }
          startIndex = -1;
        }
      }
    }
  }

  if (batches.length === 0) {
    // If structured parsing failed entirely, try the regex fix as last resort fallback
    // This was the old logic, kept just in case
     if (cleanText.startsWith('{')) {
          const fixedJson = '[' + cleanText.replace(/}\s*\{/g, '},{') + ']';
          try {
            const parsed = JSON.parse(fixedJson);
             return normalizeToBatches(parsed);
          } catch (e) {
             console.error("Final fallback PCAP parse failed.");
          }
    }
  }

  return batches;
}

function normalizeToBatches(parsed: unknown): PCAPBatch[] {
  if (Array.isArray(parsed)) {
    // If it's an array, it might be an array of batches OR an array of questions (legacy)
    // Check first item
    if (parsed.length > 0) {
        if ('questions' in (parsed[0] as object)) {
            // It's an array of batches
             return parsed.map(item => {
                // Best effort validation
                const result = PCAPBatchSchema.safeParse(item);
                return result.success ? result.data : null;
             }).filter((b): b is PCAPBatch => b !== null);
        } else {
             // It's likely just an array of questions, wrap in a single batch
             const questionsResult = z.array(PCAPQuestionSchema).safeParse(parsed);
             if (questionsResult.success) {
                 return [{ questions: questionsResult.data }];
             }
        }
    }
    return [];
  } else if (typeof parsed === 'object' && parsed !== null) {
      // Single object
      if ('questions' in parsed) {
          const result = PCAPBatchSchema.safeParse(parsed);
          return result.success ? [result.data] : [];
      }
  }
  return [];
}
