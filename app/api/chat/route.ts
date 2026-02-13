import { StreamingTextResponse } from 'ai';
import { Groq } from 'groq-sdk';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { BOB_SYSTEM_PROMPT } from '@/lib/constants';
import { getNextKey } from "@/utils/keyManager";

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { messages, data } = await req.json();
    const context = data?.context || '';

    const systemPrompt = `${BOB_SYSTEM_PROMPT}\n\nCONTEXT FROM CURRENT QUESTION:\n${context}`;

    // --- STRATEGY: Gemini (Flash) -> Groq (Llama 3) ---
    
    // 1. ATTEMPT GEMINI
    const geminiKey = getNextKey("GOOGLE_API_KEY");
    if (geminiKey) {
      try {
        console.log("🦁 Bob is using Gemini...");
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContentStream({
          contents: [
            { role: 'user', parts: [{ text: systemPrompt }] },
            ...messages.map((m: any) => ({
              role: m.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: m.content }]
            }))
          ],
          generationConfig: { temperature: 0.5, maxOutputTokens: 1000 }
        });

        const stream = new ReadableStream({
          async start(controller) {
            const encoder = new TextEncoder();
            for await (const chunk of result.stream) {
              const text = chunk.text();
              if (text) controller.enqueue(encoder.encode(text));
            }
            controller.close();
          }
        });

        return new StreamingTextResponse(stream);

      } catch (geminiErr: any) {
        console.warn("⚠️ Bob Gemini failed, falling back to Groq:", geminiErr.message);
      }
    }

    // 2. FALLBACK TO GROQ
    const groqKey = getNextKey("GROQ_API_KEY");
    if (!groqKey) throw new Error("No AI keys available for Bob");

    console.log("🦁 Bob is using Groq...");
    const groq = new Groq({ apiKey: groqKey });
    
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      temperature: 0.5,
      max_tokens: 1000,
    });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        for await (const chunk of completion) {
          const text = chunk.choices[0]?.delta?.content || '';
          if (text) controller.enqueue(encoder.encode(text));
        }
        controller.close();
      },
    });

    return new StreamingTextResponse(stream);

  } catch (error: any) {
    console.error("🔥 Bob Chat Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
