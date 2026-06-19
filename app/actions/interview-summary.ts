"use server";

import { generateText, AI_MODELS } from "@/lib/ai/gateway";
import { sanitizePromptInput } from "@/utils/sanitize";
import { logger } from "@/lib/logger";

interface ClientAnalytics {
  wpm?: number;
  sentiment?: string;
  keyConcepts?: string[];
  confidenceScore?: number;
  fillerWordCount?: number;
  fillerWordsPerMinute?: number;
  answerDepth?: string;
  starMethodCount?: number;
  questionsCovered?: number;
  vocabularyRichness?: number;
  technicalAccuracy?: number;
  durationSeconds?: number;
}

export async function summarizeInterviewAction(
  history: { role: string; content: string }[],
  type: string,
  clientAnalytics?: ClientAnalytics,
) {
  const ALLOWED_TYPES = ["behavioral", "technical"];
  const safeType = ALLOWED_TYPES.includes(type) ? type : "Technical";

  // Build analytics context block for the LLM
  const analyticsBlock = clientAnalytics
    ? `
CLIENT-SIDE METRICS (use these to enrich your analysis):
- Speaking Pace: ${clientAnalytics.wpm ?? "N/A"} WPM
- Emotional Tone: ${clientAnalytics.sentiment ?? "N/A"}
- Answer Depth: ${clientAnalytics.answerDepth ?? "N/A"}
- Technical Concepts Mentioned: ${clientAnalytics.keyConcepts?.join(", ") || "none detected"}
- Filler Words: ${clientAnalytics.fillerWordCount ?? 0} total (${clientAnalytics.fillerWordsPerMinute ?? 0}/min)
- STAR Method Responses: ${clientAnalytics.starMethodCount ?? 0}
- Questions Addressed: ${clientAnalytics.questionsCovered ?? "N/A"}
- Vocabulary Richness: ${clientAnalytics.vocabularyRichness ?? "N/A"}%
- Client Confidence Score: ${clientAnalytics.confidenceScore ?? "N/A"}%
- Technical Signal Score: ${clientAnalytics.technicalAccuracy ?? "N/A"}%
- Session Duration: ${clientAnalytics.durationSeconds ? Math.round(clientAnalytics.durationSeconds / 60) + " minutes" : "N/A"}
`
    : "";

  const prompt = `
You are a Senior Technical Recruiter and Interview Coach with 15+ years of experience.
Analyze this ${sanitizePromptInput(safeType, 100)} interview transcript and provide actionable feedback.

TRANSCRIPT:
${sanitizePromptInput(history.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n'), 20000)}
${analyticsBlock}
TASK:
Provide a structured, specific feedback report. Reference actual answers from the transcript. Avoid generic advice.

1. **Technical Accuracy** (if applicable): Rate specific answers. Which were strong? Which had gaps or inaccuracies? Cite examples.
2. **Communication Quality**: Assess clarity, structure, and confidence. Did they use STAR method? Were answers too brief or too verbose? Comment on filler word usage if metrics show high count.
3. **Top 3 Strengths**: Be specific — reference actual moments from the conversation.
4. **Top 3 Improvement Areas**: Concrete, actionable advice tied to what they actually said.
5. **Answer-by-Answer Highlights**: Pick 2-3 notable answers (good or bad) and explain why.
6. **Overall Score**: X/100 with brief justification. Factor in the client-side metrics if provided.
7. **Verdict**: Strong Hire / Hire / Lean Hire / No Hire — with a one-sentence rationale.

FORMAT: Return well-structured markdown. Use bold for emphasis. Keep it concise but specific.
`;

  try {
    const result = await generateText(
      [{ role: "user", content: prompt }],
      "You are a Senior Technical Recruiter and Interview Coach.",
      "auto",
      {
        model: AI_MODELS.DEFAULT,
        temperature: 0.7,
        maxTokens: 3000,
      }
    );

    return { markdown: result.content || "Failed to generate summary." };
  } catch (error) {
    logger.error("Summary Error (Gateway):", error);
    return { markdown: "I couldn't generate a detailed summary right now. Review your session metrics above for performance insights, and try again later for the full AI analysis." };
  }
}
