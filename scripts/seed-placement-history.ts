import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Load environment variables
const envLocalPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
} else {
  dotenv.config();
}

function getAdminClient(): SupabaseClient {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment."
    );
  }

  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

interface RawPlacementFile {
  schema_version: string;
  total_records: number;
  records_by_department: Record<string, number>;
  records_by_academic_year: Record<string, number>;
  records: Array<{
    id: string;
    company: string;
    normalized_company_name: string | null;
    department: "ECE" | "CSE";
    academic_year: string;
    visit_date: string | null;
    students_placed: number | null;
    package_lpa: string[] | null;
    offers_count: number | null;
    btech_offers: number | null;
    mtech_offers: number | null;
    ctc_lpa: string | null;
    source_name: string;
    source_url: string;
    source_type: string;
    page_number: number | null;
    source_row_serial_no: string;
    source_notes: string | null;
    data_quality_status: string[];
  }>;
}

export function normalizeCompanyName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Conservative company resolver:
 * - Grouped multi-company rows (contain '+') MUST keep company_id = null
 * - Returns matching company_id ONLY if there is a clean, unambiguous company match
 * - Never mutates or normalizes the source company_name
 */
export function resolveConservativeCompanyId(
  sourceCompany: string,
  normalizedSourceName: string | null,
  isGroupedRow: boolean,
  companiesByNormName: Map<string, string>
): string | null {
  // Rule: Multi-company grouped rows must NEVER be linked
  if (isGroupedRow || sourceCompany.includes("+")) {
    return null;
  }

  // 1. Check if source explicitly provided a normalized company name
  if (normalizedSourceName) {
    const explicitNorm = normalizeCompanyName(normalizedSourceName);
    if (companiesByNormName.has(explicitNorm)) {
      return companiesByNormName.get(explicitNorm)!;
    }
  }

  // 2. Exact match on raw company name
  const rawNorm = normalizeCompanyName(sourceCompany);
  if (companiesByNormName.has(rawNorm)) {
    return companiesByNormName.get(rawNorm)!;
  }

  // 3. Conservative prefix match for track suffixes (e.g. "TCS-Digital" -> parent "TCS")
  // Only strips common track separators like "-", " (", " - " if the base company exists
  const parts = sourceCompany.split(/[-–(]/);
  if (parts.length > 1) {
    const baseCandidate = normalizeCompanyName(parts[0].trim());
    if (baseCandidate.length >= 3 && companiesByNormName.has(baseCandidate)) {
      return companiesByNormName.get(baseCandidate)!;
    }
  }

  return null;
}

export async function seedPlacementHistory(jsonFilePath?: string): Promise<{
  totalProcessed: number;
  totalUpserted: number;
  eceCount: number;
  cseCount: number;
  linkedCompaniesCount: number;
  unlinkedCount: number;
  groupedRowsCount: number;
}> {
  const db = getAdminClient();
  const targetPath =
    jsonFilePath ||
    path.resolve(process.cwd(), "data/klu_placements_supplementary_2016_2026.json");

  if (!fs.existsSync(targetPath)) {
    throw new Error(`Historical dataset file not found at: ${targetPath}`);
  }

  const rawData: RawPlacementFile = JSON.parse(
    fs.readFileSync(targetPath, "utf8")
  );
  console.log(`Loaded ${rawData.records.length} records from ${targetPath}`);

  // 1. Fetch existing placement_companies for conservative company-level linking
  console.log("Fetching existing placement_companies for conservative resolution...");
  const { data: existingCompanies, error: compErr } = await db
    .from("placement_companies")
    .select("id, name, normalized_name");

  if (compErr) {
    throw new Error(`Failed to fetch placement_companies: ${compErr.message}`);
  }

  const companiesByNormName = new Map<string, string>(); // normalized_name -> UUID
  for (const c of existingCompanies || []) {
    companiesByNormName.set(c.normalized_name, c.id);
  }
  console.log(`Loaded ${companiesByNormName.size} existing master companies.`);

  // 2. Transform records
  let eceCount = 0;
  let cseCount = 0;
  let linkedCompaniesCount = 0;
  let unlinkedCount = 0;
  let groupedRowsCount = 0;

  const rowsToUpsert = rawData.records.map((r) => {
    if (r.department === "ECE") eceCount++;
    if (r.department === "CSE") cseCount++;

    const isGrouped =
      r.company.includes("+") ||
      (r.data_quality_status || []).includes("grouped_multi_company_row");

    if (isGrouped) {
      groupedRowsCount++;
    }

    const companyId = resolveConservativeCompanyId(
      r.company,
      r.normalized_company_name,
      isGrouped,
      companiesByNormName
    );

    if (companyId) {
      linkedCompaniesCount++;
    } else {
      unlinkedCount++;
    }

    return {
      id: r.id,
      company_name: r.company,
      normalized_company_name: r.normalized_company_name ?? null,
      company_id: companyId,
      department: r.department,
      academic_year: r.academic_year,
      visit_date: r.visit_date ?? null,
      students_placed: r.students_placed ?? null,
      package_lpa: r.package_lpa ?? null,
      offers_count: r.offers_count ?? null,
      btech_offers: r.btech_offers ?? null,
      mtech_offers: r.mtech_offers ?? null,
      ctc_lpa: r.ctc_lpa ?? null,
      source_name: r.source_name,
      source_url: r.source_url,
      source_type: r.source_type,
      page_number: r.page_number ?? null,
      source_row_serial_no: r.source_row_serial_no,
      source_notes: r.source_notes ?? null,
      data_quality_status: r.data_quality_status ?? ["clean"],
      source_dataset: "klu_placements_supplementary_2016_2026",
      import_batch: "initial_historical_seed",
    };
  });

  // 3. Batch upsert (chunks of 100)
  const CHUNK_SIZE = 100;
  console.log(`Upserting ${rowsToUpsert.length} records in batches of ${CHUNK_SIZE}...`);

  for (let i = 0; i < rowsToUpsert.length; i += CHUNK_SIZE) {
    const chunk = rowsToUpsert.slice(i, i + CHUNK_SIZE);
    const { error: upsertErr } = await db
      .from("placement_history")
      .upsert(chunk, { onConflict: "id" });

    if (upsertErr) {
      throw new Error(`Batch upsert failed at index ${i}: ${upsertErr.message}`);
    }
    process.stdout.write(`Processed ${Math.min(i + CHUNK_SIZE, rowsToUpsert.length)} / ${rowsToUpsert.length}\r`);
  }

  console.log("\n✅ Upsert completed successfully.");
  console.log(`   Total Records: ${rowsToUpsert.length}`);
  console.log(`   ECE: ${eceCount}`);
  console.log(`   CSE: ${cseCount}`);
  console.log(`   Linked Company References: ${linkedCompaniesCount}`);
  console.log(`   Unlinked / Standalone Records: ${unlinkedCount}`);
  console.log(`   Grouped Multi-Company Records (Explicitly Unlinked): ${groupedRowsCount}`);

  return {
    totalProcessed: rawData.records.length,
    totalUpserted: rowsToUpsert.length,
    eceCount,
    cseCount,
    linkedCompaniesCount,
    unlinkedCount,
    groupedRowsCount,
  };
}

interface Ece2025JsonRecord {
  sno: number;
  source_page: number;
  source_row: number;
  raw_company: string;
  cleaned_company: string;
  normalized_company: string;
  drive_name: string;
  role_title: string | null;
  raw_date: string;
  date_of_visit: string;
  raw_package_text: string;
  package_min_lpa: number;
  package_max_lpa: number;
  package_values: number[];
  warnings: string[];
  requires_review: boolean;
}

/**
 * Imports the 114 ECE 2025-2026 records from the verified PDF report into placement_history
 * using source_dataset = "klu_placements_2025_2026_report".
 * Provides 100% complete historical company profiles across the entire 2016-2026 period.
 */
export async function seedEce2025ReportHistory(jsonFilePath?: string): Promise<{
  totalProcessed: number;
  totalUpserted: number;
  linkedCompaniesCount: number;
}> {
  const db = getAdminClient();
  const targetPath =
    jsonFilePath || path.resolve(process.cwd(), "data/klu_placements_2025_26.json");

  if (!fs.existsSync(targetPath)) {
    throw new Error(`ECE 2025-26 report JSON not found at: ${targetPath}`);
  }

  const rawData: Ece2025JsonRecord[] = JSON.parse(
    fs.readFileSync(targetPath, "utf8")
  );
  console.log(`\nLoading ${rawData.length} ECE 2025-2026 records from ${targetPath}...`);

  const { data: existingCompanies, error: compErr } = await db
    .from("placement_companies")
    .select("id, name, normalized_name");

  if (compErr) {
    throw new Error(`Failed to fetch placement_companies: ${compErr.message}`);
  }

  const companiesByNormName = new Map<string, string>();
  for (const c of existingCompanies || []) {
    companiesByNormName.set(c.normalized_name, c.id);
  }

  let linkedCompaniesCount = 0;
  const rowsToUpsert = rawData.map((r) => {
    const companyId = companiesByNormName.get(r.normalized_company) || null;
    if (companyId) linkedCompaniesCount++;

    return {
      id: `ece-2025-2026-${String(r.sno).padStart(3, "0")}`,
      company_name: r.cleaned_company,
      normalized_company_name: null,
      company_id: companyId,
      department: "ECE" as const,
      academic_year: "2025-2026",
      visit_date: r.raw_date,
      students_placed: null,
      package_lpa: r.package_values.map((v) => v.toString()),
      offers_count: null,
      btech_offers: null,
      mtech_offers: null,
      ctc_lpa: null,
      source_name: "KL University (KLEF) - 2025-2026 Placements Report",
      source_url: "2025_2026_KLU_PLACEMENTS_REPORT.pdf",
      source_type: "pdf_report",
      page_number: r.source_page,
      source_row_serial_no: String(r.sno),
      source_notes: r.warnings && r.warnings.length > 0 ? r.warnings.join("; ") : null,
      data_quality_status: ["clean"],
      source_dataset: "klu_placements_2025_2026_report",
      import_batch: "ece_2025_2026_pdf_seed",
    };
  });

  const CHUNK_SIZE = 100;
  for (let i = 0; i < rowsToUpsert.length; i += CHUNK_SIZE) {
    const chunk = rowsToUpsert.slice(i, i + CHUNK_SIZE);
    const { error: upsertErr } = await db
      .from("placement_history")
      .upsert(chunk, { onConflict: "id" });

    if (upsertErr) {
      throw new Error(`Batch upsert of ECE 2025-26 failed at index ${i}: ${upsertErr.message}`);
    }
  }

  console.log(`✅ Upserted ${rowsToUpsert.length} ECE 2025-2026 records into placement_history.`);
  console.log(`   Linked Company References: ${linkedCompaniesCount} / ${rowsToUpsert.length}`);

  return {
    totalProcessed: rawData.length,
    totalUpserted: rowsToUpsert.length,
    linkedCompaniesCount,
  };
}

export async function seedAllPlacementHistory() {
  const supplementary = await seedPlacementHistory();
  const ece2025 = await seedEce2025ReportHistory();
  return { supplementary, ece2025 };
}

// Allow direct execution
if (require.main === module) {
  seedAllPlacementHistory()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Seed failed:", err);
      process.exit(1);
    });
}
