import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";
import { chromium } from "playwright";
import fs from "fs/promises";

vi.mock("playwright", () => ({
  chromium: {
    launch: vi.fn(),
  },
}));

vi.mock("fs/promises", () => ({
  default: {
    readFile: vi.fn(),
  },
}));

const launchMock = vi.mocked(chromium.launch);
const readFileMock = vi.mocked(fs.readFile);
const originalEnv = process.env;

function makeRequest(payload: unknown): Request {
  return new Request("http://localhost/api/resume/generate", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/resume/generate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    delete process.env.RESUME_PDF_TIMEOUT_MS;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("returns a generated PDF response", async () => {
    readFileMock.mockResolvedValue("<html><body>{{NAME}}</body></html>");

    const page = {
      setContent: vi.fn().mockResolvedValue(undefined),
      evaluate: vi.fn().mockResolvedValue(undefined),
      pdf: vi.fn().mockResolvedValue(Buffer.from("pdf-content")),
    };
    const browser = {
      newPage: vi.fn().mockResolvedValue(page),
      close: vi.fn().mockResolvedValue(undefined),
    };
    launchMock.mockResolvedValue(browser as never);

    const response = await POST(makeRequest({ name: "Jane Doe" }));

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/pdf");
    expect(response.headers.get("Content-Disposition")).toContain("resume.pdf");
    expect(browser.close).toHaveBeenCalledTimes(1);
    expect(page.pdf).toHaveBeenCalledTimes(1);
  });

  it("times out long-running render steps and still closes browser", async () => {
    process.env.RESUME_PDF_TIMEOUT_MS = "1";
    readFileMock.mockResolvedValue("<html><body>{{NAME}}</body></html>");

    const page = {
      setContent: vi.fn().mockImplementation(() => new Promise(() => undefined)),
      evaluate: vi.fn().mockResolvedValue(undefined),
      pdf: vi.fn().mockResolvedValue(Buffer.from("pdf-content")),
    };
    const browser = {
      newPage: vi.fn().mockResolvedValue(page),
      close: vi.fn().mockResolvedValue(undefined),
    };
    launchMock.mockResolvedValue(browser as never);

    const response = await POST(makeRequest({ name: "Jane Doe" }));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toContain("Timed out rendering resume HTML content.");
    expect(browser.close).toHaveBeenCalledTimes(1);
  });

  it("returns 400 for invalid payload shape", async () => {
    const response = await POST(makeRequest({ skills: "typescript" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Invalid resume payload.");
    expect(readFileMock).not.toHaveBeenCalled();
    expect(launchMock).not.toHaveBeenCalled();
  });

  it("escapes HTML fields and sanitizes unsafe URLs before rendering", async () => {
    readFileMock.mockResolvedValue(`
      <html>
        <body>
          <h1>{{NAME}}</h1>
          <span>{{EMAIL}}</span>
          <a href="{{LINKEDIN_URL}}">{{LINKEDIN_DISPLAY}}</a>
          <main>
            {{SUMMARY_SECTION}}
            {{COMPETENCIES_SECTION}}
            {{EXPERIENCE_SECTION}}
            {{PROJECTS_SECTION}}
            {{EDUCATION_SECTION}}
            {{CERTIFICATIONS_SECTION}}
            {{SKILLS_SECTION}}
          </main>
        </body>
      </html>
    `);

    const page = {
      setContent: vi.fn().mockResolvedValue(undefined),
      evaluate: vi.fn().mockResolvedValue(undefined),
      pdf: vi.fn().mockResolvedValue(Buffer.from("pdf-content")),
    };
    const browser = {
      newPage: vi.fn().mockResolvedValue(page),
      close: vi.fn().mockResolvedValue(undefined),
    };
    launchMock.mockResolvedValue(browser as never);

    const response = await POST(
      makeRequest({
        name: "<script>alert('x')</script>",
        email: "candidate@example.com",
        linkedin: "javascript:alert(1)",
        summary: "<img src=x onerror=alert(1)>",
        skills: ["React & TypeScript", "<b>Danger</b>"],
        experience: [
          {
            company: "<Acme>",
            period: "2024-2025",
            role: "Dev<script>",
            highlights: ["Built <tool>", "Increased KPI by 20%"],
          },
        ],
        projects: [
          {
            title: "<b>Secret Project</b>",
            period: "2025",
            description: "Built <script>alert(1)</script>",
            link: "javascript:alert(2)",
            techStack: ["React", "<svg>"]
          }
        ],
        education: [
          {
            program: "<M.Tech>",
            institution: "<Top University>",
            period: "2022-2024",
            details: "Thesis on <AI systems>",
          }
        ],
        certifications: [
          {
            name: "<Secure Cert>",
            issuer: "<Issuer>",
            year: "2025",
          }
        ],
      })
    );

    const renderedHtml = page.setContent.mock.calls[0]?.[0] as string;

    expect(response.status).toBe(200);
    expect(renderedHtml).toContain("&lt;script&gt;alert(&#39;x&#39;)&lt;/script&gt;");
    expect(renderedHtml).toContain("href=\"#\"");
    expect(renderedHtml).toContain("&lt;img src=x onerror=alert(1)&gt;");
    expect(renderedHtml).toContain("React &amp; TypeScript");
    expect(renderedHtml).toContain("&lt;b&gt;Danger&lt;/b&gt;");
    expect(renderedHtml).toContain("&lt;Acme&gt;");
    expect(renderedHtml).toContain("Dev&lt;script&gt;");
    expect(renderedHtml).toContain("&lt;b&gt;Secret Project&lt;/b&gt;");
    expect(renderedHtml).toContain("Built &lt;script&gt;alert(1)&lt;/script&gt;");
    expect(renderedHtml).toContain("Thesis on &lt;AI systems&gt;");
    expect(renderedHtml).toContain("&lt;Secure Cert&gt;");
    expect(renderedHtml).not.toContain("javascript:alert(1)");
    expect(renderedHtml).not.toContain("javascript:alert(2)");
    expect(browser.close).toHaveBeenCalledTimes(1);
  });
});