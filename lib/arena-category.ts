/**
 * Shared utilities for parsing arena-prefixed category strings.
 *
 * @deprecated Use database quiz_mode, arena_status columns instead.
 * These helpers are kept for legacy compatibility.
 */

export type ArenaStatus = "win" | "loss" | "tie";

export interface ParsedArenaCategory {
  category: string;
  status: ArenaStatus | null;
}

/**
 * Checks if a category string represents an arena match.
 */
export function isArenaCategory(category: string): boolean {
  return category.startsWith("arena:") || category.startsWith("arena_");
}

/**
 * Extracts the base quiz category from an arena-prefixed category string.
 * Strips all arena prefixes/status markers to return just the quiz category.
 */
export function parseArenaBaseCategory(category: string): string {
  if (!isArenaCategory(category)) return category;

  // Format A: "arena:win:aws"
  if (category.startsWith("arena:")) {
    const parts = category.split(":");
    if (parts.length >= 3) {
      return parts.slice(2).join(":");
    }
    return category;
  }

  // Format B & C: "arena_aws:win:" or "arena_aws"
  const withoutPrefix = category.slice(6); // strips "arena_"
  if (withoutPrefix.includes(":")) {
    return withoutPrefix.split(":")[0];
  }
  
  return withoutPrefix;
}

/**
 * Extracts the win/loss/tie status from an arena category string.
 * Returns null for non-arena categories or if no status is embedded.
 */
export function parseArenaStatus(category: string): ArenaStatus | null {
  if (!isArenaCategory(category)) return null;

  if (/:win(:|$)/.test(category) || category.includes(":win:")) return "win";
  if (/:loss(:|$)/.test(category) || category.includes(":loss:")) return "loss";
  if (/:tie(:|$)/.test(category) || category.includes(":tie:")) return "tie";

  return null;
}

/**
 * Parses an arena category string into its structured category and status components.
 */
export function parseArenaCategory(category: string): ParsedArenaCategory {
  return {
    category: parseArenaBaseCategory(category),
    status: parseArenaStatus(category),
  };
}

/**
 * Builds an arena category string from a base category and status.
 */
export function buildArenaCategory(category: string, status?: ArenaStatus | null): string {
  const base = parseArenaBaseCategory(category);
  if (status) {
    return `arena_${base}:${status}:`;
  }
  return `arena_${base}`;
}

/**
 * Returns a display-friendly label for an arena category.
 * e.g., "arena:win:aws" → "Arena: aws"
 */
export function formatArenaCategoryLabel(category: string): string {
  if (!isArenaCategory(category)) return category;
  const base = parseArenaBaseCategory(category);
  return `Arena: ${base}`;
}
