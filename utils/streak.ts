/**
 * Calculates a consecutive daily streak from an array of timestamps.
 *
 * The algorithm:
 * 1. Normalizes all timestamps to midnight (start of day).
 * 2. De-duplicates and sorts them in descending order.
 * 3. Checks if the most recent day is today or yesterday.
 * 4. Walks backwards counting consecutive 1-day gaps.
 *
 * @param timestamps - Array of ISO date strings or Date objects
 * @returns The current consecutive-day streak count (0 if broken)
 */
export function calculateStreak(timestamps: (string | Date)[]): number {
  if (!timestamps || timestamps.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const uniqueDays = Array.from(
    new Set(
      timestamps.map((t) => {
        const d = new Date(t);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      })
    )
  ).sort((a, b) => b - a);

  if (uniqueDays.length === 0) return 0;

  const mostRecent = uniqueDays[0];
  const diffDays = Math.round((today.getTime() - mostRecent) / (1000 * 3600 * 24));

  // Streak is broken if the most recent activity was more than 1 day ago
  if (diffDays > 1) return 0;

  let streak = 1;
  for (let i = 0; i < uniqueDays.length - 1; i++) {
    const current = uniqueDays[i];
    const next = uniqueDays[i + 1];
    const dayDiff = Math.round((current - next) / (1000 * 3600 * 24));

    if (dayDiff === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
