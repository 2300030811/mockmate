import { memo, useRef } from "react";
import { m } from "framer-motion";
import { Layout } from "lucide-react";
import { Group } from "../types";
import { GRID_SIZE } from "../constants";

interface GroupComponentProps {
  group: Group;
  isSelected: boolean;
  onSelect: (id: string, type: "group") => void;
  updatePos: (id: string, x: number, y: number, lockChildren?: boolean) => void;
  updateSize: (id: string, w: number, h: number) => void;
  onDragStateEnd?: (nodes?: any, groups?: any) => void;
  theme: "light" | "dark" | "neo";
  nodes: any[];
  groups: any[];
}

export const GroupComponent = memo(({
  group,
  isSelected,
  onSelect,
  updatePos,
  updateSize,
  onDragStateEnd,
  theme
}: GroupComponentProps) => {
  const isDragging = useRef(false);
  const lockChildren = useRef(false);
  const isLight = theme === "light";

  return (
    <m.div
      drag
      dragMomentum={false}
      dragElastic={0}
      onDragStart={(e) => {
        isDragging.current = true;
        lockChildren.current = e.shiftKey;
        onSelect(group.id, "group");
      }}
      onDragEnd={(_, info) => {
        isDragging.current = false;
        const nx = Math.round((group.x + info.offset.x) / GRID_SIZE) * GRID_SIZE;
        const ny = Math.round((group.y + info.offset.y) / GRID_SIZE) * GRID_SIZE;
        updatePos(group.id, nx, ny, lockChildren.current);
        if (onDragStateEnd) onDragStateEnd();
      }}
      className={`pointer-events-auto absolute rounded-xl border border-dashed transition-colors select-none ${
        isSelected
          ? "ring-2 ring-[#5e6ad2] shadow-sm"
          : "hover:border-[#5e6ad2]/50"
      }`}
      style={{
        x: group.x,
        y: group.y,
        width: group.w,
        height: group.h,
        cursor: isDragging.current ? "grabbing" : "grab",
        backgroundColor: isSelected
          ? "rgba(94, 106, 210, 0.06)"
          : isLight
          ? "rgba(94, 106, 210, 0.02)"
          : "rgba(94, 106, 210, 0.03)",
        borderColor: isSelected
          ? "#5e6ad2"
          : isLight
          ? "rgba(94, 106, 210, 0.4)"
          : "rgba(94, 106, 210, 0.25)"
      }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(group.id, "group");
      }}
    >
      {/* Group Tag */}
      <div className="m-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/90 dark:bg-[#14141e]/90 border border-zinc-200 dark:border-[#1e1e2a] shadow-xs select-none">
        <Layout
          size={11}
          className={isSelected ? "text-[#5e6ad2]" : "text-zinc-500"}
        />
        <span className="text-[9.5px] font-mono uppercase font-bold tracking-wider text-zinc-700 dark:text-[#ebebef]">
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
        onDragEnd={() => {
          if (onDragStateEnd) onDragStateEnd();
        }}
        className="absolute bottom-1 right-1 w-3.5 h-3.5 cursor-nwse-resize flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="w-1.5 h-1.5 rounded-xs bg-[#5e6ad2]" />
      </m.div>
    </m.div>
  );
});

GroupComponent.displayName = "GroupComponent";
