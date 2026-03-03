/**
 * Server-side rate limiter for Next.js Server Actions.
 *
 * Uses Upstash Redis when available (production), otherwise falls back to
 * an in-memory Map for development. This ensures AI-heavy actions like
 * quiz generation and interview chat can't be spammed.
 *
 * Usage:
 *   const { success, message } = await rateLimit("generate", userId);
 *   if (!success) return { error: message || "Too many requests" };
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers, cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

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
  generate: { maxRequests: 100, windowSeconds: 86400 },     // 100 quiz generations per day (authenticated)
  chat: { maxRequests: 200, windowSeconds: 3600 },           // 200 chat messages per hour
  challenge: { maxRequests: 50, windowSeconds: 3600 },       // 50 challenge submissions per hour
  default: { maxRequests: 120, windowSeconds: 3600 },        // 120 requests per hour
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

async function getCallerAuth(userId?: string | null): Promise<{ identifier: string; isGuest: boolean }> {
  if (userId) return { identifier: `user:${userId}`, isGuest: false };

  // Check auth session Server-side
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) return { identifier: `user:${user.id}`, isGuest: false };
  } catch (e) {
    // Ignore if not in request context
  }

  // Fallback 1: Try a stored session ID from cookies if they have interacted with the site before
  try {
    const cookieStore = cookies();
    const guestSession = cookieStore.get('guest_session')?.value;
    if (guestSession) return { identifier: `guest_session:${guestSession}`, isGuest: true };
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

    if (ipStr) return { identifier: `ip:${ipStr}`, isGuest: true };

    return { identifier: "ip:unknown", isGuest: true };
  } catch {
    return { identifier: "ip:unknown", isGuest: true };
  }
}

// ── Main Export ──────────────────────────────────────────────────────────
/**
 * Rate limits a server action call.
 * Authenticated users: generous tier-based limits
 * Guest accounts: 10 uses per 24 hours total across AI features
 *
 * @param tier    - The rate limit tier
 * @param passedUserId  - Optional user ID for authenticated requests
 * @returns       - { success: boolean, remaining: number, message?: string }
 */
export async function rateLimit(
  tier: RateLimitTier = "default",
  passedUserId?: string | null
): Promise<{ success: boolean; remaining: number; message?: string }> {
  const { identifier, isGuest } = await getCallerAuth(passedUserId);

  if (!isGuest) {
    // Authenticated users get tier-based rate limits
    const config = TIER_CONFIG[tier];
    const authErrorMessage = `Rate limit exceeded. You've hit the maximum of ${config.maxRequests} ${tier} requests. Please wait before trying again.`;

    // Production: Use Upstash Redis
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      const limiter = getUpstashLimiter(tier);
      if (limiter) {
        const result = await limiter.limit(identifier);
        return {
          success: result.success,
          remaining: result.remaining,
          message: result.success ? undefined : authErrorMessage,
        };
      }
    }

    // Development: Use in-memory fallback
    const res = inMemoryRateLimit(
      `${tier}:${identifier}`,
      config.maxRequests,
      config.windowSeconds * 1000
    );
    return {
      ...res,
      message: res.success ? undefined : authErrorMessage,
    };
  }

  // Guests get strictly rate limited to 10 uses per 24 hours
  const guestTier = "guest_ai_daily_quota";
  const errorMessage = "Authentication is required for more usage. You have hit your daily quota for guest accounts (10/day). Please create an account to use AI features freely!";

  // Production: Use Upstash Redis (cached like authenticated tiers)
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    let limiter = upstashLimiters.get(guestTier);
    if (!limiter) {
      limiter = new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(10, "86400s"),
        analytics: true,
        prefix: `mockmate:ratelimit:${guestTier}`,
      });
      upstashLimiters.set(guestTier, limiter);
    }
    const result = await limiter.limit(identifier);
    return {
      success: result.success,
      remaining: result.remaining,
      message: result.success ? undefined : errorMessage
    };
  }

  // Development: Use in-memory fallback
  const res = inMemoryRateLimit(
    `${guestTier}:${identifier}`,
    10,
    86400 * 1000
  );
  return {
    ...res,
    message: res.success ? undefined : errorMessage
  };
}
