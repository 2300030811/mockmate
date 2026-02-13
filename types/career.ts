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
  duration: string; // e.g., "Week 1-2"
  resources: { name: string; url: string; type: 'course' | 'article' | 'project' }[];
  isCompleted?: boolean;
}

export interface MarketInsights {
  demand: 'high' | 'medium' | 'low';
  salaryRange: string;
  outlook: string;
}

export interface InterviewPrep {
  topQuestions: { question: string; reason: string }[];
}

export interface ResumeSuggestion {
  category: 'keyword' | 'experience' | 'structure';
  suggestion: string;
  impact: 'high' | 'medium' | 'low';
}

export interface CareerAnalysisResult {
  jobRole: string;
  company?: string;
  matchScore: number; // 0-100
  extractedSkills: Skill[];
  missingSkills: SkillGap[];
  roadmap: LearningStep[];
  marketInsights?: MarketInsights;
  interviewPrep?: InterviewPrep;
  resumeSuggestions?: ResumeSuggestion[];
}

