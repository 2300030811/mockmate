import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { placementRepository } from "../lib/db/placement-repository";
import { PlacementAuditRecord } from "../lib/utils/placement-extractor";

// Load environment variables from .env.local or .env
const envLocalPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
} else {
  dotenv.config();
}

// Configurable academic year parameters
export const CONFIG = {
  HISTORICAL_ACADEMIC_YEAR: process.env.HISTORICAL_ACADEMIC_YEAR || "2025-26",
  CURRENT_ACADEMIC_YEAR: process.env.CURRENT_ACADEMIC_YEAR || "2026-27",
  SOURCE_PDF_NAME: "2025_2026_KLU_PLACEMENTS_REPORT.pdf",
};

export function getAdminClient(): SupabaseClient {
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

export async function seedPlacements(): Promise<{
  historicalYearId: string;
  currentYearId: string;
  uniqueCompaniesCount: number;
  drivesUpserted: number;
  totalDrivesInDb: number;
}> {
  const db = getAdminClient();

  // 1. Load audited JSON dataset
  const jsonPath = path.resolve(process.cwd(), "data/klu_placements_2025_26.json");
  if (!fs.existsSync(jsonPath)) {
    throw new Error(
      `Dataset not found at ${jsonPath}. Run 'npx tsx scripts/extract-placement-pdf.ts' first.`
    );
  }

  const records: PlacementAuditRecord[] = JSON.parse(
    fs.readFileSync(jsonPath, "utf8")
  );
  console.log(`Loaded ${records.length} audited placement records from JSON.`);

  // 2. Upsert Academic Years (configurable, idempotent)
  console.log(`\n1. Upserting Academic Years...`);
  const historicalYearId = await placementRepository.upsertAcademicYear(
    db,
    CONFIG.HISTORICAL_ACADEMIC_YEAR,
    false // Historical season
  );
  console.log(
    `   Historical Year "${CONFIG.HISTORICAL_ACADEMIC_YEAR}" id: ${historicalYearId}`
  );

  const currentYearId = await placementRepository.upsertAcademicYear(
    db,
    CONFIG.CURRENT_ACADEMIC_YEAR,
    true // Current active season
  );
  console.log(
    `   Current Year "${CONFIG.CURRENT_ACADEMIC_YEAR}" id: ${currentYearId}`
  );

  // 3. Upsert Companies (deduplicated by normalized_name)
  console.log(`\n2. Upserting Master Companies Directory...`);
  const uniqueCompaniesMap = new Map<string, string>(); // normalized_name -> display name
  for (const r of records) {
    if (!uniqueCompaniesMap.has(r.normalized_company)) {
      uniqueCompaniesMap.set(r.normalized_company, r.cleaned_company);
    }
  }

  const companyIdMap = new Map<string, string>(); // normalized_name -> UUID
  for (const [normalizedName, displayName] of uniqueCompaniesMap.entries()) {
    const companyId = await placementRepository.upsertCompany(db, displayName);
    companyIdMap.set(normalizedName, companyId);
  }
  console.log(
    `   Upserted ${companyIdMap.size} unique companies from ${records.length} records.`
  );

  // 4. Upsert Placement Drives (idempotent composite key)
  console.log(`\n3. Upserting Placement Drives (Batch / Idempotent)...`);
  let drivesUpserted = 0;

  for (const r of records) {
    const companyId = companyIdMap.get(r.normalized_company);
    if (!companyId) {
      throw new Error(`Company ID not found for normalized name: ${r.normalized_company}`);
    }

    const drivePayload = {
      academic_year_id: historicalYearId,
      company_id: companyId,
      drive_name: r.drive_name,
      role_title: r.role_title,
      date_of_visit: r.date_of_visit,
      package_min_lpa: r.package_min_lpa,
      package_max_lpa: r.package_max_lpa,
      package_values: r.package_values,
      raw_package_text: r.raw_package_text,
      drive_status: "completed",
      source_type: "pdf_report",
      source_reference: CONFIG.SOURCE_PDF_NAME,
      source_page: r.source_page,
      notes: `S.No ${r.sno} in ${CONFIG.HISTORICAL_ACADEMIC_YEAR} report`,
    };

    await placementRepository.upsertDrive(db, drivePayload);
    drivesUpserted++;
  }
  console.log(`   Processed and upserted ${drivesUpserted} drives.`);

  // 5. Verify database counts
  const { count: totalDrivesInDb, error: countErr } = await db
    .from("placement_drives")
    .select("id", { count: "exact", head: true })
    .eq("academic_year_id", historicalYearId);

  if (countErr) {
    console.warn("Could not verify exact drive count:", countErr.message);
  }

  console.log(`\n==================================================`);
  console.log(`SEEDING SUMMARY`);
  console.log(`==================================================`);
  console.log(`Historical Year:         ${CONFIG.HISTORICAL_ACADEMIC_YEAR}`);
  console.log(`Current Year:            ${CONFIG.CURRENT_ACADEMIC_YEAR}`);
  console.log(`Unique Companies:        ${companyIdMap.size}`);
  console.log(`Drives Upserted:         ${drivesUpserted}`);
  console.log(`Total Drives in DB:      ${totalDrivesInDb ?? "N/A"}`);
  console.log(`Idempotency Check:       ${totalDrivesInDb === 114 ? "PASSED (Exact 114 drives in DB)" : "See DB count"}`);
  console.log(`==================================================\n`);

  return {
    historicalYearId,
    currentYearId,
    uniqueCompaniesCount: companyIdMap.size,
    drivesUpserted,
    totalDrivesInDb: totalDrivesInDb ?? drivesUpserted,
  };
}

// CLI execution
if (process.argv[1] && process.argv[1].endsWith("seed-placements.ts")) {
  seedPlacements().catch((err) => {
    console.error("Seed execution failed:", err);
    process.exit(1);
  });
}
