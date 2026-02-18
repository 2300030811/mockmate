
"use server";

import { Groq } from "groq-sdk";
import { getNextKey } from "@/utils/keyManager";

export interface AnalysisResult {
  score: number;
  markdown: string;
  error?: string;
}

export async function analyzeProjectCode(
  files: Record<string, { code: string; active?: boolean }>, 
  taskDescription: string
): Promise<AnalysisResult> {
  
  try {
    const apiKey = getNextKey("GROQ_API_KEY") || process.env.GROQ_API_KEY;
    if (!apiKey) return { score: 0, markdown: "", error: "AI Service Unavailable" };

    const groq = new Groq({ apiKey });

    // Prepare context
    const fileContext = Object.entries(files)
      .map(([name, file]) => `// File: ${name}\n${file.code}`)
      .join("\n\n");

    const prompt = `
      You are a Senior Software Engineer reviewing a Junior Developer's code.
      
      TASK: "${taskDescription}"
      
      CODE TO REVIEW:
      ${fileContext.slice(0, 15000)} // Limit context window
      
      INSTRUCTIONS:
      Provide a structured code review in MARKDOWN format.
      1. **Code Quality Score**: Give a strict score out of 100 based on best practices, readability, and correctness.
      2. **Strengths**: What did they do well? (Bullet points)
      3. **Improvements**: Specific architectural or logic improvements. (Bullet points)
      4. **Bugs**: Any potential bugs or edge cases missed.
      5. **Verdict**: 1-sentence summary.

      FORMAT:
      Start with the score line: "SCORE: <number>"
      Then provide the rest in markdown.
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3, // Lower temp for more analytical output
      max_tokens: 1500,
    });

    const content = chatCompletion.choices[0]?.message?.content || "Failed to analyze.";
    
    // Extract Score
    const scoreMatch = content.match(/SCORE:\s*(\d+)/i);
    const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 0;

    // Clean up content (remove the score line for display)
    const cleanMarkdown = content.replace(/SCORE:\s*\d+/i, "").trim();

    return {
      score,
      markdown: cleanMarkdown
    };

  } catch (error) {
    console.error("Project Analysis Error:", error);
    return { 
      score: 0, 
      markdown: "Unable to analyze code at this time. Please try again later.", 
      error: "Analysis Failed" 
    };
  }
}
