-- =================================================================
-- Migration: Add Placement Imports (Audit Table & Provenance Columns)
-- =================================================================

-- 1. Private User-Scoped Import Audit Storage
-- Raw pasted text (which may contain student PII: roll numbers, names, phone numbers)
-- is strictly isolated here and NEVER exposed in public placement tables.
CREATE TABLE IF NOT EXISTS public.placement_import_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  raw_text TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  draft_snapshot JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'analyzed' CHECK (status IN ('analyzed', 'confirmed', 'discarded')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  confirmed_at TIMESTAMPTZ
);

-- Index for fast lookup by user and content hash
CREATE INDEX IF NOT EXISTS idx_pis_user_id ON public.placement_import_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_pis_hash ON public.placement_import_submissions(content_hash);

-- 2. Row Level Security on placement_import_submissions
ALTER TABLE public.placement_import_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read, insert, and update their own import submissions
DROP POLICY IF EXISTS "Users can manage their own placement imports" ON public.placement_import_submissions;
CREATE POLICY "Users can manage their own placement imports"
  ON public.placement_import_submissions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Service role bypass for server tasks
DROP POLICY IF EXISTS "Service role manages placement_import_submissions" ON public.placement_import_submissions;
CREATE POLICY "Service role manages placement_import_submissions"
  ON public.placement_import_submissions
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 3. Update placement_drives to support student_submission source and explicit verification flags
ALTER TABLE public.placement_drives 
  DROP CONSTRAINT IF EXISTS placement_drives_source_type_check,
  ADD CONSTRAINT placement_drives_source_type_check 
    CHECK (source_type IN ('pdf_report', 'outlook_email', 'telegram', 'manual', 'student_submission'));

ALTER TABLE public.placement_drives
  ADD COLUMN IF NOT EXISTS source_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS data_verified BOOLEAN DEFAULT false;

-- 4. Update placement_announcements to support student_submission source
ALTER TABLE public.placement_announcements
  DROP CONSTRAINT IF EXISTS placement_announcements_source_check,
  ADD CONSTRAINT placement_announcements_source_check
    CHECK (source IN ('outlook', 'telegram', 'portal', 'manual', 'student_submission'));
