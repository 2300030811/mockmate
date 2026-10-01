import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

const mockCreateServerClient = vi.fn();
const mockCreateClient = vi.fn();
const mockCookieStore = {
  getAll: vi.fn(),
  set: vi.fn(),
};
const mockCookies = vi.fn(() => mockCookieStore);

vi.mock("@supabase/ssr", () => ({
  createServerClient: (...args: any[]) => mockCreateServerClient(...args),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: (...args: any[]) => mockCreateClient(...args),
}));

vi.mock("next/headers", () => ({
  cookies: () => mockCookies(),
}));

describe("Supabase Client Utilities", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe("createAdminClient (utils/supabase/admin.ts)", () => {
    it("creates client with real credentials when URL and long service key exist", async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
      process.env.SUPABASE_SERVICE_ROLE_KEY = "super-secret-service-role-key-over-twenty-chars";

      const { createAdminClient } = await import("./admin");
      createAdminClient();

      expect(mockCreateClient).toHaveBeenCalledWith(
        "https://example.supabase.co",
        "super-secret-service-role-key-over-twenty-chars",
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      );
    });

    it("falls back to placeholder client when serviceRoleKey is missing or short", async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;

      const { createAdminClient } = await import("./admin");
      createAdminClient();

      expect(mockCreateClient).toHaveBeenCalledWith(
        "https://placeholder.supabase.co",
        "placeholder",
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      );
    });

    it("falls back when serviceRoleKey is present but shorter than 20 chars", async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
      process.env.SUPABASE_SERVICE_ROLE_KEY = "too-short";

      const { createAdminClient } = await import("./admin");
      createAdminClient();

      expect(mockCreateClient).toHaveBeenCalledWith(
        "https://example.supabase.co",
        "too-short",
        expect.any(Object)
      );
    });
  });

  describe("createClient (utils/supabase/server.ts)", () => {
    it("returns placeholder client and exercises its cookie handlers when env vars are missing", async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const { createClient } = await import("./server");
      createClient();

      expect(mockCreateServerClient).toHaveBeenCalledWith(
        "https://placeholder.supabase.co",
        "placeholder",
        expect.objectContaining({
          cookies: expect.any(Object),
        })
      );

      const placeholderOptions = mockCreateServerClient.mock.calls[0][2];
      expect(placeholderOptions.cookies.getAll()).toEqual([]);
      expect(() => placeholderOptions.cookies.setAll()).not.toThrow();
    });

    it("creates server client with options when credentials exist", async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key-12345";

      mockCookieStore.getAll.mockReturnValue([{ name: "sb-token", value: "xyz" }]);

      const { createClient } = await import("./server");
      createClient();

      expect(mockCreateServerClient).toHaveBeenCalledWith(
        "https://example.supabase.co",
        "anon-key-12345",
        expect.any(Object)
      );

      const options = mockCreateServerClient.mock.calls[0][2];

      // Test cookies.getAll
      expect(options.cookies.getAll()).toEqual([{ name: "sb-token", value: "xyz" }]);

      // Test cookies.setAll success
      options.cookies.setAll([
        { name: "cookie1", value: "val1", options: { path: "/" } },
      ]);
      expect(mockCookieStore.set).toHaveBeenCalledWith("cookie1", "val1", { path: "/" });

      // Test cookies.setAll ignoring error in Server Component
      mockCookieStore.set.mockImplementationOnce(() => {
        throw new Error("Cookies can only be modified in a Server Action");
      });
      expect(() => {
        options.cookies.setAll([{ name: "cookie2", value: "val2", options: {} }]);
      }).not.toThrow();

      // Test global.fetch wrapper
      const originalFetch = global.fetch;
      const mockFetch = vi.fn().mockResolvedValue(new Response());
      global.fetch = mockFetch;

      try {
        await options.global.fetch("https://example.supabase.co/rest/v1", {
          method: "GET",
        });
        expect(mockFetch).toHaveBeenCalledWith(
          "https://example.supabase.co/rest/v1",
          expect.objectContaining({
            method: "GET",
            signal: expect.any(AbortSignal),
          })
        );

        // Test with custom signal
        const customController = new AbortController();
        await options.global.fetch("https://example.supabase.co/rest/v1", {
          signal: customController.signal,
        });
        expect(mockFetch).toHaveBeenCalledWith(
          "https://example.supabase.co/rest/v1",
          expect.objectContaining({
            signal: customController.signal,
          })
        );
      } finally {
        global.fetch = originalFetch;
      }
    });
  });
});
