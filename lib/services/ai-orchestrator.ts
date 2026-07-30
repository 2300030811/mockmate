import { generateText, ChatMessage } from "@/lib/ai/gateway";
import { safeParseStructured } from "@/lib/ai/response-parser";
import { z } from "zod";

export interface AIStructuredResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  provider?: string;
  raw?: string;
}

export const aiOrchestrator = {
  /**
   * Generates freeform text/markdown output using the AI Gateway.
   */
  async generateText(
    messages: string | ChatMessage[],
    systemPrompt: string,
    providerPreference: "groq" | "gemini" | "auto" = "auto",
    options?: {
      temperature?: number;
      maxTokens?: number;
      model?: string;
      customApiKey?: string;
    }
  ): Promise<{ content: string; provider: "groq" | "gemini" }> {
    return generateText(messages, systemPrompt, providerPreference, options);
  },

  /**
   * Generates a validated JSON structure using the AI Gateway and Zod schema.
   */
  async generateStructured<Output, Def extends z.ZodTypeDef = z.ZodTypeDef, Input = any>(
    prompt: string | ChatMessage[],
    systemPrompt: string,
    schema: z.ZodType<Output, Def, Input>,
    providerPreference: "groq" | "gemini" | "auto" = "auto",
    options?: {
      temperature?: number;
      maxTokens?: number;
      model?: string;
      customApiKey?: string;
    }
  ): Promise<AIStructuredResult<Output>> {
    try {
      const responseFormat = providerPreference === "groq" || providerPreference === "auto"
        ? { type: "json_object" as const }
        : undefined;

      const result = await generateText(prompt, systemPrompt, providerPreference, {
        temperature: options?.temperature ?? 0.1,
        maxTokens: options?.maxTokens ?? 4000,
        model: options?.model,
        customApiKey: options?.customApiKey,
        responseFormat,
      });

      const parsed = safeParseStructured(result.content, schema);
      if (!parsed.success) {
        return {
          success: false,
          error: parsed.error,
          provider: result.provider,
          raw: result.content,
        };
      }

      return {
        success: true,
        data: parsed.data,
        provider: result.provider,
        raw: result.content,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || String(error),
      };
    }
  },
};
