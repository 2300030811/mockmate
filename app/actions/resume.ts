"use server";

import { Groq } from "groq-sdk";
import { getNextKey } from "@/utils/keyManager";
import { OCRService } from "@/lib/services/ocr";
import { RoastData, roastDataSchema, deriveMatchRating } from "../(main)/resume-roaster/types";
import { sanitizePromptInput } from "@/utils/sanitize";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";
import { extractAndMatchKeywords } from "@/utils/ats-keywords";

export async function roastResumeAction(formData: FormData, jobDescription?: string, tone: string = "Brutal"): Promise<{ data: RoastData | null; raw: string; error?: string }> {
  try {
    const { success: withinLimit, message: limitMsg } = await rateLimit("default");
    if (!withinLimit) {
      return { data: null, raw: "", error: limitMsg || "Rate limit exceeded. Please wait." };
    }
    const file = formData.get("file") as File;
    if (!file || !(file instanceof File)) {
      throw new Error("No file uploaded");
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text from resume
    const { text: resumeText } = await OCRService.extractText(buffer);

    if (resumeText.length < 100) {
      return { data: null, raw: "", error: "Resume content too short or unreadable." };
    }

    const apiKey = getNextKey("GROQ_API_KEY") || process.env.GROQ_API_KEY;
    if (!apiKey) return { data: null, raw: "", error: "Groq API Service configuration missing." };

    const groq = new Groq({ apiKey });

    // --- Deterministic keyword pre-processing ---
    const hasJD = !!jobDescription && jobDescription.trim().length > 20;
    let keywordSection = "";
    if (hasJD) {
      const kwResult = extractAndMatchKeywords(resumeText, jobDescription!);
      keywordSection = `
KEYWORD ANALYSIS (pre-computed, use this as ground truth):
${kwResult.summary}
The atsScore MUST be consistent with this match rate. A ${kwResult.matchPercent}% keyword match means atsScore should be approximately ${kwResult.matchPercent} (adjust ±15 based on content quality, section structure, etc.).`;
    }

    const prompt = `
RESUME: ${sanitizePromptInput(resumeText, 30000)}
${hasJD ? `JOB DESCRIPTION: ${sanitizePromptInput(jobDescription!, 2000)}` : ""}
TONE: ${sanitizePromptInput(tone, 50)}
${keywordSection}

TASK: Provide a ${tone} roast AND a rigorous ATS analysis in JSON. Reference specific text from the resume to prove you read it.

=== ATS SCORING RUBRIC (follow strictly) ===
${hasJD ? `A job description was provided. Score the resume's ATS compatibility against that specific job.` : `No job description was provided. Score against GENERAL ATS best practices only. Cap atsScore at a MAXIMUM of 70 since there is no specific job to match against.`}

atsScore criteria (0-100):
- 0-30: Critical issues — no relevant keywords, missing standard sections (Education, Experience, Skills, Contact Info), walls of text with no structure
- 31-50: Below average — some relevant terms present but major keyword gaps, weak action verbs, no quantified achievements, missing key sections
- 51-70: Decent — reasonable keyword coverage, has standard sections, some quantified achievements, but notable gaps remain
- 71-85: Strong — good keyword alignment with JD, clear section headers, quantified metrics, strong action verbs, good structure
- 86-100: Excellent — near-perfect keyword match, all standard ATS sections present, heavily quantified achievements, clean consistent formatting cues in text

For "contentIssues": ONLY flag things detectable from the extracted TEXT — missing section headers, inconsistent date formats, lack of quantified metrics, missing contact info, use of abbreviations without full terms, no action verbs. Do NOT comment on visual formatting (fonts, columns, margins, colors) since we only have extracted text.

For "presentKeywords": list specific skills/technologies/terms from the resume that ${hasJD ? "match the job description" : "are strong for general employability"}.
For "missingHardSkills": list specific technical skills, tools, certifications, or technologies ${hasJD ? "from the JD that are absent from the resume" : "commonly expected that are absent"}.
For "missingSoftSkills": list soft skills ${hasJD ? "implied by the JD that are missing" : "generally valued that appear absent"}.
For "atsTips": give 3-5 specific, actionable tips to improve ATS pass rate.

JSON FORMAT:
{
  "brutalRoast": "Humorous critique paragraph (2-3 sentences) referencing specific details from the resume.",
  "professionalScore": 0-100,
  "skillBreakdown": { "clarity": 0-100, "impact": 0-100, "technical": 0-100, "layout": 0-100 },
  "criticalFlaws": ["5 specific flaws found in the resume"],
  "winningPoints": ["5 specific strengths found in the resume"],
  "atsAnalysis": {
    "atsScore": 0-100,
    "presentKeywords": ["keywords found in resume${hasJD ? " that match the JD" : ""}"],
    "missingHardSkills": ["missing technical skills/tools"],
    "missingSoftSkills": ["missing soft skills"],
    "contentIssues": ["text-level structural issues detected"],
    "atsTips": ["3-5 actionable improvement tips"]
  },
  "suggestions": ["4 actionable fixes to improve the resume"]
}

IMPORTANT RULES:
- The atsScore must reflect REAL keyword overlap and content quality, not vibes.${hasJD ? " It must be consistent with the pre-computed keyword match rate above." : " Maximum 70 since no JD was provided."}
- All arrays must contain at least 1 item and at most 10 items.
- skillBreakdown scores should be independent: clarity (readability/structure), impact (achievements/metrics), technical (skills depth), layout (section organization in text).
- Strictly return JSON only. Never output other text, conversational fillers, or markdown code blocks like \`\`\`json. Output nothing but the raw JSON object.
`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a Resume Analyst with a ${tone} roasting style. You combine entertaining critique with rigorous, data-driven ATS analysis. You always and only respond in strictly valid JSON format.`
        },
        { role: "user", content: prompt }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.6,
      response_format: { type: "json_object" },
      max_tokens: 4000,
    });

    const content = chatCompletion.choices[0]?.message?.content || "";
    try {
      const rawParsed = JSON.parse(content);

      // Validate with Zod and apply defaults for missing fields
      const validated = roastDataSchema.safeParse(rawParsed);

      if (!validated.success) {
        logger.warn("Zod validation issues, applying defaults:", validated.error.flatten());
        // Still attempt to use the raw data with coercion
        const coerced = roastDataSchema.parse({
          ...rawParsed,
          atsAnalysis: {
            atsScore: 50,
            missingHardSkills: [],
            missingSoftSkills: [],
            presentKeywords: [],
            contentIssues: [],
            atsTips: [],
            ...rawParsed.atsAnalysis,
          },
        });
        const matchRating = deriveMatchRating(coerced.atsAnalysis.atsScore);
        const roastData: RoastData = {
          ...coerced,
          atsAnalysis: {
            ...coerced.atsAnalysis,
            matchRating,
            jobDescriptionProvided: hasJD,
          },
        };
        return { data: roastData, raw: content };
      }

      const matchRating = deriveMatchRating(validated.data.atsAnalysis.atsScore);
      const roastData: RoastData = {
        ...validated.data,
        atsAnalysis: {
          ...validated.data.atsAnalysis,
          matchRating,
          jobDescriptionProvided: hasJD,
        },
      };

      return { data: roastData, raw: content };
    } catch (e) {
      logger.warn("JSON Parse failed, attempting regex extraction", e);
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          const rawParsed = JSON.parse(match[0]);
          const validated = roastDataSchema.safeParse(rawParsed);
          const data = validated.success ? validated.data : roastDataSchema.parse(rawParsed);
          const matchRating = deriveMatchRating(data.atsAnalysis.atsScore);
          const roastData: RoastData = {
            ...data,
            atsAnalysis: {
              ...data.atsAnalysis,
              matchRating,
              jobDescriptionProvided: hasJD,
            },
          };
          return { data: roastData, raw: content };
        } catch {
          return { data: null, raw: "", error: "The AI spat out garbage instead of JSON. Try again." };
        }
      }
      return { data: null, raw: "", error: "The AI spat out garbage instead of JSON. Try again." };
    }

  } catch (error: unknown) {
    logger.error("Resume Roast Error (Groq):", error);
    const msg = error instanceof Error ? error.message : "Failed to roast resume.";
    return { data: null, raw: "", error: msg };
  }
}
