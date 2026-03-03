-- ==========================================
-- PROJECT RESULTS TABLE (Project Mode Progress)
-- ==========================================

-- Create Project Results table (mirrors quiz_results pattern)
CREATE TABLE IF NOT EXISTS project_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL, -- For guest/anonymous users
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- For logged-in users
  project_id TEXT NOT NULL, -- Reference to ProjectChallenge.id (e.g., "todo-api-fix")
  score INTEGER, -- AI analysis score (0-100) if analysis was done, NULL if only completion verified
  time_taken INTEGER NOT NULL, -- Seconds to complete
  hints_used INTEGER DEFAULT 0,
  analysis_breakdown JSONB, -- Store ScoreBreakdown: {correctness, codeQuality, bestPractices, completeness}
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS (Row Level Security)
ALTER TABLE project_results ENABLE ROW LEVEL SECURITY;

-- Public can view all project results (for leaderboard potential future addition)
DROP POLICY IF EXISTS "Allow public select to project_results" ON project_results;
CREATE POLICY "Allow public select to project_results" ON project_results FOR SELECT USING (true);

-- Admins can delete results
DROP POLICY IF EXISTS "Admins can delete project_results" ON project_results;
CREATE POLICY "Admins can delete project_results" ON project_results FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- NOTE: INSERT/UPDATE policies NOT created for public users.
-- Only the Service Role (Server Actions) can insert/update project_results for security.

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_project_results_user_id ON project_results(user_id);
CREATE INDEX IF NOT EXISTS idx_project_results_session_id ON project_results(session_id);
CREATE INDEX IF NOT EXISTS idx_project_results_project_id ON project_results(project_id);
CREATE INDEX IF NOT EXISTS idx_project_results_completed_at ON project_results(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_results_user_project ON project_results(user_id, project_id);

-- Refresh PostgREST schema
NOTIFY pgrst, 'reload schema';
