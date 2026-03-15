/**
 * Deterministic keyword extraction and matching for ATS analysis.
 * Optimized for performance and precision.
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

const ALLOWED_SHORT = new Set(["ai", "ml", "js", "go", "c", "r"]);

// Global cache for stemming to avoid redundant string operations across calls
const STEM_CACHE = new Map<string, string>();

/** Naive suffix stemmer with caching */
function stem(word: string): string {
  const cached = STEM_CACHE.get(word);
  if (cached !== undefined) return cached;

  let stemmed = word
    .replace(/ing$/, "")
    .replace(/ations$/, "ate")
    .replace(/tion$/, "te")
    .replace(/ments$/, "")
    .replace(/ment$/, "")
    .replace(/ed$/, "")
    .replace(/ly$/, "")
    .replace(/ies$/, "y")
    .replace(/s$/, "");

  // Prevent management -> manage and managing -> manag disparity
  if (stemmed.endsWith("manage")) {
    stemmed = stemmed.replace(/manage$/, "manag");
  }

  // Prevent memory leak in long-running processes (though rare in serverless)
  if (STEM_CACHE.size > 5000) STEM_CACHE.clear();
  STEM_CACHE.set(word, stemmed);
  return stemmed;
}

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Tokenize text into lowercase words, filtering stop words and short tokens */
function tokenize(text: string): string[] {
  // match() is generally faster than replace() + split() for token extraction
  const matches = text.toLowerCase().match(/[a-z0-9#+.\/\-]+/g);
  if (!matches) return [];

  const result: string[] = [];
  for (let i = 0; i < matches.length; i++) {
    const raw = matches[i];
    // Strip trailing or leading punctuation (.,/,-) while preserving them mid-word (Node.js, C++)
    const w = raw.replace(/^[.\/\-]+|[.\/\-]+$/g, '');
    if ((w.length >= 2 || ALLOWED_SHORT.has(w)) && !STOP_WORDS.has(w)) {
      result.push(w);
    }
  }
  return result;
}

/** Extract bigrams from tokens */
function getBigrams(tokens: string[]): string[] {
  const result: string[] = [];
  for (let i = 0; i < tokens.length - 1; i++) {
    result.push(`${tokens[i]} ${tokens[i + 1]}`);
  }
  return result;
}

const SECTION_ALIASES: Record<string, RegExp> = {
  education:        /\b(education|academic|degree|university|college)\b/i,
  experience:       /\b(experience|employment|work history|professional background|professional experience|career history)\b/i,
  skills:           /\b(skills|competencies|technical skills|core skills|technical competencies|key skills)\b/i,
  summary:          /\b(summary|profile|about me|professional summary)\b/i,
  objective:        /\b(objective|career objective|goal)\b/i,
  certifications:   /\b(certifications?|certificates?|licensed|accredited)\b/i,
  projects:         /\b(projects?|portfolio|case studies)\b/i,
  awards:           /\b(awards?|honors?|achievements?|recognition)\b/i,
  publications:     /\b(publications?|papers?|research|journals?)\b/i,
  contact:          /\b(contact|email|phone|linkedin|github|address)\b/i,
  languages:        /\b(languages?|spoken|fluent|native)\b/i,
  volunteer:        /\b(volunteer|community|nonprofit|charity)\b/i,
};

const METRIC_PATTERNS: RegExp[] = [
  /\d+\s*%/,
  /\$\s*\d+/,
  /\d+\s*x\b/i,
  /\d[\d,]*\s*\+?\s*(users|customers|clients)/i,
  /\d+\s*(ms|milliseconds?|sec(onds?)?)\b/i,
  /\d+\s*(days?|weeks?|months?|years?)\b/i,
  /\d+\s*(tb|gb|mb)\b/i,
  /(increased|decreased|reduced|improved|grew)/i,
  /\d[\d,]*\s*(requests?|transactions?|calls?)/i,
];

export interface SectionPresence {
  present: string[];
  missing: string[];
}

export interface MetricDetectionResult {
  metricSignals: number;
  hasMetrics: boolean;
  summary: string;
}

export function detectSections(text: string): SectionPresence {
  const present: string[] = [];
  const missing: string[] = [];
  for (const [section, pattern] of Object.entries(SECTION_ALIASES)) {
    if (pattern.test(text)) present.push(section);
    else missing.push(section);
  }
  return { present, missing };
}

export function detectQuantifiedAchievements(text: string): MetricDetectionResult {
  let metricSignals = 0;
  for (let i = 0; i < METRIC_PATTERNS.length; i++) {
    if (METRIC_PATTERNS[i].test(text)) metricSignals++;
  }
  const hasMetrics = metricSignals > 0;
  const label = metricSignals === 0 ? "None" : metricSignals <= 2 ? "Low" : metricSignals <= 5 ? "Moderate" : "Strong";
  const summary = `Quantified achievement signals: ${metricSignals}/${METRIC_PATTERNS.length}. Impact: ${label}.`;
  return { metricSignals, hasMetrics, summary };
}

export interface KeywordMatchResult {
  jdKeywords: string[];
  matched: string[];
  missing: string[];
  matchPercent: number;
  matchedBigrams: string[];
  sections: SectionPresence;
  metrics: MetricDetectionResult;
  summary: string;
}

/**
 * Optimized keyword extraction and matching.
 */
export function extractAndMatchKeywords(
  resumeText: string,
  jobDescription: string
): KeywordMatchResult {
  const jdTokens = tokenize(jobDescription);
  const resumeLower = resumeText.toLowerCase();

  // 1. Build keyword frequency from JD
  const freq = new Map<string, number>();
  for (let i = 0; i < jdTokens.length; i++) {
    const t = jdTokens[i];
    const stemmed = stem(t);
    freq.set(stemmed, (freq.get(stemmed) || 0) + 1);
  }

  // Add bigrams to frequency map
  const jdBigrams = getBigrams(jdTokens);
  for (let i = 0; i < jdBigrams.length; i++) {
    const b = jdBigrams[i];
    freq.set(b, (freq.get(b) || 0) + 1);
  }

  // Sort and prune keywords
  const sortedKeywords = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 60);

  const finalKeywords: string[] = [];
  for (let i = 0; i < sortedKeywords.length; i++) {
    const [kw, count] = sortedKeywords[i];
    const isBigram = kw.includes(" ");
    // Keep unigrams, and bigrams that appear at least twice
    if (!isBigram || count >= 2) {
      finalKeywords.push(kw);
    }
    if (finalKeywords.length >= 50) break;
  }

  // 2. Compute stemmed resume tokens once
  const resumeTokens = tokenize(resumeLower);
  const stemmedResume = new Set<string>();
  for (let i = 0; i < resumeTokens.length; i++) {
    stemmedResume.add(stem(resumeTokens[i]));
  }

  // 3. Match keywords
  let totalWeight = 0;
  let matchedWeight = 0;
  const matched: string[] = [];
  const missing: string[] = [];
  const matchedBigrams: string[] = [];

  // Pre-compiled regex cache for this specific call's bigrams
  const bigramRegexCache = new Map<string, RegExp>();

  for (let i = 0; i < finalKeywords.length; i++) {
    const kw = finalKeywords[i];
    const isBigram = kw.includes(" ");
    const weight = isBigram ? 2 : 1;
    totalWeight += weight;

    let found = false;
    if (isBigram) {
      let pattern = bigramRegexCache.get(kw);
      if (!pattern) {
        pattern = new RegExp(`\\b${escapeRegex(kw)}\\b`, "i");
        bigramRegexCache.set(kw, pattern);
      }
      found = pattern.test(resumeLower);
    } else {
      found = stemmedResume.has(stem(kw));
    }

    if (found) {
      matched.push(kw);
      matchedWeight += weight;
      if (isBigram) matchedBigrams.push(kw);
    } else {
      missing.push(kw);
    }
  }

  const matchPercent = totalWeight > 0 ? Math.round((matchedWeight / totalWeight) * 100) : 0;
  const sections = detectSections(resumeText);
  const metrics = detectQuantifiedAchievements(resumeText);

  // 4. Generate summary
  const summary = [
    `Analysis: ${matched.length}/${finalKeywords.length} keywords (${matchPercent}%).`,
    matchedBigrams.length > 0 ? `Phrases: ${matchedBigrams.join(", ")}` : "",
    `Sections: ${sections.present.join(", ") || "none"}`,
    metrics.summary,
  ].filter(Boolean).join("\n");

  return {
    jdKeywords: finalKeywords,
    matched,
    missing,
    matchPercent,
    matchedBigrams,
    sections,
    metrics,
    summary,
  };
}
