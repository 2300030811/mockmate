/**
 * Shared utilities for parsing arena-prefixed category strings.
 *
 * Arena categories appear in several formats across the codebase:
 *   "arena:win:aws"       →  category "aws", status "win"
 *   "arena_aws:win:"      →  category "aws", status "win"
 *   "arena_aws"           →  category "aws", status null
 *   "aws"                 →  category "aws", status null
 */

/**
 * Extracts the base quiz category from an arena-prefixed category string.
 * Strips all arena prefixes/status markers to return just the quiz category.
 */
export function parseArenaBaseCategory(category: string): string {
  return category
    .replace(/^arena:[^:]+:/, "")   // "arena:win:aws" → "aws"
    .replace(/^arena_[^:]+:/, "")   // "arena_aws:win:" → "" (needs further cleanup)
    .replace(/^arena_/, "")         // "arena_aws" → "aws"
    .replace(/:$/, "")              // strip trailing colon
    || category;                    // fallback to original if nothing matched
}

/**
 * Extracts the win/loss/tie status from an arena category string.
 * Returns null for non-arena categories.
 */
export function parseArenaStatus(category: string): "win" | "loss" | "tie" | null {
  if (category.includes(":win:") || category.includes(":win")) return "win";
  if (category.includes(":loss:") || category.includes(":loss")) return "loss";
  if (category.includes(":tie:") || category.includes(":tie")) return "tie";
  return null;
}

/**
 * Checks if a category string represents an arena match.
 */
export function isArenaCategory(category: string): boolean {
  return category.includes("arena");
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
