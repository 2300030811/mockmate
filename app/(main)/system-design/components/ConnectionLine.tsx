"use client";

import { memo } from "react";
import { Connection, Node } from "../types";

interface ConnectionLineProps {
  connection: Connection;
  fromNode: Node | undefined;
  toNode: Node | undefined;
  isSelected: boolean;
  onClick: (id: string) => void;
}

export const ConnectionLine = memo(({ 
  connection, 
  fromNode, 
  toNode, 
  isSelected, 
  onClick 
}: ConnectionLineProps) => {
  if (!fromNode || !toNode) return null;

  const x1 = fromNode.x + 48, y1 = fromNode.y + 48, x2 = toNode.x + 48, y2 = toNode.y + 48;
  const dx = x2 - x1, dy = y2 - y1, dist = Math.sqrt(dx*dx + dy*dy);
  const cf = Math.min(dist * 0.4, 150);
  const path = `M ${x1} ${y1} C ${x1 + (dx>0?cf:-cf)} ${y1}, ${x2 - (dx>0?cf:-cf)} ${y2}, ${x2} ${y2}`;

  return (
    <g className="pointer-events-auto" onClick={(e) => { e.stopPropagation(); onClick(connection.id); }}>
      <path 
        d={path} 
        stroke="transparent" 
        strokeWidth="20" 
        fill="none" 
        className="cursor-pointer" 
      />
      <path 
        d={path} 
        stroke={isSelected ? "#818cf8" : "#6366f1"} 
        strokeWidth={isSelected ? 3 : 2} 
        strokeDasharray="5,5" 
        fill="none" 
        className={`transition-all duration-200 ${isSelected ? 'opacity-100' : 'opacity-40 hover:opacity-100'}`} 
        markerEnd="url(#arrow)" 
      />
      {connection.label && (
        <foreignObject x={(x1+x2)/2-40} y={(y1+y2)/2-12} width="80" height="24">
          <div className="flex justify-center">
            <span className="bg-[#0A0A0A] border border-white/10 text-[8px] font-bold text-gray-400 px-2 py-0.5 rounded-full shadow-lg">
              {connection.label}
            </span>
          </div>
        </foreignObject>
      )}
      <circle r="3" fill="#a5b4fc">
        <animateMotion dur="2s" repeatCount="indefinite" path={path} rotate="auto" />
      </circle>
    </g>
  );
});

ConnectionLine.displayName = "ConnectionLine";
