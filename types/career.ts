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

export interface CareerAnalysisResult {
  jobRole: string;
  company?: string;
  matchScore: number; // 0-100
  extractedSkills: Skill[];
  missingSkills: SkillGap[];
  roadmap: LearningStep[];
}
