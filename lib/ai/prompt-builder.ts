/**
 * Centralized prompt builder for AI quiz generation.
 *
 * All quiz/flashcard prompts live here so that providers share a single
 * source of truth.  Each provider can still pass its own `contentLimit`
 * when calling `buildUserPrompt`.
 */

// ── System Prompts ──────────────────────────────────────────────────────

const QUIZ_SYSTEM_PROMPT = "You are a helpful assistant that outputs JSON.";

// ── User Prompts ────────────────────────────────────────────────────────

function buildFlashcardPrompt(content: string, count: number): string {
   return `
You are an elite Study Assistant.

TASK:
Create high-quality FLASHCARDS from the provided text.

CRITICAL RULES:
1. FORMAT (Strict JSON):
   - Return a JSON Array.
   - Schema: [{"question": "Front of Card", "options": ["Back of Card"], "answer": "Back of Card", "explanation": "Context"}]
   - NOTE: The "options" array must contain EXACTLY ONE string (the answer/back of card).
   - "answer" must match that single option string.

2. CONTENT QUALITY:
   - FRONT (question): Must be a clear Term, Concept, or Question. (e.g. "Mitochondria function", "What is Isomorphism?")
   - BACK (answer): Concise definition or answer (1-2 sentences max).
   - SELF-CONTAINED: Do not use "According to the text". The card must make sense in isolation.

3. QUANTITY:
   - Generate AT LEAST ${Math.max(count, 15)} cards.

TEXT CONTENT:
${content}
`.trim();
}

function buildQuizPrompt(content: string, count: number, difficulty: string): string {
   const difficultyGuidance =
      difficulty === "hard"
         ? "Focus on complex scenarios, edge cases, and multi-step reasoning."
         : "Focus on conceptual understanding and application.";

   return `
You are an elite AI Quiz Architect.

TASK:
Generate a high-quality, professional-grade multiple-choice quiz from the provided text.

CRITICAL INSTRUCTIONS:
1. QUANTITY & QUALITY:
   - Generate AT LEAST ${Math.max(count, 15)} questions.
   - DIFFICULTY: ${difficulty.toUpperCase()}.
   - QUESTIONS MUST BE SELF-CONTAINED. Do not ask "According to the text..." or "What does the author say...". The question should stand alone as a test of knowledge.
   - EASY: Definitions and basic facts.
   - MEDIUM: Application and relationships.
   - HARD: Synthesis and complex scenarios.
   - ${difficultyGuidance}

2. OPTION QUALITY:
   - Exactly 4 options per question.
   - Distractors must be PLAUSIBLE but clearly INCORRECT.
   - Avoid "All of the above" unless absolutely appropriate.
   - CONSTRAINTS: For visual puzzles (like "mirror image", "water image"), DO NOT use Cyrillic or Unicode characters. Instead, wrap the ORIGINAL unreflected string in tags: '[MIRROR]...[/MIRROR]' or '[WATER]...[/WATER]' (e.g. '[MIRROR]15bg82XQh[/MIRROR]'). The UI will render the visual reflection via CSS. For completely non-textual spatial puzzles (e.g., "embedded figure", "paper folding"), IGNORE and skip them.

3. EXPLANATIONS:
   - Explain WHY the correct answer is right.
   - Briefly explain why the distractors are incorrect.

4. JSON FORMATTING:
   - Return ONLY a raw JSON array.
   - Structure: [{"question": "What is the capital of France?", "options": ["Paris", "London", "Berlin", "Madrid"], "answer": "Paris", "explanation": "Paris is the capital of France."}]
   - "answer" MUST match the exact text of one option. NEVER output just the option letter (e.g., "A").

TEXT CONTENT:
${content}
`.trim();
}

// ── Vision Prompts (PDF with images / scanned docs) ─────────────────────

function buildVisionFlashcardPrompt(count: number): string {
   return `
You are an elite Study Assistant.
Analyze the provided PDF document.

TASK:
Extract key concepts, definitions, and visual facts to create high-quality FLASHCARDS.

CRITICAL INSTRUCTIONS:
1. QUANTITY: Generate AT LEAST ${Math.max(count, 15)} flashcards.
2. FORMAT:
   - Return a JSON array.
   - Structure: [{"question": "Concept", "options": ["Definition"], "answer": "Definition", "explanation": "Context"}]
   - 'question' is the Front. 'answer' is the Back.
3. QUALITY:
   - Front: Clear term/concept/diagram query.
   - Back: Concise, accurate definition/answer.
`.trim();
}

function buildVisionQuizPrompt(count: number, difficulty: string): string {
   return `
You are an elite AI Quiz Architect.
Analyze the provided PDF document (which may contain text, images, handwritten notes, or diagrams).

CORE OBJECTIVE:
EXTRACT and GENERATE high-quality, professional-grade multiple-choice questions (MCQs) that accurately reflect the document's content.

CRITICAL INSTRUCTIONS:
1. QUESTION DIVERSITY & DEPTH:
   - Target: ${Math.max(count, 15)} questions.
   - DIFFICULTY: ${difficulty.toUpperCase()}.
   - EASY: Focus on terminology and basic concepts.
   - MEDIUM: Focus on application, relationships between concepts, and analysis.
   - HARD: Focus on synthesis, edge cases, complex diagrams, and multi-step reasoning.
   - Use a mix of:
     * Direct identification from text/images.
     * Concept synthesis across pages.
     * Scenario-based problem solving.

2. OPTION QUALITY:
   - Provide exactly 4 options per question.
   - Distractors (wrong answers) MUST be plausible and related to the content, not obviously silly.
   - Avoid "All of the above" or "None of the above" unless absolutely necessary.
   - CONSTRAINTS: For visual puzzles (like "mirror image", "water image"), DO NOT use Cyrillic or Unicode characters. Instead, wrap the ORIGINAL unreflected string in tags: '[MIRROR]...[/MIRROR]' or '[WATER]...[/WATER]' (e.g. '[MIRROR]15bg82XQh[/MIRROR]'). The UI will render the visual reflection via CSS. For completely non-textual spatial puzzles (e.g., "embedded figure", "paper folding"), IGNORE and skip them.

3. EXPLANATIONS:
   - Provide a comprehensive explanation for EACH question.
   - Explain WHY the correct answer is right and why major distractors are wrong.

4. TECHNICAL SPECIFICATIONS:
   - Return ONLY a raw JSON array.
   - NO markdown formatting (no \`\`\`json blocks).
   - STRUCTURE: [{"question": "What is the capital of France?", "options": ["Paris", "London", "Berlin", "Madrid"], "answer": "Paris", "explanation": "Paris is the capital of France."}]
   - ACCURACY: The "answer" field MUST be a CHARACTER-FOR-CHARACTER match with one of the strings in the "options" array. NEVER output just the option letter (e.g., "A").
`.trim();
}

// ── Public API ──────────────────────────────────────────────────────────

export class PromptBuilder {
   /** System prompt shared by all providers. */
   static getSystemPrompt(): string {
      return QUIZ_SYSTEM_PROMPT;
   }

   /**
    * Build the user prompt for text-based quiz / flashcard generation.
    *
    * @param content  - Sanitised user content (already trimmed / sampled)
    * @param count    - Target number of questions / cards
    * @param difficulty - "easy" | "medium" | "hard"
    * @param mode     - "quiz" | "flashcard"
    */
   static buildUserPrompt(
      content: string,
      count: number,
      difficulty: string,
      mode: "quiz" | "flashcard"
   ): string {
      return mode === "flashcard"
         ? buildFlashcardPrompt(content, count)
         : buildQuizPrompt(content, count, difficulty);
   }

   /**
    * Build the user prompt for vision-based (scanned PDF) generation.
    *
    * @param count      - Target number of questions / cards
    * @param difficulty - "easy" | "medium" | "hard"
    * @param mode       - "quiz" | "flashcard"
    */
   static buildVisionPrompt(
      count: number,
      difficulty: string,
      mode: "quiz" | "flashcard"
   ): string {
      return mode === "flashcard"
         ? buildVisionFlashcardPrompt(count)
         : buildVisionQuizPrompt(count, difficulty);
   }
}
