import { QuizQuestion } from "@/types";
import { parseExplanationForHotspot } from "@/utils/quiz-helpers";
import { QuizQuestionSchema } from "./schemas";
import { z } from "zod";

export interface QuizParser {
  canParse(data: unknown): boolean;
  parse(data: unknown): QuizQuestion[];
}

// Raw data shapes from external sources (before normalization)
interface RawQuestion {
  id?: number | string;
  type?: string;
  question?: string;
  options?: string[] | Record<string, string>;
  answer?: string | string[] | Record<string, string>;
  answer_mapping?: Record<string, string>;
  explanation?: string;
  code?: string;
  image?: string;
  section?: string;
  domain?: string;
  difficulty?: string;
  batchId?: string;
  correctAnswer?: string | string[];
  correct_answers?: string | string[];
  statements?: { text: string; answer: string }[];
  rows?: string[];
  hotspot_options?: string[];
  boxes?: { label: string; options: string[]; answer: string }[];
  drop_zones?: string[];
  scenario?: string;
}

// --- Parsers ---

export const MongoDBParser: QuizParser = {
  canParse(data: unknown): boolean {
    return Array.isArray(data) && data.length > 0 && 'questions' in data[0] && Array.isArray(data[0].questions);
  },
  parse(data: unknown): QuizQuestion[] {
    const batches = data as { questions: RawQuestion[] }[];
    return batches.flatMap((batch) => batch.questions).map(normalizeQuestion).filter(isValid);
  }
};

export const SalesforceParser: QuizParser = {
  canParse(data: unknown): boolean {
    if (typeof data !== 'object' || data === null) return false;
    const obj = data as Record<string, unknown>;
    return Array.isArray(obj.sections) || (Array.isArray(obj.questions) && !Array.isArray(obj));
  },
  parse(data: unknown): QuizQuestion[] {
    const obj = data as { sections?: { sectionTitle?: string; questions?: RawQuestion[] }[]; questions?: RawQuestion[] };
    if (Array.isArray(obj.sections)) {
      return obj.sections.flatMap((section) => 
        Array.isArray(section.questions) 
          ? section.questions.map((q) => ({ ...q, section: section.sectionTitle })) 
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
        const arr = data as RawQuestion[];
        // Check if it's a nested array (batches)
        if (arr.length > 0 && Array.isArray(arr[0])) {
            return (arr as unknown as RawQuestion[][]).flat().map(normalizeQuestion).filter(isValid);
        }
        return arr.map(normalizeQuestion).filter(isValid);
    }
}

// --- Helper Functions ---

function normalizeQuestion(q: RawQuestion): QuizQuestion | null {
    if (!q || typeof q !== "object") return null;
    
    const newQ: Record<string, unknown> = { ...q };

    // Standardize ID
    if (!newQ.id && newQ.question) {
        // ...
    }

    // Extract code block from question if it exists and q.code is missing
    if (!newQ.code && typeof newQ.question === 'string') {
        const qText = newQ.question;
        
        // Match Markdown code blocks
        const markdownMatch = qText.match(/```(?:\w+)?\n([\s\S]*?)```/);
        if (markdownMatch) {
            newQ.code = markdownMatch[1].trim();
            newQ.question = qText.replace(/```(?:\w+)?\n[\s\S]*?```/, "\n\n").trim();
        } else {
            // Heuristic for "Given:\n...code...\nQuestion"
            const patterns = [
                // Shape + Query + Rest
                /Given a sample collection called [^,]+, in which all documents have the following shape:\s*({[\s\S]*?})\.\s*And the following query:\s*(db\.[\s\S]*?)\.\s*(Which[\s\S]*)/i,
                // Documents + Rest
                /Given the following documents in a collection:\s*({[\s\S]*?})\.\s*(Which[\s\S]*)/i,
                // Collection + Documents + Query + Rest
                /(?:collection named \w+ contains the following documents and query|following aggregation query):?\s*(db\.[\s\S]*?)\.\s*(What[\s\S]*)/i,
                // Generic "Given the following query: db.xxx(...)" inline
                /(?:Given the following query|the following query):?\s*(db\.\S+\([\s\S]*?\))\.\s*((?:No|What|Which|The|How|If)[\s\S]*)/i,
                // Generic Given...Code...Question
                /Given:?\n([\s\S]*?)(\n(?:What|Which|And|Assume|If|The|A)\s+.*)/i,
                /Given the following code fragment:?\n([\s\S]*?)(\n(?:What|Which|And|Assume|If|The|A)\s+.*)/i,
                /fragment:?\n([\s\S]*?)(\n(?:What|Which|And|Assume|If)\s+.*)/i
            ];

            for (const pattern of patterns) {
                const match = qText.match(pattern);
                if (match) {
                    if (match.length === 4) {
                        // Special case: Shape + Query + Rest
                        newQ.code = `${match[1]}\n\n${match[2]}`;
                        newQ.question = match[3].trim();
                        break;
                    } else if (match[1].trim().length > 10) {
                        newQ.code = match[1].trim();
                        newQ.question = qText.replace(match[1], "\n\n").trim();
                        break;
                    }
                }
            }

            // Universal fallback: extract ALL db.xxx.xxx(...) inline queries
            if (!newQ.code && typeof newQ.question === 'string') {
                const qStr = newQ.question as string;
                // Match all db.collection.method(...) patterns, including chained calls
                const allDbMatches: string[] = [];
                const dbRegex = /db\.\w+\.\w+\([^)]*(?:\([^)]*\))*[^)]*\)(?:\.\w+\([^)]*\))*/g;
                let m: RegExpExecArray | null;
                while ((m = dbRegex.exec(qStr)) !== null) {
                    if (m[0].length > 12) allDbMatches.push(m[0]);
                }
                if (allDbMatches.length > 0) {
                    newQ.code = allDbMatches.join('\n\n');
                    let cleaned = qStr;
                    for (const dbMatch of allDbMatches) {
                        cleaned = cleaned.replace(dbMatch, '');
                    }
                    newQ.question = cleaned.replace(/\s{2,}/g, ' ').trim();
                }
            }
        }
    }

    // Consolidate answer fields
    const rawAnswer = q.answer || q.correctAnswer || q.correct_answers;
    
    // Handle Salesforce/MongoDB format: options as object { "A": "...", "B": "..." }
    if (newQ.options && typeof newQ.options === 'object' && !Array.isArray(newQ.options)) {
        const optionsObj = newQ.options as Record<string, string>;
        const sortedKeys = Object.keys(optionsObj).sort();
        newQ.options = sortedKeys.map(key => optionsObj[key]);
        
        // Map correctAnswer key to value
        if (rawAnswer) {
            if (typeof rawAnswer === 'string') {
                if (optionsObj[rawAnswer]) newQ.answer = optionsObj[rawAnswer];
            } else if (Array.isArray(rawAnswer)) {
                const mapped = rawAnswer.map(k => optionsObj[k]).filter(Boolean);
                if (mapped.length > 0) newQ.answer = mapped;
            }
        }
    } else if (Array.isArray(newQ.options) && rawAnswer) {
        // Handle Array options with letter-based answers (Common in Azure/Oracle)
        const optionsArr = newQ.options as string[];
        const mapLetterToValue = (val: string) => {
            if (typeof val === 'string' && val.length === 1 && /[A-Z]/i.test(val)) {
                const index = val.toUpperCase().charCodeAt(0) - 65;
                return optionsArr[index] || val;
            }
            return val;
        };

        if (typeof rawAnswer === 'string') {
            newQ.answer = mapLetterToValue(rawAnswer);
        } else if (Array.isArray(rawAnswer)) {
            newQ.answer = (rawAnswer as string[]).map(mapLetterToValue);
        }
    } else {
        newQ.answer = rawAnswer;
    }

    // Parse Hotspot Logic
    const qType = String(newQ.type || "").toLowerCase();
    
    // Default to mcq if type is missing but options exist
    if (!newQ.type && Array.isArray(newQ.options)) {
        newQ.type = "mcq";
    }

    // Detect MSQ if answer is multiple
    if (Array.isArray(newQ.answer) && (newQ.answer as any[]).length > 1) {
        newQ.type = "MSQ";
    } else if (qType === 'multiple' || qType === 'msq') {
        newQ.type = "MSQ";
    }

    if (
        (newQ.type === "hotspot" || newQ.type === "drag_drop" || newQ.type === "mcq") &&
        (!newQ.answer || (typeof newQ.answer === "object" && Object.keys(newQ.answer as object).length === 0))
        ) {
        const explanation = typeof newQ.explanation === 'string' ? newQ.explanation : undefined;
        const parsed = parseExplanationForHotspot(explanation);
        if (parsed) {
            newQ.type = "hotspot";
            newQ.answer = parsed;
        }
    }
    
    return newQ as unknown as QuizQuestion;
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
