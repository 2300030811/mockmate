-- =================================================================
-- Migration: Add materialised user stats to profiles
-- =================================================================
-- Adds xp, level, streak, elo, and timing columns to the profiles
-- table so that XP/streak/elo are persisted and updated incrementally
-- instead of being recomputed from quiz_results on every page load.
-- =================================================================

-- 1. Add new columns
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS xp           INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS level        INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS streak       INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS elo          INTEGER DEFAULT 1000,
  ADD COLUMN IF NOT EXISTS last_activity_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS streak_updated_at TIMESTAMPTZ;

-- 2. Backfill XP from existing quiz_results
-- Standard quizzes: BASE_QUIZ_XP (50) per quiz + 10 per correct answer
-- Arena matches:    BASE_ARENA_XP (50) per match + 25 per correct + win bonus 150 / draw bonus 50 + accuracy bonus
-- Daily challenges: DAILY_CHALLENGE_BASE (10) per entry + 1 per point
WITH user_xp AS (
  SELECT
    qr.user_id,
    -- Standard quiz XP
    COALESCE(SUM(
      CASE WHEN qr.category NOT LIKE 'arena%' AND qr.category != 'daily-challenge'
           THEN 50 + (qr.score * 10)
           ELSE 0
      END
    ), 0) AS std_xp,
    -- Arena XP (using rich formula)
    COALESCE(SUM(
      CASE WHEN qr.category LIKE 'arena%'
           THEN 50
                + (qr.score * 25)
                + CASE WHEN qr.category LIKE '%:win:%' THEN 150
                       WHEN qr.category LIKE '%:tie:%' THEN 50
                       ELSE 0
                  END
                + CASE WHEN qr.total_questions > 0
                       THEN ROUND((qr.score::NUMERIC / qr.total_questions) * 200)
                       ELSE 0
                  END
           ELSE 0
      END
    ), 0) AS arena_xp,
    -- Daily challenge XP
    COALESCE(SUM(
      CASE WHEN qr.category = 'daily-challenge'
           THEN 10 + qr.score  -- DAILY_CHALLENGE_BASE + points
           ELSE 0
      END
    ), 0) AS daily_xp,
    -- last activity
    MAX(qr.completed_at) AS last_activity
  FROM quiz_results qr
  WHERE qr.user_id IS NOT NULL
  GROUP BY qr.user_id
)
UPDATE profiles p
SET
  xp    = ux.std_xp + ux.arena_xp + ux.daily_xp,
  level = FLOOR((ux.std_xp + ux.arena_xp + ux.daily_xp) / 100) + 1,
  last_activity_at = ux.last_activity
FROM user_xp ux
WHERE p.id = ux.user_id;

-- 3. Backfill streak from daily-challenge + all quiz activity timestamps
-- We'll compute streak from ALL quiz_results per user (expanded scope).
-- Because SQL window functions can do consecutive-day counting:
WITH daily_activity AS (
  SELECT
    user_id,
    DATE(completed_at AT TIME ZONE 'UTC') AS activity_date
  FROM quiz_results
  WHERE user_id IS NOT NULL
  GROUP BY user_id, DATE(completed_at AT TIME ZONE 'UTC')
),
ordered AS (
  SELECT
    user_id,
    activity_date,
    activity_date - (ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY activity_date))::INT AS grp
  FROM daily_activity
),
streaks AS (
  SELECT
    user_id,
    MAX(activity_date) AS streak_end,
    COUNT(*) AS streak_len
  FROM ordered
  GROUP BY user_id, grp
),
current_streak AS (
  SELECT DISTINCT ON (user_id)
    user_id,
    CASE WHEN streak_end >= CURRENT_DATE - INTERVAL '1 day'
         THEN streak_len
         ELSE 0
    END AS streak
  FROM streaks
  ORDER BY user_id, streak_end DESC
)
UPDATE profiles p
SET
  streak = cs.streak,
  streak_updated_at = NOW()
FROM current_streak cs
WHERE p.id = cs.user_id;

-- 4. Elo starts fresh at 1000 for everyone (old Elo was never persisted)
-- Default already handles this — no update needed.

-- 5. Performance index for XP-based leaderboard
CREATE INDEX IF NOT EXISTS idx_profiles_xp ON profiles(xp DESC);

-- 6. RLS: Users can read their own stats; service role can update stats columns
-- The existing "Users can update own profile" policy already covers this since
-- it allows updates where auth.uid() = id AND role hasn't changed.
-- Stats columns (xp, level, streak, elo) are only updated by server actions
-- using the admin client (service role), so no additional RLS needed.

-- 7. Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
