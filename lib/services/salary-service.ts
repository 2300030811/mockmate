import { logger } from '@/lib/logger';
import type { SalaryData } from '@/types/career';

// Import salary datasets from external JSON — clean separation of concerns
import indiaSalaries from '@/data/salaries.india.json';
import usSalaries from '@/data/salaries.us.json';

export type { SalaryData };

// ─── Types ──────────────────────────────────────────────────────────────────

interface SalaryEntry { min: number; max: number; median: number }
type SalaryDB = Record<string, SalaryEntry>;

export type SalaryConfidence = 'high' | 'medium' | 'low';

export interface EnrichedSalaryData extends SalaryData {
  confidence: SalaryConfidence;
  matchType: 'exact' | 'fuzzy' | 'none';
}

// ─── Location Multipliers ───────────────────────────────────────────────────
// City-based cost-of-living adjustments (India). Source: AmbitionBox, Glassdoor.

const INDIA_CITY_MULTIPLIER: Record<string, number> = {
  bangalore:    1.20,
  bengaluru:    1.20,
  mumbai:       1.15,
  delhi:        1.10,
  'new delhi':  1.10,
  gurgaon:      1.15,
  gurugram:     1.15,
  noida:        1.08,
  hyderabad:    1.10,
  pune:         1.08,
  chennai:      1.05,
  kolkata:      1.00,
  ahmedabad:    0.95,
  jaipur:       0.90,
  chandigarh:   0.92,
  kochi:        0.90,
  coimbatore:   0.85,
  indore:       0.85,
  lucknow:      0.85,
  bhopal:       0.82,
  thiruvananthapuram: 0.88,
};

const US_CITY_MULTIPLIER: Record<string, number> = {
  'san francisco':  1.30,
  'new york':       1.25,
  seattle:          1.20,
  'los angeles':    1.15,
  austin:           1.05,
  denver:           1.05,
  chicago:          1.05,
  boston:            1.20,
  'washington dc':  1.15,
  atlanta:          0.95,
  dallas:           0.95,
  phoenix:          0.90,
  remote:           1.00,
};

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

// ─── Location Detection ─────────────────────────────────────────────────────

function detectRegion(location: string): { isUS: boolean; city: string; multiplier: number } {
  const loc = location.toLowerCase().trim();
  const isUS = /\b(us|usa|united states|america)\b/.test(loc);
  const cityMultipliers = isUS ? US_CITY_MULTIPLIER : INDIA_CITY_MULTIPLIER;

  // Find the best matching city
  for (const [city, mult] of Object.entries(cityMultipliers)) {
    if (loc.includes(city)) {
      return { isUS, city, multiplier: mult };
    }
  }

  return { isUS, city: 'default', multiplier: 1.0 };
}

// ─── Fuzzy Title Matching ───────────────────────────────────────────────────

function fuzzyMatchTitle(normalizedTitle: string, db: SalaryDB): { key: string; score: number } | null {
  const titleWords = normalizedTitle.split(/[\s\-\/\.]+/).filter(w => w.length > 2);
  let bestMatch: { key: string; score: number } | null = null;

  for (const key of Object.keys(db)) {
    const keyWords = key.split(/[\s\-\/\.]+/).filter(w => w.length > 2);
    let score = 0;
    for (const tw of titleWords) {
      for (const kw of keyWords) {
        if (tw === kw) score += 3;
        else if (kw.includes(tw) || tw.includes(kw)) score += 2;
      }
    }
    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { key, score };
    }
  }

  return bestMatch && bestMatch.score >= 2 ? bestMatch : null;
}

// ─── Local Salary Lookup ────────────────────────────────────────────────────

function lookupLocalSalary(
  jobTitle: string,
  location: string,
  experienceYears?: number
): { salary: SalaryData; confidence: SalaryConfidence; matchType: 'exact' | 'fuzzy' } | null {
  const normalizedTitle = jobTitle.toLowerCase().trim();
  const { isUS, multiplier } = detectRegion(location);
  const db = (isUS ? usSalaries : indiaSalaries) as SalaryDB;
  const currency = isUS ? 'USD' : 'INR';
  const sources = isUS
    ? ['Glassdoor', 'Levels.fyi', 'Indeed']
    : ['Glassdoor', 'AmbitionBox', 'Levels.fyi'];

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
    const fuzzy = fuzzyMatchTitle(normalizedTitle, db);
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

  // 4. Apply location multiplier
  const adjusted: SalaryEntry = {
    min: Math.round(entry.min * multiplier),
    max: Math.round(entry.max * multiplier),
    median: Math.round(entry.median * multiplier),
  };

  return {
    salary: {
      ...adjusted,
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
  location: string = 'India',
  experienceYears?: number
): EnrichedSalaryData | null {
  const localResult = lookupLocalSalary(jobTitle, location, experienceYears);

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

/**
 * Format salary data for display in natural language
 */
export function formatSalaryRange(
  salary: SalaryData | null,
  locale: string = 'en-IN'
): string {
  if (!salary) return '';

  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: salary.currency,
    maximumFractionDigits: 0,
  });

  const min = formatter.format(salary.min);
  const max = formatter.format(salary.max);
  const period = salary.period === 'YEAR' ? 'PA' : 'PM';

  return `${min} - ${max} ${period}`;
}
