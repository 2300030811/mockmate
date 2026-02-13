/**
 * Sanitizes user-provided content before injecting into AI prompts.
 * 
 * Prevents prompt injection attacks by:
 * 1. Stripping common injection patterns (e.g., "ignore previous instructions")
 * 2. Adding delimiters so the AI treats user content as data, not instructions
 * 3. Truncating to a safe length
 */

const INJECTION_PATTERNS = [
  /ignore\s+(?:all\s+|the\s+|these\s+|those\s+)?previous\s+instructions/gi,
  /ignore\s+(?:all\s+|the\s+|these\s+|those\s+)?above\s+instructions/gi,
  /disregard\s+(?:all\s+|the\s+|these\s+|those\s+)?previous/gi,
  /you\s+are\s+now\s+(?:a|an)\s+(?:evil|malicious|unrestricted)/gi,
  /system:\s*/gi,
  /\[SYSTEM\]/gi,
  /\[INST\]/gi,
  /<<SYS>>/gi,
  /<\/SYS>/gi,
  /\bDAN\b.*\bmode\b/gi,
];

/**
 * Strips known prompt injection patterns and wraps content in safe delimiters.
 * @param content Raw user-provided text (resume, PDF content, quiz question, etc.)
 * @param maxLength Maximum characters to allow (default 50000)
 * @returns Sanitized content string safe for prompt interpolation
 */
export function sanitizePromptInput(content: string, maxLength: number = 50000): string {
  if (!content || typeof content !== "string") return "";

  let sanitized = content;

  // Strip known injection patterns
  for (const pattern of INJECTION_PATTERNS) {
    sanitized = sanitized.replace(pattern, "[FILTERED]");
  }

  // Truncate to max length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

/**
 * Wraps user content in XML-style delimiters so the model treats it as data.
 * This is a best-practice defense against indirect prompt injection.
 */
export function wrapAsUserContent(content: string, label: string = "USER_CONTENT"): string {
  const sanitized = sanitizePromptInput(content);
  return `<${label}>\n${sanitized}\n</${label}>`;
}
