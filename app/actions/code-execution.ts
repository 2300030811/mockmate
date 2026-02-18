"use server";

// Judge0 Types (simplified)
type Judge0Response = {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  time: string | null;
  memory: number | null;
};

const LANGUAGE_MAP: Record<string, number> = {
  python: 71,   // Python (3.8.1)
  python3: 71,  // Python (3.8.1)
  javascript: 63, // JavaScript (Node.js 12.14.0)
  typescript: 74, // TypeScript (3.7.4)
  c: 50,        // C (GCC 9.2.0)
  cpp: 54,      // C++ (GCC 9.2.0)
  "c++": 54,    // C++ (GCC 9.2.0)
  java: 62,     // Java (OpenJDK 13.0.1)
  go: 60,       // Go (1.13.5)
  rust: 73,     // Rust (1.40.0)
  csharp: 51,   // C# (Mono 6.6.0.161)
  "c#": 51      // C# (Mono 6.6.0.161)
};

export interface ExecutionResult {
  output: string;
  error?: string;
}

export async function executeCode(language: string, code: string): Promise<ExecutionResult> {
  // 1. Validation
  if (!code || !code.trim()) {
    return { output: "", error: "Code is empty" };
  }
  
  if (code.length > 5000) {
      return { output: "", error: "Code exceeds 5000 characters limit." };
  }

  // 2. Language Mapping
  // Ensure case-insensitive match
  const normalizedLang = language.toLowerCase();
  const languageId = LANGUAGE_MAP[normalizedLang];

  if (!languageId) {
    return { output: "", error: `Execution for '${language}' is not supported.` };
  }

  // 3. Execution via Judge0
  try {
    const response = await fetch(
      "https://ce.judge0.com/submissions?base64_encoded=false&wait=true",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          source_code: code,
          language_id: languageId,
          stdin: "" // Add stdin support here if needed later
        })
      }
    );

    if (!response.ok) {
        // Fallback for API errors
        console.error("Judge0 API Error:", response.status, response.statusText);
        return { 
            output: "", 
            error: `Judge0 Service Error (${response.status}). Rate limit or service unavailable.` 
        };
    }

    const result = await response.json();

    // 4. Response Parsing
    // Judge0 returns stdout, stderr, compile_output, and message separately.
    // We combine them into a single output string for the frontend, prioritizing errors.
    
    let combinedOutput = "";
    
    // Compilation Error (e.g., Syntax Error)
    if (result.compile_output) {
        combinedOutput += `[Compilation Error]\n${result.compile_output}\n`;
    }
    
    // Standard Error (Runtime Error)
    if (result.stderr) {
        combinedOutput += `[Standard Error]\n${result.stderr}\n`;
    }
    
    // Standard Output
    if (result.stdout) {
        combinedOutput += result.stdout;
    }
    
    // System Message (e.g., Time Limit Exceeded)
    if (result.message) {
        combinedOutput += `\n[System Message]\n${result.message}`;
    }
    
    if (!combinedOutput) {
        combinedOutput = "Code executed successfully (No output).";
    }

    return { 
        output: combinedOutput,
        error: result.stderr || result.compile_output || undefined
    };

  } catch (error: unknown) {
    console.error("Code Execution Failed:", error);
    return { output: "", error: "Network Error: Failed to reach execution engine." };
  }
}
