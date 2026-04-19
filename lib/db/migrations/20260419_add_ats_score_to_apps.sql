-- Migration: Add ats_score to career_ops_applications
ALTER TABLE public.career_ops_applications 
ADD COLUMN IF NOT EXISTS ats_score INTEGER;

-- Add constraint idempotently
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'career_ops_applications_ats_score_check'
    ) THEN 
        ALTER TABLE public.career_ops_applications 
        ADD CONSTRAINT career_ops_applications_ats_score_check 
        CHECK (ats_score >= 0 AND ats_score <= 100);
    END IF;
END $$;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
