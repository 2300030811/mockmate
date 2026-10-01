-- =================================================================
-- Migration: Add Placement Hub
-- =================================================================
-- Six tables powering MockMate's Placement Intelligence module.
-- All calendar/scheduling data lives in placement_events.
-- Reuses existing update_updated_at_column() trigger from schema.sql.
-- =================================================================

-- 1. Academic Years
CREATE TABLE IF NOT EXISTS public.placement_academic_years (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  year_label TEXT NOT NULL UNIQUE,
  is_current BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- 2. Companies (master directory, deduplicated by normalized_name)
CREATE TABLE IF NOT EXISTS public.placement_companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  normalized_name TEXT NOT NULL UNIQUE,
  industry TEXT,
  website TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- 3. Placement Drives (central entity — one per company visit/role)
CREATE TABLE IF NOT EXISTS public.placement_drives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.placement_companies(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES public.placement_academic_years(id) ON DELETE RESTRICT,
  drive_name TEXT NOT NULL,
  role_title TEXT,
  date_of_visit DATE,
  package_min_lpa NUMERIC(6,2),
  package_max_lpa NUMERIC(6,2),
  package_values JSONB DEFAULT '[]'::jsonb,
  raw_package_text TEXT,
  drive_status TEXT NOT NULL DEFAULT 'completed'
    CHECK (drive_status IN ('announced','registration_open','ongoing','completed','cancelled')),
  eligible_branches TEXT[] DEFAULT '{}',
  min_cgpa NUMERIC(4,2) DEFAULT 0.0,
  source_type TEXT NOT NULL DEFAULT 'manual'
    CHECK (source_type IN ('pdf_report','outlook_email','telegram','manual')),
  source_reference TEXT,
  source_page INT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  -- Deterministic identity for historical seed. Live ingestion will supplement with external_event_id/source hash.
  CONSTRAINT uq_placement_drive_identity UNIQUE (academic_year_id, company_id, date_of_visit, drive_name)
);

-- 4. Placement Events (powers the Today / Upcoming / Deadlines engine)
-- ALL calendar data lives here. No scheduling fields on placement_drives.
CREATE TABLE IF NOT EXISTS public.placement_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  drive_id UUID NOT NULL REFERENCES public.placement_drives(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'REGISTRATION_DEADLINE',
    'PRE_PLACEMENT_TALK',
    'APTITUDE_TEST',
    'CODING_ASSESSMENT',
    'TECHNICAL_INTERVIEW',
    'HR_INTERVIEW',
    'OFFER_RELEASE',
    'OTHER'
  )),
  title TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  venue TEXT,
  meeting_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- 5. Placement Announcements (raw ingestion log — unverified by default)
-- ponytail: raw_body protection currently relies on repository-level column
-- selection for public queries. A database view is the recommended upgrade
-- before live Outlook/Telegram ingestion lands (flagged for Milestone 6+).
CREATE TABLE IF NOT EXISTS public.placement_announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  drive_id UUID REFERENCES public.placement_drives(id) ON DELETE SET NULL,
  source TEXT NOT NULL CHECK (source IN ('outlook','telegram','portal','manual')),
  subject TEXT NOT NULL,
  raw_body TEXT NOT NULL,
  content_hash TEXT,
  importance TEXT DEFAULT 'normal'
    CHECK (importance IN ('low','normal','urgent','critical')),
  received_at TIMESTAMPTZ NOT NULL,
  verified BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- 6. Student Applications (links to existing MockMate auth profiles)
CREATE TABLE IF NOT EXISTS public.placement_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  drive_id UUID NOT NULL REFERENCES public.placement_drives(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'eligible'
    CHECK (status IN (
      'eligible','applied','test_scheduled',
      'interview_scheduled','offered','rejected','withdrawn'
    )),
  applied_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  CONSTRAINT uq_placement_user_drive UNIQUE (user_id, drive_id)
);

-- =================================================================
-- Triggers
-- =================================================================

DROP TRIGGER IF EXISTS set_placement_drives_updated_at ON public.placement_drives;
CREATE TRIGGER set_placement_drives_updated_at
  BEFORE UPDATE ON public.placement_drives
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS set_placement_applications_updated_at ON public.placement_applications;
CREATE TRIGGER set_placement_applications_updated_at
  BEFORE UPDATE ON public.placement_applications
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- =================================================================
-- Indexes (optimized for the Today/Upcoming engine)
-- =================================================================

CREATE INDEX IF NOT EXISTS idx_pe_start_time ON public.placement_events(start_time);
CREATE INDEX IF NOT EXISTS idx_pe_drive_id ON public.placement_events(drive_id);
CREATE INDEX IF NOT EXISTS idx_pe_type_start ON public.placement_events(event_type, start_time);
CREATE INDEX IF NOT EXISTS idx_pd_visit ON public.placement_drives(date_of_visit);
CREATE INDEX IF NOT EXISTS idx_pd_status ON public.placement_drives(drive_status);
CREATE INDEX IF NOT EXISTS idx_pd_year ON public.placement_drives(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_pa_user ON public.placement_applications(user_id, status);
CREATE INDEX IF NOT EXISTS idx_pc_norm ON public.placement_companies(normalized_name);
CREATE INDEX IF NOT EXISTS idx_pann_hash ON public.placement_announcements(content_hash);

-- =================================================================
-- Row Level Security
-- =================================================================

ALTER TABLE public.placement_academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placement_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placement_drives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placement_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placement_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placement_applications ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ: academic years, companies, drives, events
CREATE POLICY "Public read placement_academic_years"
  ON public.placement_academic_years FOR SELECT USING (true);
CREATE POLICY "Public read placement_companies"
  ON public.placement_companies FOR SELECT USING (true);
CREATE POLICY "Public read placement_drives"
  ON public.placement_drives FOR SELECT USING (true);
CREATE POLICY "Public read placement_events"
  ON public.placement_events FOR SELECT USING (true);

-- Base table placement_announcements: restricted to service role / internal operations.
-- Public clients query the placement_announcements_public view instead.

-- PUBLIC VIEW: Excludes raw_body at the database level.
CREATE OR REPLACE VIEW public.placement_announcements_public AS
SELECT
  id,
  drive_id,
  source,
  subject,
  importance,
  received_at,
  verified,
  created_at
FROM public.placement_announcements
WHERE verified = true;

GRANT SELECT ON public.placement_announcements_public TO anon, authenticated;

-- APPLICATIONS: users see/manage only their own
CREATE POLICY "Users read own applications"
  ON public.placement_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own applications"
  ON public.placement_applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own applications"
  ON public.placement_applications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

NOTIFY pgrst, 'reload schema';
