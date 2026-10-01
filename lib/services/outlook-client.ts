/**
 * Microsoft Graph REST Client.
 * Communicates with Graph v1.0 using native fetch, automatic OAuth 2.0 bearer token injection,
 * HTTP 429 throttling handling with Retry-After, exponential backoff, and 410 Gone error classification.
 */

import { getGraphAccessToken, AzureAuthConfig } from "./outlook-auth";

const GRAPH_BASE_URL = "https://graph.microsoft.com/v1.0";

export class OutlookApiError extends Error {
  status: number;
  code?: string;
  is429: boolean;
  is410: boolean;
  retryAfterSeconds?: number;

  constructor(
    message: string,
    status: number,
    code?: string,
    retryAfterSeconds?: number
  ) {
    super(message);
    this.name = "OutlookApiError";
    this.status = status;
    this.code = code;
    this.is429 = status === 429;
    this.is410 = status === 410;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export interface GraphRequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: unknown;
  customAuth?: AzureAuthConfig;
  customFetch?: typeof fetch;
  maxRetries?: number;
  retryDelayMs?: number;
}

/**
 * Resolves a relative Graph path or an absolute URL (such as nextLink/deltaLink).
 */
export function resolveGraphUrl(endpointOrUrl: string): string {
  if (endpointOrUrl.startsWith("http://") || endpointOrUrl.startsWith("https://")) {
    return endpointOrUrl;
  }
  const cleanEndpoint = endpointOrUrl.startsWith("/")
    ? endpointOrUrl
    : `/${endpointOrUrl}`;
  return `${GRAPH_BASE_URL}${cleanEndpoint}`;
}

/**
 * Executes a request against Microsoft Graph with throttling and retry handling.
 */
export async function callGraphApi<T = unknown>(
  endpointOrUrl: string,
  options: GraphRequestOptions = {}
): Promise<T> {
  const {
    method = "GET",
    headers = {},
    body,
    customAuth,
    customFetch = fetch,
    maxRetries = 3,
    retryDelayMs = 500,
  } = options;

  const url = resolveGraphUrl(endpointOrUrl);
  let attempt = 0;

  while (attempt <= maxRetries) {
    const accessToken = await getGraphAccessToken(customAuth, customFetch);

    const requestHeaders: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      ...headers,
    };

    let requestBody: string | undefined = undefined;
    if (body) {
      requestHeaders["Content-Type"] = "application/json";
      requestBody = typeof body === "string" ? body : JSON.stringify(body);
    }

    try {
      const response = await customFetch(url, {
        method,
        headers: requestHeaders,
        body: requestBody,
      });

      if (response.ok) {
        // Return null for 204 No Content
        if (response.status === 204) {
          return null as T;
        }
        return (await response.json()) as T;
      }

      // Handle HTTP 429 Throttling
      if (response.status === 429) {
        const retryAfterHeader = response.headers.get("Retry-After");
        const retrySeconds = retryAfterHeader
          ? parseInt(retryAfterHeader, 10) || 2
          : 2;

        if (attempt < maxRetries) {
          attempt++;
          const waitMs = retrySeconds * 1000;
          await new Promise((resolve) => setTimeout(resolve, waitMs));
          continue;
        }

        throw new OutlookApiError(
          `Microsoft Graph throttled request (HTTP 429) after ${maxRetries} retries.`,
          429,
          "TooManyRequests",
          retrySeconds
        );
      }

      // Handle HTTP 410 Gone (expired deltaLink)
      if (response.status === 410) {
        throw new OutlookApiError(
          "Microsoft Graph delta token has expired (HTTP 410 Gone). A full sync is required.",
          410,
          "ResyncRequired"
        );
      }

      // Handle transient server errors (500, 503, 504)
      if (
        (response.status === 500 ||
          response.status === 503 ||
          response.status === 504) &&
        attempt < maxRetries
      ) {
        attempt++;
        const backoffMs = retryDelayMs * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
        continue;
      }

      // Other client or server errors
      let errorBody = "";
      let errorCode: string | undefined;
      try {
        const errJson = await response.json();
        errorCode = errJson?.error?.code;
        errorBody = errJson?.error?.message || JSON.stringify(errJson);
      } catch {
        errorBody = await response.text();
      }

      throw new OutlookApiError(
        `Microsoft Graph request failed with status ${response.status}: ${errorBody}`,
        response.status,
        errorCode
      );
    } catch (err) {
      if (err instanceof OutlookApiError) {
        throw err;
      }

      // Network level failure retry
      if (attempt < maxRetries) {
        attempt++;
        const backoffMs = retryDelayMs * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
        continue;
      }

      throw new OutlookApiError(
        `Network error during Microsoft Graph request: ${(err as Error).message}`,
        0
      );
    }
  }

  throw new OutlookApiError("Exhausted maximum retry attempts for Microsoft Graph.", 0);
}
