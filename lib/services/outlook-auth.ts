/**
 * Outlook / Microsoft Graph OAuth 2.0 Authentication Service.
 * Implements Azure AD Client Credentials flow with in-memory token caching.
 * Pure native fetch — zero external dependencies.
 */

export interface AzureAuthConfig {
  tenantId: string;
  clientId: string;
  clientSecret: string;
}

export interface CachedToken {
  accessToken: string;
  expiresAt: number; // Unix timestamp in ms
}

let inMemoryTokenCache: CachedToken | null = null;

/**
 * Reads Azure configuration strictly from server-side environment variables.
 */
export function getAzureAuthConfig(): AzureAuthConfig | null {
  const tenantId = process.env.AZURE_TENANT_ID;
  const clientId = process.env.AZURE_CLIENT_ID;
  const clientSecret = process.env.AZURE_CLIENT_SECRET;

  if (!tenantId || !clientId || !clientSecret) {
    return null;
  }

  return { tenantId, clientId, clientSecret };
}

/**
 * Clears in-memory token cache (used for unit testing and forced token rotation).
 */
export function clearTokenCache(): void {
  inMemoryTokenCache = null;
}

/**
 * Retrieves a valid Microsoft Graph OAuth 2.0 access token.
 * Uses cached token if valid; requests a new token 5 minutes before expiry.
 */
export async function getGraphAccessToken(
  customConfig?: AzureAuthConfig,
  customFetch: typeof fetch = fetch
): Promise<string> {
  const config = customConfig ?? getAzureAuthConfig();

  if (!config) {
    throw new Error(
      "Missing Azure AD configuration. Ensure AZURE_TENANT_ID, AZURE_CLIENT_ID, and AZURE_CLIENT_SECRET are set."
    );
  }

  const now = Date.now();

  // Return cached token if valid for at least 60 seconds
  if (inMemoryTokenCache && inMemoryTokenCache.expiresAt > now + 60_000) {
    return inMemoryTokenCache.accessToken;
  }

  const tokenUrl = `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`;
  const bodyParams = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    scope: "https://graph.microsoft.com/.default",
    grant_type: "client_credentials",
  });

  const response = await customFetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: bodyParams.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Azure AD token request failed with status ${response.status}: ${errorText}`
    );
  }

  const data = (await response.json()) as {
    access_token: string;
    expires_in: number;
    token_type: string;
  };

  if (!data.access_token) {
    throw new Error("Azure AD token response did not contain an access_token.");
  }

  // Cache token with a 5-minute safety buffer before expiration
  const bufferMs = Math.min(300, Math.floor(data.expires_in * 0.1)) * 1000;
  const expiresAt = now + data.expires_in * 1000 - bufferMs;

  inMemoryTokenCache = {
    accessToken: data.access_token,
    expiresAt,
  };

  return inMemoryTokenCache.accessToken;
}
