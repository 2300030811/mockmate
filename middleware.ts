import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

import { env } from "@/lib/env";

const redis = (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN)
  ? Redis.fromEnv()
  : null;

const ratelimit = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "60s"),
  ephemeralCache: new Map(),
  analytics: true,
}) : null;

export default async function middleware(
  request: NextRequest,
  event: NextFetchEvent
): Promise<Response | undefined> {
  const ip = request.ip ?? "127.0.0.1";

  // 1. Update Supabase session (handles auth sync)
  const supabaseResponse = await updateSession(request);

  // 2. Rate limiting for production API routes
  if (
    request.nextUrl.pathname.startsWith("/api") &&
    env.NODE_ENV !== "development" &&
    ratelimit
  ) {
    const { success, pending, limit, reset, remaining } = await ratelimit.limit(
      `ratelimit_middleware_${ip}`
    );
    event.waitUntil(pending);

    if (!success) {
      const res = NextResponse.redirect(new URL("/api/blocked", request.url));
      res.headers.set("X-RateLimit-Limit", limit.toString());
      res.headers.set("X-RateLimit-Remaining", remaining.toString());
      res.headers.set("X-RateLimit-Reset", reset.toString());
      return res;
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/api/:path*",
    "/aws-quiz/:path*",
    "/azure-quiz/:path*",
    "/mongodb-quiz/:path*",
    "/salesforce-quiz/:path*",
    "/pcap-quiz/:path*",
    "/oracle-quiz/:path*",
    "/career-path/:path*"
  ],
};
