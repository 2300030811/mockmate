import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';
import { BOB_SYSTEM_PROMPT } from '@/lib/constants';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

// Create an OpenAI API client (that's edge friendly!)
const keys = (process.env.GROQ_API_KEY || '').split(',');
const apiKey = keys[Math.floor(Math.random() * keys.length)].trim();

const openai = new OpenAI({
  apiKey,
  baseURL: 'https://api.groq.com/openai/v1',
});

// IMPORTANT! Set the runtime to nodejs for broader compatibility
export const runtime = 'nodejs';

export async function POST(req: Request) {
  const { messages, data } = await req.json();

  // Extract context from data (current question info)
  const context = data?.context || '';


  // Modify the system prompt slightly based on context if needed
  const systemMessage: ChatCompletionMessageParam = {
    role: 'system',
    content: `${BOB_SYSTEM_PROMPT}

CONTEXT FROM CURRENT QUESTION:
${context}`,
  };

  // Combine system message with conversation history
  // Ensure messages from client are treated as compatible with OpenAI types
  const allMessages = [systemMessage, ...messages] as ChatCompletionMessageParam[];

  // Ask OpenAI for a streaming chat completion given the prompt
  const response = await openai.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    stream: true,
    messages: allMessages,
    temperature: 0.5,
    max_tokens: 1000,
  });

  // Convert the response into a friendly text-stream
  // OpenAIStream handles the stream type correctly
  // @ts-expect-error Library type mismatch between openai v4 and ai v3 regarding Azure specific fields
  const stream = OpenAIStream(response);
  // Respond with the stream
  return new StreamingTextResponse(stream);
}
