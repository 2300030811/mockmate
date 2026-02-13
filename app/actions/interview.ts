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
    - Your goal is to assess the candidate's skills.
    - Keep your responses concise (1-2 sentences max) so the conversation flows naturally.
    - Ask one clear question at a time.
    - If the user gives a good answer, acknowledge it briefly and move to the next question.
    - If the answer is weak or vague, ask a follow-up question to clarify.
    - Start by introducing yourself briefly and asking the first question.`;

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
                const googleKey = process.env.GOOGLE_API_KEY;
                if (!googleKey) throw new Error("No Google Key either");

                const genAI = new GoogleGenerativeAI(googleKey);
                const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite-preview-02-05" });
                
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

