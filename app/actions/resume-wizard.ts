"use server";

import { Groq } from "groq-sdk";
import { getNextKey, getNumKeys } from "@/utils/keyManager";
import { logger } from "@/lib/logger";

const WIZARD_SYSTEM_PROMPT = `You are an adaptive, conversational resume builder assistant.
Your goal is to build a highly structured JSON resume progressively by asking the user ONE targeted question at a time about their career, experience, projects, or education.

You will receive:
1. The current state of the resume (JSON)
2. The current section being worked on
3. The user's answer to the last question

Your job is to:
1. Extract any relevant information from the user's answer and merge it into the current resume JSON. Do NOT hallucinate data. If they skip, leave it unchanged.
2. Formulate the NEXT question to ask the user. Move on to the next empty section if the current one seems complete.
3. Determine if the resume has enough information to be considered "complete" (e.g., has name, contact, at least 1 experience/project, education, skills).

Respond ONLY with a raw JSON object containing the following structure exactly:
{
  "resume_data": { ... updated full resume JSON ... },
  "next_question": {
    "section": "intro" | "contact" | "summary" | "workExperience" | "education" | "personalProjects" | "skills" | "review",
    "text": "The next conversational question to ask the user."
  },
  "is_complete": boolean
}`;

export async function processWizardTurnAction(
  currentResumeJson: string, 
  currentSection: string, 
  userAnswer: string
): Promise<{ data: any | null; error?: string }> {
  try {
    let content = "";
    const numGroqKeys = getNumKeys("GROQ_API_KEY") || 1;
    
    const prompt = `Current Section: ${currentSection}
Current Resume JSON: ${currentResumeJson}

User's Answer: "${userAnswer}"

Process the answer, update the resume JSON, and formulate the next question. Output ONLY a valid JSON object.`;

    for (let i = 0; i < numGroqKeys; i++) {
      try {
        const apiKey = getNextKey("GROQ_API_KEY") || process.env.GROQ_API_KEY;
        if (!apiKey) throw new Error("Groq API Key missing");

        const groq = new Groq({ apiKey });
        const chatCompletion = await groq.chat.completions.create({
          messages: [
            { role: "system", content: WIZARD_SYSTEM_PROMPT },
            { role: "user", content: prompt },
          ],
          model: "llama-3.3-70b-versatile",
          temperature: 0.1,
          response_format: { type: "json_object" },
        });

        content = chatCompletion.choices[0]?.message?.content || "";
        if (content) break;
      } catch (err) {
        logger.warn(`[ResumeWizard] Key ${i + 1} failed:`, err);
      }
    }

    if (!content) return { data: null, error: "Failed to process turn. Please try again." };
    
    try {
      const parsed = JSON.parse(content);
      return { data: parsed };
    } catch (parseErr) {
      return { data: null, error: "Failed to parse AI response." };
    }
  } catch (error) {
    logger.error("[ResumeWizard] Action Error:", error);
    return { data: null, error: "Critical error during wizard processing." };
  }
}
