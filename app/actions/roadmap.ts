"use server";

import { generateText, AI_MODELS } from "@/lib/ai/gateway";
import { sanitizePromptInput } from "@/utils/sanitize";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

export async function generateRoadmapAction(goal: string, experience: string): Promise<{ markdown: string, error?: string }> {
   try {
      const { success: withinLimit, message: limitMsg } = await rateLimit("default");
      if (!withinLimit) {
         return { markdown: "", error: limitMsg || "Rate limit exceeded. Please wait." };
      }

      const prompt = `
        The user wants to achieve this goal: "${sanitizePromptInput(goal, 500)}"
        Current experience level: "${sanitizePromptInput(experience, 200)}"

        TASK:
        Create a detailed, step-by-step certification and learning roadmap.
        Include:
        1. Foundational certifications (e.g., AWS Cloud Practitioner).
        2. Core technical skills to learn (e.g., Docker, Terraform).
        3. Professional-level certifications.
        4. Estimated timelines for each stage.
        5. Practical project ideas.

        FORMAT: Return a markdown string with clear headings, bullet points, and a professional tone. Use bold text for certification names.
     `;

      const result = await generateText(
         prompt,
         "You are an expert technical career coach.",
         "auto",
         {
            model: AI_MODELS.DEFAULT,
            temperature: 0.7,
            maxTokens: 2048,
         }
      );

      return { markdown: result.content || "Failed to generate roadmap." };
   } catch (error) {
      logger.error("Roadmap Error (Gateway):", error);
      return { markdown: "", error: "I encountered an error while mapping your path. Please try again with a more specific goal!" };
   }
}
