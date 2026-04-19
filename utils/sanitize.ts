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

/**
 * Escape user-provided text before interpolating into HTML templates.
 */
export function escapeHtml(text: string): string {
  if (!text || typeof text !== "string") return "";

  const htmlEntities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };

  return text.replace(/[&<>"']/g, (char) => htmlEntities[char]);
}

/**
 * Allow only safe URL protocols for user-controlled links and escape for HTML safety.
 */
export function sanitizeUrl(url: string, fallback: string = "#"): string {
  if (!url || typeof url !== "string") return fallback;

  const trimmed = url.trim();
  if (!trimmed) return fallback;
  
  // Internal anchors or relative paths
  if (trimmed.startsWith("#") || (trimmed.startsWith("/") && !trimmed.startsWith("//"))) {
    return escapeHtml(trimmed);
  }

  let finalUrl = "";

  // Reject potential protocol-relative with leading slashes if not strictly handled
  if (trimmed.startsWith("//")) {
    finalUrl = `https:${trimmed}`;
  } 
  // Accept bare domains by normalizing to https. 
  // Tightened to prevent common malformed host strings like "..com" or "-.com"
  else if (/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+(\/.*)?$/i.test(trimmed)) {
    finalUrl = `https://${trimmed}`;
  }
  else {
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        finalUrl = trimmed;
      } else if (parsed.protocol === "mailto:") {
        // Stricter mailto validation: ensure only one '@' and no complex headers
        const mailPart = parsed.pathname;
        if (/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(mailPart)) {
            finalUrl = trimmed;
        }
      }
    } catch {
      finalUrl = fallback;
    }
  }

  return escapeHtml(finalUrl || fallback);
}


/**
 * Normalize text for ATS compatibility by converting problematic Unicode.
 * ATS parsers and legacy systems often fail on em-dashes, smart quotes,
 * zero-width characters, and non-breaking spaces.
 * 
 * @param text Raw parsed text from a resume PDF or API
 * @returns Clean, ATS-friendly string
 */
export function normalizeTextForATS(text: string): string {
  if (!text) return text;
  let t = text;
  // Dash variants -> standard hyphen
  t = t.replace(/\u2014/g, '-'); // em-dash
  t = t.replace(/\u2013/g, '-'); // en-dash
  
  // Smart quotes -> straight quotes
  t = t.replace(/[\u201C\u201D\u201E\u201F]/g, '"');
  t = t.replace(/[\u2018\u2019\u201A\u201B]/g, "'");
  
  // Ellipsis
  t = t.replace(/\u2026/g, '...');
  
  // Invisible characters / Zero-width
  t = t.replace(/[\u200B\u200C\u200D\u2060\uFEFF]/g, '');
  
  // Non-breaking space -> standard space
  t = t.replace(/\u00A0/g, ' ');
  
  return t;
}
