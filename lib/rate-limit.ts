/**
 * Server-side rate limiter for Next.js Server Actions.
 *
 * Uses Upstash Redis when available (production), otherwise falls back to
 * an in-memory Map for development. This ensures AI-heavy actions like
 * quiz generation and interview chat can't be spammed.
 *
 * Usage:
 *   const { success } = await rateLimit("generate", userId || ip);
 *   if (!success) throw new Error("Too many requests");
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

// ── In-Memory Fallback for Development ──────────────────────────────────
const memoryStore = new Map<string, { count: number; resetAt: number }>();

function inMemoryRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { success: boolean; remaining: number } {
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || now > entry.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: maxRequests - 1 };
  }

  if (entry.count >= maxRequests) {
    return { success: false, remaining: 0 };
  }

  entry.count++;
  return { success: true, remaining: maxRequests - entry.count };
}

// ── Rate Limit Tiers ────────────────────────────────────────────────────
type RateLimitTier = "generate" | "chat" | "challenge" | "default";

const TIER_CONFIG: Record<RateLimitTier, { maxRequests: number; windowSeconds: number }> = {
  generate: { maxRequests: 10, windowSeconds: 3600 },      // 10 quiz generations per hour
  chat: { maxRequests: 60, windowSeconds: 600 },            // 60 chat messages per 10 minutes
  challenge: { maxRequests: 20, windowSeconds: 3600 },      // 20 challenge submissions per hour
  default: { maxRequests: 30, windowSeconds: 600 },         // 30 requests per 10 minutes
};

// ── Cached Upstash instances ────────────────────────────────────────────
const upstashLimiters = new Map<string, Ratelimit>();

function getUpstashLimiter(tier: RateLimitTier): Ratelimit | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }

  if (upstashLimiters.has(tier)) {
    return upstashLimiters.get(tier)!;
  }

  const config = TIER_CONFIG[tier];
  const limiter = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(config.maxRequests, `${config.windowSeconds}s`),
    analytics: true,
    prefix: `mockmate:ratelimit:${tier}`,
  });

  upstashLimiters.set(tier, limiter);
  return limiter;
}

// ── Get caller identifier ───────────────────────────────────────────────
import { cookies } from "next/headers";

function getCallerIdentifier(userId?: string | null): string {
  if (userId) return `user:${userId}`;

  // Fallback 1: Try a stored session ID from cookies if they have interacted with the site before
  try {
    const cookieStore = cookies();
    const guestSession = cookieStore.get('guest_session')?.value;
    if (guestSession) return `guest_session:${guestSession}`;
  } catch (e) {
    // Ignore cookie errors
  }

  // Fallback 2: IP Address with robust proxy parsing
  try {
    const headersList = headers();

    // Check multiple common headers for proxies/CDNs (Cloudflare, Vercel, generic)
    const forwardedFor = headersList.get("x-forwarded-for");
    const realIp = headersList.get("x-real-ip");
    const cfConnectingIp = headersList.get("cf-connecting-ip");
    const vercelIp = headersList.get("x-vercel-forwarded-for");

    // Grab the first valid IP found
    const ipStr = cfConnectingIp || vercelIp || realIp || (forwardedFor?.split(",")[0]?.trim());

    if (ipStr) return `ip:${ipStr}`;

    return "ip:unknown";
  } catch {
    return "ip:unknown";
  }
}

// ── Main Export ──────────────────────────────────────────────────────────
/**
 * Rate limits a server action call.
 *
 * @param tier    - The rate limit tier (determines max requests & window)
 * @param userId  - Optional user ID for authenticated requests
 * @returns       - { success: boolean, remaining: number }
 */
export async function rateLimit(
  tier: RateLimitTier = "default",
  userId?: string | null
): Promise<{ success: boolean; remaining: number }> {
  const identifier = getCallerIdentifier(userId);
  const config = TIER_CONFIG[tier];

  // Production: Use Upstash Redis
  const limiter = getUpstashLimiter(tier);
  if (limiter) {
    const result = await limiter.limit(identifier);
    return { success: result.success, remaining: result.remaining };
  }

  // Development: Use in-memory fallback
  return inMemoryRateLimit(
    `${tier}:${identifier}`,
    config.maxRequests,
    config.windowSeconds * 1000
  );
}
