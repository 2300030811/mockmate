import { logger } from '@/lib/logger';
import type { SalaryData } from '@/types/career';

// Import salary datasets from external JSON — clean separation of concerns
import indiaSalaries from '@/data/salaries.india.json';

export type { SalaryData };

// ─── Types ──────────────────────────────────────────────────────────────────

interface SalaryEntry { min: number; max: number; median: number }
type SalaryDB = Record<string, SalaryEntry>;

export type SalaryConfidence = 'high' | 'medium' | 'low';

export interface EnrichedSalaryData extends SalaryData {
  confidence: SalaryConfidence;
  matchType: 'exact' | 'fuzzy' | 'none';
}

// ─── Experience Scaling ─────────────────────────────────────────────────────

function adjustForExperience(entry: SalaryEntry, years: number): SalaryEntry {
  // Fresher/Intern: bottom of range
  if (years <= 1) {
    return {
      min: entry.min,
      max: Math.round(entry.min + (entry.median - entry.min) * 0.5),
      median: Math.round(entry.min + (entry.median - entry.min) * 0.3),
    };
  }
  // Junior (2-3 years): lower-mid range
  if (years <= 3) {
    return {
      min: Math.round(entry.min * 1.1),
      max: entry.median,
      median: Math.round((entry.min * 1.1 + entry.median) / 2),
    };
  }
  // Mid-level (4-6 years): full range
  if (years <= 6) {
    return entry;
  }
  // Senior (7-10 years): upper range
  if (years <= 10) {
    return {
      min: entry.median,
      max: entry.max,
      median: Math.round((entry.median + entry.max) / 2),
    };
  }
  // Staff/Principal (11+ years): top of range + premium
  return {
    min: Math.round(entry.median * 1.2),
    max: Math.round(entry.max * 1.25),
    median: Math.round(entry.max * 1.1),
  };
}



// ─── Fuzzy Title Matching ───────────────────────────────────────────────────

// ─── Search Cache & Pre-processing ──────────────────────────────────────────
const FUZZY_CACHE = new Map<string, { key: string; score: number } | null>();
const db = indiaSalaries as SalaryDB;

// Pre-process database keys into words for faster matching
const processedKeys = Object.keys(db).map(key => ({
  key,
  words: key.split(/[\s\-\/\.]+/).filter(w => w.length >= 2)
}));

function fuzzyMatchTitle(normalizedTitle: string): { key: string; score: number } | null {
  const cached = FUZZY_CACHE.get(normalizedTitle);
  if (cached !== undefined) return cached;

  const titleWords = normalizedTitle.split(/[\s\-\/\.]+/).filter(w => w.length >= 2);
  let bestMatch: { key: string; score: number } | null = null;

  for (const item of processedKeys) {
    let score = 0;
    for (const tw of titleWords) {
      for (const kw of item.words) {
        if (tw === kw) {
          score += 3;
        } else if (kw.includes(tw) || tw.includes(kw)) {
          score += 2;
        }
      }
    }
    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { key: item.key, score };
    }
  }

  const result = bestMatch && bestMatch.score >= 2 ? bestMatch : null;
  FUZZY_CACHE.set(normalizedTitle, result);
  return result;
}

// ─── Local Salary Lookup ────────────────────────────────────────────────────

function lookupLocalSalary(
  jobTitle: string,
  experienceYears?: number
): { salary: SalaryData; confidence: SalaryConfidence; matchType: 'exact' | 'fuzzy' } | null {
  const normalizedTitle = jobTitle.toLowerCase().trim();
  const multiplier = 1.0; // Default to 1.0 as city data isn't collected yet
  const currency = 'INR';
  const sources = ['Glassdoor', 'AmbitionBox', 'Levels.fyi'];

  // 1. Exact match
  let entry: SalaryEntry | null = null;
  let matchType: 'exact' | 'fuzzy' = 'exact';
  let confidence: SalaryConfidence = 'high';

  if (db[normalizedTitle]) {
    entry = db[normalizedTitle];
    matchType = 'exact';
    confidence = 'high';
  } else {
    // 2. Fuzzy match
    const fuzzy = fuzzyMatchTitle(normalizedTitle);
    if (fuzzy) {
      entry = db[fuzzy.key];
      matchType = 'fuzzy';
      confidence = fuzzy.score >= 4 ? 'high' : 'medium';
    }
  }

  if (!entry) return null;

  // 3. Apply experience scaling
  if (typeof experienceYears === 'number' && experienceYears >= 0) {
    entry = adjustForExperience(entry, experienceYears);
  }

  return {
    salary: {
      ...entry,
      currency,
      period: 'YEAR',
      source: 'Industry Aggregated Data',
      publishers: sources,
    },
    confidence,
    matchType,
  };
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Get salary estimate with confidence scoring.
 *
 * Strategy:
 *   1. Local DB (instant) — exact/fuzzy match with experience & location scaling
 *   2. Returns null only if no data at all — AI then estimates (LOW confidence)
 */
export function fetchSalaryEstimate(
  jobTitle: string,
  experienceYears?: number
): EnrichedSalaryData | null {
  const localResult = lookupLocalSalary(jobTitle, experienceYears);

  if (localResult) {
    logger.debug('Using local salary database', { jobTitle, matchType: localResult.matchType, confidence: localResult.confidence });
    return {
      ...localResult.salary,
      confidence: localResult.confidence,
      matchType: localResult.matchType,
    };
  }

  logger.debug('No salary data available, AI will estimate', { jobTitle });
  return null;
}

// ─── Format Cache ───────────────────────────────────────────────────────────

const FORMATTER_CACHE = new Map<string, Intl.NumberFormat>();

function getFormatter(locale: string, currency: string): Intl.NumberFormat {
  const cacheKey = `${locale}-${currency}`;
  if (!FORMATTER_CACHE.has(cacheKey)) {
    FORMATTER_CACHE.set(cacheKey, new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }));
  }
  return FORMATTER_CACHE.get(cacheKey)!;
}

/**
 * Format salary data for display in natural language
 */
export function formatSalaryRange(
  salary: SalaryData | null
): string {
  if (!salary) return '';

  const formatter = getFormatter('en-IN', 'INR');

  const min = formatter.format(salary.min);
  const max = formatter.format(salary.max);
  const period = salary.period === 'YEAR' ? 'PA' : 'PM';

  return `${min} - ${max} ${period}`;
}
