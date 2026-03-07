-- Create system_designs table
CREATE TABLE IF NOT EXISTS public.system_designs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    session_id TEXT,
    title TEXT NOT NULL DEFAULT 'Untitled Design',
    nodes JSONB NOT NULL DEFAULT '[]',
    connections JSONB NOT NULL DEFAULT '[]',
    groups JSONB NOT NULL DEFAULT '[]',
    ai_score JSONB,
    ai_review TEXT,
    thumbnail_svg TEXT,
    challenge_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_designs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can create their own designs"
    ON public.system_designs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view their own designs"
    ON public.system_designs
    FOR SELECT
    USING (auth.uid() = user_id OR session_id = current_setting('request.headers')::json->>'x-session-id');

CREATE POLICY "Users can update their own designs"
    ON public.system_designs
    FOR UPDATE
    USING (auth.uid() = user_id OR session_id = current_setting('request.headers')::json->>'x-session-id');

CREATE POLICY "Users can delete their own designs"
    ON public.system_designs
    FOR DELETE
    USING (auth.uid() = user_id);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_system_designs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_system_designs_updated_at
BEFORE UPDATE ON public.system_designs
FOR EACH ROW
EXECUTE FUNCTION update_system_designs_updated_at();
