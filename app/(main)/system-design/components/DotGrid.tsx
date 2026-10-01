"use client";

import { memo } from "react";
import { GRID_SIZE } from "../constants";

interface DotGridProps {
  theme: "light" | "dark" | "neo";
  pan: { x: number; y: number };
  scale: number;
}

export const DotGrid = memo(({ theme, pan, scale }: DotGridProps) => {
  const isLight = theme === "light";
  const gridColor = isLight ? "#cbd5e1" : "#262636";

  return (
    <div
      className="absolute inset-0 pointer-events-none transition-opacity duration-300"
      style={{
        backgroundImage: `radial-gradient(circle, ${gridColor} 1.2px, transparent 1.2px)`,
        backgroundSize: `${GRID_SIZE * scale}px ${GRID_SIZE * scale}px`,
        backgroundPosition: `${pan.x}px ${pan.y}px`
      }}
    />
  );
});

DotGrid.displayName = "DotGrid";
