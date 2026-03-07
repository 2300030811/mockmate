import { memo, useRef } from "react";
import { m, useMotionValue } from "framer-motion";
import { Layout } from "lucide-react";
import { Group } from "../types";
import { GRID_SIZE } from "../constants";

interface GroupComponentProps {
   group: Group;
   isSelected: boolean;
   onSelect: (id: string, type: "group") => void;
   updatePos: (id: string, x: number, y: number) => void;
   updateSize: (id: string, w: number, h: number) => void;
   theme: "light" | "dark" | "neo";
}

export const GroupComponent = memo(({ group, isSelected, onSelect, updatePos, updateSize, theme }: GroupComponentProps) => {
   const isDragging = useRef(false);
   const isLight = theme === 'light';
   const isNeo = theme === 'neo';

   return (
      <m.div
         drag
         dragMomentum={false}
         dragElastic={0}
         onDragStart={() => { isDragging.current = true; onSelect(group.id, "group"); }}
         onDragEnd={(_, info) => {
            isDragging.current = false;
            const nx = Math.round((group.x + info.offset.x) / GRID_SIZE) * GRID_SIZE;
            const ny = Math.round((group.y + info.offset.y) / GRID_SIZE) * GRID_SIZE;
            updatePos(group.id, nx, ny);
         }}
         className={`absolute rounded-3xl border-2 backdrop-blur-xl transition-all duration-300 ${isSelected ? `shadow-[0_0_40px_-10px_var(--group-color-glow)] scale-[1.01] ${isLight ? 'bg-white/60' : isNeo ? 'bg-[#050212]/60' : ''}` : `shadow-lg hover:shadow-[0_0_20px_-5px_var(--group-color-glow)] ${isLight ? 'bg-white/40' : isNeo ? 'bg-[#050212]/40' : ''}`}`}
         style={{
            x: group.x,
            y: group.y,
            width: group.w,
            height: group.h,
            cursor: isDragging.current ? 'grabbing' : 'grab',
            backgroundColor: isSelected ? `${group.color}33` : `${group.color}11`,
            borderColor: isSelected ? group.color : `${group.color}44`,
            // @ts-ignore
            '--group-color-glow': group.color
         } as any}
         transition={{ type: "spring", stiffness: 300, damping: 25 }}
         onClick={(e) => { e.stopPropagation(); onSelect(group.id, "group"); }}
      >
         <div className="p-4 flex items-center gap-2 select-none">
            <Layout size={12} className={isSelected ? (isLight ? "text-indigo-600" : isNeo ? "text-cyan-400" : "text-indigo-400") : "text-gray-500"} />
            <span className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? (isLight ? "text-indigo-600" : isNeo ? "text-cyan-400" : "text-indigo-400") : "text-gray-500"}`}>
               {group.name}
            </span>
         </div>

         {/* Resize Handle (Bottom-Right) */}
         <m.div
            drag
            dragMomentum={false}
            onDrag={(_, info) => {
               const nw = Math.round((group.w + info.delta.x) / GRID_SIZE) * GRID_SIZE;
               const nh = Math.round((group.h + info.delta.y) / GRID_SIZE) * GRID_SIZE;
               if (nw > 100 && nh > 100) {
                  updateSize(group.id, nw, nh);
               }
            }}
            className="absolute bottom-2 right-2 w-4 h-4 cursor-nwse-resize flex items-center justify-center opacity-0 group-hover:opacity-100"
            onMouseDown={(e) => e.stopPropagation()}
         >
            <div className={`w-1.5 h-1.5 rounded-full ${isNeo ? 'bg-cyan-400 shadow-[0_0_8px_cyan]' : 'bg-indigo-500'}`} />
         </m.div>

         {/* Connection points / Decorative corners */}
         <div className={`absolute top-2 right-2 w-2 h-2 border-t border-r ${isLight ? 'border-gray-300' : isNeo ? 'border-fuchsia-500/40' : 'border-white/10'}`} />
         <div className={`absolute bottom-2 left-2 w-2 h-2 border-b border-l ${isLight ? 'border-gray-300' : isNeo ? 'border-fuchsia-500/40' : 'border-white/10'}`} />
      </m.div>
   );
});

GroupComponent.displayName = "GroupComponent";
