import { describe, it, expect } from "vitest";
import {
  parseArenaBaseCategory,
  parseArenaStatus,
  isArenaCategory,
  formatArenaCategoryLabel,
} from "./arena-category";

// ─── parseArenaBaseCategory ─────────────────────────────────────────────────

describe("parseArenaBaseCategory", () => {
  it("extracts category from 'arena:win:aws'", () => {
    expect(parseArenaBaseCategory("arena:win:aws")).toBe("aws");
  });

  it("extracts category from 'arena:loss:azure'", () => {
    expect(parseArenaBaseCategory("arena:loss:azure")).toBe("azure");
  });

  it("extracts category from 'arena:tie:mongodb'", () => {
    expect(parseArenaBaseCategory("arena:tie:mongodb")).toBe("mongodb");
  });

  it("extracts category from 'arena_aws'", () => {
    expect(parseArenaBaseCategory("arena_aws")).toBe("aws");
  });

  it("returns non-arena categories unchanged", () => {
    expect(parseArenaBaseCategory("aws")).toBe("aws");
    expect(parseArenaBaseCategory("azure")).toBe("azure");
    expect(parseArenaBaseCategory("daily-challenge")).toBe("daily-challenge");
  });
});

// ─── parseArenaStatus ───────────────────────────────────────────────────────

describe("parseArenaStatus", () => {
  it("returns 'win' for ':win:' categories", () => {
    expect(parseArenaStatus("arena:win:aws")).toBe("win");
  });

  it("returns 'loss' for ':loss:' categories", () => {
    expect(parseArenaStatus("arena:loss:azure")).toBe("loss");
  });

  it("returns 'tie' for ':tie:' categories", () => {
    expect(parseArenaStatus("arena:tie:mongodb")).toBe("tie");
  });

  it("returns null for non-arena categories", () => {
    expect(parseArenaStatus("aws")).toBeNull();
    expect(parseArenaStatus("arena_aws")).toBeNull();
  });
});

// ─── isArenaCategory ────────────────────────────────────────────────────────

describe("isArenaCategory", () => {
  it("returns true for arena categories", () => {
    expect(isArenaCategory("arena:win:aws")).toBe(true);
    expect(isArenaCategory("arena_aws")).toBe(true);
  });

  it("returns false for non-arena categories", () => {
    expect(isArenaCategory("aws")).toBe(false);
    expect(isArenaCategory("daily-challenge")).toBe(false);
  });
});

// ─── formatArenaCategoryLabel ───────────────────────────────────────────────

describe("formatArenaCategoryLabel", () => {
  it("formats arena categories as 'Arena: <base>'", () => {
    expect(formatArenaCategoryLabel("arena:win:aws")).toBe("Arena: aws");
    expect(formatArenaCategoryLabel("arena_aws")).toBe("Arena: aws");
  });

  it("returns non-arena categories unchanged", () => {
    expect(formatArenaCategoryLabel("aws")).toBe("aws");
  });
});
