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
}

export const NodeComponent = memo(({
  node,
  isSelected,
  isConnecting,
  onNodeClick,
  onDelete,
  updatePos,
  scale,
  theme
}: NodeProps) => {
  const Config = NODE_CONFIG[node.type];
  const isLight = theme === 'light';
  const isNeo = theme === 'neo';

  return (
    <m.div
      drag
      dragMomentum={false}
      dragElastic={0}
      onDragEnd={(_, info) => {
        const rawX = node.x + (info.offset.x / scale);
        const rawY = node.y + (info.offset.y / scale);
        const snappedX = Math.round(rawX / GRID_SIZE) * GRID_SIZE;
        const snappedY = Math.round(rawY / GRID_SIZE) * GRID_SIZE;
        updatePos(node.id, snappedX, snappedY);
      }}
      whileDrag={{ scale: 1.05, zIndex: 50, cursor: 'grabbing' }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: 1,
        scale: isSelected ? 1.05 : 1,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 25,
      }}
      style={{
        position: 'absolute',
        x: node.x,
        y: node.y,
        left: 0,
        top: 0
      }}
      className={`
        w-24 h-24 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-grab z-20 group
        backdrop-blur-xl border border-b-4 transition-all duration-300
        ${Config.bg} ${isLight ? Config.border.replace('border-white/5', 'border-gray-200') : isNeo ? Config.border.replace('border-white/5', 'border-fuchsia-500/20') : Config.border} ${isLight ? 'bg-white/80' : isNeo ? 'bg-[#050212]/80' : ''}
        ${isSelected ? `ring-2 scale-105 ${isLight ? 'shadow-[0_0_30px_rgba(0,0,0,0.1)] ring-indigo-400' : isNeo ? 'shadow-[0_0_30px_rgba(217,70,239,0.2)] ring-cyan-400' : 'shadow-[0_0_30px_rgba(255,255,255,0.2)] ring-white/60'}` : `shadow-lg hover:-translate-y-1 ${isLight ? 'hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)]' : isNeo ? 'hover:shadow-[0_8px_30px_rgba(6,182,212,0.1)]' : 'hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)]'}`}
        ${isConnecting ? `ring-2 shadow-[0_0_20px_rgba(99,102,241,0.4)] ${isNeo ? 'ring-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]' : 'ring-indigo-400'}` : ''}
      `}
      onClick={(e) => {
        e.stopPropagation();
        onNodeClick(node.id);
      }}
    >
      <div className={`p-3 rounded-xl shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)] ${Config.color} ${isLight ? 'bg-gray-100/80 shadow-[inset_0_2px_5px_rgba(0,0,0,0.05)]' : isNeo ? 'bg-fuchsia-950/40 shadow-[inset_0_2px_10px_rgba(217,70,239,0.1)]' : 'bg-gray-900/60'}`}>
        <Config.icon size={28} strokeWidth={1.5} />
      </div>
      <span className={`text-[10px] font-bold uppercase px-2 text-center leading-tight tracking-wider truncate w-full ${isLight ? 'text-gray-700' : isNeo ? 'text-cyan-50' : 'text-gray-300'}`}>
        {node.name}
      </span>

      <AnimatePresence>
        {isSelected && (
          <m.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute -top-3 -right-3"
          >
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(node.id); }}
              className="w-6 h-6 bg-red-500 hover:bg-red-400 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110"
            >
              <Trash2 size={12} />
            </button>
          </m.div>
        )}
      </AnimatePresence>
    </m.div>
  );
});

NodeComponent.displayName = "NodeComponent";
