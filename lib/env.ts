import { z } from "zod";

const envSchema = z.object({
  // Server-side
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // Supabase (Required)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional().or(z.literal("")),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional().or(z.literal("")),
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
  JUDGE0_API_KEY: z.string().optional(),

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
  // In production, log but DON'T crash — many optional vars might not be set.
  // The app should degrade gracefully when specific features are unavailable.
  console.error("[env] Validation warnings:", JSON.stringify(_env.error.format(), null, 2));
}

// Use parsed values if valid, otherwise fall back to raw process.env with safe defaults
export const env = _env.success
  ? _env.data
  : ({
      NODE_ENV: (process.env.NODE_ENV as "development" | "test" | "production") || "development",
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
      UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
      GROQ_API_KEY: process.env.GROQ_API_KEY,
      RESEND_API_KEY: process.env.RESEND_API_KEY,
      FEEDBACK_EMAIL: process.env.FEEDBACK_EMAIL,
      JUDGE0_API_KEY: process.env.JUDGE0_API_KEY,
      AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT: process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT,
      AZURE_DOCUMENT_INTELLIGENCE_KEY: process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY,
      AZURE_SPEECH_KEY: process.env.AZURE_SPEECH_KEY,
      AZURE_SPEECH_REGION: process.env.AZURE_SPEECH_REGION,
      AZURE_STORAGE_CONNECTION_STRING: process.env.AZURE_STORAGE_CONNECTION_STRING,
      AWS_QUESTIONS_URL: process.env.AWS_QUESTIONS_URL,
      AZURE_QUESTIONS_URL: process.env.AZURE_QUESTIONS_URL,
      SALESFORCE_QUESTIONS_URL: process.env.SALESFORCE_QUESTIONS_URL,
      MONGODB_QUESTIONS_URL: process.env.MONGODB_QUESTIONS_URL,
      PCAP_QUESTIONS_URL: process.env.PCAP_QUESTIONS_URL,
      ORACLE_QUESTIONS_URL: process.env.ORACLE_QUESTIONS_URL,
      NEXT_PUBLIC_AZURE_FINAL_JSON_URL: process.env.NEXT_PUBLIC_AZURE_FINAL_JSON_URL,
    } satisfies Partial<z.infer<typeof envSchema>> as z.infer<typeof envSchema>);

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
