
import { QuizQuestion } from "@/types";

export const parseExplanationForHotspot = (explanation: string | undefined): Record<string, string> | null => {
  if (!explanation) return null;

  const matches: Record<string, string> = {};
  
  // Pattern 1: "Box 1: Yes" or "Box 1: Value"
  // We need to be careful not to capture the explanation text after the value
  // Regex strategy: Look for "Box <N>:" followed by typically "Yes" or "No" or a short phrase until a newline or "Box <N+1>" or "-".
  
  // Common format in dumps: "Box 1: Yes - explanation... Box 2: No - explanation..."
  // or "Box 1: Yes. explanation..."
  
  const regex = /(?:Box|Statement|Area)\s+(\d+)\s*:\s*(Yes|No)/gi;
  let match;
  
  // Reset regex lastIndex just in case
  regex.lastIndex = 0;
  
  while ((match = regex.exec(explanation)) !== null) {
      const boxId = `Box ${match[1]}`;
      const rawValue = match[2].trim().toLowerCase();
      // Normalize to Title Case for UI consistency ("yes" -> "Yes")
      const value = rawValue.charAt(0).toUpperCase() + rawValue.slice(1);
      
      const cleanValue = value; // No need to regex replace punctuation since we captured strict Yes/No
      
      if (cleanValue) {
          matches[boxId] = cleanValue;
      }
  }

  return Object.keys(matches).length > 0 ? matches : null;
};

// Helper for shuffle (moving here to be reusable if needed, though mostly used in API)
export const shuffleArray = <T>(array: T[]): T[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

export const selectExamQuestionsAzureStyle = (questions: QuizQuestion[], targetTotal: number): QuizQuestion[] => {
    const mcqs = questions.filter((q) => q.type && q.type.toLowerCase() === "mcq");
    const others = questions.filter((q) => {
      const isMcq = q.type && q.type.toLowerCase() === "mcq";
      if (isMcq) return false;
      
      // Filter out Hotspots that don't have a structured answer
      if (q.type === "hotspot") {
          const hasStructuredAnswer = q.answer && typeof q.answer === 'object' && Object.keys(q.answer).length > 0;
          return !!hasStructuredAnswer;
      }
      return true;
    });

    const shuffledMcqs = shuffleArray(mcqs);
    const shuffledOthers = shuffleArray(others);

    // 75% MCQ
    const targetMcq = Math.round(targetTotal * 0.75);
    const targetOther = targetTotal - targetMcq;

    let selectedMcqs = shuffledMcqs.slice(0, targetMcq);
    let selectedOthers = shuffledOthers.slice(0, targetOther);

    // Backfill
    if (selectedOthers.length < targetOther) {
      const needed = targetOther - selectedOthers.length;
      selectedMcqs = [...selectedMcqs, ...shuffledMcqs.slice(targetMcq, targetMcq + needed)];
    } else if (selectedMcqs.length < targetMcq) {
      const needed = targetMcq - selectedMcqs.length;
      const othersSlice = shuffledOthers.slice(targetOther, targetOther + needed);
      selectedOthers = [...selectedOthers, ...othersSlice];
    }

    const final = shuffleArray([...selectedMcqs, ...selectedOthers]);
    if (final.length > targetTotal) return final.slice(0, targetTotal);
    return final;
};

export function checkAnswer(q: QuizQuestion, uAns: any): boolean {
    if (uAns === undefined) return false;

    if (q.type === 'mcq' || !q.type) { // Default to MCQ if no type
      if (typeof uAns === 'string' && uAns === q.answer) return true;
      if (Array.isArray(uAns) && Array.isArray(q.answer)) {
          return uAns.length === q.answer.length && uAns.every(v => (q.answer as string[]).includes(v));
      }
      // AWS legacy check
      if (Array.isArray(uAns) && typeof q.answer === 'string') {
          const sorted = [...uAns].sort().join("");
          return sorted === q.answer;
      }
    } else if (q.type === 'hotspot') {
      if (typeof q.answer === 'object' && q.answer !== null && uAns && typeof uAns === 'object' && !Array.isArray(uAns)) {
          const answerRecord = q.answer as Record<string, "Yes" | "No">;
          const userRecord = uAns as Record<string, string>;
          return Object.entries(answerRecord).every(([key, val]) => userRecord[key] === val);
      }
    } else if (q.type === 'case_table') {
      if ('statements' in q && Array.isArray(q.statements) && typeof uAns === 'object' && !Array.isArray(uAns)) {
           const userRecord = uAns as Record<string, string>;
           return q.statements.every((st, idx) => userRecord[idx] === st.answer);
      }
    } else if (q.type === 'drag_drop') {
       if (Array.isArray(q.answer)) {
           return Array.isArray(uAns) && q.answer.length === uAns.length && q.answer.every((val) => (uAns as string[]).includes(val));
       } else if ('answer_mapping' in q && q.answer_mapping && typeof uAns === 'object' && !Array.isArray(uAns)) {
           const userRecord = uAns as Record<string, string>;
           return Object.entries(q.answer_mapping).every(([zone, item]) => userRecord[zone] === item);
       }
    }
    return false;
}
