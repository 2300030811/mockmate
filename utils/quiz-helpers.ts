
export const parseExplanationForHotspot = (explanation: string | undefined): Record<string, string> | null => {
  if (!explanation) return null;

  const matches: Record<string, string> = {};
  
  // Pattern 1: "Box 1: Yes" or "Box 1: Value"
  // We need to be careful not to capture the explanation text after the value
  // Regex strategy: Look for "Box <N>:" followed by typically "Yes" or "No" or a short phrase until a newline or "Box <N+1>" or "-".
  
  // Common format in dumps: "Box 1: Yes - explanation... Box 2: No - explanation..."
  // or "Box 1: Yes. explanation..."
  
  const regex = /(?:Box|Statement|Area)\s+(\d+)\s*:\s*(Yes|No)/gi;
  let match;
  
  // Reset regex lastIndex just in case
  regex.lastIndex = 0;
  
  while ((match = regex.exec(explanation)) !== null) {
      const boxId = `Box ${match[1]}`;
      const rawValue = match[2].trim().toLowerCase();
      // Normalize to Title Case for UI consistency ("yes" -> "Yes")
      const value = rawValue.charAt(0).toUpperCase() + rawValue.slice(1);
      
      const cleanValue = value; // No need to regex replace punctuation since we captured strict Yes/No
      
      if (cleanValue) {
          matches[boxId] = cleanValue;
      }
  }

  return Object.keys(matches).length > 0 ? matches : null;
};

// Helper for shuffle (moving here to be reusable if needed, though mostly used in API)
export const shuffleArray = <T>(array: T[]): T[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};
