import { StreamingTextResponse } from 'ai';
import { Groq } from 'groq-sdk';
import { BOB_SYSTEM_PROMPT } from '@/lib/constants';

const keys = (process.env.GROQ_API_KEY || '').split(',');
const apiKey = keys[Math.floor(Math.random() * keys.length)].trim();

const groq = new Groq({ apiKey });

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const { messages, data } = await req.json();

  const context = data?.context || '';

  const systemMessage = {
    role: 'system' as const,
    content: `${BOB_SYSTEM_PROMPT}

CONTEXT FROM CURRENT QUESTION:
${context}`,
  };

  const allMessages = [systemMessage, ...messages.map((m: { role: string; content: string }) => ({
    role: m.role as 'user' | 'assistant' | 'system',
    content: m.content,
  }))];

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    stream: true,
    messages: allMessages,
    temperature: 0.5,
    max_tokens: 1000,
  });

  // Convert Groq's AsyncIterable stream to a ReadableStream for StreamingTextResponse
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      for await (const chunk of completion) {
        const text = chunk.choices[0]?.delta?.content || '';
        if (text) {
          controller.enqueue(encoder.encode(text));
        }
      }
      controller.close();
    },
  });

  return new StreamingTextResponse(stream);
}
