
import { QuizQuestion, QuizMode } from "@/types";
import { BaseQuizSource } from "./BaseQuizSource";
import { shuffleArray } from "@/utils/quiz-helpers";
import { detectAndParse } from "@/lib/parsers";

export class SimpleUrlQuizSource extends BaseQuizSource {
  private url: string | undefined;

  constructor(label: string, url: string | undefined, defaultExamCount: number = 65) {
    super(label, defaultExamCount);
    this.url = url;
  }

  async fetchRemoteQuestions(): Promise<QuizQuestion[]> {
    if (!this.url) {
        console.error(`[${this.label}] URL is missing.`);
        return [];
    }
    
    // DB check is now in BaseQuizSource
    
    try {
        const res = await fetch(this.url, { 
            next: { revalidate: 3600 },
            signal: AbortSignal.timeout(10000) 
        });
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        const rawData = await res.json();
        return detectAndParse(rawData);
    } catch (e) {
        console.error(`[${this.label}] Fetch error:`, e);
        return [];
    }
  }
}
