"use client";

import { memo } from "react";
import { Connection, Node } from "../types";

interface ConnectionLineProps {
  connection: Connection;
  fromNode: Node | undefined;
  toNode: Node | undefined;
  isSelected: boolean;
  onClick: (id: string) => void;
  onDoubleClick: (id: string) => void;
  theme: "light" | "dark" | "neo";
}

export const ConnectionLine = memo(({
  connection,
  fromNode,
  toNode,
  isSelected,
  onClick,
  onDoubleClick,
  theme
}: ConnectionLineProps) => {
  if (!fromNode || !toNode) return null;

  const isLight = theme === "light";

  const x1 = fromNode.x + 48;
  const y1 = fromNode.y + 48;
  const x2 = toNode.x + 48;
  const y2 = toNode.y + 48;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const cf = Math.min(dist * 0.4, 150);
  const path = `M ${x1} ${y1} C ${x1 + (dx > 0 ? cf : -cf)} ${y1}, ${x2 - (dx > 0 ? cf : -cf)} ${y2}, ${x2} ${y2}`;

  const strokeColor = isSelected ? "#5e6ad2" : isLight ? "#94a3b8" : "#3e3e52";

  return (
    <g
      className="pointer-events-auto"
      onClick={(e) => {
        e.stopPropagation();
        onClick(connection.id);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onDoubleClick(connection.id);
      }}
    >
      <path
        d={path}
        stroke="transparent"
        strokeWidth="20"
        fill="none"
        className="cursor-pointer"
      />
      <path
        d={path}
        stroke={strokeColor}
        strokeWidth={isSelected ? 2.5 : 1.5}
        strokeDasharray="4,4"
        fill="none"
        style={{ shapeRendering: "geometricPrecision" }}
        className={`transition-colors duration-150 ${isSelected ? "opacity-100" : "opacity-60 hover:opacity-100"}`}
        markerEnd="url(#arrow)"
      />
      {connection.label && (
        <foreignObject x={(x1 + x2) / 2 - 45} y={(y1 + y2) / 2 - 12} width="90" height="24">
          <div className="flex justify-center">
            <span
              className={`px-2 py-0.5 rounded-full border text-[8.5px] font-mono font-medium truncate max-w-[85px] text-center select-none shadow-sm ${
                isLight
                  ? "bg-white border-zinc-200 text-zinc-700"
                  : "bg-[#14141e] border-[#1e1e2a] text-[#ebebef]"
              }`}
            >
              {connection.label}
            </span>
          </div>
        </foreignObject>
      )}
      <circle r="2" fill="#5e6ad2">
        <animateMotion dur="3.5s" repeatCount="indefinite" path={path} rotate="auto" />
      </circle>
    </g>
  );
});

ConnectionLine.displayName = "ConnectionLine";
