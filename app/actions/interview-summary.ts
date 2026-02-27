"use server";

import { Groq } from "groq-sdk";
import { getNextKey } from "@/utils/keyManager";
import { sanitizePromptInput } from "@/utils/sanitize";
import { logger } from "@/lib/logger";

export async function summarizeInterviewAction(history: { role: string; content: string }[], type: string) {
  try {
     const apiKey = getNextKey("GROQ_API_KEY") || process.env.GROQ_API_KEY;
     if(!apiKey) throw new Error("Groq API Service configuration missing.");

     const groq = new Groq({ apiKey });

     const prompt = `
        You are a Senior Technical Recruiter.
        Analyze this interview transcript for a "${sanitizePromptInput(type, 100)}" role:
        
        TRANSCRIPT:
        ${sanitizePromptInput(history.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n'), 20000)}

        TASK:
        Provide a structured feedback report:
        1. **Technical Accuracy:** How well did the candidate answer technical questions?
        2. **Communication Skills:** Clarity, confidence, and structure (STAR method).
        3. **Strengths:** Key areas where the candidate shined.
        4. **Weaknesses/Gaps:** Areas for improvement.
        5. **Overall Score:** A score out of 100.
        6. **Verdict:** Hire, Strong Hire, No Hire, or Lean Hire with reasoning.

        FORMAT: Return a markdown string.
     `;

     const chatCompletion = await groq.chat.completions.create({
       messages: [{ role: "user", content: prompt }],
       model: "llama-3.3-70b-versatile",
       temperature: 0.7,
       max_tokens: 3000,
     });

     return { markdown: chatCompletion.choices[0]?.message?.content || "Failed to generate summary." };
  } catch (error) {
     logger.error("Summary Error (Groq):", error);
     return { markdown: "I couldn't generate a summary right now, but you handled several difficult questions well. Keep practicing!" };
  }
}
