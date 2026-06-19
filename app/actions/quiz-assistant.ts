"use server";

import { generateText, AI_MODELS } from "@/lib/ai/gateway";
import { sanitizePromptInput } from "@/utils/sanitize";
import { logger } from "@/lib/logger";

interface BobResponse {
  success: boolean;
  message: string;
}

export async function askBob(context: string, question: string): Promise<BobResponse> {
  try {
    const userPrompt = `Context (Question/Code/Options): 
${sanitizePromptInput(context, 5000)}

User Question: ${sanitizePromptInput(question, 2000)}`;

    const systemPrompt = `You are Bob, a helpful AI bilingual assistant.
Your goal is to help students understand quiz questions for their exams.
When answering:
- EXPLAIN LIKE I'M 5. Use simple, clear language that anyone can understand.
- Do NOT use metaphors or a specific persona like a "lion". Just be a helpful tutor.
- Always explain the correct answer clearly.
- If the user asks for an explanation, break it down simply.
- The user is practicing for a certification exam so ensure technical accuracy but keep it simple.`;

    const result = await generateText(
      userPrompt,
      systemPrompt,
      "auto",
      { model: AI_MODELS.DEFAULT, temperature: 0.5, maxTokens: 500 }
    );
    const content = result.content;
    if (!content) {
      throw new Error("Empty response from AI Gateway");
    }

    return { success: true, message: content };

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error("askBob failed:", message);
    return { success: false, message: "Something went wrong. Please try again later." };
  }
}
