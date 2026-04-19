import { z } from "zod";
import { clampScore } from "@/utils/math";

export const ATS_SCORE_WEIGHTS = {
  format: 0.25,
  content: 0.35,
  keyword: 0.4,
} as const;


export function computeWeightedAtsScore(params: {
  formatScore: number;
  contentScore: number;
  keywordScore: number;
}): number {
  const weighted =
    params.formatScore * ATS_SCORE_WEIGHTS.format +
    params.contentScore * ATS_SCORE_WEIGHTS.content +
    params.keywordScore * ATS_SCORE_WEIGHTS.keyword;

  return clampScore(weighted);
}

export interface AtsScoreResult {
  atsScore: number;
  matchRating: 'High' | 'Medium' | 'Low';
  
  // Detailed scores
  formatScore: number;
  contentScore: number;
  keywordScore: number;

  // Keyword analysis
  presentKeywords: string[];
  missingKeywords: string[];

  // Section analysis
  sectionAnalysis: {
    summary: boolean;
    experience: boolean;
    education: boolean;
    skills: boolean;
    projects: boolean;
    contact: boolean;
  };

  // Structured issues
  structureIssues: string[];
  
  // Fix suggestions
  fixSuggestions: {
    category: 'Keyword' | 'Structure' | 'Content' | 'Formatting';
    priority: 'High' | 'Medium' | 'Low';
    suggestion: string;
    before?: string;
    after?: string;
  }[];

  overallFeedback: string;
}

// ---------- Zod schemas for runtime validation ----------

export const fixSuggestionSchema = z.object({
  category: z.enum(['Keyword', 'Structure', 'Content', 'Formatting']),
  priority: z.enum(['High', 'Medium', 'Low']),
  suggestion: z.string(),
  before: z.string().optional(),
  after: z.string().optional(),
});

export const atsScoreSchema = z.object({
  atsScore: z.number().min(0).max(100),
  matchRating: z.enum(['High', 'Medium', 'Low']).optional(),
  formatScore: z.number().min(0).max(100),
  contentScore: z.number().min(0).max(100),
  keywordScore: z.number().min(0).max(100),
  
  presentKeywords: z.array(z.string()).default([]),
  missingKeywords: z.array(z.string()).default([]),
  
  sectionAnalysis: z.object({
    summary: z.boolean().default(false),
    experience: z.boolean().default(false),
    education: z.boolean().default(false),
    skills: z.boolean().default(false),
    projects: z.boolean().default(false),
    contact: z.boolean().default(false),
  }).default({}),
  
  structureIssues: z.array(z.string()).default([]),
  
  fixSuggestions: z.array(fixSuggestionSchema).default([]),
  
  overallFeedback: z.string().default(""),
});

/** Derive matchRating deterministically from atsScore */
export function deriveAtsMatchRating(atsScore: number): 'High' | 'Medium' | 'Low' {
  if (atsScore >= 75) return 'High';
  if (atsScore >= 45) return 'Medium';
  return 'Low';
}
