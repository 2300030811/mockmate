import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";

const updateSessionMock = vi.hoisted(() => vi.fn());
const rateLimitLimitMock = vi.hoisted(() => vi.fn());

async function loadMiddleware(options?: {
  nodeEnv?: "development" | "test" | "production";
  enableRedis?: boolean;
}) {
  const enableRedis = options?.enableRedis ?? true;
  const env = {
    NODE_ENV: options?.nodeEnv ?? "development",
    UPSTASH_REDIS_REST_URL: enableRedis ? "https://redis.example.com" : undefined,
    UPSTASH_REDIS_REST_TOKEN: enableRedis ? "token" : undefined,
  };

  vi.doMock("@/lib/env", () => ({ env }));

  vi.doMock("@/utils/supabase/middleware", () => ({
    updateSession: updateSessionMock,
  }));

  vi.doMock("@upstash/redis", () => ({
    Redis: {
      fromEnv: vi.fn(() => ({})),
    },
  }));

  vi.doMock("@upstash/ratelimit", () => {
    class MockRatelimit {
      static slidingWindow = vi.fn(() => "window");

      limit = rateLimitLimitMock;
    }

    return {
      Ratelimit: MockRatelimit,
    };
  });

  const module = await import("./middleware");
  return module.default;
}

describe("middleware", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("falls back to NextResponse.next when updateSession fails", async () => {
    updateSessionMock.mockRejectedValue(new Error("session timeout"));
    rateLimitLimitMock.mockResolvedValue({
      success: true,
      pending: Promise.resolve(),
      limit: 100,
      reset: 1000,
      remaining: 99,
    });

    const middleware = await loadMiddleware({ nodeEnv: "development" });
    const request = new NextRequest("http://localhost/dashboard");
    const waitUntil = vi.fn();

    const response = await middleware(request, { waitUntil } as never);

    expect(response).toBeDefined();
    expect(response?.status).toBe(200);
    expect(response?.headers.get("location")).toBeNull();
  });

  it("redirects API requests when rate limit is exceeded", async () => {
    updateSessionMock.mockResolvedValue(NextResponse.next());
    rateLimitLimitMock.mockResolvedValue({
      success: false,
      pending: Promise.resolve(),
      limit: 100,
      reset: 12345,
      remaining: 0,
    });

    const middleware = await loadMiddleware({ nodeEnv: "production" });
    const request = new NextRequest("http://localhost/api/chat");
    const waitUntil = vi.fn();

    const response = await middleware(request, { waitUntil } as never);

    expect(response).toBeDefined();
    expect(response?.status).toBe(307);
    expect(response?.headers.get("location")).toContain("/api/blocked");
    expect(response?.headers.get("X-RateLimit-Limit")).toBe("100");
    expect(response?.headers.get("X-RateLimit-Remaining")).toBe("0");
    expect(response?.headers.get("X-RateLimit-Reset")).toBe("12345");
    expect(waitUntil).toHaveBeenCalledTimes(1);
  });
});