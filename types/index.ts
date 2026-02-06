export type QuizType = "mcq" | "hotspot" | "drag_drop";

export interface QuizQuestion {
  id: number | string;
  type: QuizType;
  question: string;
  options?: string[];
  answer?: string | string[] | Record<string, any>;
  explanation?: string;
  image?: string;
  section?: string;
}

export type QuizMode = "practice" | "exam";

export interface QuizConfig {
  mode: QuizMode;
  count?: number | "all";
  url: string; 
}

export interface AWSQuestion extends QuizQuestion {
  id: number;
  type: "mcq";
  options: string[];
  answer: string;
}

// For raw API responses before normalization
export interface ExternalQuizResponse {
  questions?: unknown[];
  [key: string]: unknown;
}

