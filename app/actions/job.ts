"use server";

import { generateText, AI_MODELS } from "@/lib/ai/gateway";
import { sanitizePromptInput } from "@/utils/sanitize";
import { rateLimit } from "@/lib/rate-limit";

export interface DistilledJobDescription {
  schemaVersion: number;
  title?: string;
  skillsRequired?: string[];
  responsibilities?: string[];
  seniority?: string;
}

/**
 * Server Action to parse and distill a raw job description string into a compact,
 * structured JSON payload. This reduces prompt bloat in subsequent turns.
 */
export async function distillJobDescriptionAction(
  jdText: string
): Promise<{ data: DistilledJobDescription | null; error?: string }> {
  try {
    // Rate limit: prevent abuse
    const { success, message } = await rateLimit("default");
    if (!success) {
      return { data: null, error: message || "Rate limit exceeded. Please slow down." };
    }

    const cleanText = jdText ? jdText.trim() : "";
    if (!cleanText) {
      return { data: null, error: "Job description is empty" };
    }
    if (cleanText.length > 10000) {
      return { data: null, error: "Job description is too long (maximum 10,000 characters)" };
    }

    const prompt = `You are a Senior Recruiter. Analyze this job description and extract a structured, highly distilled summary.
Exclude generic equal opportunity statements, company intro boilerplate, or benefit details. Focus strictly on required credentials.

Output ONLY a valid JSON object matching the schema below. Do not wrap in markdown code blocks.

SCHEMA:
{
  "schemaVersion": 1,
  "title": "Clean target job title",
  "skillsRequired": ["list of key technical and soft skills required (max 15 items)"],
  "responsibilities": ["list of main responsibilities (max 6 items)"],
  "seniority": "junior | mid | senior | lead"
}

JOB DESCRIPTION:
${sanitizePromptInput(cleanText, 8000)}
`;

    const result = await generateText(
      [{ role: "user", content: prompt }],
      "You are an expert recruiter. Output only valid JSON.",
      "auto",
      {
        model: AI_MODELS.DEFAULT,
        temperature: 0.1,
        maxTokens: 1000,
        responseFormat: { type: "json_object" }
      }
    );

    const rawContent = result.content ? result.content.trim() : "";
    if (!rawContent) {
      throw new Error("Empty response from AI");
    }

    const data = JSON.parse(rawContent) as DistilledJobDescription;
    
    // Safety fallback properties
    const safeData: DistilledJobDescription = {
      schemaVersion: 1,
      title: data.title || "Software Engineer",
      skillsRequired: Array.isArray(data.skillsRequired) ? data.skillsRequired.slice(0, 15) : [],
      responsibilities: Array.isArray(data.responsibilities) ? data.responsibilities.slice(0, 6) : [],
      seniority: data.seniority || "mid"
    };

    return { data: safeData };
  } catch (error: unknown) {
    console.error("❌ Distill JD Error (Server Action):", error);
    return { data: null, error: "Failed to distill job description" };
  }
}
