-- Migration: Add ats_score to career_ops_applications
ALTER TABLE public.career_ops_applications 
ADD COLUMN IF NOT EXISTS ats_score INTEGER CHECK (ats_score >= 0 AND ats_score <= 100);

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
