import { GeneratedQuizQuestion } from "./models";

/**
 * Normalizes a string for comparison by removing whitespace and lowercasing.
 */
function normalize(str: string): string {
  // Remove whitespace, lowercase, but KEEP decimals (.), percents (%), and dashes (-)
  return str.toLowerCase().replace(/\s+/g, "").replace(/[^\w\.\%\-]/g, "");
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
 */
function levenshtein(a: string, b: string): number {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          )
        );
      }
    }
  }
  return matrix[b.length][a.length];
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

export function sanitizeQuizQuestions(questions: any[]): GeneratedQuizQuestion[] {
  if (!Array.isArray(questions)) return [];

  return questions.map(q => {
    // Ensure basic structure
    const sanitizedQuestion: GeneratedQuizQuestion = {
      question: String(q.question || ""),
      options: Array.isArray(q.options) ? q.options.map(String) : [],
      answer: String(q.answer || ""),
      explanation: String(q.explanation || ""),
    };
    
    // Trim everything
    sanitizedQuestion.question = sanitizedQuestion.question.trim();
    sanitizedQuestion.options = sanitizedQuestion.options.map((o: string) => o.trim());
    sanitizedQuestion.answer = sanitizedQuestion.answer.trim();
    sanitizedQuestion.explanation = sanitizedQuestion.explanation.trim();

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
            console.warn(`⚠️ [QuizCleanup] No match found for answer: "${sanitizedQuestion.answer}" in options: ${JSON.stringify(sanitizedQuestion.options)}`);
        }
    }

    return sanitizedQuestion;
  });
}
