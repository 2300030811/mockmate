import { memo } from "react";
import { Node, Group } from "../types";

interface MiniMapProps {
  pan: { x: number; y: number };
  scale: number;
  groups: Group[];
  nodes: Node[];
  windowSize: { width: number; height: number };
  theme: "light" | "dark" | "neo";
}

export const MiniMap = memo(({
  pan,
  scale,
  groups,
  nodes,
  windowSize,
  theme
}: MiniMapProps) => {
  const isLight = theme === "light";

  return (
    <div
      className="absolute bottom-4 right-4 w-52 h-32 border border-zinc-200 dark:border-[#1e1e2a] rounded-lg bg-white/95 dark:bg-[#14141e]/95 backdrop-blur-md shadow-md overflow-hidden pointer-events-none z-20 select-none transition-opacity duration-200 opacity-70 hover:opacity-100"
    >
      <div className="absolute top-2 left-2.5 text-[8px] font-mono font-bold text-zinc-400 dark:text-[#5a5a6e] uppercase tracking-wider">
        MINIMAP // RADAR
      </div>
      <svg
        viewBox={`${-pan.x / scale - 200} ${-pan.y / scale - 150} ${2500} ${1500}`}
        className="w-full h-full py-4 opacity-75"
      >
        {/* Groups */}
        {groups.map((g) => (
          <rect
            key={g.id}
            x={g.x}
            y={g.y}
            width={g.w}
            height={g.h}
            rx="8"
            fill={isLight ? "rgba(0,0,0,0.02)" : "rgba(255,255,255,0.03)"}
            stroke={isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"}
            strokeDasharray="4 4"
          />
        ))}

        {/* Nodes */}
        {nodes.map((n) => (
          <rect
            key={n.id}
            x={n.x}
            y={n.y}
            width={96}
            height={96}
            rx="12"
            fill="#5e6ad2"
          />
        ))}

        {/* Current Camera Viewport */}
        <rect
          x={-pan.x / scale}
          y={-pan.y / scale}
          width={(windowSize.width || 1200) / scale}
          height={(windowSize.height || 800) / scale}
          rx="6"
          stroke="#5e6ad2"
          strokeWidth="12"
          fill="rgba(94, 106, 210, 0.08)"
        />
      </svg>
    </div>
  );
});

MiniMap.displayName = "MiniMap";
