import { logger } from "@/lib/logger";

export interface GitHubRepo {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  html_url: string;
  fork: boolean;
  contributors_count?: number;
  project_type?: "open_source" | "self_project";
}

export interface GitHubProfileData {
  username: string;
  name: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  avatar_url: string | null;
  blog: string | null;
  repos: GitHubRepo[];
}

/**
 * Extract a GitHub username from resume text by matching common URL patterns.
 * Returns the first valid username found, or null.
 */
export function extractGitHubUsername(text: string): string | null {
  // Match patterns like: github.com/username, github.com/username/, www.github.com/username
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38})(?:\/|\s|$|[),.\]>])/i,
    /github\s*:\s*@?([a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38})(?:\s|$|[),.\]>])/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      const username = match[1].toLowerCase();
      // Filter out common false positives
      const blacklist = new Set(["settings", "explore", "topics", "trending", "collections", "events", "sponsors", "features", "security", "pricing", "orgs", "marketplace"]);
      if (!blacklist.has(username)) {
        return match[1]; // Return original casing
      }
    }
  }

  return null;
}

const GITHUB_API = "https://api.github.com";
const FETCH_TIMEOUT_MS = 8_000;

/**
 * Fetch public GitHub profile data + top repos.
 * Uses the free unauthenticated API (60 req/hr).
 * Returns null on any failure (non-critical path).
 */
export async function fetchGitHubProfile(username: string): Promise<GitHubProfileData | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "MockMate-DeepEval/1.0",
    };

    // Optional: use a token if available for higher rate limits
    const token = process.env.GITHUB_TOKEN;
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      // Fetch profile and repos in parallel
      const [profileRes, reposRes] = await Promise.all([
        fetch(`${GITHUB_API}/users/${encodeURIComponent(username)}`, {
          headers,
          signal: controller.signal,
        }),
        fetch(
          `${GITHUB_API}/users/${encodeURIComponent(username)}/repos?sort=stars&direction=desc&per_page=30&type=owner`,
          { headers, signal: controller.signal }
        ),
      ]);

      if (!profileRes.ok) {
        logger.warn(`[GitHub] Profile fetch failed: ${profileRes.status} for ${username}`);
        return null;
      }

      const profile = await profileRes.json();
      const repos: any[] = reposRes.ok ? await reposRes.json() : [];

      // Determine project_type for each repo (heuristic: forked or 2+ contributors = open_source)
      const enrichedRepos: GitHubRepo[] = repos
        .filter((r: any) => !r.archived)
        .map((r: any) => ({
          name: r.name,
          description: r.description,
          language: r.language,
          stargazers_count: r.stargazers_count ?? 0,
          forks_count: r.forks_count ?? 0,
          html_url: r.html_url,
          fork: r.fork ?? false,
          project_type: r.fork ? "open_source" as const : "self_project" as const,
        }));

      return {
        username: profile.login,
        name: profile.name,
        bio: profile.bio,
        public_repos: profile.public_repos ?? 0,
        followers: profile.followers ?? 0,
        following: profile.following ?? 0,
        created_at: profile.created_at ?? "",
        avatar_url: profile.avatar_url,
        blog: profile.blog,
        repos: enrichedRepos,
      };
    } finally {
      clearTimeout(timer);
    }
  } catch (err) {
    logger.warn(`[GitHub] Fetch failed for ${username}:`, err instanceof Error ? err.message : String(err));
    return null;
  }
}

/**
 * Format GitHub profile data into the structured text block
 * expected by the deep evaluation prompt.
 */
export function formatGitHubDataForPrompt(data: GitHubProfileData): string {
  const lines: string[] = [
    "\n=== GITHUB DATA ===",
    `Username: ${data.username}`,
    `Bio: ${data.bio || "N/A"}`,
    `Public Repos: ${data.public_repos}`,
    `Followers: ${data.followers}`,
    `Following: ${data.following}`,
    `Account Created: ${data.created_at}`,
    `Blog/Website: ${data.blog || "N/A"}`,
    "",
    "Top Repositories:",
  ];

  if (data.repos.length === 0) {
    lines.push("  No public repositories found.");
  } else {
    for (const repo of data.repos) {
      lines.push(`  - ${repo.name} (${repo.language || "Unknown"})`);
      lines.push(`    Stars: ${repo.stargazers_count} | Forks: ${repo.forks_count}`);
      lines.push(`    Type: ${repo.project_type} | Forked: ${repo.fork}`);
      if (repo.description) {
        lines.push(`    Description: ${repo.description}`);
      }
      lines.push(`    URL: ${repo.html_url}`);
    }
  }

  lines.push("=== END GITHUB DATA ===");
  return lines.join("\n");
}
