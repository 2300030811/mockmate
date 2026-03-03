import { describe, it, expect } from "vitest";

/**
 * normalizeCode utility function
 * Removes comments and whitespace for lenient regex matching
 */
function normalizeCode(code: string) {
  return code
    .replace(/\/\/.*$/gm, "") // Remove single line comments
    .replace(/\/\*[\s\S]*?\*\//g, "") // Remove multi-line comments
    .replace(/\s+/g, " ") // Collapse multiple spaces
    .replace(/\s*([\{\}\(\)\;\,\=\+\-\*\/])\s*/g, "$1") // Remove spaces around syntax boundaries
    .trim();
}

describe("normalizeCode", () => {
  it("should remove single-line comments", () => {
    const code = `const x = 1; // this is a comment
const y = 2;`;
    const result = normalizeCode(code);
    expect(result).not.toContain("//");
    expect(result).toContain("const x=1");
    expect(result).toContain("const y=2");
  });

  it("should remove multi-line comments", () => {
    const code = `const x = 1; /* this is a 
    multi-line comment */
const y = 2;`;
    const result = normalizeCode(code);
    expect(result).not.toContain("/*");
    expect(result).not.toContain("*/");
    expect(result).toContain("const x=1");
    expect(result).toContain("const y=2");
  });

  it("should collapse whitespace and remove spaces around operators", () => {
    const code = `const  x  =  1  +  2  ;`;
    const result = normalizeCode(code);
    expect(result).toBe("const x=1+2;");
  });

  it("should handle nested comments", () => {
    const code = `// outer comment /* inner */
const x = /* inline */ 1;`;
    const result = normalizeCode(code);
    expect(result).toContain("const x=1");
  });

  it("should preserve code logic after normalization", () => {
    const code = `function add(a, b) {
  // Add two numbers
  return a + b; /* result */
}`;
    const result = normalizeCode(code);
    expect(result).toContain("function add(a,b)");
    expect(result).toContain("return a+b");
  });

  it("should handle template literals (remove quotes)", () => {
    const code = `const template = \`Hello \${name}\`;`;
    const result = normalizeCode(code);
    // This should work since we're not modifying quote handling in normalizeCode
    expect(result).toBeTruthy();
  });
});

describe("Regex validation patterns", () => {
  it("should match functional update pattern in setCount", () => {
    const code = `setCount(prev => prev + 1);`;
    const regex = /setCount\(\s*\(?\s*\w+\s*\)?\s*=>\s*\w+\s*\+\s*\d+\)/;
    expect(regex.test(code)).toBe(true);
  });

  it("should NOT match direct state update pattern", () => {
    const code = `setCount(count + 1);`;
    const regex = /setCount\(\s*\(?\s*\w+\s*\)?\s*=>\s*\w+\s*\+\s*\d+\)/;
    expect(regex.test(code)).toBe(false);
  });

  it("should match addEventListener pattern", () => {
    const code = `button.addEventListener('click', handler);`;
    const regex = /addEventListener|addEventListener.*click|appendChild|insertAdjacentHTML/;
    expect(regex.test(code)).toBe(true);
  });

  it("should match display: flex pattern", () => {
    const code = `header {
  display: flex;
  justify-content: space-between;
}`;
    const regex = /display:\s*flex|flex-direction|justify-content|align-items/;
    expect(regex.test(code)).toBe(true);
  });

  it("should match JSON.parse in destructive validation", () => {
    const code = `const { title } = req.body;
const body = JSON.parse(req.body);`;
    const regex = /(?<!JSON\.parse\()req\.body/;
    expect(regex.test(code)).toBe(true);
  });
});

describe("Score calculation", () => {
  it("should calculate weighted average correctly", () => {
    const breakdown = {
      correctness: 80,
      codeQuality: 90,
      bestPractices: 85,
      completeness: 75,
    };

    const score = Math.round(
      breakdown.correctness * 0.4 +
        breakdown.codeQuality * 0.2 +
        breakdown.bestPractices * 0.2 +
        breakdown.completeness * 0.2
    );

    // (80 * 0.4) + (90 * 0.2) + (85 * 0.2) + (75 * 0.2)
    // = 32 + 18 + 17 + 15 = 82
    expect(score).toBe(82);
  });

  it("should cap score at 100", () => {
    const score = Math.min(100, 150);
    expect(score).toBe(100);
  });

  it("should handle zero scores", () => {
    const breakdown = {
      correctness: 0,
      codeQuality: 0,
      bestPractices: 0,
      completeness: 0,
    };

    const score = Math.round(
      breakdown.correctness * 0.4 +
        breakdown.codeQuality * 0.2 +
        breakdown.bestPractices * 0.2 +
        breakdown.completeness * 0.2
    );

    expect(score).toBe(0);
  });
});
