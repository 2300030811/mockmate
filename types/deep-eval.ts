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
