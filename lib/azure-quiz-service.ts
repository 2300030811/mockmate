export type QuestionType = 'mcq' | 'drag_drop' | 'hotspot' | 'hotspot_yesno_table' | 'hotspot_sentence' | 'hotspot_box_mapping' | 'case_table';

export interface BaseQuestion {
  id: number;
  type: QuestionType;
  question?: string;
  explanation?: string;
}

export interface MCQQuestion extends BaseQuestion {
  type: 'mcq';
  question: string;
  options: string[];
  answer: string; // "A", "B", etc. or "Yes"/"No"
}

export interface DragDropQuestion extends BaseQuestion {
  type: 'drag_drop';
  question: string;
  options: string[];
  drop_zones?: string[];
  answer: string[] | string;
  answer_mapping?: Record<string, string>;
}

// Legacy hotspot format
export interface HotspotQuestion extends BaseQuestion {
  type: 'hotspot';
  question: string;
  answer: Record<string, "Yes" | "No">;
  rows?: string[];
}

// Hotspot Yes/No table with statements
export interface HotspotYesNoTableQuestion extends BaseQuestion {
  type: 'hotspot_yesno_table';
  question: string;
  statements: {
    text: string;
    answer: "Yes" | "No";
  }[];
}

// Hotspot sentence completion
export interface HotspotSentenceQuestion extends BaseQuestion {
  type: 'hotspot_sentence';
  question: string;
  hotspot_options: string[];
  answer: string;
}

// Hotspot box mapping
export interface HotspotBoxMappingQuestion extends BaseQuestion {
  type: 'hotspot_box_mapping';
  question: string;
  boxes: {
    label: string;
    options: string[];
    answer: string;
  }[];
}

export interface CaseStudyQuestion extends BaseQuestion {
  type: 'case_table';
  scenario: string;
  statements: {
    text: string;
    answer: "Yes" | "No";
  }[];
}

export type QuizQuestion = 
  | MCQQuestion 
  | DragDropQuestion 
  | HotspotQuestion 
  | HotspotYesNoTableQuestion
  | HotspotSentenceQuestion
  | HotspotBoxMappingQuestion
  | CaseStudyQuestion;

const AZURE_BLOB_URL = "/api/azure-questions";

export async function fetchAzureQuestions(): Promise<QuizQuestion[]> {
  try {
    const res = await fetch(AZURE_BLOB_URL, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`Failed to fetch questions: ${res.statusText}`);
    }
    const data = await res.json();
    
    return data as QuizQuestion[];
  } catch (error) {
    console.error("Error loading Azure questions:", error);
    return [];
  }
}
