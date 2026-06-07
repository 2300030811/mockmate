import { z } from "zod";

export const CATEGORY_MAXES = {
  open_source: 35,
  self_projects: 30,
  production: 25,
  technical_skills: 10,
} as const;

export const MAX_BONUS = 20;
export const MAX_TOTAL_SCORE = 120; // 100 (categories) + 20 (bonus)

export interface DeepEvalCategoryScore {
  score: number;
  max: number;
  evidence: string;
}

export interface DeepEvalScores {
  open_source: DeepEvalCategoryScore;
  self_projects: DeepEvalCategoryScore;
  production: DeepEvalCategoryScore;
  technical_skills: DeepEvalCategoryScore;
}

export interface DeepEvalBonusPoints {
  total: number;
  breakdown: string;
}

export interface DeepEvalDeductions {
  total: number;
  reasons: string;
}

export interface DeepEvalResult {
  scores: DeepEvalScores;
  bonus_points: DeepEvalBonusPoints;
  deductions: DeepEvalDeductions;
  key_strengths: string[];
  areas_for_improvement: string[];
  /** Optional flag if the job role is gibberish */
  is_invalid_role?: boolean;
  /** List of keywords from the JD missing in the resume */
  missing_keywords?: string[];
  /** Computed from scores + bonus - deductions */
  totalScore: number;
  /** Whether GitHub data was used in the evaluation */
  hasGitHubData: boolean;
}

const categoryScoreSchema = z.object({
  score: z.number().min(0),
  max: z.number().min(1),
  evidence: z.string().min(1),
});

const scoresSchema = z.object({
  open_source: categoryScoreSchema,
  self_projects: categoryScoreSchema,
  production: categoryScoreSchema,
  technical_skills: categoryScoreSchema,
});

const bonusPointsSchema = z.object({
  total: z.number().min(0).max(MAX_BONUS),
  breakdown: z.string(),
});

const deductionsSchema = z.object({
  total: z.number().min(0),
  reasons: z.string(),
});

export const deepEvalSchema = z.object({
  scores: scoresSchema,
  bonus_points: bonusPointsSchema,
  deductions: deductionsSchema,
  key_strengths: z.array(z.string()).min(1).max(5),
  areas_for_improvement: z.array(z.string()).min(1).max(3),
  is_invalid_role: z.boolean().optional(),
  missing_keywords: z.array(z.string()).optional(),
});

function clampRubricValue(value: number, max: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(Math.round(value), max));
}

/**
 * Cap individual category scores at their maximums and compute the
 * final total score (categories + bonus - deductions), capped at 120.
 */
export function computeDeepEvalTotal(
  scores: DeepEvalScores,
  bonus: number,
  deductions: number
): number {
  const cappedOpenSource = clampRubricValue(scores.open_source.score, CATEGORY_MAXES.open_source);
  const cappedSelfProjects = clampRubricValue(scores.self_projects.score, CATEGORY_MAXES.self_projects);
  const cappedProduction = clampRubricValue(scores.production.score, CATEGORY_MAXES.production);
  const cappedTechSkills = clampRubricValue(scores.technical_skills.score, CATEGORY_MAXES.technical_skills);

  const categoryTotal = cappedOpenSource + cappedSelfProjects + cappedProduction + cappedTechSkills;
  const cappedBonus = clampRubricValue(bonus, MAX_BONUS);
  const cappedDeductions = Math.max(0, Math.round(deductions));
  const raw = categoryTotal + cappedBonus - cappedDeductions;

  return Math.max(0, Math.min(raw, MAX_TOTAL_SCORE));
}

/**
 * Derive a human-readable grade from the total score (0-120).
 */
export function deriveDeepEvalGrade(totalScore: number): "Exceptional" | "Strong" | "Average" | "Below Average" | "Weak" {
  if (totalScore >= 90) return "Exceptional";
  if (totalScore >= 70) return "Strong";
  if (totalScore >= 45) return "Average";
  if (totalScore >= 25) return "Below Average";
  return "Weak";
}
