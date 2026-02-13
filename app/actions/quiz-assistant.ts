"use server";

import Groq from "groq-sdk";
import { getNextKey } from "@/utils/keyManager";
import { sanitizePromptInput } from "@/utils/sanitize";

interface BobResponse {
  success: boolean;
  message: string;
}

export async function askBob(context: string, question: string): Promise<BobResponse> {
  try {
    const apiKey = getNextKey("GROQ_API_KEY");
    if (!apiKey) {
      throw new Error("No Groq API Key available for Bob assistant");
    }

    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are Bob, a helpful AI bilingual assistant.
Your goal is to help students understand quiz questions for their exams.
When answering:
- EXPLAIN LIKE I'M 5. Use simple, clear language that anyone can understand.
- Do NOT use metaphors or a specific persona like a "lion". Just be a helpful tutor.
- Always explain the correct answer clearly.
- If the user asks for an explanation, break it down simply.
- The user is practicing for a certification exam so ensure technical accuracy but keep it simple.`,
        },
        {
          role: "user",
          content: `Context (Question/Code/Options): 
${sanitizePromptInput(context, 5000)}

User Question: ${sanitizePromptInput(question, 2000)}`,
        },
      ],
      temperature: 0.5,
      max_tokens: 500,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Empty response from Groq");
    }

    return { success: true, message: content };

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("askBob failed:", message);
    return { success: false, message: "Something went wrong. Please try again later." };
  }
}
