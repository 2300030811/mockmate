"use server";

import { generateText, AI_MODELS } from "@/lib/ai/gateway";
import { z } from "zod";
import { sanitizePromptInput } from "@/utils/sanitize";
import { rateLimit } from "@/lib/rate-limit";

// Input validation schema
const ChatMessageSchema = z.object({
    role: z.enum(["user", "assistant", "system"]),
    content: z.string().min(1).max(10000),
});
const ChatInputSchema = z.array(ChatMessageSchema).max(50);

// getGroqClient removed in favor of AI Gateway

const ALLOWED_INTERVIEW_TYPES = ["behavioral", "technical"];
const ALLOWED_DIFFICULTIES = ["junior", "mid", "senior"];

export async function chatWithAI(
  messages: { role: string; content: string }[],
  type: string,
  difficulty: string = "mid",
  topic: string = ""
): Promise<{ response: string, error?: string }> {
    // Validate interview type & difficulty
    const safeType = ALLOWED_INTERVIEW_TYPES.includes(type) ? type : "behavioral";
    const safeDifficulty = ALLOWED_DIFFICULTIES.includes(difficulty) ? difficulty : "mid";
    const safeTopic = topic ? sanitizePromptInput(topic, 100) : "";

    // Validate input
    const parsed = ChatInputSchema.safeParse(messages);
    if (!parsed.success) {
        return { response: "", error: "Invalid message format" };
    }
    const validMessages = parsed.data;

    // Limit message history to last 30 messages to prevent token overflow
    const trimmedMessages = validMessages.length > 30 ? validMessages.slice(-30) : validMessages;

    try {
        // Rate limit: 60 chat messages per 10 minutes for users, 10/day for guests
        const { success: withinLimit, message: limitMsg } = await rateLimit("chat");
        if (!withinLimit) {
            return { response: "", error: limitMsg || "Too many requests. Please slow down." };
        }

        const systemPrompt = `You are a professional technical interviewer conducting a ${safeType} interview.
    - Difficulty: ${safeDifficulty}-level (adjust question complexity accordingly).
    ${safeTopic ? `- Focus area: ${safeTopic}. Prioritize questions related to this topic.` : ''}
    - Your goal is to assess the candidate's skills with insightful questions.
    ${safeType === 'technical' ? '- IMPORTANT: When you ask a coding question or ask the candidate to implement something, EXPLICITLY tell them to "type your solution in the Editor tab on the right".' : ''}
    - Keep your responses concise (1-2 sentences max) so the conversation feels like a real dialogue.
    - Ask one clear question at a time.
    - Acknowledge their answer briefly with "I see", "Great", or "Interesting point" before moving on.
    - If the user gives a weak answer, ask a targeted follow-up.
    - Start the interview by introducing yourself professionally and asking the first question.
    - Do NOT use emojis or informal text. Stay professional.`;

        let responseText = "";

        try {
            const result = await generateText(
                trimmedMessages.map(m => ({
                    role: m.role as "user" | "assistant" | "system",
                    content: m.role === "user" ? sanitizePromptInput(m.content) : m.content,
                })),
                systemPrompt,
                "auto",
                {
                    temperature: 0.7,
                    maxTokens: 150,
                    model: AI_MODELS.FAST
                }
            );
            responseText = result.content;
        } catch (gatewayError: unknown) {
            const msg = gatewayError instanceof Error ? gatewayError.message : String(gatewayError);
            console.error("❌ AI Gateway Failed (Server Action):", msg);
            return { response: "", error: "AI Service Unavailable" };
        }

        if (!responseText) responseText = "Let's move to the next topic.";

        return { response: responseText };
    } catch (error: unknown) {
        console.error("Chat Action Error:", error);
        return { response: "", error: "Failed to process AI response" };
    }
}

export async function getSpeechToken(): Promise<{ token: string, region: string, error?: string }> {
    const key = process.env.AZURE_SPEECH_KEY;
    const region = process.env.AZURE_SPEECH_REGION;

    if (!key || !region) {
        return { token: "", region: "", error: "Missing Azure Speech credentials" };
    }

    try {
        const response = await fetch(`https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`, {
            method: 'POST',
            headers: {
                'Ocp-Apim-Subscription-Key': key,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch token");
        }

        const token = await response.text();
        return { token, region };
    } catch (error) {
        console.error("Speech Token Error:", error);
        return { token: "", region: "", error: "Failed to issue speech token" };
    }
}
