import { Groq } from "groq-sdk";
import { getNextKey } from "@/utils/keyManager";
import { logger } from "@/lib/logger";
import { GitHubRepo } from "@/lib/github-fetch";

const FILTER_SYSTEM_PROMPT = `You are an expert technical recruiter analyzing GitHub repositories to identify the most impressive and relevant projects for a software engineering position.

Given a list of GitHub repositories, select the TOP 7 most impressive projects that would be most relevant for evaluating a candidate's technical skills and experience.

**Selection Criteria (in order of importance):**
1. **Technical Complexity**: Projects that demonstrate advanced programming concepts, architecture, or problem-solving.
2. **Real-world Impact**: Projects with actual users, deployments, or practical applications.
3. **Popularity/Community Engagement**: Projects with stars, forks, or community contributions.
4. **Originality**: Unique projects rather than tutorial-based or classroom assignments.

**Projects to PRIORITIZE:**
- Contributions to popular open source projects (React, Vue, Node.js, etc.)
- Forks of popular projects with meaningful contributions
- Projects with significant community adoption (stars/forks)
- Projects that solve real-world problems

**Projects to AVOID:**
- Simple tutorial projects (e.g., "Hello World", basic calculators, weather apps, simple CRUD)
- Classroom assignments with generic names
- Projects with no meaningful description or clear purpose
- Empty or boilerplate repositories

**CRITICAL REQUIREMENTS:**
- Select exactly 7 UNIQUE projects (no duplicates) if 7 or more qualifying projects exist.
- If fewer than 7 qualifying projects exist, select ALL of them (do not pad with additional projects).
- Respond with a raw JSON object containing a single key "selected_repos" mapping to an array of strings containing ONLY the EXACT names of the selected repositories. Do not include markdown formatting or explanations.`;

export async function filterTopGitHubProjects(repos: GitHubRepo[]): Promise<GitHubRepo[]> {
  if (!repos || repos.length <= 7) {
    return repos;
  }

  try {
    const apiKey = getNextKey("GROQ_API_KEY") || process.env.GROQ_API_KEY;
    if (!apiKey) {
      logger.warn("[GitHubFilter] No Groq API Key found. Returning top 7 by stars.");
      return repos.slice(0, 7);
    }

    const simplifiedRepos = repos.map(r => ({
      name: r.name,
      description: r.description,
      language: r.language,
      stars: r.stargazers_count,
      forks: r.forks_count,
      fork: r.fork
    }));

    const prompt = `Repository Data:\n${JSON.stringify(simplifiedRepos, null, 2)}\n\nSelect the top 7 most impressive projects based on the criteria. Output ONLY a valid JSON object like: { "selected_repos": ["repo1", "repo2", ...] }`;

    const groq = new Groq({ apiKey });
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: FILTER_SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      response_format: { type: "json_object" },
    });

    const content = chatCompletion.choices[0]?.message?.content;
    if (!content) throw new Error("Empty AI response");

    const parsed = JSON.parse(content);
    const selectedNames = parsed.selected_repos || [];

    if (!Array.isArray(selectedNames) || selectedNames.length === 0) {
      throw new Error("Invalid format returned by AI");
    }

    const filtered = repos.filter(r => selectedNames.includes(r.name));
    
    // If AI failed to match names or returned too few, fallback
    if (filtered.length === 0) {
      return repos.slice(0, 7);
    }
    
    return filtered.slice(0, 7);
  } catch (error) {
    logger.warn("[GitHubFilter] Failed to filter repos with AI, falling back to stars:", error instanceof Error ? error.message : String(error));
    return repos.slice(0, 7);
  }
}
