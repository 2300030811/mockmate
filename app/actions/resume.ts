"use server";

import { generateText } from "@/lib/ai/gateway";
import { OCRService } from "@/lib/services/ocr";
import { RoastData, roastDataSchema } from "../(main)/resume-roaster/types";
import { sanitizePromptInput } from "@/utils/sanitize";
import { safeJsonParse } from "@/utils/safeJson";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";
import { deriveAtsMatchRating } from "@/types/ats-score";
import { computeAtsEngineScores } from "@/lib/ats-engine";
import { clampScore } from "@/utils/math";
import { resumeGeneratePayloadSchema } from "../api/resume/generate/schema";


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
  "jobTitle": "Extracted target role name",
  "companyName": "Extracted target company name (if JD provided)",
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

    let jobTitleFromJD = "";
    let companyNameFromJD = "";
    if (hasJD) {
        // Simple heuristic extraction for better metadata consistency
        const jdLines = jobDescription.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        if (jdLines.length > 0) {
            jobTitleFromJD = jdLines[0].substring(0, 100); // Assume first line might be title
        }
    }

    try {
      const systemPrompt = `You are a Resume Analyst with a ${tone} style. Respond ONLY in valid JSON.`;
      const completion = await generateText(
        prompt,
        systemPrompt,
        "auto",
        { temperature: 0.6 }
      );
      content = completion.content;
    } catch (gatewayError) {
      logger.error("Resume roast: AI Gateway completion failed.", gatewayError);
      errorLog += "gateway_error; ";
    }

    if (!content) {
      return {
        data: null,
        raw: "",
        error: `Analysis failed. ${errorLog ? "Providers are experiencing issues." : "No provider returned content."}`,
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
      jobTitle: parsedData.jobTitle || "",
      companyName: parsedData.companyName || "",
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

export async function parseResumeAction(
  formData: FormData
): Promise<{ data: any | null; error?: string }> {
  try {
    const { success: withinLimit, message: limitMsg } = await rateLimit("default");
    if (!withinLimit) {
      return { data: null, error: limitMsg || "Rate limit exceeded." };
    }

    const file = formData.get("file") as File;
    if (!file || !(file instanceof File)) throw new Error("No file uploaded");

    let resumeText = "";
    if (file.type === "application/pdf") {
      const arrayBuffer = await file.arrayBuffer();
      const ocrResult = await OCRService.extractText(Buffer.from(arrayBuffer));
      resumeText = ocrResult.text;
    } else {
      resumeText = await file.text();
    }

    if (resumeText.length < 50) {
      return { data: null, error: "Resume content too short or unreadable." };
    }

    const prompt = `You are an expert Resume Parser. Your task is to extract information from the raw resume text provided and map it strictly to the requested JSON schema.
    
CRITICAL RULES:
1. NEVER invent, hallucinate, or assume any information that is not explicitly in the text.
2. If a field is not present in the text, leave it blank or as an empty array.
3. Output strictly valid JSON matching this EXACT schema (use these exact lowercase field names):

{
  "name": "Full Name",
  "email": "email@example.com",
  "phone": "+1 555 123 4567",
  "location": "City, State",
  "linkedin": "https://linkedin.com/in/...",
  "portfolio": "https://...",
  "summary": "Professional summary paragraph",
  "skills": ["Skill1", "Skill2"],
  "languages": ["Language1"],
  "technologies": ["Tech1", "Tech2"],
  "experience": [
    {
      "company": "Company Name",
      "role": "Job Title",
      "period": "Jan 2020 - Present",
      "highlights": ["Achievement 1", "Achievement 2"]
    }
  ],
  "projects": [
    {
      "title": "Project Name",
      "period": "2024",
      "description": "What the project does",
      "link": "https://...",
      "techStack": ["React", "Node.js"]
    }
  ],
  "education": [
    {
      "program": "B.Tech in Computer Science",
      "institution": "University Name",
      "period": "2016 - 2020",
      "details": "GPA, achievements"
    }
  ],
  "certifications": [
    {
      "name": "Cert Name",
      "issuer": "Issuing Org",
      "year": "2024"
    }
  ]
}

RAW RESUME TEXT:
${sanitizePromptInput(resumeText, 25000)}
`;

    let content = "";
    
    try {
      const systemPrompt = "You extract resume text into structured JSON format.";
      const completion = await generateText(
        prompt,
        systemPrompt,
        "auto",
        { temperature: 0.1 }
      );
      content = completion.content;
    } catch (gatewayError) {
      logger.error("Resume parse: AI Gateway completion failed.", gatewayError);
    }

    if (!content) {
      return { data: null, error: "Failed to parse resume with AI." };
    }

    // Pre-process the AI output: truncate strings that exceed schema limits
    // so that one long description doesn't reject the entire resume
    let rawParsed: any;
    try {
      const cleaned = content
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      const firstOpen = cleaned.indexOf(cleaned.startsWith("[") ? "[" : "{");
      const lastClose = cleaned.lastIndexOf(cleaned.startsWith("[") ? "]" : "}");
      const jsonStr = (firstOpen !== -1 && lastClose !== -1)
        ? cleaned.substring(firstOpen, lastClose + 1)
        : cleaned;
      rawParsed = JSON.parse(jsonStr);
    } catch {
      logger.error("Resume parse: AI output is not valid JSON.");
      return { data: null, error: "AI returned invalid data. Please try again." };
    }

    // Truncate strings that exceed schema limits
    const truncStr = (val: unknown, max: number): string =>
      typeof val === "string" ? val.slice(0, max) : "";
    const truncArr = (val: unknown, itemMax: number, arrMax: number): string[] =>
      Array.isArray(val) ? val.slice(0, arrMax).map((s: any) => truncStr(s, itemMax)) : [];

    if (rawParsed.name) rawParsed.name = truncStr(rawParsed.name, 120);
    if (rawParsed.email) rawParsed.email = truncStr(rawParsed.email, 160);
    if (rawParsed.phone) rawParsed.phone = truncStr(rawParsed.phone, 40);
    if (rawParsed.linkedin) rawParsed.linkedin = truncStr(rawParsed.linkedin, 300);
    if (rawParsed.portfolio) rawParsed.portfolio = truncStr(rawParsed.portfolio, 300);
    if (rawParsed.location) rawParsed.location = truncStr(rawParsed.location, 120);
    if (rawParsed.summary) rawParsed.summary = truncStr(rawParsed.summary, 2500);
    if (rawParsed.skills) rawParsed.skills = truncArr(rawParsed.skills, 80, 60);
    if (rawParsed.languages) rawParsed.languages = truncArr(rawParsed.languages, 80, 30);
    if (rawParsed.technologies) rawParsed.technologies = truncArr(rawParsed.technologies, 80, 40);

    if (Array.isArray(rawParsed.experience)) {
      rawParsed.experience = rawParsed.experience.slice(0, 20).map((e: any) => ({
        company: truncStr(e?.company, 120),
        role: truncStr(e?.role, 120),
        period: truncStr(e?.period, 80),
        highlights: truncArr(e?.highlights, 300, 12),
      }));
    }
    if (Array.isArray(rawParsed.projects)) {
      rawParsed.projects = rawParsed.projects.slice(0, 20).map((p: any) => ({
        title: truncStr(p?.title, 120),
        period: truncStr(p?.period, 80),
        description: truncStr(p?.description, 500),
        link: truncStr(p?.link, 300),
        techStack: truncArr(p?.techStack, 80, 20),
      }));
    }
    if (Array.isArray(rawParsed.education)) {
      rawParsed.education = rawParsed.education.slice(0, 10).map((e: any) => ({
        program: truncStr(e?.program, 140),
        institution: truncStr(e?.institution, 140),
        period: truncStr(e?.period, 80),
        details: truncStr(e?.details, 300),
      }));
    }
    if (Array.isArray(rawParsed.certifications)) {
      rawParsed.certifications = rawParsed.certifications.slice(0, 20).map((c: any) => ({
        name: truncStr(c?.name, 140),
        issuer: truncStr(c?.issuer, 140),
        year: truncStr(c?.year, 20),
      }));
    }

    const parsedData = resumeGeneratePayloadSchema.safeParse(rawParsed);
    if (!parsedData.success) {
      logger.error("Resume parse: failed to validate sanitized AI output.", parsedData.error.format());
      return { data: null, error: "Analysis failed to parse. Please try again." };
    }

    return { data: parsedData.data };
  } catch (error: unknown) {
    logger.error("Parse Error:", error);
    return { data: null, error: "Failed to parse resume." };
  }
}
