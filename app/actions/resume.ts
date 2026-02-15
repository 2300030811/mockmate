"use server";

import { Groq } from "groq-sdk";
import { getNextKey } from "@/utils/keyManager";
import { OCRService } from "@/lib/services/ocr";

export async function roastResumeAction(formData: FormData, jobDescription?: string) {
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
      You are "The Resume Roaster", a brutally honest yet helpful career coach. 
      Analyze the provided resume and optionally the job description.
      
      RESUME CONTENT:
      ${resumeText}
      
      ${jobDescription ? `TARGET JOB DESCRIPTION: ${jobDescription}` : ""}
      
      TASK:
      Generate a structured JSON response. Use professional but funny "roast" language in the 'brutalRoast' field.
      
      JSON STRUCTURE:
      {
        "brutalRoast": "the humorously honest critique",
        "professionalScore": 85,
        "criticalFlaws": ["list of 5 flaws"],
        "winningPoints": ["list of 5 points"],
        "atsAnalysis": {
          "missingKeywords": ["keyword1", "keyword2"],
          "formattingIssues": "desc of issues",
          "matchRating": "Low/Medium/High"
        },
        "suggestions": ["list of improvements"]
      }

      ONLY RETURN JSON.
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.8,
      response_format: { type: "json_object" },
      max_tokens: 3000,
    });

    const content = chatCompletion.choices[0]?.message?.content || "";
    try {
      return { 
        data: JSON.parse(content),
        raw: content
      };
    } catch (e) {
      // Fallback if JSON fails, extract with regex
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        return { data: JSON.parse(match[0]), raw: content };
      }
      throw new Error("Failed to parse AI response.");
    }

  } catch (error: unknown) {
    console.error("❌ Resume Roast Error (Groq):", error);
    const msg = error instanceof Error ? error.message : "Failed to roast resume.";
    throw new Error(msg);
  }
}
