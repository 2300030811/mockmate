"use server";

import { rateLimit } from "@/lib/rate-limit";

const LANGUAGE_MAP: Record<string, number> = {
  python: 100,   // Python (3.12.5)
  python3: 100,  // Python (3.12.5)
  javascript: 102, // JavaScript (Node.js 22.08.0)
  typescript: 101, // TypeScript (5.6.2)
  c: 103,        // C (GCC 14.1.0)
  cpp: 105,      // C++ (GCC 14.1.0)
  "c++": 105,    // C++ (GCC 14.1.0)
  java: 91,      // Java (JDK 17.0.6)
  go: 107,       // Go (1.23.5)
  rust: 108,     // Rust (1.85.0)
  csharp: 51,    // C# (Mono 6.6.0.161)
  "c#": 51       // C# (Mono 6.6.0.161)
};

export interface ExecutionResult {
  output: string;
  error?: string;
}

// Retry-capable fetch with timeout
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 15000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

export async function executeCode(language: string, code: string): Promise<ExecutionResult> {
  // 0. Server-side rate limit: prevent abuse bypassing client cooldown
  try {
    const { success, message } = await rateLimit("default");
    if (!success) {
      return { output: "", error: message || "Too many execution requests. Please wait." };
    }
  } catch {
    // If rate-limiter is unavailable, allow the request through
  }

  // 1. Validation
  if (!code || !code.trim()) {
    return { output: "", error: "Code is empty" };
  }
  if (code.length > 10000) {
    return { output: "", error: "Code exceeds 10,000 characters limit." };
  }

  // 2. Language Mapping
  const normalizedLang = language.toLowerCase();
  const languageId = LANGUAGE_MAP[normalizedLang];
  if (!languageId) {
    return { output: "", error: `Execution for '${language}' is not supported.` };
  }

  // 3. Execute with retry (max 2 attempts)
  const url = "https://ce.judge0.com/submissions?base64_encoded=false&wait=true&fields=stdout,stderr,compile_output,message,status,time,memory";
  const body = JSON.stringify({
    source_code: code,
    language_id: languageId,
    stdin: "",
    cpu_time_limit: 5,
    memory_limit: 128000,
  });
  const judge0Key = process.env.JUDGE0_API_KEY;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (judge0Key) {
    headers["X-Auth-Token"] = judge0Key;
  }

  let lastError = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetchWithTimeout(url, { method: "POST", headers, body }, 20000);

      if (response.status === 429) {
        lastError = "Rate limited. Please wait a few seconds.";
        if (attempt === 0) { await new Promise(r => setTimeout(r, 2000)); continue; }
        return { output: "", error: lastError };
      }
      if (!response.ok) {
        return { output: "", error: `Judge0 Service Error (${response.status}).` };
      }

      const result = await response.json();

      // 4. Build output
      let out = "";
      if (result.compile_output) out += `[Compilation Error]\n${result.compile_output}\n`;
      if (result.stderr) out += `[Standard Error]\n${result.stderr}\n`;
      if (result.stdout) {
        const maxLen = 20000;
        if (result.stdout.length > maxLen) {
          out += result.stdout.substring(0, maxLen) + "\n... [Output Truncated]";
        } else {
          out += result.stdout;
        }
      }
      if (result.message) out += `\n[System Message]\n${result.message}`;

      const status = result.status?.description || "";
      if (!out && status && status !== "Accepted") out = `[Status: ${status}]`;
      if (!out) out = "Code executed successfully (No output).";

      // Append stats
      if (result.time || result.memory) {
        const s = [];
        if (result.time) s.push(`Time: ${result.time}s`);
        if (result.memory) s.push(`Memory: ${(result.memory / 1024).toFixed(1)} MB`);
        out += `\n\n── ${s.join(" | ")} ──`;
      }

      return { output: out, error: result.stderr || result.compile_output || undefined };

    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        lastError = "Execution timed out (20s). Try simpler code.";
      } else {
        lastError = "Network Error: Failed to reach execution engine.";
      }
    }
  }

  return { output: "", error: lastError };
}
