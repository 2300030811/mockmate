-- ==========================================
-- INTERVIEW SESSIONS TABLE
-- ==========================================

-- Stores completed AI interview sessions with transcripts and AI analysis
CREATE TABLE IF NOT EXISTS interview_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT, -- For guest/anonymous tracking
  type TEXT NOT NULL DEFAULT 'behavioral', -- 'behavioral' or 'technical'
  difficulty TEXT NOT NULL DEFAULT 'mid', -- 'junior', 'mid', 'senior'
  topic TEXT, -- Optional focus area
  messages JSONB NOT NULL DEFAULT '[]'::jsonb, -- Full conversation transcript
  ai_summary TEXT, -- AI-generated markdown report
  stats JSONB, -- { wpm, sentiment, keyConcepts, confidenceScore }
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- SECURITY (Row Level Security)
-- ==========================================

ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own sessions
DROP POLICY IF EXISTS "Users can view own interview sessions" ON interview_sessions;
CREATE POLICY "Users can view own interview sessions" ON interview_sessions 
  FOR SELECT USING (auth.uid() = user_id);

-- Inserts are done via Server Actions (Service Role) only.
-- No public INSERT policy needed — keeps data integrity.

-- ==========================================
-- INDEXES
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_interview_sessions_user_id ON interview_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_created_at ON interview_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_type ON interview_sessions(type);

-- ==========================================
-- REFRESH
-- ==========================================

NOTIFY pgrst, 'reload schema';
