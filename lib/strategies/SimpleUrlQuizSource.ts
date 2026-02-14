
import { QuizQuestion, QuizMode } from "@/types";
import { BaseQuizSource } from "./BaseQuizSource";
import { shuffleArray } from "@/utils/quiz-helpers";
import { QuizFetcher } from "@/lib/quiz-fetcher"; // Import base fetcher for parsing if needed
import { detectAndParse } from "@/lib/parsers";

export class SimpleUrlQuizSource extends BaseQuizSource {
  private url: string | undefined;

  constructor(label: string, url: string | undefined, defaultExamCount: number = 65) {
    super(label, defaultExamCount);
    this.url = url;
  }

  async fetchRawQuestions(): Promise<QuizQuestion[]> {
    if (!this.url) {
        console.error(`[${this.label}] URL is missing.`);
        return [];
    }
    
    // Check DB cache first
    const dbQuestions = await QuizFetcher.fetchQuestionsFromDB(this.label.toLowerCase());
    if (dbQuestions && dbQuestions.length > 0) return dbQuestions;

    try {
        const res = await fetch(this.url, { next: { revalidate: 3600 } });
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        const rawData = await res.json();
        return detectAndParse(rawData);
    } catch (e) {
        console.error(`[${this.label}] Fetch error:`, e);
        return [];
    }
  }
}
