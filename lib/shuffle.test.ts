import { describe, it, expect } from "vitest";
import { shuffleArray } from "./shuffle";

describe("shuffleArray", () => {
  it("returns an array with the same elements", () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffleArray(input);
    expect(result).toHaveLength(input.length);
    expect(result.sort()).toEqual([...input].sort());
  });

  it("does not mutate the original array", () => {
    const input = [1, 2, 3, 4, 5];
    const original = [...input];
    shuffleArray(input);
    expect(input).toEqual(original);
  });

  it("returns an empty array for empty input", () => {
    expect(shuffleArray([])).toEqual([]);
  });

  it("returns a single-element array unchanged", () => {
    expect(shuffleArray([42])).toEqual([42]);
  });

  it("produces a roughly uniform distribution", () => {
    // Shuffle [0, 1, 2] many times and check that each element
    // appears in each position roughly 1/3 of the time.
    const input = [0, 1, 2];
    const N = 10_000;
    const counts: number[][] = [
      [0, 0, 0], // counts for position 0
      [0, 0, 0], // counts for position 1
      [0, 0, 0], // counts for position 2
    ];

    for (let i = 0; i < N; i++) {
      const result = shuffleArray(input);
      for (let pos = 0; pos < 3; pos++) {
        counts[pos][result[pos]]++;
      }
    }

    const expected = N / 3;
    const tolerance = 0.08; // 8% tolerance

    for (let pos = 0; pos < 3; pos++) {
      for (let val = 0; val < 3; val++) {
        const ratio = counts[pos][val] / expected;
        expect(ratio).toBeGreaterThan(1 - tolerance);
        expect(ratio).toBeLessThan(1 + tolerance);
      }
    }
  });
});
