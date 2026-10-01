-- =================================================================
-- Migration: Add Placement Sync State and External Event Identifiers
-- =================================================================

-- 1. Sync State Tracking (powers Microsoft Graph delta sync and retry tracking)
CREATE TABLE IF NOT EXISTS public.placement_sync_state (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL UNIQUE, -- 'outlook_email', 'outlook_calendar'
  mailbox_id TEXT NOT NULL,
  folder_id TEXT,
  delta_link TEXT,
  last_attempt_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  last_error TEXT,
  retry_count INT DEFAULT 0,
  consecutive_failure_count INT DEFAULT 0,
  last_processed_message_id TEXT,
  last_processed_event_id TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- 2. Add external identity columns and verification flags to placement_events
ALTER TABLE public.placement_events 
  ADD COLUMN IF NOT EXISTS outlook_event_id TEXT,
  ADD COLUMN IF NOT EXISTS ical_uid TEXT,
  ADD COLUMN IF NOT EXISTS source_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS data_verified BOOLEAN DEFAULT false;

-- 3. Indexes for fast calendar synchronization and delta matching
CREATE INDEX IF NOT EXISTS idx_pe_outlook_id ON public.placement_events(outlook_event_id);
CREATE INDEX IF NOT EXISTS idx_pe_ical_uid ON public.placement_events(ical_uid);
CREATE INDEX IF NOT EXISTS idx_pss_source ON public.placement_sync_state(source);

-- 4. Enable RLS on sync state table (internal service role only)
ALTER TABLE public.placement_sync_state ENABLE ROW LEVEL SECURITY;

-- Deny public access, allow service role bypass
CREATE POLICY "Service role manages placement_sync_state"
  ON public.placement_sync_state
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Trigger to auto-update updated_at on placement_sync_state
DROP TRIGGER IF EXISTS set_placement_sync_state_updated_at ON public.placement_sync_state;
CREATE TRIGGER set_placement_sync_state_updated_at
  BEFORE UPDATE ON public.placement_sync_state
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
