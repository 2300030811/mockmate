/**
 * Centralized prompt builder for AI quiz generation.
 *
 * Optimised for Groq-hosted open-source models (Llama 3, Mixtral).
 * Key strategies:
 *  - Use Groq's `response_format: { type: "json_object" }` at the API call
 *    level for hard JSON enforcement. json_object mode requires the root to be
 *    an object, so all output is wrapped as { "concepts": [...], "questions": [...] }.
 *  - Concept-first prompting: Step 1 extracts concepts INTO the JSON "concepts"
 *    array, Step 2 generates one question per concept. Embedding Step 1 inside
 *    the JSON makes it work on all model sizes including llama-3.1-8b-instant —
 *    the model has a concrete JSON target to hit rather than free-form reasoning.
 *    Strip "concepts" before sending to the frontend; it only guides generation.
 *  - Concrete filled example over abstract schema — OSS models follow examples
 *    far more reliably than placeholder templates.
 *  - Flat, short instruction lists — deep nesting loses Llama/Mixtral attention.
 *  - "Generate exactly N" + "Do not stop early" — OSS models treat "at least"
 *    as a soft suggestion and frequently stop at 8-12.
 *  - "type" field included in examples so sanitizeQuizQuestions never has to
 *    fall back to the default — consistent with quiz-cleanup.ts expectations.
 *  - Fallback { "concepts": [], "questions": [] } so parsing never throws.
 *
 * Parsing on the frontend:
 *   const { questions } = JSON.parse(raw);       // drop "concepts"
 *   const clean = sanitizeQuizQuestions(questions); // from quiz-cleanup.ts
 */

// ── Types ───────────────────────────────────────────────────────────────

export type Difficulty = "easy" | "medium" | "hard";
export type Mode = "quiz" | "flashcard";

// ── Constants ───────────────────────────────────────────────────────────

/**
 * Use alongside `response_format: { type: "json_object" }` in the Groq API
 * call. The system prompt must mention "JSON" for json_object mode to activate.
 * json_object mode requires a root object (not array), so all output is
 * wrapped as { "concepts": [...], "questions": [...] }.
 */
export const QUIZ_SYSTEM_PROMPT =
   "You are a quiz generation assistant. " +
   "Always respond with a valid JSON object and nothing else.";

/**
 * Minimum number of questions/cards to generate.
 * Change here to affect all builders.
 */
const MIN_QUESTION_COUNT = 15;

// ── Difficulty Guidance ─────────────────────────────────────────────────

const DIFFICULTY_GUIDANCE: Record<Difficulty, string> = {
   easy: "Direct recall only — definitions, named facts, single-step identification.",
   medium: "Application and comparison — cause-and-effect, relationships, use-case selection.",
   hard: "Multi-step reasoning and edge cases — synthesis, exceptions, scenario analysis.",
};

// ── Shared Fragments ────────────────────────────────────────────────────

/**
 * Visual puzzle constraint shared by all quiz builders.
 * Defined once so text-quiz and vision-quiz always stay in sync.
 */
const VISUAL_PUZZLE_CONSTRAINT =
   'For mirror/water-image questions: wrap the original string in [MIRROR]...[/MIRROR] or ' +
   '[WATER]...[/WATER] tags (e.g. [MIRROR]15bg82XQh[/MIRROR]). ' +
   'Do not use Cyrillic or Unicode reflections. ' +
   'Skip non-textual spatial puzzles (embedded figures, paper folding) entirely.';

// ── Concrete Output Examples ────────────────────────────────────────────
//
// "concepts" array is Step 1 output embedded inside the JSON — guides the
// model to spread coverage before generating questions. Strip it on the
// frontend; only "questions" is needed by the UI.
//
// "type" field is included explicitly so sanitizeQuizQuestions (quiz-cleanup.ts)
// never falls back to its default — keeps behaviour predictable across all paths.

const QUIZ_EXAMPLE = `{
  "concepts": [
    "Mitochondria function",
    "ATP production process"
  ],
  "questions": [
    {
      "concept": "Mitochondria function",
      "type": "mcq",
      "question": "Which organelle produces ATP through cellular respiration?",
      "options": ["Mitochondria", "Ribosome", "Golgi apparatus", "Lysosome"],
      "answer": "Mitochondria",
      "explanation": "Mitochondria generate ATP via oxidative phosphorylation. Ribosomes synthesise proteins, Golgi packages them, and lysosomes handle waste digestion."
    }
  ]
}`;

const FLASHCARD_EXAMPLE = `{
  "concepts": [
    "Mitochondria",
    "ATP"
  ],
  "questions": [
    {
      "concept": "Mitochondria",
      "type": "flashcard",
      "question": "Mitochondria",
      "options": ["Organelle that generates ATP through cellular respiration"],
      "answer": "Organelle that generates ATP through cellular respiration",
      "explanation": "Often called the powerhouse of the cell; produces energy via oxidative phosphorylation."
    }
  ]
}`;

// ── Internal Helpers ────────────────────────────────────────────────────

function resolveCount(count: number): number {
   return Math.max(count, MIN_QUESTION_COUNT);
}

// ── Text Prompts ────────────────────────────────────────────────────────

function buildFlashcardPrompt(content: string, count: number, difficulty: Difficulty): string {
   const target = resolveCount(count);
   const guidance = DIFFICULTY_GUIDANCE[difficulty];

   return `Generate exactly ${target} flashcards from the text below.
Difficulty: ${difficulty.toUpperCase()} — ${guidance}

Step 1 — Fill the "concepts" array:
List exactly ${target} distinct key concepts, terms, or ideas from the text.
Draw from the full text — do not cluster on the opening paragraphs.
Each concept must be unique. Do not repeat or rephrase the same idea.

Step 2 — Fill the "questions" array:
Create one flashcard per concept from Step 1.
Each item's "concept" field must match an entry from the "concepts" array.

Rules:
- Each card must be self-contained. Never write "According to the text".
- "type" must be exactly "flashcard" for every item.
- Front (question): the concept name or a clear question about it.
- Back (answer): a concise definition or answer (1-2 sentences).
- The "options" array contains exactly one string that matches "answer" exactly.
  This keeps the shape consistent with quiz mode.
- Do not stop early. Output all ${target} cards before finishing.
- If the content is insufficient, return { "concepts": [], "questions": [] }.

Output format — follow this example exactly:
${FLASHCARD_EXAMPLE}

TEXT:
${content}`;
}

function buildQuizPrompt(content: string, count: number, difficulty: Difficulty): string {
   const target = resolveCount(count);
   const guidance = DIFFICULTY_GUIDANCE[difficulty];

   return `Generate exactly ${target} multiple-choice questions from the text below.
Difficulty: ${difficulty.toUpperCase()} — ${guidance}

Step 1 — Fill the "concepts" array:
List exactly ${target} distinct key concepts, facts, or ideas from the text.
Draw from the full text — do not cluster on the opening paragraphs.
Each concept must be unique. Do not repeat or rephrase the same idea.

Step 2 — Fill the "questions" array:
Create one question per concept from Step 1.
Each item's "concept" field must match an entry from the "concepts" array.

Rules:
- Questions must be self-contained. Never write "According to the text" or "The author says".
- "type" must be exactly "mcq" for every item.
- Provide exactly 4 options per question.
- Distractors must be plausible but clearly wrong. Avoid "All of the above".
- "answer" must be a character-for-character match with one of the option strings.
- ${VISUAL_PUZZLE_CONSTRAINT}
- Explanation: state why the correct answer is right and why each distractor is wrong.
- Do not stop early. Output all ${target} questions before finishing.
- If the content is insufficient, return { "concepts": [], "questions": [] }.

Output format — follow this example exactly:
${QUIZ_EXAMPLE}

TEXT:
${content}`;
}

// ── Vision Prompts (scanned PDFs / image-heavy docs) ───────────────────

function buildVisionFlashcardPrompt(count: number, difficulty: Difficulty): string {
   const target = resolveCount(count);
   const guidance = DIFFICULTY_GUIDANCE[difficulty];

   return `Analyze the provided PDF. Generate exactly ${target} flashcards from its content.
Difficulty: ${difficulty.toUpperCase()} — ${guidance}

Step 1 — Fill the "concepts" array:
List exactly ${target} distinct key concepts, terms, or ideas from the document.
Draw from all sections and pages — do not cluster on the opening content.
Each concept must be unique. Do not repeat or rephrase the same idea.

Step 2 — Fill the "questions" array:
Create one flashcard per concept from Step 1.
Each item's "concept" field must match an entry from the "concepts" array.

Rules:
- Front (question): the concept name or a clear question about it.
- Back (answer): a concise definition or answer (1-2 sentences).
- "type" must be exactly "flashcard" for every item.
- The "options" array contains exactly one string that matches "answer" exactly.
- Do not stop early. Output all ${target} cards before finishing.
- If the content is insufficient, return { "concepts": [], "questions": [] }.

Output format — follow this example exactly:
${FLASHCARD_EXAMPLE}`;
}

function buildVisionQuizPrompt(count: number, difficulty: Difficulty): string {
   const target = resolveCount(count);
   const guidance = DIFFICULTY_GUIDANCE[difficulty];

   return `Analyze the provided PDF (may contain text, images, diagrams, or handwriting).
Generate exactly ${target} multiple-choice questions from its content.
Difficulty: ${difficulty.toUpperCase()} — ${guidance}

Step 1 — Fill the "concepts" array:
List exactly ${target} distinct key concepts, facts, or ideas from the document.
Draw from all sections and pages — do not cluster on the opening content.
Include concepts from text, diagrams, images, and cross-page synthesis.
Each concept must be unique. Do not repeat or rephrase the same idea.

Step 2 — Fill the "questions" array:
Create one question per concept from Step 1.
Each item's "concept" field must match an entry from the "concepts" array.

Rules:
- "type" must be exactly "mcq" for every item.
- Provide exactly 4 options per question.
- Distractors must be plausible and content-relevant. Avoid "All/None of the above".
- "answer" must be a character-for-character match with one of the option strings.
- ${VISUAL_PUZZLE_CONSTRAINT}
- Explanation: state why the correct answer is right and why each distractor is wrong.
- Do not stop early. Output all ${target} questions before finishing.
- If the content is insufficient, return { "concepts": [], "questions": [] }.

Output format — follow this example exactly:
${QUIZ_EXAMPLE}`;
}

// ── Public API ──────────────────────────────────────────────────────────

export class PromptBuilder {
   /**
    * System prompt for the API call.
    * Paired with \`response_format: { type: "json_object" }\`
    */
   static getSystemPrompt(): string {
      return QUIZ_SYSTEM_PROMPT;
   }

   /**
    * User prompt for text-based quiz / flashcard generation.
    */
   static buildUserPrompt(
      content: string,
      count: number,
      difficulty: string,
      mode: "quiz" | "flashcard"
   ): string {
      // Cast the string difficulty to our strongly typed Difficulty type
      const typedDifficulty = (difficulty as Difficulty) || "medium";
      return mode === "flashcard"
         ? buildFlashcardPrompt(content, count, typedDifficulty)
         : buildQuizPrompt(content, count, typedDifficulty);
   }

   /**
    * User prompt for vision-based (scanned PDF) generation.
    */
   static buildVisionPrompt(
      count: number,
      difficulty: string,
      mode: "quiz" | "flashcard"
   ): string {
      const typedDifficulty = (difficulty as Difficulty) || "medium";
      return mode === "flashcard"
         ? buildVisionFlashcardPrompt(count, typedDifficulty)
         : buildVisionQuizPrompt(count, typedDifficulty);
   }
}
