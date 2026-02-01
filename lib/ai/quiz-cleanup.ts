import { QuizQuestion } from "./models";

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

  return null;
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

export function sanitizeQuizQuestions(questions: any[]): QuizQuestion[] {
  if (!Array.isArray(questions)) return [];

  return questions.map(q => {
    // Ensure basic structure
    const sanitizedQuestion: QuizQuestion = {
      question: String(q.question || ""),
      options: Array.isArray(q.options) ? q.options.map(String) : [],
      answer: String(q.answer || ""),
      explanation: String(q.explanation || ""),
    };
    
    // Trim everything
    sanitizedQuestion.question = sanitizedQuestion.question.trim();
    sanitizedQuestion.options = sanitizedQuestion.options.map(o => o.trim());
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
