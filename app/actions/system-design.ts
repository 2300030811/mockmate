"use server";

import { Groq } from "groq-sdk";
import { getNextKey } from "@/utils/keyManager";
import { Node, Connection } from "../(main)/system-design/types";
import { sanitizePromptInput } from "@/utils/sanitize";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

export async function reviewSystemDesignAction(components: Node[], connections: Connection[]): Promise<{ markdown: string; error?: string }> {
  try {
    const { success: withinLimit, message: limitMsg } = await rateLimit("default");
    if (!withinLimit) {
      return { markdown: "", error: limitMsg || "Rate limit exceeded. Please wait." };
    }

    const apiKey = getNextKey("GROQ_API_KEY") || process.env.GROQ_API_KEY;
    if (!apiKey) return { markdown: "", error: "Groq API Service configuration missing." };

    const groq = new Groq({ apiKey });

    const prompt = `
      You are a Senior System Design Interviewer. 
      Analyze the following architecture and provide a professional critique.
      
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

      FORMAT: Return the response in clean Markdown with clear headings and emojis.
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 2048,
    });

    return { markdown: chatCompletion.choices[0]?.message?.content || "Failed to generate review." };

  } catch (error: unknown) {
    logger.error("System Design Review Error (Groq):", error);
    const msg = error instanceof Error ? error.message : "Failed to review system design.";
    return { markdown: "", error: msg };
  }
}
