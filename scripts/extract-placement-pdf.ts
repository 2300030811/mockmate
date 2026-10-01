import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { DocumentAnalysisClient, AzureKeyCredential } from "@azure/ai-form-recognizer";
import { processRawRow, PlacementAuditRecord } from "../lib/utils/placement-extractor";

// Load environment variables from .env.local or .env
const envLocalPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
} else {
  dotenv.config();
}

interface ExtractionResult {
  records: PlacementAuditRecord[];
  pagesProcessed: number;
  rowsDetected: number;
  rowsStructurallyValid: number;
  rowsWithWarnings: number;
  rowsRequiringReview: number;
  duplicateCompanies: { name: string; count: number }[];
}

async function extractFromAzure(pdfPath: string): Promise<PlacementAuditRecord[]> {
  const dataDir = path.resolve(process.cwd(), "data");
  const rawCachePath = path.join(dataDir, "klu_placements_2025_26_raw.json");
  const forceOcr = process.argv.includes("--force-ocr");

  let rawRows: { sno: string; company: string; date: string; pkg: string; page: number; row: number }[] = [];

  if (fs.existsSync(rawCachePath) && !forceOcr) {
    console.log(`[Cache] Loading raw table rows from ${rawCachePath}...`);
    rawRows = JSON.parse(fs.readFileSync(rawCachePath, "utf8"));
  } else {
    const endpoint = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT;
    const key = process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY;

    if (!endpoint || !key) {
      throw new Error(
        "Missing AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT or AZURE_DOCUMENT_INTELLIGENCE_KEY in environment."
      );
    }

    const client = new DocumentAnalysisClient(endpoint, new AzureKeyCredential(key));
    const buffer = fs.readFileSync(pdfPath);

    const pagesToScan = ["1", "2", "3"];

    for (const pageStr of pagesToScan) {
      console.log(`[Azure OCR] Analyzing Page ${pageStr}...`);
      const poller = await client.beginAnalyzeDocument("prebuilt-layout", buffer, {
        pages: pageStr,
      });
      const result = await poller.pollUntilDone();

      if (!result.tables || result.tables.length === 0) {
        console.warn(`[Azure OCR] Warning: No table detected on page ${pageStr}`);
        continue;
      }

      const table = result.tables[0];
      const pageNum = parseInt(pageStr, 10);

      // Group cells by rowIndex
      const rowMap = new Map<number, typeof table.cells>();
      for (const cell of table.cells) {
        if (!rowMap.has(cell.rowIndex)) {
          rowMap.set(cell.rowIndex, []);
        }
        rowMap.get(cell.rowIndex)!.push(cell);
      }

      // Process each row (skip header row 0)
      for (const [rIdx, cells] of rowMap.entries()) {
        if (rIdx === 0) continue;

        cells.sort((a, b) => a.columnIndex - b.columnIndex);
        const textParts = cells.map((c) => c.content.trim());

        rawRows.push({
          sno: textParts[0] || String(rawRows.length + 1),
          company: textParts[1] || "",
          date: textParts[2] || "",
          pkg: textParts[3] || "",
          page: pageNum,
          row: rIdx,
        });
      }
    }

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(rawCachePath, JSON.stringify(rawRows, null, 2), "utf8");
    console.log(`[Cache] Saved raw OCR rows to ${rawCachePath}`);
  }

  const records: PlacementAuditRecord[] = [];
  for (const raw of rawRows) {
    const record = processRawRow(
      raw.sno,
      raw.company,
      raw.date,
      raw.pkg,
      raw.page,
      raw.row
    );
    records.push(record);
  }

  return records;
}

export async function runExtraction(): Promise<ExtractionResult> {
  const pdfPath = path.resolve(process.cwd(), "2025_2026_KLU_PLACEMENTS_REPORT.pdf");
  if (!fs.existsSync(pdfPath)) {
    throw new Error(`Placement report PDF not found at ${pdfPath}`);
  }

  console.log(`Starting extraction for ${path.basename(pdfPath)}...`);
  const records = await extractFromAzure(pdfPath);

  // Compute machine validation & human verification audit stats
  const rowsDetected = records.length;
  const rowsStructurallyValid = records.filter(
    (r) => r.date_of_visit !== null && r.package_min_lpa !== null && r.cleaned_company.length > 0
  ).length;
  const rowsWithWarnings = records.filter((r) => r.warnings.length > 0).length;
  const rowsRequiringReview = records.filter((r) => r.requires_review).length;

  const companyCounts = new Map<string, number>();
  for (const r of records) {
    companyCounts.set(r.normalized_company, (companyCounts.get(r.normalized_company) || 0) + 1);
  }

  const duplicateCompanies: { name: string; count: number }[] = [];
  for (const [name, count] of companyCounts.entries()) {
    if (count > 1) {
      duplicateCompanies.push({ name, count });
    }
  }

  const result: ExtractionResult = {
    records,
    pagesProcessed: 3,
    rowsDetected,
    rowsStructurallyValid,
    rowsWithWarnings,
    rowsRequiringReview,
    duplicateCompanies,
  };

  // Ensure data directory exists
  const dataDir = path.resolve(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Save full audited JSON dataset
  const jsonPath = path.join(dataDir, "klu_placements_2025_26.json");
  fs.writeFileSync(jsonPath, JSON.stringify(records, null, 2), "utf8");
  console.log(`Audited dataset written to ${jsonPath}`);

  // Generate audit summary markdown report
  const auditReportPath = path.join(dataDir, "klu_placements_2025_26_audit.md");
  let markdown = `# KLU Placement Report (2025-26) Extraction Audit Report\n\n`;
  markdown += `**Source Document**: \`2025_2026_KLU_PLACEMENTS_REPORT.pdf\`  \n`;
  markdown += `**Generated At**: ${new Date().toISOString()}  \n\n`;
  markdown += `## Verification Scorecard\n\n`;
  markdown += `| Metric | Count | Status |\n`;
  markdown += `|---|---|---|\n`;
  markdown += `| **PDF pages processed** | ${result.pagesProcessed} | ✅ |\n`;
  markdown += `| **Rows detected** | ${result.rowsDetected} | ✅ |\n`;
  markdown += `| **Rows structurally valid** | ${result.rowsStructurallyValid} / ${result.rowsDetected} | ✅ |\n`;
  markdown += `| **Rows with watermark/format warnings cleaned** | ${result.rowsWithWarnings} | ℹ️ |\n`;
  markdown += `| **Rows requiring manual review** | ${result.rowsRequiringReview} | ${result.rowsRequiringReview === 0 ? "✅ 0" : "⚠️ " + result.rowsRequiringReview} |\n`;
  markdown += `| **Multi-visit companies** | ${result.duplicateCompanies.map((d) => `${d.name} (${d.count}x)`).join(", ")} | ℹ️ |\n\n`;

  markdown += `## Multi-Visit Companies\n\n`;
  for (const dup of result.duplicateCompanies) {
    const visits = records.filter((r) => r.normalized_company === dup.name);
    markdown += `### ${visits[0].cleaned_company} (${dup.count} visits)\n\n`;
    markdown += `| S.No | Date of Visit | Package Offered | Drive Name | Page |\n`;
    markdown += `|---|---|---|---|---|\n`;
    for (const v of visits) {
      markdown += `| ${v.sno} | ${v.date_of_visit} | ${v.raw_package_text} | ${v.drive_name} | Page ${v.source_page} |\n`;
    }
    markdown += `\n`;
  }

  markdown += `## Rows with Applied Watermark / Normalization Cleanups (${result.rowsWithWarnings})\n\n`;
  markdown += `| S.No | Page | Raw Company | Cleaned Company | Raw Date | Parsed Date | Raw Package | Cleaned Package | Notes |\n`;
  markdown += `|---|---|---|---|---|---|---|---|---|\n`;
  for (const r of records.filter((rec) => rec.warnings.length > 0)) {
    markdown += `| ${r.sno} | P${r.source_page} | \`${r.raw_company.replace(/\n/g, "\\n")}\` | **${r.cleaned_company}** | \`${r.raw_date.replace(/\n/g, "\\n")}\` | ${r.date_of_visit} | \`${r.raw_package_text.replace(/\n/g, "\\n")}\` | ${r.package_min_lpa === r.package_max_lpa ? r.package_min_lpa + " LPA" : r.package_min_lpa + " to " + r.package_max_lpa + " LPA"} | ${r.warnings.join("; ")} |\n`;
  }

  fs.writeFileSync(auditReportPath, markdown, "utf8");
  console.log(`Audit report written to ${auditReportPath}`);

  // Print scorecard to terminal
  console.log("\n==================================================");
  console.log("KLU PLACEMENT REPORT (2025-26) EXTRACTION AUDIT");
  console.log("==================================================");
  console.log(`PDF pages processed:       ${result.pagesProcessed}`);
  console.log(`Rows detected:             ${result.rowsDetected}`);
  console.log(`Rows structurally valid:   ${result.rowsStructurallyValid}`);
  console.log(`Rows with cleanups/warns:  ${result.rowsWithWarnings}`);
  console.log(`Rows requiring review:     ${result.rowsRequiringReview}`);
  console.log(`Multi-visit companies:     ${result.duplicateCompanies.map((d) => `${d.name} (${d.count}x)`).join(", ")}`);
  console.log("==================================================\n");

  return result;
}

// Direct execution entry point
if (process.argv[1] && process.argv[1].endsWith("extract-placement-pdf.ts")) {
  runExtraction().catch((err) => {
    console.error("Extraction failed:", err);
    process.exit(1);
  });
}
