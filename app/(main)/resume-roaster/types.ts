export interface SkillBreakdown {
  clarity: number;
  impact: number;
  technical: number;
  layout: number;
}

export interface AtsAnalysis {
  matchRating: 'High' | 'Medium' | 'Low' | string;
  missingKeywords: string[];
  formattingIssues: string;
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
