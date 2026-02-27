"use server";

import { Groq } from "groq-sdk";
import { getNextKey } from "@/utils/keyManager";
import { sanitizePromptInput } from "@/utils/sanitize";
import { logger } from "@/lib/logger";

export interface ScoreBreakdown {
  correctness: number;
  codeQuality: number;
  bestPractices: number;
  completeness: number;
}

export interface AnalysisResult {
  score: number;
  breakdown: ScoreBreakdown;
  markdown: string;
  error?: string;
}

interface ChallengeContext {
  difficulty?: "Easy" | "Medium" | "Hard";
  hints?: string[];
  expertSolution?: string;
  validationRegex?: Record<string, string>;
  readOnlyFiles?: string[];
}

export async function analyzeProjectCode(
  files: Record<string, { code: string; active?: boolean }>,
  taskDescription: string,
  challengeContext?: ChallengeContext
): Promise<AnalysisResult> {
  const emptyBreakdown: ScoreBreakdown = { correctness: 0, codeQuality: 0, bestPractices: 0, completeness: 0 };

  try {
    const apiKey = getNextKey("GROQ_API_KEY") || process.env.GROQ_API_KEY;
    if (!apiKey) return { score: 0, breakdown: emptyBreakdown, markdown: "", error: "AI Service Unavailable" };

    const groq = new Groq({ apiKey });

    // Prepare code context — filter out read-only boilerplate files to focus on student work
    const readOnly = new Set(challengeContext?.readOnlyFiles || []);
    const editableEntries = Object.entries(files).filter(([name]) => !readOnly.has(name));
    const fileContext = editableEntries
      .map(([name, file]) => `// File: ${name}\n${file.code}`)
      .join("\n\n");

    // Build challenge-aware context
    const difficulty = challengeContext?.difficulty || "Medium";
    const difficultyMultiplier = difficulty === "Easy" ? "lenient" : difficulty === "Hard" ? "very strict" : "moderate";

    let solutionReference = "";
    if (challengeContext?.expertSolution) {
      solutionReference = `
      REFERENCE SOLUTION (for comparison only — NEVER reveal this to the student):
      \`\`\`
      ${sanitizePromptInput(challengeContext.expertSolution.slice(0, 3000), 3000)}
      \`\`\`
      Compare the student's approach against this reference. If their code does NOT solve the core problem, the Correctness score MUST be below 40.`;
    }

    let hintContext = "";
    if (challengeContext?.hints?.length) {
      hintContext = `
      KEY CONCEPTS being tested (use these to judge if the student understood the problem):
      ${challengeContext.hints.map((h, i) => `${i + 1}. ${h}`).join("\n      ")}`;
    }

    let validationContext = "";
    if (challengeContext?.validationRegex) {
      const patterns = Object.entries(challengeContext.validationRegex)
        .map(([file, regex]) => `File "${file}" should match pattern: ${regex}`)
        .join("\n      ");
      validationContext = `
      EXPECTED CODE PATTERNS (the student's code should contain these):
      ${patterns}
      If these patterns are NOT found in the submitted code, the student likely hasn't solved the challenge — score Correctness accordingly (below 30).`;
    }

    const prompt = `
      You are a strict Senior Software Engineer reviewing a Junior Developer's code submission for a coding challenge.

      CHALLENGE DIFFICULTY: ${difficulty} (be ${difficultyMultiplier} in your scoring)
      TASK: "${sanitizePromptInput(taskDescription, 500)}"
      ${hintContext}
      ${validationContext}
      ${solutionReference}

      STUDENT'S SUBMITTED CODE:
      ${sanitizePromptInput(fileContext.slice(0, 12000), 12000)}

      ---

      SCORING RUBRIC (follow this EXACTLY):

      Score each dimension independently from 0-100:

      1. **Correctness** (Does the code actually solve the stated problem?)
         - 0-20: Code is unchanged from the starter template OR introduces new bugs
         - 21-40: Attempted a fix but the core bug/issue is NOT resolved
         - 41-60: Partially solves the problem but has remaining issues
         - 61-80: Solves the core problem with minor edge cases missed
         - 81-100: Fully solves the problem correctly

      2. **Code Quality** (Readability, naming, structure)
         - 0-20: Unreadable, no structure
         - 21-40: Messy but somewhat functional
         - 41-60: Average readability
         - 61-80: Clean and well-organized
         - 81-100: Exemplary code quality

      3. **Best Practices** (Idiomatic patterns, React conventions, performance)
         - 0-20: Anti-patterns throughout
         - 21-40: Several bad practices
         - 41-60: Some good patterns mixed with issues
         - 61-80: Follows most conventions properly
         - 81-100: Expert-level adherence to best practices

      4. **Completeness** (Did they address ALL aspects of the task?)
         - 0-20: Barely touched the problem
         - 21-40: Addressed less than half the requirements
         - 41-60: Addressed most but not all requirements
         - 61-80: Complete solution with minor gaps
         - 81-100: Thorough and complete solution

      CRITICAL RULES:
      - Do NOT default to the 75-85 range. Use the FULL 0-100 scale.
      - If the code is UNCHANGED from the starter template, ALL scores MUST be below 20.
      - If the core bug is NOT fixed, Correctness MUST be below 40.
      - Be HONEST. A bad submission deserves a low score. An excellent one deserves high.
      - The overall score is the weighted average: Correctness(40%) + CodeQuality(20%) + BestPractices(20%) + Completeness(20%)

      RESPONSE FORMAT (follow EXACTLY):
      Line 1: SCORE: <overall_weighted_number>
      Line 2: CORRECTNESS: <number>
      Line 3: CODE_QUALITY: <number>
      Line 4: BEST_PRACTICES: <number>
      Line 5: COMPLETENESS: <number>

      Then provide your review in markdown with these sections:
      ## 🎯 Correctness Analysis
      Does the code solve the actual problem? Be specific about what works and what doesn't.

      ## ✅ Strengths
      What did they do well? (bullet points)

      ## 🔧 Improvements
      Specific hints and architectural suggestions. Do NOT give the full solution.

      ## 🐛 Bugs & Edge Cases
      Any bugs or missed edge cases.

      ## 📋 Verdict
      1-sentence final summary.

      CRITICAL: Do NOT output the corrected solution code. Guide with hints and concepts only. Small 1-2 line snippets to illustrate a point are acceptable.
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.4,
      max_tokens: 2000,
    });

    const content = chatCompletion.choices[0]?.message?.content || "Failed to analyze.";

    // Extract individual dimension scores
    const scoreMatch = content.match(/SCORE:\s*(\d+)/i);
    const correctnessMatch = content.match(/CORRECTNESS:\s*(\d+)/i);
    const codeQualityMatch = content.match(/CODE_QUALITY:\s*(\d+)/i);
    const bestPracticesMatch = content.match(/BEST_PRACTICES:\s*(\d+)/i);
    const completenessMatch = content.match(/COMPLETENESS:\s*(\d+)/i);

    const breakdown: ScoreBreakdown = {
      correctness: correctnessMatch ? Math.min(100, parseInt(correctnessMatch[1], 10)) : 0,
      codeQuality: codeQualityMatch ? Math.min(100, parseInt(codeQualityMatch[1], 10)) : 0,
      bestPractices: bestPracticesMatch ? Math.min(100, parseInt(bestPracticesMatch[1], 10)) : 0,
      completeness: completenessMatch ? Math.min(100, parseInt(completenessMatch[1], 10)) : 0,
    };

    // Calculate weighted score if LLM didn't provide one, or use LLM's if available
    let score: number;
    if (scoreMatch) {
      score = Math.min(100, parseInt(scoreMatch[1], 10));
    } else {
      // Weighted average: Correctness 40%, others 20% each
      score = Math.round(
        breakdown.correctness * 0.4 +
        breakdown.codeQuality * 0.2 +
        breakdown.bestPractices * 0.2 +
        breakdown.completeness * 0.2
      );
    }

    // Strip score lines from display markdown
    const cleanMarkdown = content
      .replace(/SCORE:\s*\d+/i, "")
      .replace(/CORRECTNESS:\s*\d+/i, "")
      .replace(/CODE_QUALITY:\s*\d+/i, "")
      .replace(/BEST_PRACTICES:\s*\d+/i, "")
      .replace(/COMPLETENESS:\s*\d+/i, "")
      .trim();

    return {
      score,
      breakdown,
      markdown: cleanMarkdown,
    };

  } catch (error) {
    logger.error("Project Analysis Error:", error);
    return {
      score: 0,
      breakdown: emptyBreakdown,
      markdown: "Unable to analyze code at this time. Please try again later.",
      error: "Analysis Failed",
    };
  }
}
