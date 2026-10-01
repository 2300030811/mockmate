-- =================================================================
-- Migration: Add Placement History Table
-- =================================================================
-- Dedicated historical reference table for KLU placement data (2016-2026).
-- Completely isolated from live 2026-27 placement_drives and calendar engine.
-- Preserves 1:1 fidelity with source records, exact null semantics, and
-- all data quality flags.
-- =================================================================

CREATE TABLE IF NOT EXISTS public.placement_history (
  id TEXT PRIMARY KEY,                           -- Preserves source ID e.g. "ece-2026-2027-001", "cse-2025-2026-001"
  company_name TEXT NOT NULL,                   -- Verbatim source company string (e.g. "TCS-Digital", "GGK+Wipro+Infosys...")
  normalized_company_name TEXT,                  -- NULL for 1,103 records; only set for the 3 source-normalized records
  company_id UUID REFERENCES public.placement_companies(id) ON DELETE SET NULL, -- Optional company-level link (never implies track equality)
  department TEXT NOT NULL CHECK (department IN ('ECE', 'CSE')),
  academic_year TEXT NOT NULL,                  -- e.g. "2024-2025", "2021-2022"

  -- ECE-Specific Columns (Strictly NULL for CSE)
  visit_date TEXT,                              -- Preserved verbatim (e.g. "21-10-2024", "12.08.22", "14.06.19 & 26.07.19")
  students_placed INT,                          -- Headcount placed in ECE (NULL for CSE)
  package_lpa JSONB,                            -- JSONB array of strings e.g. ["10"] or ["3.8", "6.8"], NULL for CSE & ECE 2016-19

  -- CSE-Specific Columns (Strictly NULL for ECE)
  offers_count INT,                             -- Total Offers published by CSE (NULL for ECE)
  btech_offers INT,                             -- B.Tech offers count (NULL for ECE, and NULL when blank in source)
  mtech_offers INT,                             -- M.Tech offers count (NULL for ECE, and NULL when blank in source)
  ctc_lpa TEXT,                                 -- Verbatim CTC string e.g. "7", "3.45", "58.00" (NULL for ECE)

  -- Provenance & Audit
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  source_type TEXT NOT NULL,
  page_number INT,
  source_row_serial_no TEXT NOT NULL,
  source_notes TEXT,
  data_quality_status TEXT[] NOT NULL DEFAULT '{"clean"}',
  source_dataset TEXT NOT NULL DEFAULT 'klu_placements_supplementary_2016_2026',
  import_batch TEXT NOT NULL DEFAULT 'initial_historical_seed',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_ph_academic_year ON public.placement_history(academic_year);
CREATE INDEX IF NOT EXISTS idx_ph_department ON public.placement_history(department);
CREATE INDEX IF NOT EXISTS idx_ph_company_name ON public.placement_history(company_name);
CREATE INDEX IF NOT EXISTS idx_ph_company_id ON public.placement_history(company_id);
CREATE INDEX IF NOT EXISTS idx_ph_source_dataset ON public.placement_history(source_dataset);
CREATE INDEX IF NOT EXISTS idx_ph_quality ON public.placement_history USING GIN (data_quality_status);

-- Row Level Security (Public Read-Only, Service Role Write)
ALTER TABLE public.placement_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view placement history" ON public.placement_history;
CREATE POLICY "Public can view placement history"
  ON public.placement_history
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Service role manages placement history" ON public.placement_history;
CREATE POLICY "Service role manages placement history"
  ON public.placement_history
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
