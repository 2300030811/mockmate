-- 1. Create Quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT UNIQUE NOT NULL, -- e.g., 'aws', 'azure', 'pcap', 'oracle'
  questions JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create User Profiles table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Quiz Results table
CREATE TABLE IF NOT EXISTS quiz_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL, -- To track guest users
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- New: For logged-in users
  nickname TEXT, -- For global leaderboard
  category TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Career Paths table
CREATE TABLE IF NOT EXISTS career_paths (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- New: For logged-in users
  job_role TEXT NOT NULL,
  company TEXT,
  match_score INTEGER NOT NULL,
  data JSONB NOT NULL, -- The full CareerAnalysisResult object
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_paths ENABLE ROW LEVEL SECURITY;

-- 5. Policies for Profiles
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- 6. Policies for Results (Allow authenticated users to see their own data across sessions)
CREATE POLICY "Allow public insert to quiz_results" ON quiz_results FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow users to see their own results" ON quiz_results FOR SELECT USING (
  (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR (session_id = session_id)
);

-- 7. Policies for Career Paths
CREATE POLICY "Allow public insert to career_paths" ON career_paths FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow users to see their own career paths" ON career_paths FOR SELECT USING (
  (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR (session_id = session_id)
);

-- 8. Quizzes Policies
CREATE POLICY "Allow public read access to quizzes" ON quizzes FOR SELECT USING (true);
CREATE POLICY "Allow public insert to quizzes" ON quizzes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to quizzes" ON quizzes FOR UPDATE USING (true);

-- Trigger for creating profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nickname)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'nickname');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
