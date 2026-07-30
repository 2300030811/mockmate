"use server";

import { generateText, AI_MODELS } from "@/lib/ai/gateway";
import { z } from "zod";
import { sanitizePromptInput } from "@/utils/sanitize";
import { rateLimit } from "@/lib/rate-limit";

// Input validation schema
const ChatMessageSchema = z.object({
    role: z.enum(["user", "assistant", "system"]),
    content: z.string().min(1).max(10000),
});
const ChatInputSchema = z.array(ChatMessageSchema).max(50);

// getGroqClient removed in favor of AI Gateway

const ALLOWED_INTERVIEW_TYPES = ["behavioral", "technical"];
const ALLOWED_DIFFICULTIES = ["junior", "mid", "senior"];

export interface ChatWithAIInput {
  messages: { role: string; content: string }[];
  type: string;
  difficulty?: string;
  topic?: string;
  context?: {
    editor?: {
      code: string;
      language: string;
    };
    execution?: {
      compiled: boolean;
      success: boolean;
      stdout?: string;
      stderr?: string;
      time?: string;
    };
    candidate?: {
      schemaVersion: number;
      name?: string;
      summary?: string;
      skills?: string[];
      experience?: { company?: string; role?: string; period?: string; highlights?: string[] }[];
      projects?: { name?: string; description?: string; highlights?: string[] }[];
      education?: { school?: string; degree?: string }[];
    };
    targetRole?: {
      schemaVersion: number;
      title?: string;
      skillsRequired?: string[];
      responsibilities?: string[];
      seniority?: string;
    };
  };
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

/**
 * Preprocesses candidate profiles by ranking projects and experience items
 * based on overlap with required job skills, selecting only the top 3 most relevant.
 */
export async function preprocessCandidateProfile(candidate: any, targetRole: any) {
  if (!candidate) return null;

  const jdSkills = Array.isArray(targetRole?.skillsRequired)
    ? targetRole.skillsRequired
        .map((s: string) => (s || "").toLowerCase().trim())
        .filter(Boolean)
    : [];

  // Rank projects using weighted match scoring
  const scoredProjects = (candidate.projects || []).map((proj: any) => {
    let score = 0;
    const nameLower = (proj.name || proj.title || "").toLowerCase();
    const descLower = (proj.description || "").toLowerCase();
    const highlightsLower = Array.isArray(proj.highlights)
      ? proj.highlights.map((h: string) => (h || "").toLowerCase())
      : [];

    jdSkills.forEach((skill: string) => {
      if (nameLower.includes(skill)) score += 5;
      else if (descLower.includes(skill)) score += 3;
      else if (highlightsLower.some((h: string) => h.includes(skill))) score += 2;
    });

    return { ...proj, score };
  });

  const topProjects = scoredProjects
    .sort((a: any, b: any) => b.score - a.score)
    .map(({ score, ...rest }: any) => rest)
    .slice(0, 3);

  // Rank experience items using weighted scoring + recency bonus
  const scoredExperiences = (candidate.experience || []).map((exp: any, index: number) => {
    let score = 0;
    const companyLower = (exp.company || "").toLowerCase();
    const roleLower = (exp.role || "").toLowerCase();
    const highlightsLower = Array.isArray(exp.highlights)
      ? exp.highlights.map((h: string) => (h || "").toLowerCase())
      : [];

    jdSkills.forEach((skill: string) => {
      if (roleLower.includes(skill)) score += 5;
      else if (companyLower.includes(skill)) score += 3;
      else if (highlightsLower.some((h: string) => h.includes(skill))) score += 2;
    });

    // Recency bonus
    if (index === 0) score += 3;
    else if (index === 1) score += 1;

    return { ...exp, score };
  });

  const topExperience = scoredExperiences
    .sort((a: any, b: any) => b.score - a.score)
    .map(({ score, ...rest }: any) => rest)
    .slice(0, 3);

  return {
    ...candidate,
    projects: topProjects,
    experience: topExperience
  };
}

export async function buildInterviewerPrompt(input: ChatWithAIInput): Promise<string> {
  const { type, difficulty = "mid", topic = "", context } = input;
  const safeType = ALLOWED_INTERVIEW_TYPES.includes(type) ? type : "behavioral";
  const safeDifficulty = ALLOWED_DIFFICULTIES.includes(difficulty) ? difficulty : "mid";
  const safeTopic = topic ? sanitizePromptInput(topic, 100) : "";

  const basePrompt = `You are a Senior Technical Interviewer at a top-tier tech company conducting a ${safeType} interview.
    - Difficulty: ${safeDifficulty}-level candidate. Calibrate questions to this experience band.
    ${safeTopic ? `- Focus area: ${safeTopic}. Ground 70% of questions in this domain.` : ''}

    INTERVIEW PROTOCOL:
    1. Start with a warm but professional greeting. Introduce yourself by name (pick a realistic name). State the interview type briefly.
    2. Ask ONE clear question at a time. Wait for the response before proceeding.
    3. ADAPTIVE DIFFICULTY: Start with a moderate question. If the candidate answers well, increase complexity. If they struggle, offer a simpler follow-up or a hint. Do not escalate difficulty on struggles.
    4. PROBE DEPTH (NO EASY PASS): If an answer is vague, surface-level, or missing details, ask a pointed follow-up like "Can you elaborate on..." or "What would happen if...". Do not accept hand-wavy explanations or move to a new topic immediately.
    5. ACKNOWLEDGE & REFER BACK (MEMORY): Use prior turn answers to build context. Reference candidate statements dynamically. E.g., "Earlier you mentioned X — how does that connect with Y?".
    ${safeType === 'technical' ? `6. CODING QUESTIONS: When asking a coding problem, clearly state the problem, expected input/output, and constraints. Tell the candidate to "type your solution in the Editor tab on the right". Review their code for correctness, edge cases, and time/space complexity.
    7. SYSTEM DESIGN: For design questions, guide the candidate through requirements gathering, high-level design, and deep dives. Ask about trade-offs.` : `6. BEHAVIORAL QUESTIONS: Use the STAR framework as your evaluation lens. If the candidate doesn't naturally use STAR, gently prompt: "What was the specific result?" or "What was your individual contribution?"
    7. Look for: self-awareness, teamwork, leadership signals, conflict resolution maturity, and growth mindset.`}
    8. Keep responses to 2-4 sentences max to maintain conversational flow. Exception: when giving technical feedback on code, be thorough.
    9. NEVER break character. Do NOT use emojis, markdown formatting (outside of code blocks), or informal language.
    10. Do NOT reveal evaluation criteria, scoring, or hints about what you're looking for.`;

  let prompt = basePrompt;

  const preprocessedCandidate = await preprocessCandidateProfile(context?.candidate, context?.targetRole);
  if (preprocessedCandidate) {
    const p = preprocessedCandidate;
    const version = p.schemaVersion || 1;
    prompt += `\n\n<candidate_profile schemaVersion="${version}">`;
    if (p.name) prompt += `\n<name>${escapeXml(p.name)}</name>`;
    if (p.summary) prompt += `\n<summary>${escapeXml(p.summary)}</summary>`;
    if (p.skills && p.skills.length > 0) prompt += `\n<skills>${escapeXml(p.skills.join(", "))}</skills>`;
    if (p.experience && p.experience.length > 0) {
      prompt += `\n<experience>`;
      p.experience.forEach((exp: any) => {
        prompt += `\n  <job company="${escapeXml(exp.company || "")}" role="${escapeXml(exp.role || "")}">\n    <highlight>${escapeXml((exp.highlights || []).join(" | "))}</highlight>\n  </job>`;
      });
      prompt += `\n</experience>`;
    }
    if (p.projects && p.projects.length > 0) {
      prompt += `\n<projects>`;
      p.projects.forEach((proj: any) => {
        prompt += `\n  <project name="${escapeXml(proj.name || proj.title || "")}">\n    <description>${escapeXml(proj.description || "")}</description>\n  </project>`;
      });
      prompt += `\n</projects>`;
    }
    prompt += `\n</candidate_profile>`;
    prompt += `\n\n[Candidate Personalization Rule]: Interweave details from <candidate_profile> natively into your questions (e.g. asking about specific projects they built or technologies they used in their jobs).`;
  }

  // 2. Ingest Target Job Context (XML)
  if (context?.targetRole) {
    const r = context.targetRole;
    const version = r.schemaVersion || 1;
    prompt += `\n\n<job_requirements schemaVersion="${version}">`;
    if (r.title) prompt += `\n<title>${escapeXml(r.title)}</title>`;
    if (r.skillsRequired && r.skillsRequired.length > 0) prompt += `\n<required_skills>${escapeXml(r.skillsRequired.join(", "))}</required_skills>`;
    if (r.responsibilities && r.responsibilities.length > 0) prompt += `\n<responsibilities>${escapeXml(r.responsibilities.join(" | "))}</responsibilities>`;
    if (r.seniority) prompt += `\n<seniority>${escapeXml(r.seniority)}</seniority>`;
    prompt += `\n</job_requirements>`;
    prompt += `\n\n[Role Calibration Rule]: Calibrate your questions, scenarios, and difficulty dynamically to evaluate suitability for the <job_requirements>.`;
  }

  // 3. Ingest Editor Context (XML)
  if (safeType === "technical" && context?.editor?.code?.trim()) {
    const editor = context.editor;
    const execution = context.execution;

    // Impose a 5000 character limit on code to save tokens and prevent overflow
    let code = editor.code;
    let truncated = false;
    if (code.length > 5000) {
      code = code.substring(0, 5000) + "\n... [Code Truncated for token limit]";
      truncated = true;
    }

    prompt += `\n\n<editor language="${editor.language}" truncated="${truncated ? "true" : "false"}">
<code>
${escapeXml(code)}
</code>`;

    if (execution && execution.compiled) {
      prompt += `\n<execution success="${execution.success ? "true" : "false"}" time="${execution.time || "N/A"}">`;
      if (execution.stdout) {
        let stdout = execution.stdout;
        if (stdout.length > 2000) stdout = stdout.substring(0, 2000) + "\n... [Stdout Truncated]";
        prompt += `\n<stdout>\n${escapeXml(stdout)}\n</stdout>`;
      }
      if (execution.stderr) {
        let stderr = execution.stderr;
        if (stderr.length > 2000) stderr = stderr.substring(0, 2000) + "\n... [Stderr Truncated]";
        prompt += `\n<stderr>\n${escapeXml(stderr)}\n</stderr>`;
      }
      prompt += `\n</execution>`;
    }

    prompt += `\n</editor>`;
  }

  return prompt;
}

export async function chatWithAI(
  input: ChatWithAIInput
): Promise<{ response: string, error?: string }> {
    const { messages, type, difficulty = "mid", topic = "" } = input;
    
    // Validate interview type & difficulty
    const safeType = ALLOWED_INTERVIEW_TYPES.includes(type) ? type : "behavioral";
    const safeDifficulty = ALLOWED_DIFFICULTIES.includes(difficulty) ? difficulty : "mid";
    const safeTopic = topic ? sanitizePromptInput(topic, 100) : "";

    // Validate input
    const parsed = ChatInputSchema.safeParse(messages);
    if (!parsed.success) {
        return { response: "", error: "Invalid message format" };
    }
    const validMessages = parsed.data;

    // Limit message history to last 30 messages to prevent token overflow
    let trimmedMessages = validMessages.length > 30 ? validMessages.slice(-30) : [...validMessages];

    // --- QUESTION TRACKING: Inject coverage hint every 4 user answers to avoid repetition ---
    const userMessageCount = trimmedMessages.filter(m => m.role === 'user').length;
    if (userMessageCount > 0 && userMessageCount % 4 === 0) {
      const assistantMessages = trimmedMessages.filter(m => m.role === 'assistant').map(m => m.content);
      const topicsSummary = assistantMessages.slice(-4).map(msg => msg.slice(0, 60)).join('; ');
      trimmedMessages = [
        ...trimmedMessages,
        {
          role: 'system' as const,
          content: `INTERNAL NOTE: Topics already covered in recent questions: [${topicsSummary}]. Ask about a DIFFERENT topic next. Do not repeat previous questions.`
        }
      ];
    }

    // --- GRACEFUL WRAP-UP: After ~20 exchanges, prompt the AI to wind down ---
    const totalExchanges = trimmedMessages.filter(m => m.role === 'user').length;
    if (totalExchanges >= 10) {
      trimmedMessages = [
        ...trimmedMessages,
        {
          role: 'system' as const,
          content: 'INTERNAL NOTE: The interview has been going on for a while. Begin wrapping up naturally. Ask one final question, then provide a brief verbal summary of how the candidate performed — strengths noted and areas to improve. Keep it encouraging but honest.'
        }
      ];
    }

    try {
        // Rate limit: 60 chat messages per 10 minutes for users, 10/day for guests
        const { success: withinLimit, message: limitMsg } = await rateLimit("chat");
        if (!withinLimit) {
            return { response: "", error: limitMsg || "Too many requests. Please slow down." };
        }

        const systemPrompt = await buildInterviewerPrompt(input);

        let responseText = "";

        try {
            const result = await generateText(
                trimmedMessages.map(m => ({
                    role: m.role as "user" | "assistant" | "system",
                    content: m.role === "user" ? sanitizePromptInput(m.content) : m.content,
                })),
                systemPrompt,
                "auto",
                {
                    temperature: 0.7,
                    maxTokens: 500,
                    model: AI_MODELS.DEFAULT
                }
            );
            responseText = result.content;
        } catch (gatewayError: unknown) {
            const msg = gatewayError instanceof Error ? gatewayError.message : String(gatewayError);
            console.error("❌ AI Gateway Failed (Server Action):", msg);
            return { response: "", error: "AI Service Unavailable" };
        }

        if (!responseText) responseText = "Let's move to the next topic.";

        return { response: responseText };
    } catch (error: unknown) {
        console.error("Chat Action Error:", error);
        return { response: "", error: "Failed to process AI response" };
    }
}

export async function getSpeechToken(): Promise<{ token: string, region: string, error?: string }> {
    const key = process.env.AZURE_SPEECH_KEY;
    const region = process.env.AZURE_SPEECH_REGION;

    if (!key || !region) {
        return { token: "", region: "", error: "Missing Azure Speech credentials" };
    }

    try {
        const response = await fetch(`https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`, {
            method: 'POST',
            headers: {
                'Ocp-Apim-Subscription-Key': key,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch token");
        }

        const token = await response.text();
        return { token, region };
    } catch (error) {
        console.error("Speech Token Error:", error);
        return { token: "", region: "", error: "Failed to issue speech token" };
    }
}
