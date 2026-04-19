"use server";

import { Groq } from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getNextKey, getNumKeys } from "@/utils/keyManager";
import { OCRService } from "@/lib/services/ocr";
import { RoastData, roastDataSchema } from "../(main)/resume-roaster/types";
import { sanitizePromptInput } from "@/utils/sanitize";
import { safeJsonParse } from "@/utils/safeJson";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";
import { deriveAtsMatchRating } from "@/types/ats-score";
import { computeAtsEngineScores } from "@/lib/ats-engine";
import { clampScore } from "@/utils/math";
import {
  SectionPresence,
  MetricDetectionResult,
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

    const hasJD = !!jobDescription && jobDescription.trim().length > 20;

    // --- Deterministic Analysis (Optimized via Unified Engine) ---
    const engineResult = computeAtsEngineScores({
      resumeText,
      jobDescription: hasJD ? jobDescription : undefined,
    });

    const analysisContext = `
SECTIONS: ${engineResult.sections.present.join(", ") || "None detected"}
MISSING: ${engineResult.sections.missing.join(", ") || "None"}
METRICS: ${engineResult.metrics.summary}
${hasJD ? `KEYWORDS: Found ${engineResult.presentKeywords.length}. Match: ${engineResult.keywordScore}%` : "No JD provided. Max keywordScore: 70."}
`;

    const prompt = `
RESUME: ${sanitizePromptInput(resumeText, 25000)}
${hasJD ? `JOB DESCRIPTION: ${sanitizePromptInput(jobDescription!, 2000)}` : ""}
TONE: ${tone}

=== DATA CONTEXT ===
${analysisContext}

TASK: Return a JSON roast and ATS analysis. Ensure atsScore reflects the keyword match and metric density.
skillBreakdown.impact should correlate with metrics found (${engineResult.metrics.metricSignals}).

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
- Note: atsScore will be validated against deterministic engine analysis.
`;

    let content = "";
    let errorLog = "";

    const numGroqKeys = getNumKeys("GROQ_API_KEY") || 1;
    for (let i = 0; i < numGroqKeys; i++) {
      try {
        const apiKey = getNextKey("GROQ_API_KEY") || process.env.GROQ_API_KEY;
        if (!apiKey) throw new Error("Groq API Key missing");

        const groq = new Groq({ apiKey });
        const chatCompletion = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content: `You are a Resume Analyst with a ${tone} style. Respond ONLY in valid JSON.`,
            },
            { role: "user", content: prompt },
          ],
          model: "llama-3.3-70b-versatile",
          temperature: 0.6,
          response_format: { type: "json_object" },
        });

        content = chatCompletion.choices[0]?.message?.content || "";
        if (content) break;
      } catch (groqErr) {
        errorLog += `Groq key ${i + 1} failed: ${groqErr instanceof Error ? groqErr.message : String(groqErr)}. `;
      }
    }

    if (!content) {
      logger.warn("Resume roast: All Groq keys failed, attempting Gemini fallback...");
      try {
        const geminiApiKey = process.env.GOOGLE_API_KEY;
        if (!geminiApiKey) throw new Error("Gemini API Key missing");

        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent([{ text: prompt }]);
        content = result.response.text()
          .replace(/```(?:json)?\n?/gi, "")
          .trim();
      } catch (geminiErr) {
        errorLog += `Gemini failed: ${geminiErr instanceof Error ? geminiErr.message : String(geminiErr)}. `;
        logger.error("Resume roast: Gemini fallback failed.");
      }
    }

    if (!content) {
      return {
        data: null,
        raw: "",
        error: `Analysis failed: ${errorLog || "No provider returned content."}`,
      };
    }

    const parsedData = safeJsonParse(content, roastDataSchema);
    if (!parsedData) {
      logger.error("Resume roast: failed to parse model output into RoastData schema.");
      return { data: null, raw: content, error: "Analysis failed to parse. Please try again." };
    }

    const baseData: RoastData = {
      professionalScore: clampScore(parsedData.professionalScore ?? 50),
      brutalRoast: parsedData.brutalRoast ?? "Could not generate roast.",
      skillBreakdown: {
        clarity: clampScore(parsedData.skillBreakdown?.clarity ?? 50),
        impact: clampScore(parsedData.skillBreakdown?.impact ?? 50),
        technical: clampScore(parsedData.skillBreakdown?.technical ?? 50),
        layout: clampScore(parsedData.skillBreakdown?.layout ?? 50),
      },
      criticalFlaws: parsedData.criticalFlaws ?? [],
      winningPoints: parsedData.winningPoints ?? [],
      atsAnalysis: {
        atsScore: clampScore(parsedData.atsAnalysis?.atsScore ?? 0),
        matchRating: deriveAtsMatchRating(clampScore(parsedData.atsAnalysis?.atsScore ?? 0)),
        formatScore: clampScore(parsedData.atsAnalysis?.formatScore ?? 50),
        contentScore: clampScore(parsedData.atsAnalysis?.contentScore ?? 50),
        keywordScore: clampScore(parsedData.atsAnalysis?.keywordScore ?? 50),
        missingHardSkills: parsedData.atsAnalysis?.missingHardSkills ?? [],
        missingSoftSkills: parsedData.atsAnalysis?.missingSoftSkills ?? [],
        presentKeywords: parsedData.atsAnalysis?.presentKeywords ?? [],
        contentIssues: parsedData.atsAnalysis?.contentIssues ?? [],
        atsTips: parsedData.atsAnalysis?.atsTips ?? [],
        jobDescriptionProvided: Boolean(parsedData.atsAnalysis?.jobDescriptionProvided),
      },
      suggestions: parsedData.suggestions ?? [],
    };

    const roastData: RoastData = {
      ...baseData,
      atsAnalysis: {
        ...baseData.atsAnalysis,
        atsScore: engineResult.atsScore,
        formatScore: engineResult.formatScore,
        contentScore: engineResult.contentScore,
        keywordScore: engineResult.keywordScore,
        matchRating: engineResult.matchRating,
        jobDescriptionProvided: hasJD,
      },
    };
    return { data: roastData, raw: content };
  } catch (error: unknown) {
    logger.error("Roast Error:", error);
    return { data: null, raw: "", error: "Failed to roast resume." };
  }
}
