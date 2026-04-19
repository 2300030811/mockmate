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
  formatScore: number;
  contentScore: number;
  keywordScore: number;
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
  jobTitle?: string;
  companyName?: string;
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
  matchRating: z.enum(['High', 'Medium', 'Low']).default('Medium'),
  formatScore: z.number().min(0).max(100).default(50),
  contentScore: z.number().min(0).max(100).default(50),
  keywordScore: z.number().min(0).max(100).default(50),
  missingHardSkills: z.array(z.string()).default([]),
  missingSoftSkills: z.array(z.string()).default([]),
  presentKeywords: z.array(z.string()).default([]),
  contentIssues: z.array(z.string()).default([]),
  atsTips: z.array(z.string()).default([]),
  jobDescriptionProvided: z.boolean().default(false),
});

export const roastDataSchema = z.object({
  professionalScore: z.number().min(0).max(100).default(50),
  brutalRoast: z.string().default("Could not generate roast."),
  jobTitle: z.string().optional().default(""),
  companyName: z.string().optional().default(""),
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
    matchRating: 'Medium',
    formatScore: 50,
    contentScore: 50,
    keywordScore: 50,
    missingHardSkills: [],
    missingSoftSkills: [],
    presentKeywords: [],
    contentIssues: [],
    atsTips: [],
    jobDescriptionProvided: false,
  }),
  suggestions: z.array(z.string()).default([]),
});
