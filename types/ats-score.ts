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
