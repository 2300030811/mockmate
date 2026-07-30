-- =================================================================
-- Migration: Normalize Arena results database schema
-- =================================================================

-- 1. Create a backup table of quiz_results before modifying (conditional safeguard)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name='quiz_results' AND column_name='quiz_mode'
    ) THEN
        CREATE TABLE IF NOT EXISTS quiz_results_backup AS
        SELECT * FROM quiz_results;
    END IF;
END $$;

-- 2. Add columns if they do not exist
ALTER TABLE quiz_results
  ADD COLUMN IF NOT EXISTS quiz_mode TEXT NOT NULL DEFAULT 'standard';

ALTER TABLE quiz_results
  ADD COLUMN IF NOT EXISTS arena_status TEXT;

ALTER TABLE quiz_results
  ADD COLUMN IF NOT EXISTS arena_user_score INTEGER;

ALTER TABLE quiz_results
  ADD COLUMN IF NOT EXISTS arena_opponent_score INTEGER;

-- 3. Perform rerun-safe backfill updates
-- Format A ("arena:win:aws")
UPDATE quiz_results
SET
  quiz_mode = 'arena',
  arena_status = split_part(category, ':', 2),
  category = split_part(category, ':', 3)
WHERE category LIKE 'arena:%' AND quiz_mode <> 'arena';

-- Format B ("arena_aws:win:")
UPDATE quiz_results
SET
  quiz_mode = 'arena',
  arena_status = split_part(category, ':', 2),
  category = replace(split_part(category, ':', 1), 'arena_', '')
WHERE category LIKE 'arena_%:%' AND quiz_mode <> 'arena';

-- Format C ("arena_aws")
UPDATE quiz_results
SET
  quiz_mode = 'arena',
  category = replace(category, 'arena_', '')
WHERE category LIKE 'arena_%' AND category NOT LIKE '%:%' AND quiz_mode <> 'arena';

-- Daily Challenge
UPDATE quiz_results
SET
  quiz_mode = 'daily-challenge'
WHERE category = 'daily-challenge' AND quiz_mode <> 'daily-challenge';

-- 4. Apply check constraints after backfilling
ALTER TABLE quiz_results
  DROP CONSTRAINT IF EXISTS chk_quiz_results_quiz_mode,
  ADD CONSTRAINT chk_quiz_results_quiz_mode CHECK (quiz_mode IN ('standard', 'arena', 'daily-challenge'));

ALTER TABLE quiz_results
  DROP CONSTRAINT IF EXISTS chk_quiz_results_arena_status,
  ADD CONSTRAINT chk_quiz_results_arena_status CHECK (arena_status IN ('win', 'loss', 'tie'));

ALTER TABLE quiz_results
  DROP CONSTRAINT IF EXISTS chk_quiz_results_arena_user_score,
  ADD CONSTRAINT chk_quiz_results_arena_user_score CHECK (arena_user_score IS NULL OR arena_user_score >= 0);

ALTER TABLE quiz_results
  DROP CONSTRAINT IF EXISTS chk_quiz_results_arena_opponent_score,
  ADD CONSTRAINT chk_quiz_results_arena_opponent_score CHECK (arena_opponent_score IS NULL OR arena_opponent_score >= 0);

ALTER TABLE quiz_results
  DROP CONSTRAINT IF EXISTS chk_arena_fields_consistency,
  ADD CONSTRAINT chk_arena_fields_consistency CHECK (
    quiz_mode = 'arena'
    OR (
      arena_status IS NULL
      AND arena_user_score IS NULL
      AND arena_opponent_score IS NULL
    )
  );

-- 5. Create composite performance indexes
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_mode ON quiz_results(user_id, quiz_mode);
CREATE INDEX IF NOT EXISTS idx_quiz_results_session_mode ON quiz_results(session_id, quiz_mode);

-- 6. Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
