import { describe, it, expect, vi, beforeEach } from "vitest";
import { callGraphApi, OutlookApiError, resolveGraphUrl } from "./outlook-client";
import * as authService from "./outlook-auth";

describe("Microsoft Graph REST Client", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(authService, "getGraphAccessToken").mockResolvedValue("mock-access-token");
  });

  it("resolves relative endpoints to Graph v1.0 base URL and preserves full URLs", () => {
    expect(resolveGraphUrl("/me/messages")).toBe("https://graph.microsoft.com/v1.0/me/messages");
    expect(resolveGraphUrl("users/placement@klu.ac.in/messages/delta")).toBe(
      "https://graph.microsoft.com/v1.0/users/placement@klu.ac.in/messages/delta"
    );
    expect(
      resolveGraphUrl("https://graph.microsoft.com/v1.0/users/delta?$deltatoken=xyz")
    ).toBe("https://graph.microsoft.com/v1.0/users/delta?$deltatoken=xyz");
  });

  it("executes successful GET request with Bearer token header", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ value: [{ id: "msg-1", subject: "Campus Drive" }] }),
    });

    const res = await callGraphApi<{ value: Array<{ id: string; subject: string }> }>(
      "/users/placement@klu.ac.in/messages",
      { customFetch: mockFetch as any }
    );

    expect(res.value.length).toBe(1);
    expect(res.value[0].subject).toBe("Campus Drive");
    expect(mockFetch).toHaveBeenCalledWith(
      "https://graph.microsoft.com/v1.0/users/placement@klu.ac.in/messages",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Authorization: "Bearer mock-access-token",
          Accept: "application/json",
        }),
      })
    );
  });

  it("retries on HTTP 429 Throttling adhering to Retry-After", async () => {
    let callCount = 0;
    const mockFetch = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({
          ok: false,
          status: 429,
          headers: new Headers({ "Retry-After": "0" }), // 0 sec for instant test
          json: vi.fn().mockResolvedValue({ error: { code: "TooManyRequests" } }),
        });
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ value: [{ id: "msg-after-throttle" }] }),
      });
    });

    const res = await callGraphApi<{ value: Array<{ id: string }> }>(
      "/users/placement@klu.ac.in/messages",
      { customFetch: mockFetch as any, maxRetries: 2, retryDelayMs: 10 }
    );

    expect(callCount).toBe(2);
    expect(res.value[0].id).toBe("msg-after-throttle");
  });

  it("classifies HTTP 410 Gone error with is410=true for delta token invalidation", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 410,
      headers: new Headers(),
      json: vi.fn().mockResolvedValue({ error: { code: "ResyncRequired" } }),
    });

    await expect(
      callGraphApi("/users/placement@klu.ac.in/messages/delta", {
        customFetch: mockFetch as any,
        maxRetries: 0,
      })
    ).rejects.toMatchObject({
      name: "OutlookApiError",
      status: 410,
      is410: true,
      code: "ResyncRequired",
    });
  });

  it("injects custom headers such as Prefer timezone", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ value: [] }),
    });

    await callGraphApi("/users/placement@klu.ac.in/calendarView", {
      headers: { Prefer: 'outlook.timezone="India Standard Time"' },
      customFetch: mockFetch as any,
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/calendarView"),
      expect.objectContaining({
        headers: expect.objectContaining({
          Prefer: 'outlook.timezone="India Standard Time"',
        }),
      })
    );
  });
});
