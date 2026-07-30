"use server";

import { generateText, AI_MODELS } from "@/lib/ai/gateway";
import { Node, Connection } from "../(main)/system-design/types";
import { sanitizePromptInput } from "@/utils/sanitize";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";
import { SystemDesignService, SystemDesign } from "@/lib/services/system-design-service";

export async function saveSystemDesignAction(design: Partial<SystemDesign>) {
  try {
    const { data, error } = await SystemDesignService.saveDesign(design);
    if (error) throw error;
    return { data: data as SystemDesign };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to save design";
    logger.error("Save System Design Error:", msg);
    return { error: msg };
  }
}

export async function getSystemDesignsAction() {
  try {
    const { data, error } = await SystemDesignService.getDesigns();
    if (error) throw error;
    return { data: data as SystemDesign[] };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch designs";
    logger.error("Get System Designs Error:", msg);
    return { error: msg };
  }
}

export async function deleteSystemDesignAction(id: string) {
  try {
    const { error } = await SystemDesignService.deleteDesign(id);
    if (error) throw error;
    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to delete design";
    logger.error("Delete System Design Error:", msg);
    return { error: msg };
  }
}

export async function reviewSystemDesignAction(
  components: Node[],
  connections: Connection[],
  challengeContext?: { 
    title: string; 
    objectives: string[]; 
    constraints: string[]; 
    metrics?: { users: string; writesPerDay: string; readsPerDay: string; latency: string; storage: string } 
  }
): Promise<{
  markdown: string;
  score?: { 
    overall: number; 
    reliability: number; 
    scalability: number; 
    security: number; 
    seniority: string;
    grade?: string;
    issues?: string[];
    checklist?: { name: string; status: "pass" | "fail" }[];
  } | null;
  error?: string
}> {
  try {
    const { success: withinLimit, message: limitMsg } = await rateLimit("default");
    if (!withinLimit) {
      return { markdown: "", error: limitMsg || "Rate limit exceeded. Please wait." };
    }

    const challengeInfo = challengeContext ? `
      CONTEXT: Active Challenge: ${challengeContext.title}
      EXPECTED SCALE METRICS:
      - Users: ${challengeContext.metrics?.users || "N/A"}
      - Writes/day: ${challengeContext.metrics?.writesPerDay || "N/A"}
      - Reads/day: ${challengeContext.metrics?.readsPerDay || "N/A"}
      - Latency: ${challengeContext.metrics?.latency || "N/A"}
      - Storage: ${challengeContext.metrics?.storage || "N/A"}
      
      OBJECTIVES:
      ${challengeContext.objectives.map(o => `- ${o}`).join("\n")}
      
      CONSTRAINTS:
      ${challengeContext.constraints.map(c => `- ${c}`).join("\n")}
      
      CRITICAL AUDIT TASK:
      Evaluate the architecture against the expected scale metrics and constraints. Check for scalability bottlenecks (e.g., lack of load balancing, single point of failure DBs, lack of caching for read-heavy workloads, or missing CDNs for global scale).
    ` : "";

    const prompt = `
      You are a Senior System Design Interviewer. 
      Analyze the following architecture and provide a professional critique.
      ${challengeInfo}
      
      COMPONENTS:
      ${sanitizePromptInput(JSON.stringify(components, null, 2), 10000)}
      
      CONNECTIONS:
      ${sanitizePromptInput(JSON.stringify(connections, null, 2), 10000)}
      
      TASK:
      1. Provide a "High-Level Evaluation" (is it scalable, resilient, etc?).
      2. Identify "Single Points of Failure" and design gaps.
      3. Suggest "Scalability Improvements" (Caching, Sharding, CDNs) based on the expected scale metrics.
      4. Security check.
      5. Provide a "Seniority Rating" (Junior, Mid, Senior, Staff).
      6. Score & Structured Indicators: At the very end of your response, output a structured JSON score block wrapped in HTML comments exactly like this:
         <!-- SCORE:{"overall":85,"reliability":70,"scalability":80,"security":90,"seniority":"Senior","grade":"B","issues":["Single DB SPOF","Missing Cache","No CDN"],"checklist":[{"name":"Load Balancer","status":"pass"},{"name":"Cache Layer","status":"fail"},{"name":"CDN","status":"fail"}]} -->
         
         The "grade" value should be A+, A, B+, B, C, D, or F based on the overall score.
         The "issues" array should contain key warnings (e.g. "Single DB SPOF", "Missing Cache", "No CDN").
         The "checklist" array should check if key components needed for the scale are present and correctly designed to handle the scale.

      FORMAT: Return the response in clean Markdown with clear headings and emojis.
    `;

    let content = "";
    try {
      const result = await generateText(
        prompt,
        "You are a Senior System Design Interviewer.",
        "auto",
        {
          model: AI_MODELS.DEFAULT,
          temperature: 0.7,
          maxTokens: 2048
        }
      );
      content = result.content;
    } catch (err) {
      logger.error("System Design Review Error (AI Gateway):", err);
      return { markdown: "", error: "Failed to review system design." };
    }

    if (!content) {
      return { markdown: "", error: "Failed to generate review." };
    }

    // Parse score from markdown comment — try multiple strategies since LLMs vary format
    let score = undefined;
    // Strategy 1: Exact single-line match
    const scoreRegex = /<!-- SCORE:({.*?}) -->/;
    // Strategy 2: Multi-line match (LLMs often add linebreaks inside)
    const scoreRegexMultiline = /<!-- SCORE:([\s\S]*?) -->/;
    // Strategy 3: JSON block after "SCORE:" label (no comment wrapper)
    const scoreRegexBare = /SCORE:\s*({[\s\S]*?})\s*(?:-->|$)/;

    let match = content.match(scoreRegex) || content.match(scoreRegexMultiline) || content.match(scoreRegexBare);
    if (match && match[1]) {
      try {
        // Clean common LLM issues: single quotes → double quotes, trailing commas
        let jsonStr = match[1].trim()
          .replace(/'/g, '"')
          .replace(/,\s*([\]}])/g, '$1');
        score = JSON.parse(jsonStr);
      } catch (e) {
        logger.warn("Failed to parse AI score (trying lenient):", e);
        // Last resort: extract individual numeric fields with regex
        try {
          const extractNum = (key: string) => {
            const m = (match![1] || '').match(new RegExp(`"${key}"\\s*:\\s*(\\d+)`));
            return m ? parseInt(m[1]) : undefined;
          };
          const extractStr = (key: string) => {
            const m = (match![1] || '').match(new RegExp(`"${key}"\\s*:\\s*"([^"]+)"`));
            return m ? m[1] : undefined;
          };
          const overall = extractNum('overall');
          if (overall !== undefined) {
            score = {
              overall,
              reliability: extractNum('reliability') ?? 0,
              scalability: extractNum('scalability') ?? 0,
              security: extractNum('security') ?? 0,
              seniority: extractStr('seniority') ?? 'Mid',
              grade: extractStr('grade'),
            };
          }
        } catch (fallbackErr) {
          logger.error("Score parsing fully failed:", fallbackErr);
        }
      }
    }

    // Remove all score block variants from displayed markdown
    const cleanMarkdown = content
      .replace(/<!-- SCORE:[\s\S]*?-->/g, '')
      .replace(/SCORE:\s*{[\s\S]*?}\s*$/gm, '')
      .trim();

    return {
      markdown: cleanMarkdown,
      score
    };

  } catch (error: unknown) {
    logger.error("System Design Review Error (Groq):", error);
    const msg = error instanceof Error ? error.message : "Failed to review system design.";
    return { markdown: "", error: msg };
  }
}
