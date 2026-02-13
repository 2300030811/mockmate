import { BASE_BLOCKLIST, CUSTOM_BLOCKLIST } from "./blocklist";

/**
 * Normalizes a string by:
 * 1. Unicode normalization (NFKC)
 * 2. Converting leetspeak/homoglyphs to standard characters
 * 3. Removing non-alphanumeric characters (optional, for matching)
 * 4. Converting to lowercase
 */
function normalizeText(text: string): string {
  // 1. Unicode normalization (combines characters like 'a' + '´' into 'á')
  let normalized = text.normalize("NFKC");

  // 2. Homoglyph/Leetspeak mapping
  const homoglyphs: { [key: string]: string } = {
    '0': 'o',
    '1': 'i',
    'i': 'l', // Some fonts make i and l look similar
    '3': 'e',
    '4': 'a',
    '@': 'a',
    '5': 's',
    '$': 's',
    '7': 't',
    '8': 'b',
    '!': 'i',
    '|': 'l',
    '(': 'c',
    '{': 'c',
    '[': 'c',
    'v': 'u', // In some contexts
    'w': 'vv',
  };

  normalized = normalized.toLowerCase();
  
  let mapped = "";
  for (const char of normalized) {
    mapped += homoglyphs[char] || char;
  }

  // 3. Remove repeated characters (extra defense: fuuuuck -> fuck)
  // We'll keep a version for pattern matching
  const collapsed = mapped.replace(/(.)\1+/g, "$1");

  return collapsed;
}

/**
 * Validates a nickname against profanity and formatting rules.
 * @param nickname The nickname to check
 * @returns { success: boolean, error?: string }
 */
export function validateNickname(nickname: string): { success: boolean; error?: string } {
  if (!nickname || nickname.trim().length === 0) {
    return { success: false, error: "Nickname cannot be empty." };
  }

  const trimmed = nickname.trim();

  // Basic length and character rules
  if (trimmed.length < 2) {
    return { success: false, error: "Nickname is too short (min 2 chars)." };
  }
  if (trimmed.length > 20) {
    return { success: false, error: "Nickname is too long (max 20 chars)." };
  }

  // Check for allowed characters (alphanumeric, spaces, underscores, hyphens)
  // This is the first line of defense against Unicode manipulation
  const allowedCharsRegex = /^[a-zA-Z0-9\s_\-]+$/;
  if (!allowedCharsRegex.test(trimmed)) {
    return { success: false, error: "Nickname contains invalid characters." };
  }
  
  const normalized = normalizeText(trimmed);
  const normalizedWithVowelPlaceholder = normalized.replace(/[aeiou]/g, "*");
  const combinedBlocklist = [...BASE_BLOCKLIST, ...CUSTOM_BLOCKLIST];

  for (const word of combinedBlocklist) {
    const normalizedWord = word.toLowerCase().replace(/[aeiou]/g, "*");
    const wordRegex = new RegExp(`\\b${word}\\b`, "i");
    const fuzzyWordRegex = new RegExp(word.split('').join(' *'), "i"); // Matches f u c k

    if (
      normalized.includes(word) || 
      normalizedWithVowelPlaceholder.includes(normalizedWord) ||
      wordRegex.test(normalized) || 
      fuzzyWordRegex.test(normalized)
    ) {
      return { success: false, error: "This nickname contains inappropriate language." };
    }
    
    // Check the raw trimmed version too as a fallback
    if (trimmed.toLowerCase().includes(word)) {
        return { success: false, error: "This nickname contains inappropriate language." };
    }
  }

  return { success: true };
}
