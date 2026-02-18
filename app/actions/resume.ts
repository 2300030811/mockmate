"use server";

import { Groq } from "groq-sdk";
import { getNextKey } from "@/utils/keyManager";
import { OCRService } from "@/lib/services/ocr";
import { RoastData } from "../(main)/resume-roaster/types";

export async function roastResumeAction(formData: FormData, jobDescription?: string, tone: string = "Brutal"): Promise<{ data: RoastData; raw: string }> {
  try {
    const file = formData.get("file") as File;
    if (!file || !(file instanceof File)) {
      throw new Error("No file uploaded");
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text from resume
    const { text: resumeText } = await OCRService.extractText(buffer);

    if (resumeText.length < 100) {
      throw new Error("Resume content too short or unreadable.");
    }

    const apiKey = getNextKey("GROQ_API_KEY") || process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("Groq API Service configuration missing.");

    const groq = new Groq({ apiKey });

    const prompt = `
      RESUME: ${resumeText}
      ${jobDescription ? `JOB: ${jobDescription}` : ""}
      TONE: ${tone}

      TASK: Provide a ${tone} roast in JSON. Reference specific text from the resume to prove you read it.
      
      JSON FORMAT:
      {
        "brutalRoast": "Humorous critique paragraph (2-3 sentences) referencing specific details.",
        "professionalScore": 0-100,
        "skillBreakdown": { "clarity": 0, "impact": 0, "technical": 0, "layout": 0 },
        "criticalFlaws": ["5 specific flaws"],
        "winningPoints": ["5 specific strengths"],
        "atsAnalysis": { "missingKeywords": [], "formattingIssues": "", "matchRating": "Low/Medium/High" },
        "suggestions": ["4 actionable fixes"]
      }

      Strictly return JSON only.
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { 
          role: "system", 
          content: `You are a Resume Roaster with a ${tone} tone. You always respond in strictly valid JSON format.` 
        },
        { role: "user", content: prompt }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.85,
      response_format: { type: "json_object" },
      max_tokens: 3000,
    });

    const content = chatCompletion.choices[0]?.message?.content || "";
    try {
      const parsedData = JSON.parse(content) as RoastData;
      return { 
        data: parsedData,
        raw: content
      };
    } catch (e) {
      console.warn("JSON Parse failed, attempting regex extraction", e);
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        return { data: JSON.parse(match[0]) as RoastData, raw: content };
      }
      throw new Error("The AI spat out garbage instead of JSON. Try again.");
    }

  } catch (error: unknown) {
    console.error("❌ Resume Roast Error (Groq):", error);
    const msg = error instanceof Error ? error.message : "Failed to roast resume.";
    throw new Error(msg);
  }
}
