import { memo } from "react";
import { Node, Group } from "../types";

interface MiniMapProps {
  pan: { x: number; y: number };
  scale: number;
  groups: Group[];
  nodes: Node[];
  windowSize: { width: number; height: number };
}

export const MiniMap = memo(({ pan, scale, groups, nodes, windowSize }: MiniMapProps) => {
  return (
    <div className="absolute bottom-8 right-8 w-56 h-36 bg-black/60 border border-white/10 rounded-2xl backdrop-blur-xl overflow-hidden pointer-events-none z-30 shadow-2xl transition-opacity hover:opacity-100 opacity-60">
       <div className="absolute top-2 left-3 text-[8px] font-black text-gray-500 uppercase tracking-widest">Navigator</div>
       <svg viewBox={`${-pan.x/scale - 200} ${-pan.y/scale - 150} ${2500} ${1500}`} className="w-full h-full opacity-40 py-4">
          {groups.map(g => (
             <rect key={g.id} x={g.x} y={g.y} width={g.w} height={g.h} fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" />
          ))}
          {nodes.map(n => (
             <rect key={n.id} x={n.x} y={n.y} width={96} height={96} rx="20" fill="#6366f1" />
          ))}
          <rect x={-pan.x/scale} y={-pan.y/scale} width={(windowSize.width || 1200) / scale} height={(windowSize.height || 800) / scale} stroke="#6366f1" strokeWidth="15" fill="none" />
       </svg>
    </div>
  );
});

MiniMap.displayName = "MiniMap";
