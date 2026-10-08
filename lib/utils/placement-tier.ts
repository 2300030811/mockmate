/**
 * Placement Package Tier Utilities.
 * Single source of truth for compensation tiers across MockMate Placement Hub.
 *
 * Tier definitions:
 * - Super Dream: >= 20.0 LPA
 * - Dream:       >= 10.0 LPA and < 20.0 LPA
 * - Core:        >= 5.0 LPA and < 10.0 LPA
 * - Mass:        > 0.0 LPA and < 5.0 LPA
 * - Unlisted:    <= 0 or not specified
 */

export type PlacementTier = "super_dream" | "dream" | "core" | "mass" | "unlisted";

export interface DrivePackageInput {
  package_max_lpa?: number | null;
  package_min_lpa?: number | null;
  packageMaxLpa?: number | null;
  packageMinLpa?: number | null;
  package_values?: number[];
  packageValues?: number[];
}

/**
 * Extracts the effective package LPA for a drive (prefers maximum offered).
 */
export function drivePackage(drive: DrivePackageInput | null | undefined): number | null {
  if (!drive) return null;

  const maxVal = drive.package_max_lpa ?? drive.packageMaxLpa;
  if (typeof maxVal === "number" && maxVal > 0) return maxVal;

  const minVal = drive.package_min_lpa ?? drive.packageMinLpa;
  if (typeof minVal === "number" && minVal > 0) return minVal;

  const values = drive.package_values ?? drive.packageValues;
  if (Array.isArray(values) && values.length > 0) {
    const valid = values.filter((v) => typeof v === "number" && v > 0);
    if (valid.length > 0) return Math.max(...valid);
  }

  return null;
}

/**
 * Maps a package LPA value to its canonical recruitment tier.
 */
export function tierOf(lpa: number | null | undefined): PlacementTier {
  if (typeof lpa !== "number" || isNaN(lpa) || lpa <= 0) {
    return "unlisted";
  }
  if (lpa >= 20) return "super_dream";
  if (lpa >= 10) return "dream";
  if (lpa >= 5) return "core";
  return "mass";
}

/**
 * Returns human-readable label for a tier.
 */
export function tierLabel(tier: PlacementTier): string {
  switch (tier) {
    case "super_dream":
      return "Super Dream (20+ LPA)";
    case "dream":
      return "Dream (10–20 LPA)";
    case "core":
      return "Core (5–10 LPA)";
    case "mass":
      return "Mass / Foundation (<5 LPA)";
    case "unlisted":
    default:
      return "Unlisted CTC";
  }
}

/**
 * Short badge label for compact UI cards.
 */
export function tierShortLabel(tier: PlacementTier): string {
  switch (tier) {
    case "super_dream":
      return "Super Dream";
    case "dream":
      return "Dream";
    case "core":
      return "Core";
    case "mass":
      return "Mass";
    case "unlisted":
    default:
      return "Unlisted";
  }
}

/**
 * Color classes for badges matching the MockMate dark/light design system.
 */
export function tierBadgeClasses(tier: PlacementTier): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  switch (tier) {
    case "super_dream":
      return {
        bg: "bg-amber-500/10 dark:bg-amber-500/15",
        text: "text-amber-700 dark:text-amber-300",
        border: "border-amber-500/30",
        dot: "bg-amber-500",
      };
    case "dream":
      return {
        bg: "bg-purple-500/10 dark:bg-purple-500/15",
        text: "text-purple-700 dark:text-purple-300",
        border: "border-purple-500/30",
        dot: "bg-purple-500",
      };
    case "core":
      return {
        bg: "bg-blue-500/10 dark:bg-blue-500/15",
        text: "text-blue-700 dark:text-blue-300",
        border: "border-blue-500/30",
        dot: "bg-blue-500",
      };
    case "mass":
      return {
        bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
        text: "text-emerald-700 dark:text-emerald-300",
        border: "border-emerald-500/30",
        dot: "bg-emerald-500",
      };
    case "unlisted":
    default:
      return {
        bg: "bg-zinc-500/10 dark:bg-zinc-500/15",
        text: "text-zinc-600 dark:text-zinc-400",
        border: "border-zinc-500/20",
        dot: "bg-zinc-400",
      };
  }
}
