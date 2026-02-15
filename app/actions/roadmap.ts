"use server";

import { Groq } from "groq-sdk";
import { getNextKey } from "@/utils/keyManager";

export async function generateRoadmapAction(goal: string, experience: string) {
  try {
     const apiKey = getNextKey("GROQ_API_KEY") || process.env.GROQ_API_KEY;
     if(!apiKey) throw new Error("Groq API Service configuration missing.");

     const groq = new Groq({ apiKey });

     const prompt = `
        You are an expert technical career coach.
        The user wants to achieve this goal: "${goal}"
        Current experience level: "${experience}"

        TASK:
        Create a detailed, step-by-step certification and learning roadmap.
        Include:
        1. Foundational certifications (e.g., AWS Cloud Practitioner).
        2. Core technical skills to learn (e.g., Docker, Terraform).
        3. Professional-level certifications.
        4. Estimated timelines for each stage.
        5. Practical project ideas.

        FORMAT: Return a markdown string with clear headings, bullet points, and a professional tone. Use bold text for certification names.
     `;

     const chatCompletion = await groq.chat.completions.create({
       messages: [{ role: "user", content: prompt }],
       model: "llama-3.3-70b-versatile",
       temperature: 0.7,
       max_tokens: 2048,
     });

     return { markdown: chatCompletion.choices[0]?.message?.content || "Failed to generate roadmap." };
  } catch (error) {
     console.error("Roadmap Error (Groq):", error);
     return { markdown: "I encountered an error while mapping your path. Please try again with a more specific goal!" };
  }
}
