"use server";

import { Groq } from "groq-sdk";
import { getNextKey } from "@/utils/keyManager";
import { Node, Connection } from "../(main)/system-design/types";
import { sanitizePromptInput } from "@/utils/sanitize";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";
import { SystemDesignService, SystemDesign } from "@/lib/services/system-design-service";

export async function saveSystemDesignAction(design: Partial<SystemDesign>) {
  try {
    const { data, error } = await SystemDesignService.saveDesign(design);
    if (error) throw error;
    return { data: data as SystemDesign };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to save design";
    logger.error("Save System Design Error:", msg);
    return { error: msg };
  }
}

export async function getSystemDesignsAction() {
  try {
    const { data, error } = await SystemDesignService.getDesigns();
    if (error) throw error;
    return { data: data as SystemDesign[] };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch designs";
    logger.error("Get System Designs Error:", msg);
    return { error: msg };
  }
}

export async function deleteSystemDesignAction(id: string) {
  try {
    const { error } = await SystemDesignService.deleteDesign(id);
    if (error) throw error;
    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to delete design";
    logger.error("Delete System Design Error:", msg);
    return { error: msg };
  }
}

export async function reviewSystemDesignAction(
  components: Node[],
  connections: Connection[],
  challengeContext?: { title: string; objectives: string[]; constraints: string[] }
): Promise<{
  markdown: string;
  score?: { overall: number; reliability: number; scalability: number; security: number; seniority: string };
  error?: string
}> {
  try {
    const { success: withinLimit, message: limitMsg } = await rateLimit("default");
    if (!withinLimit) {
      return { markdown: "", error: limitMsg || "Rate limit exceeded. Please wait." };
    }

    const apiKey = getNextKey("GROQ_API_KEY") || process.env.GROQ_API_KEY;
    if (!apiKey) return { markdown: "", error: "Groq API Service configuration missing." };

    const groq = new Groq({ apiKey });

    const challengeInfo = challengeContext ? `
      CONTEXT: Active Challenge: ${challengeContext.title}
      OBJECTIVES: ${challengeContext.objectives.join(", ")}
      CONSTRAINTS: ${challengeContext.constraints.join(", ")}
      Please evaluate the design specifically against these objectives and constraints.
    ` : "";

    const prompt = `
      You are a Senior System Design Interviewer. 
      Analyze the following architecture and provide a professional critique.
      ${challengeInfo}
      
      COMPONENTS:
      ${sanitizePromptInput(JSON.stringify(components, null, 2), 10000)}
      
      CONNECTIONS:
      ${sanitizePromptInput(JSON.stringify(connections, null, 2), 10000)}
      
      TASK:
      1. Provide a "High-Level Evaluation" (is it scalable, resilient, etc?).
      2. Identify "Single Points of Failure".
      3. Suggest "Scalability Improvements" (Caching, Sharding, CDNs).
      4. Security check.
      5. Provide a "Seniority Rating" (Junior, Mid, Senior, Staff).
      6. Score: At the very end of your response, output a structured JSON score block wrapped in HTML comments exactly like this:
         <!-- SCORE:{"overall":85,"reliability":70,"scalability":80,"security":90,"seniority":"Senior"} -->

      FORMAT: Return the response in clean Markdown with clear headings and emojis.
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 2048,
    });

    const content = chatCompletion.choices[0]?.message?.content || "Failed to generate review.";

    // Parse score from markdown comment
    let score;
    const scoreRegex = /<!-- SCORE:({.*?}) -->/;
    const match = content.match(scoreRegex);
    if (match && match[1]) {
      try {
        score = JSON.parse(match[1]);
      } catch (e) {
        logger.error("Failed to parse AI score:", e);
      }
    }

    return {
      markdown: content.replace(scoreRegex, ""), // Remove the hidden score block from markdown
      score
    };

  } catch (error: unknown) {
    logger.error("System Design Review Error (Groq):", error);
    const msg = error instanceof Error ? error.message : "Failed to review system design.";
    return { markdown: "", error: msg };
  }
}
