import { logger } from '@/lib/logger';
import type { SalaryData } from '@/types/career';
import {
  buildRoleMatchCandidates,
  normalizeRoleTitleForMatching,
} from '@/lib/career-path/role-normalization';

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
// ─── Search Cache & Pre-processing ──────────────────────────────────────────
const db = indiaSalaries as SalaryDB;

const normalizedKeyToOriginal = new Map<string, string>(
  Object.keys(db).map((key) => [normalizeRoleTitleForMatching(key), key])
);

function findExactMatch(candidates: string[]): { key: string; confidence: SalaryConfidence } | null {
  for (let idx = 0; idx < candidates.length; idx += 1) {
    const candidate = candidates[idx];
    const key = normalizedKeyToOriginal.get(candidate);
    if (key) {
      return {
        key,
        confidence: idx === 0 ? 'high' : 'medium',
      };
    }
  }

  return null;
}
// ─── Local Salary Lookup ────────────────────────────────────────────────────

function lookupLocalSalary(
  jobTitle: string,
  experienceYears?: number
): { salary: SalaryData; confidence: SalaryConfidence; matchType: 'exact' | 'fuzzy' } | null {
  const candidates = buildRoleMatchCandidates(jobTitle);
  if (candidates.length === 0) return null;

  const currency = 'INR';
  const sources = ['Glassdoor', 'AmbitionBox', 'Levels.fyi'];

  // 1. Exact match
  let entry: SalaryEntry | null = null;
  let matchType: 'exact' | 'fuzzy' = 'exact';
  let confidence: SalaryConfidence = 'high';

  const exactMatch = findExactMatch(candidates);
  if (exactMatch) {
    entry = db[exactMatch.key];
    matchType = 'exact';
    confidence = exactMatch.confidence;
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
 *   1. Local DB (instant) — exact title/alias match with experience scaling
 *   2. Returns null when role is not represented in JSON — AI then estimates
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
