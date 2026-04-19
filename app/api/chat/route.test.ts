import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";
import { AIGateway } from "@/lib/ai/chat-gateway";

vi.mock("@/lib/ai/chat-gateway", () => ({
  AIGateway: {
    streamChat: vi.fn(),
  },
}));

const streamChatMock = vi.mocked(AIGateway.streamChat);

function makeRequest(payload: unknown): Request {
  return new Request("http://localhost/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

describe("POST /api/chat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects invalid request payloads", async () => {
    const response = await POST(
      makeRequest({
        messages: [{ role: "invalid", content: 123 }],
      })
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Invalid request payload");
    expect(streamChatMock).not.toHaveBeenCalled();
  });

  it("streams chat output with expected headers", async () => {
    streamChatMock.mockResolvedValue("stream-output" as never);

    const response = await POST(
      makeRequest({
        messages: [{ role: "user", content: "Hello Bob" }],
        data: { context: "current question context" },
      })
    );
    const bodyText = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/plain");
    expect(response.headers.get("x-vercel-ai-data-stream")).toBe("v1");
    expect(bodyText).toBe("stream-output");
    expect(streamChatMock).toHaveBeenCalledWith(
      [{ role: "user", content: "Hello Bob" }],
      expect.stringContaining("current question context")
    );
  });

  it("returns 500 when chat gateway fails", async () => {
    streamChatMock.mockRejectedValue(new Error("gateway failure"));

    const response = await POST(
      makeRequest({
        messages: [{ role: "user", content: "Hello Bob" }],
      })
    );
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("gateway failure");
  });
});