import { z } from "zod";

const envSchema = z.object({
  // Server-side
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  
  // Supabase (Required)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(), // Optional for some client environments but recommended

  // Upstash (Required for Rate Limiting)
  UPSTASH_REDIS_REST_URL: z.preprocess((val) => val === "" ? undefined : val, z.string().url().optional()),
  UPSTASH_REDIS_REST_TOKEN: z.preprocess((val) => val === "" ? undefined : val, z.string().min(1).optional()),

  // Azure
  AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT: z.string().optional(),
  AZURE_DOCUMENT_INTELLIGENCE_KEY: z.string().optional(),
  
  AZURE_SPEECH_KEY: z.string().optional(),
  AZURE_SPEECH_REGION: z.string().optional(),
  
  AZURE_STORAGE_CONNECTION_STRING: z.string().optional(),

  // AI
  GOOGLE_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  FEEDBACK_EMAIL: z.string().email().optional(),

  // Quiz Data Sources
  AWS_QUESTIONS_URL: z.string().url().optional(),
  AZURE_QUESTIONS_URL: z.string().url().optional(),
  SALESFORCE_QUESTIONS_URL: z.string().url().optional(),
  MONGODB_QUESTIONS_URL: z.string().url().optional(),
  PCAP_QUESTIONS_URL: z.string().url().optional(),
  ORACLE_QUESTIONS_URL: z.string().url().optional(),

  // Legacy/Unsure
  NEXT_PUBLIC_AZURE_FINAL_JSON_URL: z.string().url().optional(),

  // Client-side (Validated but should be accessed via NEXT_PUBLIC_)
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
});

// Validate strictness based on context?
// For now, we allow optionals to prevent crash loops if a feature isn't used, 
// but we provide a helper to check them.

import { logger } from "./logger";

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  logger.error("Invalid environment variables", _env.error.format());
  throw new Error("Invalid environment variables. Stop Server.");
}

export const env = _env.data;

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
