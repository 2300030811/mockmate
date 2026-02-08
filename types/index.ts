export type QuizType = 
  | "mcq" 
  | "MSQ"
  | "drag_drop" 
  | "hotspot" 
  | "hotspot_yesno_table" 
  | "hotspot_sentence" 
  | "hotspot_box_mapping" 
  | "case_table";

// Base structure for all question types
export interface BaseQuestion {
  id: number | string;
  type: QuizType;
  question: string;
  explanation?: string;
  code?: string;
  image?: string;
  section?: string;
  domain?: string;
  difficulty?: string;
  batchId?: string;
}

// 1. MCQ (Standard & AWS/Salesforce/MongoDB style)
export interface MCQQuestion extends BaseQuestion {
  type: "mcq" | "MSQ"; // MSQ for multiple select
  options: string[];
  answer: string | string[]; // Single letter/string or array of correct options
}

// 2. Drag & Drop (Azure style)
export interface DragDropQuestion extends BaseQuestion {
  type: "drag_drop";
  options: string[];
  drop_zones?: string[];
  answer: string | string[]; // Can be ordered string or array
  answer_mapping?: Record<string, string>;
}

// 3. Hotspot (Legacy Azure style)
export interface HotspotQuestion extends BaseQuestion {
  type: "hotspot";
  // Logic often uses coordinate clicks or specific area selection
  answer: Record<string, "Yes" | "No"> | boolean; 
  rows?: string[];
}

// 4. Hotspot Yes/No Table (Azure style)
export interface HotspotYesNoTableQuestion extends BaseQuestion {
  type: "hotspot_yesno_table";
  statements: {
    text: string;
    answer: "Yes" | "No";
  }[];
  // Helper to standardise access if needed
  answer?: never; 
}

// 5. Hotspot Sentence Completion (Azure style)
export interface HotspotSentenceQuestion extends BaseQuestion {
  type: "hotspot_sentence";
  hotspot_options: string[];
  answer: string;
}

// 6. Hotspot Box Mapping (Azure style)
export interface HotspotBoxMappingQuestion extends BaseQuestion {
  type: "hotspot_box_mapping";
  boxes: {
    label: string;
    options: string[];
    answer: string;
  }[];
  answer?: never; 
}

// 7. Case Study (Azure style)
export interface CaseStudyQuestion extends BaseQuestion {
  type: "case_table";
  scenario: string;
  statements: {
    text: string;
    answer: "Yes" | "No";
  }[];
  answer?: never;
}

// PCAP / Python specifics often exist as generic MCQs but with code blocks or image assets.
export interface PCAPQuestion extends MCQQuestion {
  // often has 'code' field populated
}

export type QuizQuestion = 
  | MCQQuestion 
  | DragDropQuestion 
  | HotspotQuestion 
  | HotspotYesNoTableQuestion
  | HotspotSentenceQuestion
  | HotspotBoxMappingQuestion
  | CaseStudyQuestion;

// Backwards compatibility alias if needed, or we just update usages
export type AWSQuestion = MCQQuestion;

export type QuizMode = "practice" | "exam";

export interface QuizConfig {
  mode: QuizMode;
  count?: number | "all";
  url: string; 
}

// For raw API responses before normalization
export interface ExternalQuizResponse {
  questions?: unknown[];
  [key: string]: unknown;
}

