export interface QuizQuestion {
  id: number | string;
  type: "mcq" | "hotspot" | "drag_drop" | string;
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
  url: string; // The source URL for questions
}
