import { QuizQuestion } from "@/types";
import { parseExplanationForHotspot } from "@/utils/quiz-helpers";
import { QuizQuestionSchema } from "./schemas";
import { z } from "zod";

export interface QuizParser {
  canParse(data: unknown): boolean;
  parse(data: unknown): QuizQuestion[];
}

// --- Parsers ---

export const MongoDBParser: QuizParser = {
  canParse(data: unknown): boolean {
    return Array.isArray(data) && data.length > 0 && 'questions' in data[0] && Array.isArray(data[0].questions);
  },
  parse(data: unknown): QuizQuestion[] {
    const batches = data as { questions: any[] }[];
    return batches.flatMap((batch) => batch.questions).map(normalizeQuestion).filter(isValid);
  }
};

export const SalesforceParser: QuizParser = {
  canParse(data: unknown): boolean {
    if (typeof data !== 'object' || data === null) return false;
    const obj = data as any;
    return Array.isArray(obj.sections) || (Array.isArray(obj.questions) && !Array.isArray(obj)); // Object with questions array
  },
  parse(data: unknown): QuizQuestion[] {
    const obj = data as any;
    if (Array.isArray(obj.sections)) {
      return obj.sections.flatMap((section: any) => 
        Array.isArray(section.questions) 
          ? section.questions.map((q: any) => ({ ...q, section: section.sectionTitle })) 
          : []
      ).map(normalizeQuestion).filter(isValid);
    }
    if (Array.isArray(obj.questions)) {
       return obj.questions.map(normalizeQuestion).filter(isValid);
    }
    return [];
  }
};

export const GenericArrayParser: QuizParser = {
    canParse(data: unknown): boolean {
        return Array.isArray(data);
    },
    parse(data: unknown): QuizQuestion[] {
        return (data as any[]).map(normalizeQuestion).filter(isValid);
    }
}

// --- Helper Functions ---

function normalizeQuestion(q: any): QuizQuestion | null {
    if (!q || typeof q !== "object") return null;
    
    const newQ = { ...q };

    // Standardize ID
    if (!newQ.id && newQ.question) {
        // Generate robust ID if missing? For now rely on Zod or allow missing if schema allows (it requires id)
        // If ID is missing, we might drop it or generate one. Zod requires it.
        // Let's assume ID exists or we skip.
    }

    // Handle MongoDB format: correct_answers -> correctAnswer
    if (newQ.correct_answers && !newQ.correctAnswer) {
        newQ.correctAnswer = newQ.correct_answers;
    }

    // Handle Salesforce/MongoDB format: options as object { "A": "...", "B": "..." }
    if (newQ.options && typeof newQ.options === 'object' && !Array.isArray(newQ.options)) {
        const optionsObj = newQ.options as Record<string, string>;
        const sortedKeys = Object.keys(optionsObj).sort();
        newQ.options = sortedKeys.map(key => optionsObj[key]);
        
        // Map correctAnswer key to value
        if (newQ.correctAnswer) {
            if (typeof newQ.correctAnswer === 'string') {
                const key = newQ.correctAnswer as string;
                if (optionsObj[key]) newQ.answer = optionsObj[key];
            } else if (Array.isArray(newQ.correctAnswer)) {
                const keys = newQ.correctAnswer as string[];
                const mappedAnswers = keys.map(k => optionsObj[k]).filter(Boolean);
                if (mappedAnswers.length > 0) newQ.answer = mappedAnswers; 
            }
        }
    }

    // Parse Hotspot Logic
    const qType = String(newQ.type || "");
    // Default to mcq if type is missing but options exist
    if (!newQ.type && Array.isArray(newQ.options)) {
        newQ.type = "mcq";
    }

    if (
        (qType === "hotspot" || qType === "drag_drop" || qType === "mcq") &&
        (!newQ.answer || (typeof newQ.answer === "object" && Object.keys(newQ.answer as object).length === 0))
        ) {
        const explanation = typeof newQ.explanation === 'string' ? newQ.explanation : undefined;
        const parsed = parseExplanationForHotspot(explanation);
        if (parsed) {
            newQ.type = "hotspot";
            newQ.answer = parsed;
        }
    }
    
    return newQ as QuizQuestion;
}

function isValid(q: QuizQuestion | null): q is QuizQuestion {
    if (!q) return false;
    const result = QuizQuestionSchema.safeParse(q);
    if (!result.success) {
        // console.warn("Invalid quesiton:", result.error);
        return false;
    }
    return true;
}

export function detectAndParse(data: unknown): QuizQuestion[] {
    if (MongoDBParser.canParse(data)) return MongoDBParser.parse(data);
    if (SalesforceParser.canParse(data)) return SalesforceParser.parse(data);
    if (GenericArrayParser.canParse(data)) return GenericArrayParser.parse(data);
    
    // Fallback: try to find an array property
    if (typeof data === 'object' && data !== null) {
         const firstArray = Object.values(data as object).find(v => Array.isArray(v));
         if (firstArray) return GenericArrayParser.parse(firstArray);
    }
    
    return [];
}
