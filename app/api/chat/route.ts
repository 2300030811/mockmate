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

    // --- STRATEGY: Groq (Llama 3) -> Gemini (Flash) ---
    
    // 1. ATTEMPT GROQ
    const groqKey = getNextKey("GROQ_API_KEY");
    if (groqKey) {
      try {
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
            try {
              for await (const chunk of completion) {
                const text = chunk.choices[0]?.delta?.content || '';
                if (text) controller.enqueue(encoder.encode(`0:${JSON.stringify(text)}\n`));
              }
            } catch (e) {
              console.error("Groq stream error:", e);
            } finally {
              controller.close();
            }
          },
        });

        return new Response(stream, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'x-vercel-ai-data-stream': 'v1',
          }
        });

      } catch (groqErr: any) {
        console.warn("⚠️ Bob Groq failed, falling back to Gemini:", groqErr.message);
      }
    }

    // 2. FALLBACK TO GEMINI
    const geminiKey = getNextKey("GOOGLE_API_KEY");
    if (geminiKey) {
      try {
        console.log("🦁 Bob is using Gemini...");
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ 
          model: "gemini-2.0-flash",
          systemInstruction: systemPrompt
        });

        const result = await model.generateContentStream({
          contents: messages
            .filter((m: any, i: number) => !(i === 0 && m.role === 'assistant'))
            .map((m: any) => ({
              role: m.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: m.content }]
            })),
          generationConfig: { temperature: 0.5, maxOutputTokens: 1000 }
        });

        const stream = new ReadableStream({
          async start(controller) {
            const encoder = new TextEncoder();
            try {
              for await (const chunk of result.stream) {
                const text = chunk.text();
                if (text) controller.enqueue(encoder.encode(`0:${JSON.stringify(text)}\n`));
              }
            } catch (e) {
              console.error("Gemini stream error:", e);
            } finally {
              controller.close();
            }
          }
        });

        return new Response(stream, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'x-vercel-ai-data-stream': 'v1',
          }
        });

      } catch (geminiErr: any) {
        console.warn("⚠️ Bob Gemini failed:", geminiErr.message);
      }
    }

    throw new Error("No AI services available.");

  } catch (error: any) {
    console.error("🔥 Bob Chat Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
