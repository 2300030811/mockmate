-- =================================================================
-- Migration: Add Career-Ops pattern dimensions
-- =================================================================
-- Adds optional normalized dimensions used by pattern analytics:
-- role archetype, target level, primary blocker, and blocker tags.
-- =================================================================

ALTER TABLE public.career_ops_applications
  ADD COLUMN IF NOT EXISTS role_archetype TEXT
    CHECK (
      role_archetype IS NULL OR
      role_archetype IN (
        'fullstack',
        'backend',
        'frontend',
        'data_ml',
        'devops',
        'mobile',
        'security',
        'qa',
        'product',
        'platform',
        'unknown'
      )
    ),
  ADD COLUMN IF NOT EXISTS target_level TEXT,
  ADD COLUMN IF NOT EXISTS primary_blocker TEXT
    CHECK (
      primary_blocker IS NULL OR
      primary_blocker IN (
        'stack-mismatch',
        'seniority-mismatch',
        'domain-mismatch',
        'delivery-gap',
        'unknown'
      )
    ),
  ADD COLUMN IF NOT EXISTS blocker_tags TEXT[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_career_ops_applications_role_archetype
  ON public.career_ops_applications(user_id, role_archetype)
  WHERE role_archetype IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_career_ops_applications_primary_blocker
  ON public.career_ops_applications(user_id, primary_blocker)
  WHERE primary_blocker IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_career_ops_applications_blocker_tags
  ON public.career_ops_applications USING GIN(blocker_tags);

-- Normalize existing target_level values before adding constraint
UPDATE public.career_ops_applications
SET target_level = LOWER(TRIM(target_level))
WHERE target_level IS NOT NULL;

-- Flatten variations
UPDATE public.career_ops_applications
SET target_level = 'mid'
WHERE target_level IN ('mid-level', 'intermediate');

UPDATE public.career_ops_applications
SET target_level = 'senior'
WHERE target_level IN ('sr', 'sr.', 'senior-level');

-- Add target_level constraint idempotently
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'career_ops_applications_target_level_check'
    ) THEN 
        ALTER TABLE public.career_ops_applications 
        ADD CONSTRAINT career_ops_applications_target_level_check 
        CHECK (
          target_level IS NULL OR
          target_level IN ('junior', 'mid', 'senior', 'lead', 'principal', 'staff', 'trainee', 'architect', 'unknown')
        );
    END IF;
END $$;

NOTIFY pgrst, 'reload schema';