
import { QuizQuestion, QuizMode } from "@/types";
import { BaseQuizSource } from "./BaseQuizSource";
import { QuizFetcher } from "@/lib/quiz-fetcher";
import { parsePCAPData } from "@/lib/pcap-parser"; 
import { selectExamQuestionsAzureStyle } from "@/utils/quiz-helpers";

export class PCAPQuizSource extends BaseQuizSource {
  private url: string | undefined;

  constructor(url: string | undefined) {
    super("PCAP", 40);
    this.url = url;
  }

  async fetchRawQuestions(): Promise<QuizQuestion[]> {
    if (!this.url) return [];
    
    const dbQuestions = await QuizFetcher.fetchQuestionsFromDB("pcap");
    if (dbQuestions && dbQuestions.length > 0) return dbQuestions;

    try {
        const response = await fetch(this.url, { next: { revalidate: 3600 } });
        if (!response.ok) throw new Error(`Failed: ${response.statusText}`);
        
        const text = await response.text();
        const data = parsePCAPData(text);
        
        const allQuestions: QuizQuestion[] = [];
        
        data.forEach((batch) => {
            if (batch.questions && Array.isArray(batch.questions)) {
              batch.questions.forEach((q) => {
                  
                  const optionsMap = q.options || {};
                  const optionsKeys = Object.keys(optionsMap).sort();
                  const optionsArray = optionsKeys.map(k => optionsMap[k] as string);
                  
                  let answer: string | string[];
                  if (q.correctAnswer && Array.isArray(q.correctAnswer)) {
                      if (q.correctAnswer.length === 1) {
                          answer = optionsMap[q.correctAnswer[0]] || "";
                      } else {
                          answer = q.correctAnswer.map((k: string) => optionsMap[k] || "");
                      }
                  } else {
                      answer = ""; 
                  }
    
                  let explanation = q.explanation ? q.explanation.replace(/\[cite: \d+\]/g, '').trim() : "";
                  
                  // Specific fixes
                  if (q.id === 141) {
                      explanation = "Attempting to delete an index that is out of range raises an IndexError. Here, `del spam[4]` targets the 5th element, but the list only has indices 0 to 4 (element 16). After checking range(4) creates [0,1,2,3], so index 4 is invalid.";
                  } else if (q.id === 64) {
                        explanation = "The loop iterates through range(1, 3) (i.e., 1 and 2). For i=1: 1%1==0 -> prints '*'. For i=2: 2%2==0 and 2>1 -> prints '*'. Total 2 stars printed.";
                  }
    
                  // Clean internal monologue
                  if (explanation.includes("Wait,")) {
                      const parts = explanation.split("Wait,");
                      let clean = parts[0].trim();
                      if (clean.length < 15) {
                          if (explanation.includes("**Correction**")) {
                                clean = explanation.split("**Correction**")[1].replace(/^[:\s]+/, '').trim();
                          } else {
                                clean = "Review the code execution logic.";
                          }
                      }
                      explanation = clean;
                  }
                  
                  if (explanation.includes("I will provide")) {
                        explanation = explanation.split("I will provide")[0].trim();
                  }
    
                  allQuestions.push({
                      id: `${batch.batchId || 0}-${q.id}`, 
                      type: q.type === 'multiple' ? 'MSQ' : 'mcq',
                      question: q.question,
                      code: q.code, 
                      options: optionsArray,
                      answer: answer,
                      explanation: explanation
                  });
              });
            }
          });

        return allQuestions;
    } catch (e) {
        console.error("PCAP Fetch Error:", e);
        return [];
    }
  }

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
