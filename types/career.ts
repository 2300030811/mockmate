export interface Skill {
  name: string;
  category: 'technical' | 'soft' | 'domain';
}

export interface SkillGap {
  skill: string;
  category: 'technical' | 'soft' | 'domain';
  importance: 'high' | 'medium' | 'low';
  recommendedQuiz?: 'aws' | 'azure' | 'mongodb' | 'salesforce' | 'pcap' | 'java';
}

export interface LearningStep {
  title: string;
  description: string;
  duration: string; // e.g., "Days 1-30"
  milestone: string; // concrete deliverable / checkpoint for this phase
  priority: 'critical' | 'important' | 'nice-to-have';
  estimatedHours: number; // total study/practice hours for this phase
  resources: { name: string; url: string; type: 'course' | 'article' | 'project' | 'video' | 'documentation' }[];
  isCompleted?: boolean;
}

export interface SalaryData {
  min: number;
  max: number;
  median: number;
  currency: string;
  period: string;
  source: string;
  publishers: string[];
}

export interface MarketInsights {
  demand: 'high' | 'medium' | 'low';
  salaryRange: string;
  outlook: string;
  confidence: 'high' | 'medium' | 'low'; // high = local DB match, low = AI estimated
}

export interface InterviewPrep {
  topQuestions: {
    question: string;
    reason: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    category?: 'technical' | 'behavioral' | 'system-design';
  }[];
}

export interface ResumeSuggestion {
  category: 'keyword' | 'experience' | 'structure';
  suggestion: string;
  impact: 'high' | 'medium' | 'low';
}

export interface Strength {
  skill: string;
  evidence: string; // Quote or detail from resume showing this strength
  level: 'expert' | 'proficient' | 'intermediate';
}

export interface RoleSuggestion {
  role: string;
  matchPercentage: number; // 0-100
  keyMatchingSkills: string[];
  missingSkills: string[];
  reasoning: string; // One-line explanation of why this role fits
}

export interface CareerAnalysisResult {
  jobRole: string;
  company?: string;
  matchScore: number; // 0-100
  extractedSkills: Skill[];
  missingSkills: SkillGap[];
  strengths?: Strength[]; // New: candidate's strong points
  competitiveEdge?: string; // New: AI-generated one-liner about what makes candidate stand out
  roadmap: LearningStep[];
  marketInsights?: MarketInsights;
  interviewPrep?: InterviewPrep;
  resumeSuggestions?: ResumeSuggestion[];
  suggestedRoles?: RoleSuggestion[]; // AI-suggested alternative roles with match %
  wasTruncated?: boolean;
}

