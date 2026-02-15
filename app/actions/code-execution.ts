"use server";

type PistonResponse = {
  language: string;
  version: string;
  run: {
    stdout: string;
    stderr: string;
    output: string;
    code: number;
    signal: string | null;
  };
};

const LANGUAGE_MAP: Record<string, { runtime: string; version: string }> = {
  python: { runtime: "python", version: "3.10.0" },
  javascript: { runtime: "javascript", version: "18.15.0" },
  typescript: { runtime: "typescript", version: "5.0.3" },
  c: { runtime: "c", version: "10.2.0" },
  cpp: { runtime: "c++", version: "10.2.0" },
  java: { runtime: "java", version: "15.0.2" },
  go: { runtime: "go", version: "1.16.2" },
  rust: { runtime: "rust", version: "1.68.2" },
};

export async function executeCode(language: string, code: string): Promise<{ output: string; error?: string }> {
  if (!code || !code.trim()) {
    return { output: "", error: "Code is empty" };
  }

  // Handle unsupported languages or client-side simulations (like SQL/CSS)
  if (!LANGUAGE_MAP[language]) {
    return { output: "", error: `Execution for '${language}' is not supported server-side.` };
  }

  const { runtime, version } = LANGUAGE_MAP[language];

  try {
    const response = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        language: runtime,
        version: version,
        files: [
          {
            content: code,
          },
        ],
      }),
    });

    if (!response.ok) {
        // Handle API errors (rate limits, etc)
        const errText = await response.text();
        console.error("Piston API Error:", response.status, errText);
        return { 
            output: "", 
            error: `Execution Service Unavailable (${response.status}). Using local simulation.` 
        };
    }

    const data: PistonResponse = await response.json();

    // Piston returns 'run.output' which is stdout + stderr
    // We prefer separating if possible, but for simplicity let's return combined output
    // If there is stderr, we might want to flag it
    
    // Check if there was a runtime error (exit code != 0)
    if (data.run.code !== 0 && data.run.stderr) {
         return { output: data.run.stdout, error: data.run.stderr };
    }

    return { output: data.run.output };

  } catch (error: any) {
    console.error("Code Execution Failed:", error);
    return { output: "", error: "Network Error: Failed to reach execution engine." };
  }
}
