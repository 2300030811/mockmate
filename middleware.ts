import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

export default async function middleware(
  request: NextRequest,
  event: NextFetchEvent
): Promise<Response | undefined> {
  const ip = request.ip ?? "127.0.0.1";

  // 1. Rate limiting for production API routes
  if (
    request.nextUrl.pathname.startsWith("/api") &&
    process.env.NODE_ENV !== "development" &&
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    const ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.cachedFixedWindow(12, `${24 * 60 * 60}s`),
      ephemeralCache: new Map(),
      analytics: true,
    });

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

  return NextResponse.next();
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
      "/career-pathfinder/:path*"
  ],
};
