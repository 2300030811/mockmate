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

export const MiniMap = memo(({ pan, scale, groups, nodes, windowSize, theme }: MiniMapProps) => {
   const isLight = theme === 'light';
   const isNeo = theme === 'neo';

   return (
      <div className={`absolute bottom-8 right-8 w-56 h-36 border rounded-2xl backdrop-blur-2xl overflow-hidden pointer-events-none z-30 transition-all duration-500 hover:opacity-100 opacity-60 ${isLight ? 'bg-white/90 border-gray-200 shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.15)]' : isNeo ? 'bg-[#050212]/80 border-fuchsia-500/20 shadow-[0_8px_32px_rgba(217,70,239,0.2)] hover:shadow-[0_8px_32px_rgba(217,70,239,0.4)]' : 'bg-black/40 border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.7)]'}`}>
         <div className="absolute top-2 left-3 text-[8px] font-black text-gray-500 uppercase tracking-widest">Navigator</div>
         <svg viewBox={`${-pan.x / scale - 200} ${-pan.y / scale - 150} ${2500} ${1500}`} className={`w-full h-full py-4 ${isLight ? 'opacity-60' : 'opacity-40'}`}>
            {groups.map(g => (
               <rect key={g.id} x={g.x} y={g.y} width={g.w} height={g.h} fill={isLight ? "rgba(0,0,0,0.02)" : isNeo ? "rgba(217,70,239,0.05)" : "rgba(255,255,255,0.05)"} stroke={isLight ? "rgba(0,0,0,0.1)" : isNeo ? "rgba(217,70,239,0.2)" : "rgba(255,255,255,0.1)"} />
            ))}
            {nodes.map(n => (
               <rect key={n.id} x={n.x} y={n.y} width={96} height={96} rx="20" fill={isNeo ? "#06b6d4" : "#6366f1"} />
            ))}
            <rect x={-pan.x / scale} y={-pan.y / scale} width={(windowSize.width || 1200) / scale} height={(windowSize.height || 800) / scale} stroke={isNeo ? "#d946ef" : "#6366f1"} strokeWidth="15" fill="none" />
         </svg>
      </div>
   );
});

MiniMap.displayName = "MiniMap";
