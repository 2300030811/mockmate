import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getGraphAccessToken,
  clearTokenCache,
  getAzureAuthConfig,
  AzureAuthConfig,
} from "./outlook-auth";

describe("Outlook Auth Service (Azure AD Client Credentials)", () => {
  const dummyConfig: AzureAuthConfig = {
    tenantId: "test-tenant-uuid",
    clientId: "test-client-uuid",
    clientSecret: "test-client-secret-12345",
  };

  beforeEach(() => {
    clearTokenCache();
    vi.restoreAllMocks();
  });

  it("successfully requests and returns access token from Azure AD endpoint", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        access_token: "mock-jwt-bearer-token-xyz",
        expires_in: 3600,
        token_type: "Bearer",
      }),
    });

    const token = await getGraphAccessToken(dummyConfig, mockFetch as any);

    expect(token).toBe("mock-jwt-bearer-token-xyz");
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://login.microsoftonline.com/test-tenant-uuid/oauth2/v2.0/token",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: expect.stringContaining("grant_type=client_credentials"),
      })
    );
  });

  it("reuses cached access token when not expired", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        access_token: "cached-token-123",
        expires_in: 3600,
        token_type: "Bearer",
      }),
    });

    // First call fetches from endpoint
    const token1 = await getGraphAccessToken(dummyConfig, mockFetch as any);
    expect(token1).toBe("cached-token-123");
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Second call reuses cached token
    const token2 = await getGraphAccessToken(dummyConfig, mockFetch as any);
    expect(token2).toBe("cached-token-123");
    expect(mockFetch).toHaveBeenCalledTimes(1); // still 1!
  });

  it("throws error when Azure AD returns 401/403 or invalid credentials", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: vi.fn().mockResolvedValue("AADSTS7000215: Invalid client secret provided."),
    });

    await expect(
      getGraphAccessToken(dummyConfig, mockFetch as any)
    ).rejects.toThrow(/Azure AD token request failed with status 401/);
  });

  it("throws when configuration is missing and not present in process.env", async () => {
    const originalEnv = { ...process.env };
    delete process.env.AZURE_TENANT_ID;
    delete process.env.AZURE_CLIENT_ID;
    delete process.env.AZURE_CLIENT_SECRET;

    expect(getAzureAuthConfig()).toBeNull();

    await expect(getGraphAccessToken()).rejects.toThrow(
      /Missing Azure AD configuration/
    );

    process.env = originalEnv;
  });
});
