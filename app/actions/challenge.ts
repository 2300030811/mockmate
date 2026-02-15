"use server";

import { Groq } from "groq-sdk";
import { getNextKey } from "@/utils/keyManager";

export async function getBobChallengeHint(problemTitle: string, userCode: string, language: string) {
  try {
     const apiKey = getNextKey("GROQ_API_KEY") || process.env.GROQ_API_KEY;
     if(!apiKey) throw new Error("Groq API Service configuration missing.");

     const groq = new Groq({ apiKey });

     const prompt = `
        You are Bob, a senior software engineer mentoring a junior. 
        They are stuck on the problem "${problemTitle}".
        
        Current Code (${language}):
        ${userCode}

        Task:
        Provide a helpful, encouraging hint. 
        - Do NOT give the full solution.
        - Point out logic errors or edge cases.
        - Use a friendly, slightly witty tone.
        - Keep it brief (2-3 sentences max).
     `;

     const chatCompletion = await groq.chat.completions.create({
       messages: [{ role: "user", content: prompt }],
       model: "llama-3.1-8b-instant", // Smaller model for simple hints
       temperature: 0.7,
       max_tokens: 200,
     });

     return { markdown: chatCompletion.choices[0]?.message?.content || "Bob is thinking..." };
  } catch (error) {
     console.error("Hint Error (Groq):", error);
     return { markdown: "Bob is currently compiling his thoughts... (Service Unavailable)" };
  }
}

export async function submitChallengeAction(problemTitle: string, code: string, language: string, output: string) {
    try {
        const apiKey = getNextKey("GROQ_API_KEY") || process.env.GROQ_API_KEY;
        if(!apiKey) throw new Error("Groq API Service configuration missing.");

        const groq = new Groq({ apiKey });

        const prompt = `
            You are an automated code judge.
            Problem: "${problemTitle}"
            User Code:
            \`\`\`${language}
            ${code}
            \`\`\`
            Execution Output:
            ${output}

            Evaluate the solution based on:
            1. Correctness (Does it solve the problem?)
            2. Efficiency (Big O time/space)
            3. Code Style (Cleanliness)

            Return a JSON object:
            {
               "success": boolean,
               "score": number (0-100),
               "efficiency": string (e.g., "O(n)"),
               "feedback": string (One sentence summary)
            }
            ONLY RETURN JSON.
        `;

        const chatCompletion = await groq.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: "llama-3.3-70b-versatile",
          temperature: 0.1, // Low temperature for deterministic JSON
          max_tokens: 500,
        });

        const text = chatCompletion.choices[0]?.message?.content || "";
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error("Invalid JSON from Groq");

    } catch (error) {
        console.error("Submission Error (Groq):", error);
        return { 
            success: false, 
            score: 0, 
            efficiency: "Unknown", 
            feedback: "Submission system is currently offline. Please try again." 
        };
    }
}
