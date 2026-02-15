"use server";

import { Groq } from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getNextKey } from "@/utils/keyManager";
import { z } from "zod";
import { sanitizePromptInput } from "@/utils/sanitize";

// Input validation schema
const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1).max(10000),
});
const ChatInputSchema = z.array(ChatMessageSchema).max(50);

const getGroqClient = () => {
    // Access safely on server
    const apiKey = getNextKey("GROQ_API_KEY") || process.env.GROQ_API_KEY;
    if (!apiKey) return null;
    return new Groq({ apiKey });
};

export async function chatWithAI(messages: { role: string; content: string }[], type: string): Promise<{ response: string, error?: string }> {
    // Validate input
    const parsed = ChatInputSchema.safeParse(messages);
    if (!parsed.success) {
      return { response: "", error: "Invalid message format" };
    }
    const validMessages = parsed.data;

    try {
        const systemPrompt = `You are a professional technical interviewer conducting a ${type} interview. 
    - Your goal is to assess the candidate's skills with insightful questions.
    ${type === 'technical' ? '- IMPORTANT: When you ask a coding question or ask the candidate to implement something, EXPLICITLY tell them to "type your solution in the Editor tab on the right".' : ''}
    - Keep your responses concise (1-2 sentences max) so the conversation feels like a real dialogue.
    - Ask one clear question at a time.
    - Acknowledge their answer briefly with "I see", "Great", or "Interesting point" before moving on.
    - If the user gives a weak answer, ask a targeted follow-up.
    - Start the interview by introducing yourself professionally and asking the first question.
    - Do NOT use emojis or informal text. Stay professional.`;

        let responseText = "";

        // 1. Try Groq (Llama 3.1) - Fast & Free-ish
        try {
            const groq = getGroqClient();
            if (!groq) throw new Error("No Groq Key");

            const completion = await groq.chat.completions.create({
                messages: [
                    { role: "system" as const, content: systemPrompt },
                    ...validMessages.map(m => ({
                      role: m.role as "user" | "assistant" | "system",
                      content: m.role === "user" ? sanitizePromptInput(m.content) : m.content,
                    }))
                ],
                model: "llama-3.1-8b-instant",
                temperature: 0.7,
                max_tokens: 150,
            });

            responseText = completion.choices[0]?.message?.content || "";
        } catch (groqError: unknown) {
            const msg = groqError instanceof Error ? groqError.message : String(groqError);
            console.warn("⚠️ Groq Failed (Server Action), falling back to Gemini:", msg);

            // 2. Fallback to Gemini (Free)
            try {
                const googleKey = getNextKey("GOOGLE_API_KEY") || process.env.GOOGLE_API_KEY;
                if (!googleKey) throw new Error("No Google Key either");

                const genAI = new GoogleGenerativeAI(googleKey);
                const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
                
                // Gemini expects 'user' | 'model' roles
                const history = validMessages.slice(0, -1).map((m) => ({
                    role: m.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: m.role === 'user' ? sanitizePromptInput(m.content) : m.content }]
                }));

                const chatObj = model.startChat({
                    history: history,
                    systemInstruction: systemPrompt,
                });

                const lastMsg = validMessages[validMessages.length - 1];
                // Handle empty history case for initial greeting
                const contentToSend = lastMsg 
                    ? (lastMsg.role === 'user' ? sanitizePromptInput(lastMsg.content) : lastMsg.content) 
                    : "Hello, I am ready.";
                
                const result = await chatObj.sendMessage(contentToSend);
                responseText = result.response.text();

            } catch (geminiError: unknown) {
                const gMsg = geminiError instanceof Error ? geminiError.message : String(geminiError);
                console.error("❌ Both AI Services Failed (Server Action):", gMsg);
                return { response: "", error: "AI Service Unavailable" };
            }
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
