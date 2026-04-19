import { Groq } from 'groq-sdk';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getNextKey } from "@/utils/keyManager";
import { logger } from "@/lib/logger";

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

type ProviderName = 'groq' | 'gemini';

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

export class AIGateway {
    private static async createGroqStream(
        messages: ChatMessage[],
        systemPrompt: string,
        apiKey: string
    ): Promise<AsyncIterable<string>> {
        const groq = new Groq({ apiKey });
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

        return groqStreamToText(completion);
    }

    private static async createGeminiStream(
        messages: ChatMessage[],
        systemPrompt: string,
        apiKey: string
    ): Promise<AsyncIterable<string>> {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
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

    static async streamChat(messages: ChatMessage[], systemPrompt: string): Promise<ReadableStream> {
        const groqKey = getNextKey("GROQ_API_KEY");
        const geminiKey = getNextKey("GOOGLE_API_KEY");

        let providerUsed: ProviderName | null = null;
        let primaryStream: AsyncIterable<string> | null = null;

        if (groqKey) {
            try {
                logger.info("🦁 Bob is using Groq...");
                primaryStream = await this.createGroqStream(messages, systemPrompt, groqKey);
                providerUsed = 'groq';
            } catch (groqErr: unknown) {
                const message = groqErr instanceof Error ? groqErr.message : "Unknown error";
                logger.warn("⚠️ Bob Groq failed, falling back to Gemini:", message);
            }
        }

        if (!primaryStream && geminiKey) {
            try {
                logger.info("🦁 Bob is using Gemini...");
                primaryStream = await this.createGeminiStream(messages, systemPrompt, geminiKey);
                providerUsed = 'gemini';
            } catch (geminiErr: unknown) {
                const message = geminiErr instanceof Error ? geminiErr.message : "Unknown error";
                logger.warn("⚠️ Bob Gemini failed:", message);
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
                } catch (primaryStreamError) {
                    logger.error(`${providerUsed} stream error:`, primaryStreamError);

                    if (providerUsed === 'groq' && geminiKey) {
                        try {
                            emitText(STREAM_SWITCH_NOTICE);
                            const geminiFallbackStream = await AIGateway.createGeminiStream(messages, systemPrompt, geminiKey);
                            await pumpStream(geminiFallbackStream);
                        } catch (geminiStreamError) {
                            logger.error("Gemini fallback stream error:", geminiStreamError);
                            if (!emittedAnyContent) {
                                emitText("[Bob] I ran into a streaming issue. Please retry.");
                            } else {
                                emitText(STREAM_INTERRUPTED_NOTICE);
                            }
                        }
                    } else {
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
}
