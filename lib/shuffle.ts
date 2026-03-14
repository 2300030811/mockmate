/**
 * Produces a uniformly random permutation using the Fisher-Yates algorithm.
 * Returns a new array — does not mutate the input.
 *
 * Unlike `arr.sort(() => Math.random() - 0.5)`, this guarantees an
 * unbiased distribution where every permutation is equally likely.
 */
export function shuffleArray<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
