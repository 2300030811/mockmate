"use client";

import { memo } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";
import { Node } from "../types";
import { NODE_CONFIG, GRID_SIZE } from "../constants";

interface NodeProps {
  node: Node;
  isSelected: boolean;
  isConnecting: boolean;
  onNodeClick: (id: string) => void;
  onDelete: (id: string) => void;
  updatePos: (id: string, x: number, y: number) => void;
  scale: number;
  theme: "light" | "dark" | "neo";
  onDragStateEnd?: () => void;
}

export const NodeComponent = memo(({
  node,
  isSelected,
  isConnecting,
  onNodeClick,
  onDelete,
  updatePos,
  scale,
  theme,
  onDragStateEnd
}: NodeProps) => {
  const Config = NODE_CONFIG[node.type];
  const Icon = Config?.icon;

  const showSubtitle =
    Boolean(node.metadata?.tech) ||
    node.name.trim().toLowerCase() !== node.type.trim().toLowerCase();

  const subtitleText = node.metadata?.tech || node.type;

  return (
    <m.div
      drag
      dragMomentum={false}
      dragElastic={0}
      onDragEnd={(_, info) => {
        const rawX = node.x + info.offset.x / scale;
        const rawY = node.y + info.offset.y / scale;
        const snappedX = Math.round(rawX / GRID_SIZE) * GRID_SIZE;
        const snappedY = Math.round(rawY / GRID_SIZE) * GRID_SIZE;
        updatePos(node.id, snappedX, snappedY);
        if (onDragStateEnd) onDragStateEnd();
      }}
      whileDrag={{ scale: 1.03, zIndex: 50, cursor: "grabbing" }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{
        opacity: 1,
        scale: isSelected ? 1.02 : 1
      }}
      transition={{
        type: "spring",
        stiffness: 350,
        damping: 25
      }}
      style={{
        position: "absolute",
        x: node.x,
        y: node.y,
        left: 0,
        top: 0
      }}
      className={`
        pointer-events-auto
        w-24 h-24 rounded-xl flex flex-col items-center justify-center p-2 cursor-grab z-20 group
        border backdrop-blur-md transition-all duration-150 select-none
        ${
          theme === "light"
            ? "bg-white/95 border-zinc-200 text-zinc-900 shadow-sm hover:border-zinc-300"
            : "bg-[#14141e]/95 border-[#1e1e2a] text-[#ebebef] shadow-sm hover:border-zinc-600"
        }
        ${
          isSelected
            ? "ring-2 ring-[#5e6ad2] border-[#5e6ad2] shadow-md"
            : ""
        }
        ${
          isConnecting
            ? "ring-2 ring-emerald-500 border-emerald-500 shadow-md"
            : ""
        }
      `}
      tabIndex={0}
      role="button"
      aria-label={`${node.name} architecture node, type ${node.type}. Use arrow keys to reposition, Enter to select, Delete to remove.`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onNodeClick(node.id);
        } else if (e.key === "Delete" || e.key === "Backspace") {
          e.preventDefault();
          onDelete(node.id);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          updatePos(node.id, node.x, node.y - GRID_SIZE);
          onDragStateEnd?.();
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          updatePos(node.id, node.x, node.y + GRID_SIZE);
          onDragStateEnd?.();
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          updatePos(node.id, node.x - GRID_SIZE, node.y);
          onDragStateEnd?.();
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          updatePos(node.id, node.x + GRID_SIZE, node.y);
          onDragStateEnd?.();
        }
      }}
      onClick={(e) => {
        e.stopPropagation();
        onNodeClick(node.id);
      }}
    >
      {/* Node Icon Tile */}
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
          showSubtitle ? "mb-1" : "mb-1.5"
        } ${
          theme === "light"
            ? "bg-zinc-100 text-zinc-800"
            : "bg-[#181824] text-[#ebebef] border border-[#262638]"
        }`}
      >
        {Icon && <Icon size={16} className={Config?.color} />}
      </div>

      {/* Node Custom Name */}
      <span className="text-[10.5px] font-semibold tracking-tight text-center leading-tight truncate w-full px-0.5">
        {node.name}
      </span>

      {/* Conditional Subtitle (Only if custom name or tech spec exists) */}
      {showSubtitle && (
        <span
          className={`text-[8.5px] font-mono uppercase tracking-wider truncate max-w-full ${
            node.metadata?.tech
              ? "text-[#5e6ad2] dark:text-[#7b87f5] font-semibold"
              : "text-zinc-400 dark:text-[#5a5a6e]"
          }`}
        >
          {subtitleText}
        </span>
      )}

      {/* Delete Badge on Selection */}
      <AnimatePresence>
        {isSelected && (
          <m.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute -top-2 -right-2 z-30"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(node.id);
              }}
              className="w-5 h-5 bg-rose-500 hover:bg-rose-600 rounded-full flex items-center justify-center text-white shadow-sm transition-transform hover:scale-110"
              title="Delete Node (Del/Backspace)"
            >
              <Trash2 size={10} />
            </button>
          </m.div>
        )}
      </AnimatePresence>
    </m.div>
  );
});

NodeComponent.displayName = "NodeComponent";
