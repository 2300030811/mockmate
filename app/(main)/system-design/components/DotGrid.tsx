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
    const isNeo = theme === "neo";

    const gridColor = isLight ? "#000" : isNeo ? "#0ff" : "#444";
    const opacity = isLight ? "opacity-[0.1]" : "opacity-[0.15]";

    return (
        <div
            className={`absolute inset-0 pointer-events-none transition-all duration-700 ${opacity} mix-blend-screen`}
            style={{
                backgroundImage: `radial-gradient(circle, ${gridColor} 1px, transparent 1px)`,
                backgroundSize: `${GRID_SIZE * scale}px ${GRID_SIZE * scale}px`,
                backgroundPosition: `${pan.x}px ${pan.y}px`
            }}
        />
    );
});

DotGrid.displayName = "DotGrid";
