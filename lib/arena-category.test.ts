import { describe, it, expect } from "vitest";
import {
  parseArenaBaseCategory,
  parseArenaStatus,
  isArenaCategory,
  formatArenaCategoryLabel,
  buildArenaCategory,
  parseArenaCategory,
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

// ─── parseArenaCategory & buildArenaCategory ──────────────────────────────────

describe("parseArenaCategory & buildArenaCategory", () => {
  it("correctly parses Format B 'arena_aws:win:'", () => {
    expect(parseArenaBaseCategory("arena_aws:win:")).toBe("aws");
    expect(parseArenaStatus("arena_aws:win:")).toBe("win");
  });

  it("builds correct category string using buildArenaCategory", () => {
    expect(buildArenaCategory("aws", "win")).toBe("arena_aws:win:");
    expect(buildArenaCategory("azure", "loss")).toBe("arena_azure:loss:");
    expect(buildArenaCategory("mongodb", "tie")).toBe("arena_mongodb:tie:");
    expect(buildArenaCategory("pcap")).toBe("arena_pcap");
  });

  it("parses built category strings correctly (round-trip)", () => {
    const categories = ["aws", "azure", "mongodb", "pcap"];
    const statuses = ["win" as const, "loss" as const, "tie" as const, null];

    categories.forEach(cat => {
      statuses.forEach(status => {
        const encoded = buildArenaCategory(cat, status);
        const parsed = parseArenaCategory(encoded);
        expect(parsed).toEqual({
          category: cat,
          status: status
        });
      });
    });
  });

  it("handles malformed or edge-case inputs gracefully", () => {
    expect(parseArenaCategory("")).toEqual({ category: "", status: null });
    expect(parseArenaCategory("aws")).toEqual({ category: "aws", status: null });
    expect(parseArenaCategory("arena:")).toEqual({ category: "arena:", status: null });
    expect(parseArenaCategory("arena_unknown")).toEqual({ category: "unknown", status: null });
    expect(parseArenaCategory("arena_aws:abc:")).toEqual({ category: "aws", status: null });
  });
});
