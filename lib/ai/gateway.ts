import { Groq } from 'groq-sdk';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getNextKey, getNumKeys, reportKeyFailure, reportKeySuccess } from "@/utils/keyManager";
import { logger } from "@/lib/logger";
import { extractJsonObject } from "@/lib/ai/response-parser";
import { z } from "zod";

const GENERATE_TEXT_TIMEOUT_MS = 60_000;

export const ChatMessageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string(),
});

export const AI_MODELS = {
  DEFAULT: "qwen/qwen3.8-27b",
  FAST: "openai/gpt-oss-20b",
  STRUCTURED: "qwen/qwen3.8-27b",
} as const;

// ponytail: resolveGroqModel / resolveGeminiModel prevent cross-provider model leakage and normalize deprecated llama names
function resolveGroqModel(model?: string): string {
  if (!model || model.includes("llama-3") || model.startsWith("gemini-")) {
    return AI_MODELS.DEFAULT;
  }
  return model;
}

function resolveGeminiModel(model?: string): string {
  if (!model || model === "gemini-2.0-flash" || !model.startsWith("gemini-")) {
    return "gemini-2.5-flash";
  }
  return model;
}

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

const STREAM_INTERRUPTED_NOTICE =
    "\n\n[Bob] The response stream was interrupted by the provider. Please retry if you need the full answer.";
const STREAM_SWITCH_NOTICE =
    "\n\n[Bob] The primary model stream was interrupted. Switching provider to continue...\n\n";

function toDataStreamChunk(text: string): Uint8Array {
    const encoder = new TextEncoder();
    return encoder.encode(`0:${JSON.stringify(text)}\n`);
}

async function* groqStreamToText(completion: AsyncIterable<any>): AsyncGenerator<string> {
    for await (const chunk of completion) {
        const text = chunk?.choices?.[0]?.delta?.content || '';
        if (text) yield text;
    }
}

async function* geminiStreamToText(stream: AsyncIterable<any>): AsyncGenerator<string> {
    for await (const chunk of stream) {
        const text = chunk?.text?.() || '';
        if (text) yield text;
    }
}

async function createGroqStream(
    messages: ChatMessage[],
    systemPrompt: string,
    apiKey: string
): Promise<AsyncIterable<string>> {
    const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });
    const completion = await groq.chat.completions.create({
        model: AI_MODELS.DEFAULT,
        stream: true,
        messages: [
            { role: 'system', content: systemPrompt },
            ...messages
        ],
        temperature: 0.5,
        max_tokens: 1000,
    });

    return groqStreamToText(completion);
}

async function createGeminiStream(
    messages: ChatMessage[],
    systemPrompt: string,
    apiKey: string
): Promise<AsyncIterable<string>> {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: systemPrompt
    });

    const result = await model.generateContentStream({
        contents: messages
            .filter((m, i) => !(i === 0 && m.role === 'assistant'))
            .map((m) => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content }]
            })),
        generationConfig: { temperature: 0.5, maxOutputTokens: 1000 }
    });

    return geminiStreamToText(result.stream);
}

export async function generateText(
  messages: string | ChatMessage[],
  systemPrompt: string,
  providerPreference: "groq" | "gemini" | "auto" = "auto",
  options?: {
    temperature?: number;
    maxTokens?: number;
    model?: string;
    responseFormat?: { type: "json_object" };
    customApiKey?: string;
  }
): Promise<{ content: string; provider: "groq" | "gemini" }> {
  const messageHistory: ChatMessage[] = typeof messages === "string" 
    ? [{ role: "user", content: messages }] 
    : messages;

  // ponytail: qwen/qwen3.8-27b template requires ≥1 user message; inject one when callers pass an empty array (e.g. interview greeting)
  if (!messageHistory.some(m => m.role === "user")) {
    messageHistory.push({ role: "user", content: "Begin." });
  }

  const temp = options?.temperature ?? 0.5;
  const maxTokens = options?.maxTokens ?? 1000;

  const providersToTry: ("groq" | "gemini")[] = [];
  if (providerPreference === "groq") {
    providersToTry.push("groq");
  } else if (providerPreference === "gemini") {
    providersToTry.push("gemini");
  } else {
    providersToTry.push("groq");
    providersToTry.push("gemini");
  }

  let lastError: unknown;

  for (const provider of providersToTry) {
    if (provider === "groq") {
      const customKey = options?.customApiKey;
      const numGroqKeys = customKey ? 1 : (getNumKeys("GROQ_API_KEY") || 1);
      for (let attempt = 0; attempt < numGroqKeys; attempt++) {
        const apiKey = customKey || getNextKey("GROQ_API_KEY") || process.env.GROQ_API_KEY;
        if (!apiKey) {
          lastError = new Error("Groq API Key missing");
          continue;
        }

        try {
          logger.info(`🤖 [Gateway] Attempting Groq completion...`);
          const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });
          const primaryModel = resolveGroqModel(options?.model);
          const modelsToTry = [primaryModel];
          if (primaryModel === "qwen/qwen3.8-27b") {
            modelsToTry.push("openai/gpt-oss-120b");
          } else if (primaryModel === "openai/gpt-oss-120b") {
            modelsToTry.push("qwen/qwen3.8-27b");
          }

          let modelContent: string | null = null;
          let lastGroqError: unknown = null;

          for (const modelToUse of modelsToTry) {
            try {
              const effectiveMaxTokens = (modelToUse === "qwen/qwen3.8-27b" && maxTokens > 2000) ? 2000 : maxTokens;
              const completion = await Promise.race([
                groq.chat.completions.create({
                  model: modelToUse,
                  messages: [
                    { role: "system", content: systemPrompt },
                    ...messageHistory
                  ],
                  temperature: temp,
                  max_tokens: effectiveMaxTokens,
                  response_format: options?.responseFormat,
                }),
                new Promise<never>((_, reject) =>
                  setTimeout(() => reject(new DOMException("Groq request timed out", "AbortError")), GENERATE_TEXT_TIMEOUT_MS)
                ),
              ]);

              const content = completion.choices[0]?.message?.content || "";
              if (content) {
                modelContent = content;
                break;
              }
            } catch (modelErr: any) {
              lastGroqError = modelErr;
              const isRateLimit = modelErr?.status === 429 || modelErr?.message?.includes("rate_limit") || modelErr?.message?.includes("OTPM");
              if (isRateLimit && modelsToTry.indexOf(modelToUse) < modelsToTry.length - 1) {
                logger.warn(`⚠️ [Gateway] Model ${modelToUse} rate-limited on Groq. Trying fallback model ${modelsToTry[modelsToTry.indexOf(modelToUse) + 1]}...`);
                continue;
              }
              throw modelErr;
            }
          }

          if (modelContent) {
            if (!customKey) reportKeySuccess(apiKey);
            return { content: modelContent, provider: "groq" };
          }
          throw lastGroqError || new Error("Empty response from Groq");
        } catch (err: unknown) {
          logger.warn(`⚠️ [Gateway] Groq completion attempt failed:`, err);
          if (!customKey) reportKeyFailure(apiKey);
          lastError = err;
        }
      }
    } else if (provider === "gemini") {
      const customKey = options?.customApiKey;
      const numGeminiKeys = customKey ? 1 : (getNumKeys("GOOGLE_API_KEY") || getNumKeys("GEMINI_API_KEY") || 1);
      for (let attempt = 0; attempt < numGeminiKeys; attempt++) {
        const apiKey = customKey || getNextKey("GOOGLE_API_KEY") || getNextKey("GEMINI_API_KEY") || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
        if (!apiKey) {
          lastError = new Error("Gemini API Key missing");
          continue;
        }

        try {
          logger.info(`🤖 [Gateway] Attempting Gemini completion...`);
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({
            model: resolveGeminiModel(options?.model),
            systemInstruction: systemPrompt
          });

          const result = await Promise.race([
            model.generateContent({
              contents: messageHistory
                .filter(m => m.role !== 'system')
                .map(m => ({
                  role: m.role === 'assistant' ? 'model' : 'user',
                  parts: [{ text: m.content }]
                })),
              generationConfig: {
                temperature: temp,
                maxOutputTokens: maxTokens
              }
            }),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new DOMException("Gemini request timed out", "AbortError")), GENERATE_TEXT_TIMEOUT_MS)
            ),
          ]);

          const content = result.response.text();
          if (content) {
            if (!customKey) reportKeySuccess(apiKey);
            return { content, provider: "gemini" };
          }
          throw new Error("Empty response from Gemini");
        } catch (err: unknown) {
          logger.warn(`⚠️ [Gateway] Gemini completion attempt failed:`, err);
          if (!customKey) reportKeyFailure(apiKey);
          lastError = err;
        }
      }
    }
  }

  throw new Error(`AI Gateway generation failed: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
}

export async function generateStructuredOutput<T>(
  prompt: string,
  systemPrompt: string,
  schema: z.ZodType<T>,
  providerPreference: "groq" | "gemini" | "auto" = "auto",
  options?: { temperature?: number; model?: string }
): Promise<T> {
  const { content } = await generateText(prompt, systemPrompt, providerPreference, {
    temperature: options?.temperature ?? 0.1,
    maxTokens: 4000,
    model: options?.model
  });

  // ponytail: reuse extractJsonObject from response-parser instead of reimplementing fence-stripping + bracket-finding
  const jsonStr = extractJsonObject(content);
  if (!jsonStr) throw new Error("No JSON found in AI response");

  const parsed = JSON.parse(jsonStr);
  const validated = schema.parse(parsed);
  return validated;
}

export async function streamChat(messages: ChatMessage[], systemPrompt: string): Promise<ReadableStream> {
    const groqKey = getNextKey("GROQ_API_KEY");
    const geminiKey = getNextKey("GOOGLE_API_KEY") || getNextKey("GEMINI_API_KEY") || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

    let providerUsed: 'groq' | 'gemini' | null = null;
    let primaryStream: AsyncIterable<string> | null = null;

    if (groqKey) {
        try {
            logger.info("🤖 Bob is using Groq...");
            primaryStream = await createGroqStream(messages, systemPrompt, groqKey);
            providerUsed = 'groq';
        } catch (groqErr: unknown) {
            const message = groqErr instanceof Error ? groqErr.message : "Unknown error";
            logger.warn("⚠️ Bob Groq failed, falling back to Gemini:", message);
            reportKeyFailure(groqKey);
        }
    }

    if (!primaryStream && geminiKey) {
        try {
            logger.info("🤖 Bob is using Gemini...");
            primaryStream = await createGeminiStream(messages, systemPrompt, geminiKey);
            providerUsed = 'gemini';
        } catch (geminiErr: unknown) {
            const message = geminiErr instanceof Error ? geminiErr.message : "Unknown error";
            logger.warn("⚠️ Bob Gemini failed:", message);
            reportKeyFailure(geminiKey);
        }
    }

    if (!primaryStream || !providerUsed) {
        throw new Error("No AI services available.");
    }

    return new ReadableStream({
        async start(controller) {
            let emittedAnyContent = false;

            const emitText = (text: string) => {
                emittedAnyContent = emittedAnyContent || text.length > 0;
                controller.enqueue(toDataStreamChunk(text));
            };

            const pumpStream = async (stream: AsyncIterable<string>) => {
                for await (const text of stream) {
                    emitText(text);
                }
            };

            try {
                await pumpStream(primaryStream as AsyncIterable<string>);
                if (providerUsed === 'groq' && groqKey) reportKeySuccess(groqKey);
                if (providerUsed === 'gemini' && geminiKey) reportKeySuccess(geminiKey);
            } catch (primaryStreamError) {
                logger.error(`${providerUsed} stream error:`, primaryStreamError);
                if (providerUsed === 'groq' && groqKey) reportKeyFailure(groqKey);

                if (providerUsed === 'groq' && geminiKey) {
                    try {
                        emitText(STREAM_SWITCH_NOTICE);
                        const geminiFallbackStream = await createGeminiStream(messages, systemPrompt, geminiKey);
                        await pumpStream(geminiFallbackStream);
                        reportKeySuccess(geminiKey);
                    } catch (geminiStreamError) {
                        logger.error("Gemini fallback stream error:", geminiStreamError);
                        reportKeyFailure(geminiKey);
                        if (!emittedAnyContent) {
                            emitText("[Bob] I ran into a streaming issue. Please retry.");
                        } else {
                            emitText(STREAM_INTERRUPTED_NOTICE);
                        }
                    }
                } else {
                    if (providerUsed === 'gemini' && geminiKey) reportKeyFailure(geminiKey);
                    if (!emittedAnyContent) {
                        emitText("[Bob] I ran into a streaming issue. Please retry.");
                    } else {
                        emitText(STREAM_INTERRUPTED_NOTICE);
                    }
                }
            } finally {
                controller.close();
            }
        },
    });
}
