-- Create Feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  type TEXT NOT NULL, -- 'bug', 'suggestion', 'other'
  message TEXT NOT NULL,
  email TEXT, -- Optional, for guest follow-up
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Security: Enable RLS
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Policy: Only Admins can view/delete feedback
CREATE POLICY "Admins can view feedback" ON feedback FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can delete feedback" ON feedback FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Note: We do NOT enable public insert policy because we'll use a Service Role (Admin Client)
-- in the Server Action to handle submissions securely, or we use a restricted policy.
-- For safety, we'll use a Server Action with the Admin Client.
