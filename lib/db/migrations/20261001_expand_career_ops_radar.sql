-- =================================================================
-- Migration: Expand Career-Ops Radar Sources & Lifecycle Gates
-- =================================================================
-- Unifies Job Radar enterprise adapters (Workday, Oracle, Workable,
-- Remotive, Arbeitnow) with Career-Ops pipeline inside MockMate.
-- =================================================================

-- 1. Relax check constraints on career_ops_scan_targets
ALTER TABLE public.career_ops_scan_targets
  DROP CONSTRAINT IF EXISTS career_ops_scan_targets_api_type_check;

ALTER TABLE public.career_ops_scan_targets
  ADD CONSTRAINT career_ops_scan_targets_api_type_check
  CHECK (api_type IN (
    'greenhouse',
    'ashby',
    'lever',
    'workday',
    'oracle',
    'workable',
    'remotive',
    'arbeitnow'
  ));

-- 2. Relax check constraints on career_ops_job_postings
ALTER TABLE public.career_ops_job_postings
  DROP CONSTRAINT IF EXISTS career_ops_job_postings_source_check;

ALTER TABLE public.career_ops_job_postings
  ADD CONSTRAINT career_ops_job_postings_source_check
  CHECK (source IN (
    'greenhouse',
    'ashby',
    'lever',
    'workday',
    'oracle',
    'workable',
    'remotive',
    'arbeitnow'
  ));

-- 3. Add closed_at timestamp for dead job detection
ALTER TABLE public.career_ops_job_postings
  ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS gate_notes TEXT;

-- 4. Seed expanded enterprise and discovery targets
INSERT INTO public.career_ops_scan_targets (name, api_type, api_url, enabled)
VALUES
  ('Adobe', 'workday', 'https://adobe.wd5.myworkdayjobs.com/wday/cxs/adobe/external_experienced/jobs', true),
  ('Figma', 'greenhouse', 'https://boards-api.greenhouse.io/v1/boards/figma/jobs?content=true', true),
  ('Ramp', 'ashby', 'https://api.ashbyhq.com/posting-api/job-board/ramp', true),
  ('Spotify', 'lever', 'https://api.lever.co/v0/postings/spotify', true),
  ('Remotive Tech', 'remotive', 'https://remotive.com/api/remote-jobs?search=software%20engineer&limit=40', true)
ON CONFLICT (name)
DO UPDATE
  SET api_type = EXCLUDED.api_type,
      api_url = EXCLUDED.api_url,
      enabled = EXCLUDED.enabled;
