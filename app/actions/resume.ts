"use server";

import { Groq } from "groq-sdk";
import { getNextKey } from "@/utils/keyManager";
import { OCRService } from "@/lib/services/ocr";
import { RoastData, roastDataSchema, deriveMatchRating } from "../(main)/resume-roaster/types";
import { sanitizePromptInput } from "@/utils/sanitize";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";
import {
  extractAndMatchKeywords,
  detectSections,
  detectQuantifiedAchievements,
} from "@/utils/ats-keywords";

export async function roastResumeAction(
  formData: FormData,
  jobDescription?: string,
  tone: string = "Brutal"
): Promise<{ data: RoastData | null; raw: string; error?: string }> {
  try {
    const { success: withinLimit, message: limitMsg } = await rateLimit("default");
    if (!withinLimit) {
      return { data: null, raw: "", error: limitMsg || "Rate limit exceeded." };
    }

    const file = formData.get("file") as File;
    if (!file || !(file instanceof File)) throw new Error("No file uploaded");

    const arrayBuffer = await file.arrayBuffer();
    const { text: resumeText } = await OCRService.extractText(Buffer.from(arrayBuffer));

    if (resumeText.length < 100) {
      return { data: null, raw: "", error: "Resume content too short or unreadable." };
    }

    const apiKey = getNextKey("GROQ_API_KEY") || process.env.GROQ_API_KEY;
    if (!apiKey) return { data: null, raw: "", error: "API Service missing." };

    const groq = new Groq({ apiKey });
    const hasJD = !!jobDescription && jobDescription.trim().length > 20;

    // --- Deterministic Analysis (Optimized to run once) ---
    const kwResult = hasJD ? extractAndMatchKeywords(resumeText, jobDescription!) : null;
    const sections = kwResult ? kwResult.sections : detectSections(resumeText);
    const metrics = kwResult ? kwResult.metrics : detectQuantifiedAchievements(resumeText);

    const scoreLow = kwResult ? Math.max(0, kwResult.matchPercent - 10) : 0;
    const scoreHigh = kwResult ? Math.min(100, kwResult.matchPercent + 10) : 70;

    const analysisContext = `
SECTIONS: ${sections.present.join(", ") || "None detected"}
MISSING: ${sections.missing.join(", ") || "None"}
METRICS: ${metrics.summary}
${kwResult ? `KEYWORDS: ${kwResult.summary}\nCONSTRAINT: atsScore MUST be ${scoreLow}-${scoreHigh}.` : "No JD provided. Max atsScore: 70."}
`;

    const prompt = `
RESUME: ${sanitizePromptInput(resumeText, 25000)}
${hasJD ? `JOB DESCRIPTION: ${sanitizePromptInput(jobDescription!, 2000)}` : ""}
TONE: ${tone}

=== DATA CONTEXT ===
${analysisContext}

TASK: Return a JSON roast and ATS analysis. Ensure atsScore reflects the keyword match and metric density.
skillBreakdown.impact should correlate with metrics found (${metrics.metricSignals}).

JSON FORMAT:
{
  "brutalRoast": "Paragraph referencing specific resume details.",
  "professionalScore": 0-100,
  "skillBreakdown": { "clarity": 0-100, "impact": 0-100, "technical": 0-100, "layout": 0-100 },
  "criticalFlaws": ["list 5"],
  "winningPoints": ["list 5"],
  "atsAnalysis": {
    "atsScore": 0-100,
    "presentKeywords": ["matching terms"],
    "missingHardSkills": ["missing technical"],
    "missingSoftSkills": ["missing soft"],
    "contentIssues": ["structural issues"],
    "atsTips": ["3-5 tips"]
  },
  "suggestions": ["4 fixes"]
}

Rules:
- Strictly JSON only.
- atsScore MUST be ${hasJD ? `${scoreLow}-${scoreHigh}` : "max 70"}.
`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: `You are a Resume Analyst with a ${tone} style. Respond ONLY in valid JSON.` },
        { role: "user", content: prompt },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.6,
      response_format: { type: "json_object" },
    });

    const content = chatCompletion.choices[0]?.message?.content || "";

    try {
      const rawParsed = JSON.parse(content);
      const validated = roastDataSchema.safeParse(rawParsed);
      
      const baseData = validated.success ? validated.data : roastDataSchema.parse(rawParsed);
      const roastData: RoastData = {
        ...baseData,
        atsAnalysis: {
          ...baseData.atsAnalysis,
          matchRating: deriveMatchRating(baseData.atsAnalysis.atsScore),
          jobDescriptionProvided: hasJD,
        },
      };
      return { data: roastData, raw: content };
    } catch (e) {
      logger.error("JSON processing failed:", e);
      return { data: null, raw: "", error: "Analysis failed to parse. Please try again." };
    }
  } catch (error: unknown) {
    logger.error("Roast Error:", error);
    return { data: null, raw: "", error: "Failed to roast resume." };
  }
}
