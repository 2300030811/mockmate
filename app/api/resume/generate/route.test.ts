import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";
import sparticuzChromium from "@sparticuz/chromium";
import { chromium } from "playwright-core";
import fs from "fs/promises";

vi.mock("playwright-core", () => ({
  chromium: {
    launch: vi.fn(),
  },
}));

vi.mock("@sparticuz/chromium", () => ({
  default: {
    args: ["--no-sandbox"],
    executablePath: vi.fn().mockResolvedValue("/tmp/chromium"),
  },
}));

vi.mock("fs/promises", () => ({
  default: {
    readFile: vi.fn(),
  },
}));

const launchMock = vi.mocked(chromium.launch);
const executablePathMock = vi.mocked(sparticuzChromium.executablePath);
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
    process.env = { ...process.env, NODE_ENV: "test" };
    delete process.env.VERCEL;
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
    const context = {
      newPage: vi.fn().mockResolvedValue(page),
      close: vi.fn().mockResolvedValue(undefined),
    };
    const browser = {
      newContext: vi.fn().mockResolvedValue(context),
      close: vi.fn().mockResolvedValue(undefined),
    };
    launchMock.mockResolvedValue(browser as never);

    const response = await POST(makeRequest({ name: "Jane Doe" }));

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/pdf");
    expect(response.headers.get("Content-Disposition")).toContain("resume.pdf");
    expect(readFileMock).toHaveBeenCalledWith(expect.stringContaining("resume-base.html"), "utf-8");
    expect(executablePathMock).not.toHaveBeenCalled();
    expect(browser.newContext).toHaveBeenCalledTimes(1);
    expect(context.close).toHaveBeenCalledTimes(1);
    expect(browser.close).toHaveBeenCalledTimes(1);
    expect(page.pdf).toHaveBeenCalledTimes(1);
  });

  it("loads RenderCV template when templateId is rendercv", async () => {
    readFileMock.mockResolvedValue("<html><body>{{NAME}}</body></html>");

    const page = {
      setContent: vi.fn().mockResolvedValue(undefined),
      evaluate: vi.fn().mockResolvedValue(undefined),
      pdf: vi.fn().mockResolvedValue(Buffer.from("pdf-content")),
    };
    const context = {
      newPage: vi.fn().mockResolvedValue(page),
      close: vi.fn().mockResolvedValue(undefined),
    };
    const browser = {
      newContext: vi.fn().mockResolvedValue(context),
      close: vi.fn().mockResolvedValue(undefined),
    };
    launchMock.mockResolvedValue(browser as never);

    const response = await POST(makeRequest({ name: "Jane Doe", templateId: "rendercv" }));

    expect(response.status).toBe(200);
    expect(readFileMock).toHaveBeenCalledWith(expect.stringContaining("resume-rendercv.html"), "utf-8");
  });

  it("uses PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH outside Vercel runtime", async () => {
    process.env = {
      ...process.env,
      PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH: "C:/Browsers/chrome.exe",
    };
    readFileMock.mockResolvedValue("<html><body>{{NAME}}</body></html>");

    const page = {
      setContent: vi.fn().mockResolvedValue(undefined),
      evaluate: vi.fn().mockResolvedValue(undefined),
      pdf: vi.fn().mockResolvedValue(Buffer.from("pdf-content")),
    };
    const context = {
      newPage: vi.fn().mockResolvedValue(page),
      close: vi.fn().mockResolvedValue(undefined),
    };
    const browser = {
      newContext: vi.fn().mockResolvedValue(context),
      close: vi.fn().mockResolvedValue(undefined),
    };
    launchMock.mockResolvedValue(browser as never);

    const response = await POST(makeRequest({ name: "Jane Doe" }));

    expect(response.status).toBe(200);
    expect(executablePathMock).not.toHaveBeenCalled();
    expect(launchMock).toHaveBeenCalledWith(
      expect.objectContaining({
        executablePath: "C:/Browsers/chrome.exe",
        headless: true,
      })
    );
  });

  it("uses sparticuz executable path on production serverless runtime", async () => {
    process.env = { ...process.env, NODE_ENV: "production", VERCEL: "1" };
    readFileMock.mockResolvedValue("<html><body>{{NAME}}</body></html>");

    const page = {
      setContent: vi.fn().mockResolvedValue(undefined),
      evaluate: vi.fn().mockResolvedValue(undefined),
      pdf: vi.fn().mockResolvedValue(Buffer.from("pdf-content")),
    };
    const context = {
      newPage: vi.fn().mockResolvedValue(page),
      close: vi.fn().mockResolvedValue(undefined),
    };
    const browser = {
      newContext: vi.fn().mockResolvedValue(context),
      close: vi.fn().mockResolvedValue(undefined),
    };
    launchMock.mockResolvedValue(browser as never);

    const response = await POST(makeRequest({ name: "Jane Doe" }));

    expect(response.status).toBe(200);
    expect(executablePathMock).toHaveBeenCalledTimes(1);
    expect(launchMock).toHaveBeenCalledWith(
      expect.objectContaining({
        args: ["--no-sandbox"],
        executablePath: "/tmp/chromium",
        headless: true,
      })
    );
  });

  it("times out long-running render steps and still closes browser", async () => {
    process.env.RESUME_PDF_TIMEOUT_MS = "50";
    readFileMock.mockResolvedValue("<html><body>{{NAME}}</body></html>");

    const page = {
      setContent: vi.fn().mockImplementation(() => new Promise(() => undefined)),
      evaluate: vi.fn().mockResolvedValue(undefined),
      pdf: vi.fn().mockResolvedValue(Buffer.from("pdf-content")),
    };
    const context = {
      newPage: vi.fn().mockResolvedValue(page),
      close: vi.fn().mockResolvedValue(undefined),
    };
    const browser = {
      newContext: vi.fn().mockResolvedValue(context),
      close: vi.fn().mockResolvedValue(undefined),
    };
    launchMock.mockResolvedValue(browser as never);

    const response = await POST(makeRequest({ name: "Jane Doe" }));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toContain("Timed out");
    expect(context.close).toHaveBeenCalledTimes(1);
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

  it("returns 400 for unsupported templateId", async () => {
    const response = await POST(makeRequest({ name: "Jane Doe", templateId: "legacy" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Invalid resume payload.");
    expect(readFileMock).not.toHaveBeenCalled();
  });

  it("escapes HTML fields and sanitizes unsafe URLs before rendering", async () => {
    readFileMock.mockResolvedValue(`
      <html>
        <body>
          <h1>{{NAME}}</h1>
          <div>{{CONTACT_ROW}}</div>
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
    const context = {
      newPage: vi.fn().mockResolvedValue(page),
      close: vi.fn().mockResolvedValue(undefined),
    };
    const browser = {
      newContext: vi.fn().mockResolvedValue(context),
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
    expect(renderedHtml).toContain("&lt;img src=x onerror=alert(1)&gt;");
    expect(renderedHtml).toContain("React &amp; TypeScript");
    expect(renderedHtml).toContain("&lt;b&gt;Danger&lt;/b&gt;");
    expect(renderedHtml).toContain("&lt;Acme&gt;");
    expect(renderedHtml).toContain("Dev&lt;script&gt;");
    expect(renderedHtml).toContain("&lt;b&gt;Secret Project&lt;/b&gt;");
    expect(renderedHtml).toContain("Built &lt;script&gt;alert(1)&lt;/script&gt;");
    expect(renderedHtml).toContain("Thesis on &lt;AI systems&gt;");
    expect(renderedHtml).toContain("&lt;Secure Cert&gt;");
    expect(renderedHtml).not.toContain("href=\"#\"");
    expect(renderedHtml).not.toContain("javascript:alert(1)");
    expect(renderedHtml).not.toContain("javascript:alert(2)");
    expect(browser.close).toHaveBeenCalledTimes(1);
  });
});