import { QuizQuestion } from "@/types";
import { BaseQuizSource } from "./BaseQuizSource";
import { detectAndParse } from "@/lib/parsers";
import wtnQuestions from "@/data/wtn-m1-questions.json";

export class LocalFileQuizSource extends BaseQuizSource {
  private localQuestions: QuizQuestion[];

  constructor(label: string, defaultExamCount: number = 50) {
    super(label, defaultExamCount);
    this.localQuestions = detectAndParse(wtnQuestions);
  }

  async fetchRemoteQuestions(): Promise<QuizQuestion[]> {
    return this.localQuestions;
  }
}
