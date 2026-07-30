"use server";

import { aiOrchestrator } from "@/lib/services/ai-orchestrator";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";
import { resumeGeneratePayloadSchema } from "../api/resume/generate/schema";
import { z } from "zod";

const resumeTailoredSubsetSchema = z.object({
  summary: z.string().trim().max(2500).optional().default(""),
  skills: z.array(z.string().trim().max(80)).max(60).optional().default([]),
  technologies: z.array(z.string().trim().max(80)).max(40).optional().default([]),
  experience: z.array(z.object({
    company: z.string().trim().max(120).optional().default(""),
    period: z.string().trim().max(80).optional().default(""),
    role: z.string().trim().max(120).optional().default(""),
    highlights: z.array(z.string().trim().max(300)).max(12).optional().default([]),
  })).max(20).optional().default([]),
  projects: z.array(z.object({
    title: z.string().trim().max(120).optional().default(""),
    period: z.string().trim().max(80).optional().default(""),
    description: z.string().trim().max(500).optional().default(""),
    link: z.string().trim().max(300).optional().default(""),
    techStack: z.array(z.string().trim().max(80)).max(20).optional().default([]),
  })).max(20).optional().default([]),
});


export async function tailorResumeAction(
  baseResumeJson: string,
  jobDescription: string
): Promise<{ data: any | null; error?: string }> {
  try {
    const { success: withinLimit, message: limitMsg } = await rateLimit("default");
    if (!withinLimit) {
      return { data: null, error: limitMsg || "Rate limit exceeded." };
    }

    if (!jobDescription || jobDescription.trim().length < 10) {
      return { data: null, error: "Job Description is too short. Please paste a full JD." };
    }

    let baseResume: any;
    try {
      baseResume = JSON.parse(baseResumeJson);
    } catch {
      return { data: null, error: "Invalid resume data." };
    }

    const parsed = resumeGeneratePayloadSchema.safeParse(baseResume);
    if (!parsed.success) {
      return { data: null, error: "Invalid resume structure." };
    }
    const validBase = parsed.data;

    const systemPrompt = `You are an expert AI Resume Tailor. You are given a Candidate's Base Resume (in JSON) and a Target Job Description.
Your task is to tailor the resume to perfectly match the job description, strictly outputting JSON matching the base resume schema.

Rules:
1. Rewrite the "summary" to inject keywords from the Job Description and align with the role. Do NOT exceed 2500 characters.
2. Reorder "experience" bullets (the "highlights" array) by relevance to the JD. You may lightly rewrite bullets to use exact vocabulary from the JD, but NEVER invent fake metrics, skills, or experiences the candidate does not have.
3. Select the most relevant "skills" and "technologies" from the base resume. You may reorder them.
4. Keep the exact same JSON structure for the returned fields. You only need to return: summary, skills, technologies, experience, and projects.
5. Do NOT change the candidate's name, email, phone, location, education, certifications, or publications. They will be preserved from the base resume.

Output strictly valid JSON.`;

    const userPrompt = `Base Resume JSON:\n${JSON.stringify({
      summary: validBase.summary,
      skills: validBase.skills,
      technologies: validBase.technologies,
      experience: validBase.experience,
      projects: validBase.projects,
    }, null, 2)}\n\nJob Description:\n${jobDescription}`;

    const result = await aiOrchestrator.generateStructured(
      userPrompt,
      systemPrompt,
      resumeTailoredSubsetSchema,
      "auto",
      {
        temperature: 0.2,
        maxTokens: 4000,
      }
    );

    if (!result.success) {
      logger.error("Tailor resume: AI Orchestrator completion failed.", result.error);
      return { data: null, error: "AI service is temporarily unavailable. Please try again in a moment." };
    }

    const tailoredData = result.data!;

    // Master Alignment Validation: Remove fabricated content
    const baseText = JSON.stringify(validBase).toLowerCase();

    if (tailoredData.skills) {
      tailoredData.skills = tailoredData.skills.filter((s: string) =>
        baseText.includes(s.toLowerCase().trim())
      );
    }
    if (tailoredData.technologies) {
      tailoredData.technologies = tailoredData.technologies.filter((t: string) =>
        baseText.includes(t.toLowerCase().trim())
      );
    }
    const baseCompanies = new Set(
      (validBase.experience || []).map((e: any) => e.company.toLowerCase().trim())
    );
    if (tailoredData.experience) {
      tailoredData.experience = tailoredData.experience.filter((e: any) =>
        baseCompanies.has((e.company || "").toLowerCase().trim())
      );
    }

    const finalResume = {
      ...validBase,
      summary: tailoredData.summary || validBase.summary,
      skills: tailoredData.skills || validBase.skills,
      technologies: tailoredData.technologies || validBase.technologies,
      experience: tailoredData.experience || validBase.experience,
      projects: tailoredData.projects || validBase.projects,
    };

    const finalParsed = resumeGeneratePayloadSchema.safeParse(finalResume);
    if (!finalParsed.success) {
      return { data: null, error: "AI generated an invalid resume structure. Please try again." };
    }

    return { data: finalParsed.data };
  } catch (error: unknown) {
    logger.error("Tailor Error:", error);
    return { data: null, error: "Failed to tailor resume. Please try again." };
  }
}
