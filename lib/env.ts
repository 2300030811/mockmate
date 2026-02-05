import { z } from "zod";

const envSchema = z.object({
  // Server-side
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  
  // Azure
  AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT: z.string().optional(),
  AZURE_DOCUMENT_INTELLIGENCE_KEY: z.string().optional(),
  
  AZURE_SPEECH_KEY: z.string().optional(),
  AZURE_SPEECH_REGION: z.string().optional(),
  
  AZURE_STORAGE_CONNECTION_STRING: z.string().optional(),
  
  AZURE_COSMOS_ENDPOINT: z.string().optional(),
  AZURE_COSMOS_KEY: z.string().optional(),

  // AI
  GOOGLE_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),

  // Upstash (Redis/Ratelimit) - Not in template but used in middleware
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Client-side (Validated but should be accessed via NEXT_PUBLIC_)
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
});

// Validate strictness based on context?
// For now, we allow optionals to prevent crash loops if a feature isn't used, 
// but we provide a helper to check them.

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Invalid environment variables:", _env.error.format());
  // In production, we might want to throw. In dev, just warn.
  if (process.env.NODE_ENV === "production") {
      throw new Error("Invalid environment variables");
  }
}

export const env = _env.success ? _env.data : process.env as unknown as z.infer<typeof envSchema>;

/**
 * Helper to ensure a server key exists or throw helpful error
 */
export function requireEnv(key: keyof z.infer<typeof envSchema>) {
    const value = env[key];
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
}
