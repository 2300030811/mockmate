import { GeneratedQuizQuestion } from "./models";

/**
 * Normalizes a string for comparison by removing whitespace and lowercasing.
 */
function normalize(str: string): string {
  // Remove whitespace, lowercase, but KEEP decimals (.), percents (%), and dashes (-)
  return str.toLowerCase().replace(/\s+/g, "").replace(/[^\w\.\%\-]/g, "");
}

/**
 * Creates a lightweight fingerprint for a question to detect near-duplicates.
 * Strips punctuation, whitespace, and lowercases — so "What is X?" and "what is x"
 * and "What is  X ?" all collapse to the same fingerprint.
 */
function questionFingerprint(q: string): string {
  return q.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Robustly matches an answer to one of the options.
 * Handles:
 * - Exact match
 * - Case insensitive match
 * - Whitespace differences ("720 kg" vs "720kg")
 * - Substring matches (risky but useful if AI is verbose)
 * - Index indicators ("Option A", "A)" prefix handling)
 */
export function findBestMatch(options: string[], answer: string): string | null {
  const cleanAnswer = answer.trim();
  
  // 1. Exact Match
  if (options.includes(cleanAnswer)) return cleanAnswer;

  // 2. Case Insensitive Match
  const caseMatch = options.find(o => o.toLowerCase() === cleanAnswer.toLowerCase());
  if (caseMatch) return caseMatch;

  // 3. Normalized Match (removes spaces, e.g. "720 kg" == "720kg")
  const normAnswer = normalize(cleanAnswer);
  const normMatch = options.find(o => normalize(o) === normAnswer);
  if (normMatch) return normMatch;

  // 4. Substring Match (Use with caution, but "720" in "720 kg" is better than failing)
  // We prefer the option that *contains* the answer (e.g. valid answer is "720", option is "720 kg")
  // Or answer contains option (e.g. answer "Option A: 720 kg", option "720 kg")
  const containingOption = options.find(o => o.includes(cleanAnswer) || cleanAnswer.includes(o));
  if (containingOption) return containingOption;

  // 5. Normalization Substring (last resort)
  const normSubstring = options.find(o => normalize(o).includes(normAnswer) || normAnswer.includes(normalize(o)));
  if (normSubstring) return normSubstring;

  // 6. Fuzzy Match (Levenshtein) - Allows for small typos (up to 3 chars diff)
  // Only use if strings are reasonably long to avoid false positives on short options like "A", "B"
  if (cleanAnswer.length > 3) {
      const bestFuzzy = options.reduce((best, current) => {
          const dist = levenshtein(normalize(cleanAnswer), normalize(current));
          if (dist < best.dist) return { opt: current, dist };
          return best;
      }, { opt: null as string | null, dist: Infinity });

      // Threshold: Allow 20% difference or Max 3 chars
      const threshold = Math.min(3, Math.ceil(cleanAnswer.length * 0.2));
      if (bestFuzzy.opt && bestFuzzy.dist <= threshold) {
          return bestFuzzy.opt;
      }
  }

  return null;
}

/**
 * Calculates Levenshtein distance between two strings.
 * Uses two-row optimisation (O(min(n,m)) memory instead of O(n*m)).
 */
function levenshtein(a: string, b: string): number {
  // Ensure `a` is the shorter string to minimise memory
  if (a.length > b.length) [a, b] = [b, a];

  const aLen = a.length;
  const bLen = b.length;

  // Typed arrays are ~2-3x faster than generic arrays for numeric work
  let prev = new Uint16Array(aLen + 1);
  let curr = new Uint16Array(aLen + 1);

  for (let j = 0; j <= aLen; j++) prev[j] = j;

  for (let i = 1; i <= bLen; i++) {
    curr[0] = i;
    for (let j = 1; j <= aLen; j++) {
      if (b.charCodeAt(i - 1) === a.charCodeAt(j - 1)) {
        curr[j] = prev[j - 1];
      } else {
        curr[j] = 1 + Math.min(prev[j - 1], prev[j], curr[j - 1]);
      }
    }
    [prev, curr] = [curr, prev];
  }

  return prev[aLen];
}

/**
 * Last ditch effort: Check if the explanation mentions exactly one of the options.
 * This handles cases where the AI says answer is "72 kg" (typo) but explanation says "... is 720 kg" (correct).
 */
function rescueFromExplanation(options: string[], explanation: string): string | null {
  if (!explanation) return null;
  // Count how many options appear in the explanation
  // We check if the option string is present in the explanation
  const found = options.filter(opt => explanation.includes(opt));
  
  if (found.length === 1) {
    return found[0];
  }
  return null;
}

export function sanitizeQuizQuestions(questions: unknown[]): GeneratedQuizQuestion[] {
  if (!Array.isArray(questions)) return [];

  const result: GeneratedQuizQuestion[] = [];

  for (const _q of questions) {
    const q = _q as Record<string, unknown>;
    // Ensure basic structure
    const sanitizedQuestion: GeneratedQuizQuestion = {
      question: String(q.question || ""),
      options: Array.isArray(q.options) ? q.options.map(String) : [],
      answer: String(q.answer || ""),
      explanation: String(q.explanation || ""),
      type: String(q.type || "mcq"),
    };
    
    // Trim everything
    sanitizedQuestion.question = sanitizedQuestion.question.trim();
    sanitizedQuestion.options = sanitizedQuestion.options.map((o: string) => o.trim());
    sanitizedQuestion.answer = sanitizedQuestion.answer.trim();
    sanitizedQuestion.explanation = sanitizedQuestion.explanation.trim();

    // Skip questions with empty text or no options
    if (!sanitizedQuestion.question || sanitizedQuestion.options.length === 0) {
      console.warn(`🗑️ [QuizCleanup] Dropped question with empty text or no options`);
      continue;
    }

    // Fix Answer
    const bestMatch = findBestMatch(sanitizedQuestion.options, sanitizedQuestion.answer);
    if (bestMatch) {
      if (bestMatch !== sanitizedQuestion.answer) {
        console.log(`🔧 [QuizCleanup] Fixed answer: "${sanitizedQuestion.answer}" -> "${bestMatch}"`);
      }
      sanitizedQuestion.answer = bestMatch;
    } else {
        // Try to rescue from explanation
        const rescued = rescueFromExplanation(sanitizedQuestion.options, sanitizedQuestion.explanation);
        if (rescued) {
            console.log(`🚑 [QuizCleanup] RESCUED answer via Explanation: "${sanitizedQuestion.answer}" -> "${rescued}"`);
            sanitizedQuestion.answer = rescued;
        } else {
            // Drop the question — it's unanswerable
            console.warn(`🗑️ [QuizCleanup] DROPPED unanswerable question: "${sanitizedQuestion.question}" — answer "${sanitizedQuestion.answer}" not in options: ${JSON.stringify(sanitizedQuestion.options)}`);
            continue;
        }
    }

    result.push(sanitizedQuestion);
  }

  // Deduplicate near-identical questions (same text after normalisation)
  const seen = new Set<string>();
  const deduped = result.filter((q) => {
    const fp = questionFingerprint(q.question);
    if (seen.has(fp)) {
      console.warn(`🗑️ [QuizCleanup] Dropped duplicate question: "${q.question}"`);
      return false;
    }
    seen.add(fp);
    return true;
  });

  return deduped;
}
