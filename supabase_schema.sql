-- ==========================================
-- 1. BASE TABLES (Profiles & Quizzes)
-- ==========================================

-- Create Quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT UNIQUE NOT NULL, -- e.g., 'aws', 'azure', 'pcap', 'oracle'
  questions JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create User Profiles table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT,
  email TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user', -- 'user' or 'admin'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Quiz Results table
CREATE TABLE IF NOT EXISTS quiz_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL, -- To track guest users
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- For logged-in users
  nickname TEXT, -- For global leaderboard
  category TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Career Paths table
CREATE TABLE IF NOT EXISTS career_paths (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  job_role TEXT NOT NULL,
  company TEXT,
  match_score INTEGER NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 2. SECURITY (Row Level Security)
-- ==========================================

ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_paths ENABLE ROW LEVEL SECURITY;

-- --- PROFILES ---
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- --- QUIZ RESULTS (Leaderboard) ---
DROP POLICY IF EXISTS "Allow public insert to quiz_results" ON quiz_results;
DROP POLICY IF EXISTS "Allow public select to quiz_results" ON quiz_results;
DROP POLICY IF EXISTS "Allow public update to quiz_results" ON quiz_results;
DROP POLICY IF EXISTS "Admins can delete results" ON quiz_results;

-- CRITICAL SECURITY FIX: Disable public inserts.
-- Only the Service Role (Server Actions) can insert/update results.
-- We do NOT create an INSERT policy for public/authenticated users.

CREATE POLICY "Allow public select to quiz_results" ON quiz_results FOR SELECT USING (true);

CREATE POLICY "Admins can delete results" ON quiz_results FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- --- QUIZZES ---
DROP POLICY IF EXISTS "Allow public read access to quizzes" ON quizzes;
DROP POLICY IF EXISTS "Admins can manage quizzes" ON quizzes;

CREATE POLICY "Allow public read access to quizzes" ON quizzes FOR SELECT USING (true);
CREATE POLICY "Admins can manage quizzes" ON quizzes FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- --- CAREER PATHS ---
DROP POLICY IF EXISTS "Allow public insert to career_paths" ON career_paths;
DROP POLICY IF EXISTS "Allow users to see their own career paths" ON career_paths;

-- Career paths are sensitive, only allow user to see their own (or session-based)
CREATE POLICY "Allow users to see their own career paths" ON career_paths FOR SELECT USING (
  (auth.uid() = user_id) OR (session_id = current_setting('request.headers')::json->>'x-session-id')
);

-- Only allow inserts via Server Actions (Service Role). 
-- If client-side insert is needed, ensure it only allows inserting for own user_id.
-- For now, relying on Server Actions is safer.

-- ==========================================
-- 3. AUTOMATION (Trigger for new users)
-- ==========================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nickname)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'nickname');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Uncomment the next lines IF you want to automatically create profiles on sign-up
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==========================================
-- 4. REFRESH
-- ==========================================

NOTIFY pgrst, 'reload schema';
