import { BOB_SYSTEM_PROMPT } from '@/lib/constants';
import { AIGateway } from '@/lib/ai/chat-gateway';

export const runtime = 'nodejs';

import { z } from 'zod';

const ChatMessageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant']),
  content: z.string(),
});

const RequestDataSchema = z.object({
  messages: z.array(ChatMessageSchema),
  data: z.object({
    context: z.string().optional(),
  }).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = RequestDataSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Invalid request payload", details: parsed.error.format() }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { messages, data } = parsed.data;

    // --- SECURITY: Auth Check (Removed to allow guests) ---
    // Note: Guests are still protected by our strict IP/Rate-Limiting firewall logic.
    // We intentionally allow anonymous users to try the AI.

    const context = data?.context || '';

    const systemPrompt = `${BOB_SYSTEM_PROMPT}\n\nCONTEXT FROM CURRENT QUESTION:\n${context}`;

    // --- STRATEGY: Groq (Llama 3) -> Gemini (Flash) ---
    // Delegated to AIGateway
    const stream = await AIGateway.streamChat(messages, systemPrompt);

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'x-vercel-ai-data-stream': 'v1',
      }
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("🔥 Bob Chat Error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
