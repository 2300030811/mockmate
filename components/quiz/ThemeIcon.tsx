"use client";

import {
  Cloud,
  CloudCog,
  Zap,
  Database,
  Code2,
  Coffee,
  LucideIcon,
} from "lucide-react";

// Map of icon key → Lucide component
// Each key corresponds to a quiz-themes.ts badge/card icon value
const ICON_MAP: Record<string, LucideIcon> = {
  cloud: Cloud,
  cloudcog: CloudCog,
  zap: Zap,
  database: Database,
  code2: Code2,
  coffee: Coffee,
};

interface ThemeIconProps {
  /** The icon key from quiz-themes.ts (e.g. "cloud", "database") */
  icon: string;
  /** Tailwind class string for the icon size, e.g. "w-8 h-8" */
  className?: string;
}

/**
 * Renders the appropriate Lucide icon for a given quiz category.
 * Falls back to a Cloud icon if the key is not recognised.
 */
export function ThemeIcon({ icon, className = "w-8 h-8" }: ThemeIconProps) {
  const key = icon.toLowerCase().trim();
  const IconComponent = ICON_MAP[key] ?? Cloud;
  return <IconComponent className={className} aria-hidden="true" />;
}
