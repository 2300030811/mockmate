"use server";

import { Groq } from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getNextKey } from "@/utils/keyManager";

const getGroqClient = () => {
    // Access safely on server
    const apiKey = getNextKey("GROQ_API_KEY") || process.env.GROQ_API_KEY;
    if (!apiKey) return null;
    return new Groq({ apiKey });
};

export async function chatWithAI(messages: any[], type: string, sessionId: string): Promise<{ response: string, error?: string }> {
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
                    { role: "system", content: systemPrompt },
                    ...messages
                ],
                model: "llama-3.1-8b-instant",
                temperature: 0.7,
                max_tokens: 150,
            });

            responseText = completion.choices[0]?.message?.content || "";
        } catch (groqError: any) {
            console.warn("⚠️ Groq Failed (Server Action), falling back to Gemini:", groqError.message);

            // 2. Fallback to Gemini (Free)
            try {
                const googleKey = process.env.GOOGLE_API_KEY;
                if (!googleKey) throw new Error("No Google Key either");

                const genAI = new GoogleGenerativeAI(googleKey);
                const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite-preview-02-05" });

                const chatObj = model.startChat({
                    history: messages.slice(0, -1).map((m: any) => ({
                        role: m.role === 'assistant' ? 'model' : 'user',
                        parts: [{ text: m.content }]
                    })),
                    systemInstruction: systemPrompt,
                });

                const lastMsg = messages[messages.length - 1];
                // Handle empty history case for initial greeting
                const contentToSend = lastMsg ? lastMsg.content : "Hello, I am ready.";
                
                const result = await chatObj.sendMessage(contentToSend);
                responseText = result.response.text();

            } catch (geminiError: any) {
                console.error("❌ Both AI Services Failed (Server Action):", geminiError.message);
                return { response: "", error: "AI Service Unavailable" };
            }
        }

        if (!responseText) responseText = "Let's move to the next topic.";

        return { response: responseText };

    } catch (error: any) {
        console.error("Chat Action Error:", error);
        return { response: "", error: "Failed to process AI response" };
    }
}
