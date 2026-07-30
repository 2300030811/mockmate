import { describe, it, expect, vi, beforeEach } from "vitest";

const rateLimitMock = vi.hoisted(() => vi.fn());
const generateTextMock = vi.hoisted(() => vi.fn());

vi.mock("@/utils/sanitize", () => ({
  sanitizePromptInput: vi.fn((input: string) => input),
}));

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: rateLimitMock,
}));

vi.mock("@/lib/ai/gateway", () => ({
  generateText: generateTextMock,
  AI_MODELS: {
    DEFAULT: "llama-3.3-70b-versatile",
    FAST: "openai/gpt-oss-20b",
    STRUCTURED: "llama-3.3-70b-versatile",
  },
}));

describe("chatWithAI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    rateLimitMock.mockResolvedValue({ success: true, message: "" });
    generateTextMock.mockResolvedValue({
      content: "Hello, let's begin the interview.",
      provider: "groq",
    });
  });

  it("should return error for invalid messages", async () => {
    const { chatWithAI } = await import("@/app/actions/interview");
    const result = await chatWithAI({
      messages: [{ role: "invalid" as any, content: "" }],
      type: "behavioral"
    });
    expect(result.error).toBe("Invalid message format");
  });

  it("should return AI response for valid input", async () => {
    const { chatWithAI } = await import("@/app/actions/interview");
    const result = await chatWithAI({
      messages: [{ role: "user", content: "Hi, I'm ready for the interview." }],
      type: "behavioral"
    });
    expect(result.response).toBe("Hello, let's begin the interview.");
    expect(result.error).toBeUndefined();
  });

  it("should sanitize type to behavioral for invalid values", async () => {
    const { chatWithAI } = await import("@/app/actions/interview");
    const result = await chatWithAI({
      messages: [{ role: "user", content: "Hi" }],
      type: '<script>alert("xss")</script>'
    });
    expect(result.response).toBeTruthy();

    const systemPrompt = generateTextMock.mock.calls[0][1];
    expect(systemPrompt).toContain("behavioral");
    expect(systemPrompt).not.toContain("<script>");
  });

  it("should return error when gateway fails", async () => {
    generateTextMock.mockRejectedValue(new Error("Gateway error"));

    const { chatWithAI } = await import("@/app/actions/interview");
    const result = await chatWithAI({
      messages: [{ role: "user", content: "Hi" }],
      type: "technical"
    });
    expect(result.error).toBe("AI Service Unavailable");
    expect(result.response).toBe("");
  });

  it("should accept valid difficulty and topic parameters", async () => {
    const { chatWithAI } = await import("@/app/actions/interview");
    const result = await chatWithAI({
      messages: [{ role: "user", content: "Hi" }],
      type: "technical",
      difficulty: "senior",
      topic: "React"
    });
    expect(result.response).toBeTruthy();

    const systemPrompt = generateTextMock.mock.calls[0][1];
    expect(systemPrompt).toContain("senior");
    expect(systemPrompt).toContain("React");
  });

  it("should default difficulty to mid for invalid values", async () => {
    const { chatWithAI } = await import("@/app/actions/interview");
    await chatWithAI({
      messages: [{ role: "user", content: "Hi" }],
      type: "behavioral",
      difficulty: "expert" // invalid
    });

    const systemPrompt = generateTextMock.mock.calls[0][1];
    expect(systemPrompt).toContain("mid");
  });

  it("should pass custom model, temperature, and maxTokens to gateway", async () => {
    const { chatWithAI } = await import("@/app/actions/interview");
    await chatWithAI({
      messages: [{ role: "user", content: "Hi" }],
      type: "behavioral"
    });
    expect(generateTextMock).toHaveBeenCalledWith(
      expect.any(Array),
      expect.any(String),
      "auto",
      expect.objectContaining({
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        maxTokens: 500
      })
    );
  });

  it("should pass the full conversation history (ChatMessage[]) to the gateway", async () => {
    const { chatWithAI } = await import("@/app/actions/interview");
    const messages = [
      { role: "user" as const, content: "Hello" },
      { role: "assistant" as const, content: "Hi there" },
      { role: "user" as const, content: "How are you?" }
    ];
    await chatWithAI({ messages, type: "behavioral" });
    expect(generateTextMock).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ role: "user", content: "Hello" }),
        expect.objectContaining({ role: "assistant", content: "Hi there" }),
        expect.objectContaining({ role: "user", content: "How are you?" })
      ]),
      expect.any(String),
      "auto",
      expect.any(Object)
    );
  });
});

describe("chatWithAI message trimming", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    rateLimitMock.mockResolvedValue({ success: true, message: "" });
    generateTextMock.mockResolvedValue({
      content: "Response",
      provider: "groq",
    });
  });

  it("should accept up to 50 messages per schema", async () => {
    const { chatWithAI } = await import("@/app/actions/interview");
    const messages = Array.from({ length: 50 }, (_, i) => ({
      role: i % 2 === 0 ? ("user" as const) : ("assistant" as const),
      content: `Message ${i}`,
    }));
    const result = await chatWithAI({ messages, type: "behavioral" });
    expect(result.response).toBeTruthy();
  });

  it("should reject more than 50 messages", async () => {
    const { chatWithAI } = await import("@/app/actions/interview");
    const messages = Array.from({ length: 51 }, (_, i) => ({
      role: i % 2 === 0 ? ("user" as const) : ("assistant" as const),
      content: `Message ${i}`,
    }));
    const result = await chatWithAI({ messages, type: "behavioral" });
    expect(result.error).toBe("Invalid message format");
  });

  it("should trim messages to 30 for LLM when over limit", async () => {
    const { chatWithAI } = await import("@/app/actions/interview");
    const messages = Array.from({ length: 40 }, (_, i) => ({
      role: i % 2 === 0 ? ("user" as const) : ("assistant" as const),
      content: `Message ${i}`,
    }));
    await chatWithAI({ messages, type: "behavioral" });

    const sentMessages = generateTextMock.mock.calls[0][0];
    expect(sentMessages.length).toBeGreaterThanOrEqual(30);
    expect(sentMessages.length).toBeLessThanOrEqual(32);
  });
});

describe("buildInterviewerPrompt and XML generation", () => {
  it("should escape XML special characters in dynamic outputs", async () => {
    const { buildInterviewerPrompt } = await import("@/app/actions/interview");
    const result = await buildInterviewerPrompt({
      messages: [],
      type: "technical",
      context: {
        editor: {
          code: `System.out.println("<html> & foo");`,
          language: "java"
        },
        execution: {
          compiled: true,
          success: false,
          stdout: "<stdout-output>",
          stderr: "<stderr-error>"
        }
      }
    });

    expect(result).toContain("&lt;html&gt; &amp; foo");
    expect(result).toContain("&lt;stdout-output&gt;");
    expect(result).toContain("&lt;stderr-error&gt;");
  });

  it("should truncate code over 5000 characters", async () => {
    const { buildInterviewerPrompt } = await import("@/app/actions/interview");
    const longCode = "a".repeat(6000);
    const result = await buildInterviewerPrompt({
      messages: [],
      type: "technical",
      context: {
        editor: {
          code: longCode,
          language: "javascript"
        }
      }
    });

    expect(result).toContain('truncated="true"');
    expect(result).toContain("[Code Truncated for token limit]");
    expect(result).not.toContain("a".repeat(6000));
  });

  it("should ignore editor context for behavioral type", async () => {
    const { buildInterviewerPrompt } = await import("@/app/actions/interview");
    const result = await buildInterviewerPrompt({
      messages: [],
      type: "behavioral",
      context: {
        editor: {
          code: "some code",
          language: "javascript"
        }
      }
    });

    expect(result).not.toContain("<editor");
    expect(result).not.toContain("some code");
  });
});

describe("Candidate and Job Context Integration", () => {
  it("should rank projects and experiences by skill matching and recency", async () => {
    const { preprocessCandidateProfile } = await import("@/app/actions/interview");
    
    const candidate = {
      name: "Alice",
      skills: ["React", "Python"],
      projects: [
        { title: "Generic Project", description: "Just HTML/CSS" },
        { title: "React App", description: "A complex React dashboard" },
        { title: "Other Project", description: "Node and Python APIs" },
        { title: "Vue App", description: "Vue frontend" },
      ],
      experience: [
        { role: "Product Manager", company: "A", highlights: ["Writing specs"] },
        { role: "React Engineer", company: "B", highlights: ["React dev"] },
        { role: "Developer", company: "C", highlights: ["Python scripting"] },
      ]
    };

    const targetRole = {
      title: "Senior React Engineer",
      skillsRequired: ["React", "Python"],
      responsibilities: ["Develop React apps", "Script Python tasks"],
      seniority: "senior"
    };

    const preprocessed = await preprocessCandidateProfile(candidate, targetRole);

    expect(preprocessed).not.toBeNull();
    expect(preprocessed.projects.length).toBe(3);
    expect(preprocessed.projects[0].title).toBe("React App");
    expect(preprocessed.projects[1].title).toBe("Other Project");

    expect(preprocessed.experience.length).toBe(3);
    expect(preprocessed.experience[0].role).toBe("React Engineer");
    expect(preprocessed.experience[1].role).toBe("Product Manager");
    expect(preprocessed.experience[2].role).toBe("Developer");
  });

  it("should generate correct candidate and job XML tags with schemaVersion", async () => {
    const { buildInterviewerPrompt } = await import("@/app/actions/interview");

    const result = await buildInterviewerPrompt({
      messages: [],
      type: "behavioral",
      context: {
        candidate: {
          schemaVersion: 1,
          name: "Bob & Charlie <Script>",
          summary: "Expert Developer",
          skills: ["Rust", "Go"],
          projects: [
            { name: "Compiler", description: "Rust compiler" }
          ],
          experience: [
            { company: "Acme", role: "Staff Architect", period: "2020-2025", highlights: ["Led Rust conversion"] }
          ]
        },
        targetRole: {
          schemaVersion: 1,
          title: "Lead Architect",
          skillsRequired: ["Rust", "Go"],
          responsibilities: ["Scale systems"],
          seniority: "lead"
        }
      }
    });

    expect(result).toContain('<candidate_profile schemaVersion="1">');
    expect(result).toContain('<name>Bob &amp; Charlie &lt;Script&gt;</name>');
    expect(result).toContain('<summary>Expert Developer</summary>');
    expect(result).toContain('<skills>Rust, Go</skills>');
    expect(result).toContain('<experience>');
    expect(result).toContain('<job company="Acme" role="Staff Architect">');
    expect(result).toContain('<highlight>Led Rust conversion</highlight>');
    
    expect(result).toContain('<job_requirements schemaVersion="1">');
    expect(result).toContain('<title>Lead Architect</title>');
    expect(result).toContain('<required_skills>Rust, Go</required_skills>');
    expect(result).toContain('<responsibilities>Scale systems</responsibilities>');
    expect(result).toContain('<seniority>lead</seniority>');
  });
});
