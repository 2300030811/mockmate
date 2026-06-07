"use server";

import { Groq } from "groq-sdk";
import { getNextKey, getNumKeys } from "@/utils/keyManager";
import { logger } from "@/lib/logger";

const COVER_LETTER_SYSTEM_PROMPT = `You are an expert career coach and professional resume writer.
Write compelling, personalized, and highly professional cover letters based on the user's resume data and the target job description.
Focus on matching the user's specific achievements and skills to the core needs expressed in the job description.
Do NOT hallucinate or invent skills the user does not have.
Output ONLY the raw text of the cover letter. No markdown formatting, no pleasantries before or after the letter.`;

const OUTREACH_SYSTEM_PROMPT = `You are a professional networking coach.
Write a genuine, engaging, and concise cold outreach message (for LinkedIn or Email) to a hiring manager or recruiter.
The message should briefly express interest in the role, highlight 1-2 highly relevant achievements from the user's resume, and end with a soft call to action.
Keep it under 150 words. Output ONLY the raw text of the message. No markdown formatting.`;

export async function generateCoverLetterAction(resumeDataJson: string, jobDescription: string): Promise<{ data: string | null; error?: string }> {
  try {
    let content = "";
    const numGroqKeys = getNumKeys("GROQ_API_KEY") || 1;
    
    const prompt = `Job Description:\n${jobDescription}\n\nResume Data:\n${resumeDataJson}\n\nWrite a highly tailored cover letter.`;

    for (let i = 0; i < numGroqKeys; i++) {
      try {
        const apiKey = getNextKey("GROQ_API_KEY") || process.env.GROQ_API_KEY;
        if (!apiKey) throw new Error("Groq API Key missing");

        const groq = new Groq({ apiKey });
        const chatCompletion = await groq.chat.completions.create({
          messages: [
            { role: "system", content: COVER_LETTER_SYSTEM_PROMPT },
            { role: "user", content: prompt },
          ],
          model: "llama-3.3-70b-versatile",
          temperature: 0.3,
        });

        content = chatCompletion.choices[0]?.message?.content || "";
        if (content) break;
      } catch (err) {
        logger.warn(`[CoverLetter] Key ${i + 1} failed:`, err);
      }
    }

    if (!content) return { data: null, error: "Failed to generate cover letter. Please try again later." };
    return { data: content };
  } catch (error) {
    logger.error("[CoverLetter] Action Error:", error);
    return { data: null, error: "Critical error during generation." };
  }
}

export async function generateOutreachMessageAction(resumeDataJson: string, jobDescription: string): Promise<{ data: string | null; error?: string }> {
  try {
    let content = "";
    const numGroqKeys = getNumKeys("GROQ_API_KEY") || 1;
    
    const prompt = `Job Description:\n${jobDescription}\n\nResume Data:\n${resumeDataJson}\n\nWrite a concise LinkedIn/Email cold outreach message to the recruiter/hiring manager.`;

    for (let i = 0; i < numGroqKeys; i++) {
      try {
        const apiKey = getNextKey("GROQ_API_KEY") || process.env.GROQ_API_KEY;
        if (!apiKey) throw new Error("Groq API Key missing");

        const groq = new Groq({ apiKey });
        const chatCompletion = await groq.chat.completions.create({
          messages: [
            { role: "system", content: OUTREACH_SYSTEM_PROMPT },
            { role: "user", content: prompt },
          ],
          model: "llama-3.3-70b-versatile",
          temperature: 0.3,
        });

        content = chatCompletion.choices[0]?.message?.content || "";
        if (content) break;
      } catch (err) {
        logger.warn(`[OutreachMessage] Key ${i + 1} failed:`, err);
      }
    }

    if (!content) return { data: null, error: "Failed to generate outreach message. Please try again later." };
    return { data: content };
  } catch (error) {
    logger.error("[OutreachMessage] Action Error:", error);
    return { data: null, error: "Critical error during generation." };
  }
}
