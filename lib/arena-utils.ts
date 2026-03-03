/**
 * Arena category utilities - centralized parsing and handling of arena format categories
 * Arena categories are encoded as strings: arena:{winStatus}:{category}
 * Example: "arena:win:aws", "arena:loss:azure", "arena:tie:mongodb"
 */

export type ArenaWinStatus = "win" | "loss" | "tie";

export interface ParsedArenaCategory {
  isArena: boolean;
  winStatus?: ArenaWinStatus;
  category?: string;
  rawCategory?: string;
}

/**
 * Parse an arena category string into its components
 * @param category - The category string to parse (e.g., "arena:win:aws")
 * @returns Parsed components: isArena, winStatus, category
 */
export function parseArenaCategory(category: string): ParsedArenaCategory {
  if (!category || !category.startsWith("arena:")) {
    return {
      isArena: false,
      rawCategory: category,
    };
  }

  // Match arena:winStatus:category
  const match = category.match(/^arena:(win|loss|tie):(.+)$/);

  if (!match) {
    return {
      isArena: false,
      rawCategory: category,
    };
  }

  return {
    isArena: true,
    winStatus: match[1] as ArenaWinStatus,
    category: match[2],
    rawCategory: category,
  };
}

/**
 * Encode an arena result into a category string
 * @param category - The base category (e.g., "aws")
 * @param winStatus - The match result (win/loss/tie)
 * @returns The encoded category string (e.g., "arena:win:aws")
 */
export function encodeArenaCategory(
  category: string,
  winStatus: ArenaWinStatus
): string {
  return `arena:${winStatus}:${category}`;
}

/**
 * Extract just the base category name from a potentially encoded string
 * @param category - The category string (encoded or raw)
 * @returns The clean category name (e.g., "aws", not "arena:win:aws")
 */
export function getCleanCategory(category: string): string {
  const parsed = parseArenaCategory(category);
  return parsed.category || category.replace("arena_", "");
}
