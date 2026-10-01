import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  extractTableBlocks,
  parseDateWithContext,
  classifyNoticeType,
  parseMarkdownPlacementTable,
  extractPlacementImport,
} from "./placement-import-extractor";

// Mock AI Gateway
vi.mock("@/lib/ai/gateway", () => ({
  generateText: vi.fn(),
}));

import { generateText } from "@/lib/ai/gateway";

describe("Placement Import Extractor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("extractTableBlocks", () => {
    it("isolates Markdown table blocks from surrounding prose", () => {
      const text = `
Here is the morning placement update for KLU:

| Company | Role | Package | Eligibility | Status |
|---|---|---|---|---|
| Google | SDE Intern | ₹1.14 Lakh/month | 2027 batch | Apply by Sep 24 |

Also please note that Deloitte results are published.
      `.trim();

      const { tableBlocks, remainingProse } = extractTableBlocks(text);
      expect(tableBlocks).toHaveLength(1);
      expect(tableBlocks[0]).toContain("| Google |");
      expect(remainingProse).not.toContain("| Google |");
      expect(remainingProse).toContain("Deloitte results are published");
    });
  });

  describe("parseDateWithContext", () => {
    it("detects explicit full date with year without inference", () => {
      const res = parseDateWithContext("Apply by 24 Sep 2026", "Some context");
      expect(res.dateIso).toBe("2026-09-24");
      expect(res.inferred).toBe(false);
      expect(res.precision).toBe("day");
    });

    it("infers year when established by surrounding context and marks deadlineInferred = true", () => {
      const res = parseDateWithContext("Apply by Sep 24", "KLU Placement Drive Calendar 2026 Batch updates");
      expect(res.dateIso).toBe("2026-09-24");
      expect(res.inferred).toBe(true);
      expect(res.precision).toBe("day");
    });

    it("does not manufacture a year or time when surrounding context does not establish year", () => {
      const res = parseDateWithContext("Apply by Sep 24", "General college notice with no year mentioned");
      expect(res.dateIso).toBeNull();
      expect(res.inferred).toBe(true);
      expect(res.precision).toBe("day");
    });
  });

  describe("classifyNoticeType", () => {
    it("classifies result announcements correctly", () => {
      expect(classifyNoticeType("Infosys final selects announced")).toBe("RESULT");
      expect(classifyNoticeType("Selected: 15 students for Cisco")).toBe("RESULT");
    });

    it("classifies assessments and tests correctly", () => {
      expect(classifyNoticeType("Coding assessment scheduled for tomorrow")).toBe("ASSESSMENT");
      expect(classifyNoticeType("Online Aptitude Test Slot 1")).toBe("ASSESSMENT");
    });

    it("classifies registration deadlines correctly", () => {
      expect(classifyNoticeType("Registration closes on Friday")).toBe("REGISTRATION_DEADLINE");
      expect(classifyNoticeType("Apply by Sep 24")).toBe("REGISTRATION_DEADLINE");
    });

    it("classifies training sessions correctly", () => {
      expect(classifyNoticeType("Pre-placement talk session")).toBe("TRAINING");
    });
  });

  describe("parseMarkdownPlacementTable", () => {
    it("parses multi-column Copilot table with deterministic accuracy", () => {
      const tableText = `
| Company | Role | Package | Eligibility | Status |
|---|---|---|---|---|
| Google | Application Engineering Intern | ₹1.14 Lakh/month | 2027 batch, CGPA ≥ 7.0 | Apply by 24 Sep 2026 |
| Cisco | Technical Graduate Trainee | ₹17.5 LPA | 2026 batch, CSE/ECE | Test on 28 Sep 2026 |
      `.trim();

      const items = parseMarkdownPlacementTable(tableText);
      expect(items).toHaveLength(2);

      // Row 1: Google
      expect(items[0].companyName).toBe("Google");
      expect(items[0].roleTitle).toBe("Application Engineering Intern");
      expect(items[0].stipendText).toContain("1.14 Lakh/month");
      expect(items[0].minCgpa).toBe(7.0);
      expect(items[0].targetBatch).toContain("2027");
      expect(items[0].deadlineIso).toBe("2026-09-24");
      expect(items[0].deadlineInferred).toBe(false);

      // Row 2: Cisco
      expect(items[1].companyName).toBe("Cisco");
      expect(items[1].roleTitle).toBe("Technical Graduate Trainee");
      expect(items[1].minLpa).toBe(17.5);
      expect(items[1].maxLpa).toBe(17.5);
      expect(items[1].eligibleBranches).toContain("CSE");
      expect(items[1].eligibleBranches).toContain("ECE");
    });

    it("handles malformed tables and missing columns gracefully", () => {
      const malformed = `
| Company | Package |
|---|---|
| Startup Inc | 6 LPA |
| | |
      `.trim();

      const items = parseMarkdownPlacementTable(malformed);
      expect(items).toHaveLength(1);
      expect(items[0].companyName).toBe("Startup Inc");
      expect(items[0].minLpa).toBe(6.0);
    });
  });

  describe("extractPlacementImport — Hybrid Pipeline & Anti-Injection", () => {
    it("extracts table items deterministically and queries AI only for substantive prose without duplication", async () => {
      const rawInput = `
### Active Opportunities for 2026
| Company | Role | Package | Eligibility | Status |
|---|---|---|---|---|
| Deloitte | Analyst | ₹7.6 LPA | CSE, IT | Apply by 20 Sep 2026 |

### Results Announced
Infosys has released the list of selected candidates for Specialist Programmer.
      `.trim();

      vi.mocked(generateText).mockResolvedValue({
        content: JSON.stringify({
          items: [
            {
              noticeType: "RESULT",
              companyName: "Infosys",
              roleTitle: "Specialist Programmer",
              rawSnippet: "Infosys has released the list of selected candidates",
              confidence: 0.95,
            },
          ],
        }),
        provider: "groq",
      });

      const result = await extractPlacementImport(rawInput);

      expect(result.extractedTableCount).toBe(1);
      expect(result.extractedProseCount).toBe(1);
      expect(result.items).toHaveLength(2);

      expect(result.items[0].companyName).toBe("Deloitte");
      expect(result.items[0].packageText).toContain("7.6 LPA");

      expect(result.items[1].companyName).toBe("Infosys");
      expect(result.items[1].noticeType).toBe("RESULT");

      // Verify AI prompt isolated untrusted content
      expect(generateText).toHaveBeenCalledWith(
        expect.stringContaining("<user_untrusted_content>"),
        expect.stringContaining("CRITICAL SECURITY RULE"),
        "auto",
        expect.any(Object)
      );
    });

    it("does NOT invoke AI if there is no remaining prose outside tables", async () => {
      const pureTable = `
| Company | Role | Package | Eligibility | Status |
|---|---|---|---|---|
| TCS | Digital | ₹7.0 LPA | CSE | 2026-09-30 |
      `.trim();

      const result = await extractPlacementImport(pureTable);
      expect(result.extractedTableCount).toBe(1);
      expect(result.extractedProseCount).toBe(0);
      expect(generateText).not.toHaveBeenCalled();
    });
  });
});
