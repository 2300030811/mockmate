
import { QuizQuestion, QuizMode } from "@/types";
import { SimpleUrlQuizSource } from "./SimpleUrlQuizSource";
import { selectExamQuestionsAzureStyle } from "@/utils/quiz-helpers";

export class AzureQuizSource extends SimpleUrlQuizSource {
  protected processQuestions(questions: QuizQuestion[], mode: QuizMode, countParam: string | number | null): QuizQuestion[] {
    if (mode === "exam") {
       let targetCount = this.defaultExamCount;
       if (countParam && countParam !== "all") {
           const p = typeof countParam === 'string' ? parseInt(countParam) : countParam;
           if (!isNaN(p) && p > 0) targetCount = p;
       }
       
       return selectExamQuestionsAzureStyle(questions, targetCount);
    }
    return super.processQuestions(questions, mode, countParam);
  }
}
