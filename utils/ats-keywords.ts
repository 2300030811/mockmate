/**
 * Deterministic keyword extraction and matching for ATS analysis.
 * Extracts meaningful terms from a job description and checks which
 * ones appear in the resume text, giving the LLM grounded data.
 */

const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
  "being", "have", "has", "had", "do", "does", "did", "will", "would",
  "should", "could", "may", "might", "shall", "can", "need", "must",
  "it", "its", "this", "that", "these", "those", "i", "you", "he", "she",
  "we", "they", "me", "him", "her", "us", "them", "my", "your", "his",
  "our", "their", "what", "which", "who", "whom", "whose", "where",
  "when", "how", "not", "no", "nor", "as", "if", "then", "than", "too",
  "very", "just", "about", "above", "after", "again", "all", "also",
  "am", "any", "because", "before", "between", "both", "during", "each",
  "few", "further", "get", "got", "here", "into", "more", "most", "only",
  "other", "out", "over", "own", "same", "so", "some", "such", "through",
  "under", "until", "up", "while", "why", "etc", "e.g", "i.e",
  "able", "across", "along", "already", "among", "around",
  "including", "within", "without", "work", "working", "role", "job",
  "experience", "required", "requirements", "preferred", "qualifications",
  "responsibilities", "team", "company", "looking", "join", "apply",
  "candidate", "ideal", "opportunity", "position", "years", "year",
  "strong", "excellent", "good", "great", "knowledge", "understanding",
  "ability", "skills", "using", "used", "use", "well", "new", "like",
  "ensure", "provide", "support", "based", "related", "relevant",
  "will", "per", "via", "plus", "minimum", "maximum",
]);

/** Tokenize text into lowercase words, filtering stop words and short tokens */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9#+.\/\-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !STOP_WORDS.has(w));
}

/** Extract bigrams (two-word phrases) from tokens */
function bigrams(tokens: string[]): string[] {
  const result: string[] = [];
  for (let i = 0; i < tokens.length - 1; i++) {
    result.push(`${tokens[i]} ${tokens[i + 1]}`);
  }
  return result;
}

export interface KeywordMatchResult {
  /** Unique keywords extracted from the job description */
  jdKeywords: string[];
  /** Keywords from the JD that appear in the resume */
  matched: string[];
  /** Keywords from the JD that are missing from the resume */
  missing: string[];
  /** Match percentage 0-100 */
  matchPercent: number;
  /** Summary string to inject into the LLM prompt */
  summary: string;
}

/**
 * Extract keywords from a job description and match them against resume text.
 * Returns grounded match data the LLM can reference.
 */
export function extractAndMatchKeywords(
  resumeText: string,
  jobDescription: string
): KeywordMatchResult {
  const jdTokens = tokenize(jobDescription);
  const resumeLower = resumeText.toLowerCase();

  // Count token frequency in JD — higher frequency = more important
  const freq = new Map<string, number>();
  for (const t of jdTokens) {
    freq.set(t, (freq.get(t) || 0) + 1);
  }

  // Also check bigrams for multi-word terms (e.g., "machine learning")
  const jdBigrams = bigrams(jdTokens);
  for (const b of jdBigrams) {
    freq.set(b, (freq.get(b) || 0) + 1);
  }

  // Keep keywords that appear at least once, deduplicate, limit to top 60
  const keywords = [...freq.entries()]
    .filter(([, count]) => count >= 1)
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word)
    .slice(0, 60);

  // Remove bigrams whose individual words are already captured, keep only meaningful bigrams
  const singleWords = new Set(keywords.filter((k) => !k.includes(" ")));
  const meaningfulBigrams = keywords.filter(
    (k) => k.includes(" ") && freq.get(k)! >= 2
  );
  const finalKeywords = [
    ...keywords.filter((k) => !k.includes(" ")),
    ...meaningfulBigrams,
  ].slice(0, 50);

  const matched: string[] = [];
  const missing: string[] = [];

  for (const kw of finalKeywords) {
    if (resumeLower.includes(kw)) {
      matched.push(kw);
    } else {
      missing.push(kw);
    }
  }

  const matchPercent =
    finalKeywords.length > 0
      ? Math.round((matched.length / finalKeywords.length) * 100)
      : 0;

  const summary = [
    `Deterministic keyword analysis: ${matched.length} of ${finalKeywords.length} JD keywords found in resume (${matchPercent}% match).`,
    matched.length > 0 ? `MATCHED keywords: ${matched.slice(0, 20).join(", ")}` : "",
    missing.length > 0 ? `MISSING keywords: ${missing.slice(0, 20).join(", ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return { jdKeywords: finalKeywords, matched, missing, matchPercent, summary };
}
