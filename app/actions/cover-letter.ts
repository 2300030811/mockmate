"use server";

import { generateText, AI_MODELS } from "@/lib/ai/gateway";
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
    
    const prompt = `Job Description:\n${jobDescription}\n\nResume Data:\n${resumeDataJson}\n\nWrite a highly tailored cover letter.`;

    try {
      const result = await generateText(
        prompt,
        COVER_LETTER_SYSTEM_PROMPT,
        "auto",
        { model: AI_MODELS.DEFAULT, temperature: 0.3 }
      );
      content = result.content;
    } catch (err) {
      logger.error("[CoverLetter] AI Gateway completion failed:", err);
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
    
    const prompt = `Job Description:\n${jobDescription}\n\nResume Data:\n${resumeDataJson}\n\nWrite a concise LinkedIn/Email cold outreach message to the recruiter/hiring manager.`;

    try {
      const result = await generateText(
        prompt,
        OUTREACH_SYSTEM_PROMPT,
        "auto",
        { model: AI_MODELS.DEFAULT, temperature: 0.3 }
      );
      content = result.content;
    } catch (err) {
      logger.error("[OutreachMessage] AI Gateway completion failed:", err);
    }

    if (!content) return { data: null, error: "Failed to generate outreach message. Please try again later." };
    return { data: content };
  } catch (error) {
    logger.error("[OutreachMessage] Action Error:", error);
    return { data: null, error: "Critical error during generation." };
  }
}
