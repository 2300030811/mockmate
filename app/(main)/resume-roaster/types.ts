import { z } from "zod";

export interface SkillBreakdown {
  clarity: number;
  impact: number;
  technical: number;
  layout: number;
}

export interface AtsAnalysis {
  atsScore: number;
  matchRating: 'High' | 'Medium' | 'Low';
  missingHardSkills: string[];
  missingSoftSkills: string[];
  presentKeywords: string[];
  contentIssues: string[];
  atsTips: string[];
  jobDescriptionProvided: boolean;
}

export interface RoastData {
  professionalScore: number;
  brutalRoast: string;
  skillBreakdown: SkillBreakdown;
  criticalFlaws: string[];
  winningPoints: string[];
  atsAnalysis: AtsAnalysis;
  suggestions: string[];
}

// ---------- Zod schemas for runtime validation ----------

export const skillBreakdownSchema = z.object({
  clarity: z.number().min(0).max(100).default(50),
  impact: z.number().min(0).max(100).default(50),
  technical: z.number().min(0).max(100).default(50),
  layout: z.number().min(0).max(100).default(50),
});

const atsAnalysisLLMSchema = z.object({
  atsScore: z.number().min(0).max(100).default(50),
  missingHardSkills: z.array(z.string()).default([]),
  missingSoftSkills: z.array(z.string()).default([]),
  presentKeywords: z.array(z.string()).default([]),
  contentIssues: z.array(z.string()).default([]),
  atsTips: z.array(z.string()).default([]),
});

export const roastDataSchema = z.object({
  professionalScore: z.number().min(0).max(100).default(50),
  brutalRoast: z.string().default("Could not generate roast."),
  skillBreakdown: skillBreakdownSchema.default({
    clarity: 50,
    impact: 50,
    technical: 50,
    layout: 50,
  }),
  criticalFlaws: z.array(z.string()).default([]),
  winningPoints: z.array(z.string()).default([]),
  atsAnalysis: atsAnalysisLLMSchema.default({
    atsScore: 50,
    missingHardSkills: [],
    missingSoftSkills: [],
    presentKeywords: [],
    contentIssues: [],
    atsTips: [],
  }),
  suggestions: z.array(z.string()).default([]),
});

/** Derive matchRating deterministically from atsScore */
export function deriveMatchRating(atsScore: number): 'High' | 'Medium' | 'Low' {
  if (atsScore >= 75) return 'High';
  if (atsScore >= 45) return 'Medium';
  return 'Low';
}
