/**
 * Shared math utility for clamping scores between 0 and 100.
 */
export function clampScore(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}
