/**
 * Utility functions for career analysis and resume processing.
 */

/**
 * Simple heuristic to estimate years of experience from resume text.
 * Searches for patterns like "5 years of experience" or date ranges like "2020 - present".
 * 
 * @param resumeText - The full text of the resume
 * @returns Estimated years of experience, or undefined if not found
 */
export function estimateExperienceYears(resumeText: string): number | undefined {
  if (!resumeText) return undefined;

  // Pattern: "X years of experience" or "X+ years" or "X yrs"
  const patterns = [
    /\b(\d{1,2})\+?\s*(?:years?|yrs?)\s*(?:of)?\s*(?:experience|exp)/i,
    /\b(?:experience|exp)\s*(?:of)?\s*(?:over|about|approximately)?\s*(\d{1,2})\+?\s*(?:years?|yrs?)/i,
  ];

  // Try direct patterns first
  for (const pattern of patterns) {
    const match = resumeText.match(pattern);
    if (match?.[1]) {
      const years = parseInt(match[1], 10);
      if (years >= 0 && years <= 50) return years;
    }
  }

  // Try date range extraction (count spans)
  // We look for YYYY - present or YYYY - YYYY
  // Using \u2013 for en-dash and \u2014 for em-dash to be safe with cross-platform encoding
  const dateRanges = [...resumeText.matchAll(/(\d{4})\s*(?:-|\u2013|\u2014|to)\s*(?:present|current|now|(\d{4}))/gi)];
  
  if (dateRanges.length > 0) {
    const currentYear = new Date().getFullYear();
    let earliest = currentYear;
    let found = false;

    for (const m of dateRanges) {
      const start = parseInt(m[1], 10);
      // Valid start years for professional experience
      if (start >= 1970 && start <= currentYear) {
        if (start < earliest) earliest = start;
        found = true;
      }
    }
    
    if (found && earliest < currentYear) {
      return currentYear - earliest;
    }
  }

  return undefined;
}
