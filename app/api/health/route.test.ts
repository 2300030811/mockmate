import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { GET } from "./route";

const originalEnv = process.env;

describe("GET /api/health", () => {
  beforeEach(() => {
    process.env = { ...originalEnv };
    const mutableEnv = process.env as Record<string, string | undefined>;
    mutableEnv.NODE_ENV = "test";
    mutableEnv.npm_package_version = "9.9.9";
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("returns health metadata with no-store cache", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(body.status).toBe("ok");
    expect(typeof body.timestamp).toBe("string");
    expect(typeof body.uptime).toBe("number");
    expect(body.uptime).toBeGreaterThanOrEqual(0);
    expect(body.version).toBe("9.9.9");
    expect(body.environment).toBe("test");
  });

  it("falls back to defaults when environment variables are absent", async () => {
    const mutableEnv = process.env as Record<string, string | undefined>;
    delete mutableEnv.NODE_ENV;
    delete mutableEnv.npm_package_version;

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.version).toBe("0.1.0");
    expect(body.environment).toBe("development");
  });
});