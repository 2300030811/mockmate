-- =================================================================
-- Migration: Add Career-Ops tracking foundations
-- =================================================================
-- Introduces scanner, posting, and application lifecycle tables used by
-- the career-ops adaptation in MockMate.
-- =================================================================

-- Reuse a shared updated_at trigger function for consistency.
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Canonical status check helper using text + CHECK constraints.
-- Canonical statuses:
-- evaluated, applied, responded, interview, offer, rejected, discarded, skip

-- ==========================================
-- 1. Scanner Targets and Runs
-- ==========================================

CREATE TABLE IF NOT EXISTS public.career_ops_scan_targets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  api_type TEXT NOT NULL CHECK (api_type IN ('greenhouse', 'ashby', 'lever')),
  api_url TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

DROP TRIGGER IF EXISTS set_career_ops_scan_targets_updated_at ON public.career_ops_scan_targets;
CREATE TRIGGER set_career_ops_scan_targets_updated_at
  BEFORE UPDATE ON public.career_ops_scan_targets
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.career_ops_scan_runs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed')) DEFAULT 'running',
  scanned_targets INTEGER NOT NULL DEFAULT 0,
  found_count INTEGER NOT NULL DEFAULT 0,
  filtered_count INTEGER NOT NULL DEFAULT 0,
  deduped_count INTEGER NOT NULL DEFAULT 0,
  inserted_count INTEGER NOT NULL DEFAULT 0,
  skipped_existing_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  created_by TEXT NOT NULL DEFAULT 'cron',
  started_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at TIMESTAMPTZ
);

-- ==========================================
-- 2. Scanned Job Postings
-- ==========================================

CREATE TABLE IF NOT EXISTS public.career_ops_job_postings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  external_url TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL CHECK (source IN ('greenhouse', 'ashby', 'lever')),
  source_job_id TEXT,
  company TEXT NOT NULL,
  title TEXT NOT NULL,
  location TEXT,
  normalized_company TEXT NOT NULL,
  normalized_title TEXT NOT NULL,
  job_fingerprint TEXT NOT NULL,
  posting_status TEXT NOT NULL CHECK (posting_status IN ('active', 'expired', 'uncertain')) DEFAULT 'active',
  first_seen_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_seen_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_liveness_checked_at TIMESTAMPTZ,
  last_liveness_result TEXT CHECK (last_liveness_result IN ('active', 'expired', 'uncertain')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- ==========================================
-- 3. Application Lifecycle
-- ==========================================

CREATE TABLE IF NOT EXISTS public.career_ops_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_posting_id UUID REFERENCES public.career_ops_job_postings(id) ON DELETE SET NULL,
  job_role TEXT NOT NULL,
  company TEXT NOT NULL,
  source_url TEXT,
  status TEXT NOT NULL CHECK (status IN ('evaluated', 'applied', 'responded', 'interview', 'offer', 'rejected', 'discarded', 'skip')) DEFAULT 'evaluated',
  match_score INTEGER CHECK (match_score >= 0 AND match_score <= 100),
  notes TEXT,
  applied_on DATE,
  next_follow_up_date DATE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

DROP TRIGGER IF EXISTS set_career_ops_applications_updated_at ON public.career_ops_applications;
CREATE TRIGGER set_career_ops_applications_updated_at
  BEFORE UPDATE ON public.career_ops_applications
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.career_ops_application_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.career_ops_applications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_status TEXT CHECK (from_status IN ('evaluated', 'applied', 'responded', 'interview', 'offer', 'rejected', 'discarded', 'skip')),
  to_status TEXT NOT NULL CHECK (to_status IN ('evaluated', 'applied', 'responded', 'interview', 'offer', 'rejected', 'discarded', 'skip')),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.career_ops_follow_ups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.career_ops_applications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel TEXT NOT NULL DEFAULT 'email',
  contact_name TEXT,
  contact_email TEXT,
  followed_up_on DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 4. Row Level Security
-- ==========================================

ALTER TABLE public.career_ops_scan_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_ops_scan_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_ops_job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_ops_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_ops_application_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_ops_follow_ups ENABLE ROW LEVEL SECURITY;

-- scanner targets/postings are safe to read publicly; writes happen via service role.
DROP POLICY IF EXISTS "Public can read career ops scan targets" ON public.career_ops_scan_targets;
CREATE POLICY "Public can read career ops scan targets"
  ON public.career_ops_scan_targets FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read career ops postings" ON public.career_ops_job_postings;
CREATE POLICY "Public can read career ops postings"
  ON public.career_ops_job_postings FOR SELECT USING (true);

-- scan run metadata visible to admins.
DROP POLICY IF EXISTS "Admins can read career ops scan runs" ON public.career_ops_scan_runs;
CREATE POLICY "Admins can read career ops scan runs"
  ON public.career_ops_scan_runs FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- applications/events/followups are private per user.
DROP POLICY IF EXISTS "Users can read own career ops applications" ON public.career_ops_applications;
CREATE POLICY "Users can read own career ops applications"
  ON public.career_ops_applications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own career ops applications" ON public.career_ops_applications;
CREATE POLICY "Users can insert own career ops applications"
  ON public.career_ops_applications FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own career ops applications" ON public.career_ops_applications;
CREATE POLICY "Users can update own career ops applications"
  ON public.career_ops_applications FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own career ops applications" ON public.career_ops_applications;
CREATE POLICY "Users can delete own career ops applications"
  ON public.career_ops_applications FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read own career ops application events" ON public.career_ops_application_events;
CREATE POLICY "Users can read own career ops application events"
  ON public.career_ops_application_events FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own career ops application events" ON public.career_ops_application_events;
CREATE POLICY "Users can insert own career ops application events"
  ON public.career_ops_application_events FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read own career ops follow ups" ON public.career_ops_follow_ups;
CREATE POLICY "Users can read own career ops follow ups"
  ON public.career_ops_follow_ups FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own career ops follow ups" ON public.career_ops_follow_ups;
CREATE POLICY "Users can insert own career ops follow ups"
  ON public.career_ops_follow_ups FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own career ops follow ups" ON public.career_ops_follow_ups;
CREATE POLICY "Users can update own career ops follow ups"
  ON public.career_ops_follow_ups FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own career ops follow ups" ON public.career_ops_follow_ups;
CREATE POLICY "Users can delete own career ops follow ups"
  ON public.career_ops_follow_ups FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- 5. Indexes
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_career_ops_scan_targets_enabled
  ON public.career_ops_scan_targets(enabled);

CREATE INDEX IF NOT EXISTS idx_career_ops_scan_runs_started_at
  ON public.career_ops_scan_runs(started_at DESC);

CREATE INDEX IF NOT EXISTS idx_career_ops_scan_runs_status
  ON public.career_ops_scan_runs(status);

CREATE INDEX IF NOT EXISTS idx_career_ops_job_postings_status_seen
  ON public.career_ops_job_postings(posting_status, last_seen_at DESC);

CREATE INDEX IF NOT EXISTS idx_career_ops_job_postings_company_title
  ON public.career_ops_job_postings(normalized_company, normalized_title);

CREATE INDEX IF NOT EXISTS idx_career_ops_job_postings_fingerprint
  ON public.career_ops_job_postings(job_fingerprint);

CREATE INDEX IF NOT EXISTS idx_career_ops_applications_user_status
  ON public.career_ops_applications(user_id, status, updated_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_career_ops_applications_user_posting
  ON public.career_ops_applications(user_id, job_posting_id)
  WHERE job_posting_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_career_ops_applications_follow_up_due
  ON public.career_ops_applications(next_follow_up_date)
  WHERE status IN ('evaluated', 'applied', 'responded', 'interview');

CREATE INDEX IF NOT EXISTS idx_career_ops_application_events_app_created
  ON public.career_ops_application_events(application_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_career_ops_follow_ups_app_date
  ON public.career_ops_follow_ups(application_id, followed_up_on DESC);

CREATE INDEX IF NOT EXISTS idx_career_ops_follow_ups_user_date
  ON public.career_ops_follow_ups(user_id, followed_up_on DESC);

-- ==========================================
-- 6. Seed Defaults
-- ==========================================

INSERT INTO public.career_ops_scan_targets (name, api_type, api_url, enabled)
VALUES
  ('Cohere', 'lever', 'https://api.lever.co/v0/postings/cohere', true),
  ('Anthropic', 'lever', 'https://api.lever.co/v0/postings/anthropic', true)
ON CONFLICT (name) DO UPDATE
  SET api_type = EXCLUDED.api_type,
      api_url = EXCLUDED.api_url,
      enabled = EXCLUDED.enabled,
      updated_at = timezone('utc'::text, now());

-- ==========================================
-- 7. Refresh PostgREST schema
-- ==========================================

NOTIFY pgrst, 'reload schema';
