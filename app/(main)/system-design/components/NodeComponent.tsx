"use client";

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
}

export const NodeComponent = memo(({ 
  node, 
  isSelected, 
  isConnecting,
  onNodeClick, 
  onDelete,
  updatePos,
  scale
}: NodeProps) => {
  const Config = NODE_CONFIG[node.type];

  return (
    <motion.div
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
      initial={{ x: node.x, y: node.y, opacity: 0, scale: 0.8 }}
      animate={{ 
        x: node.x, 
        y: node.y, 
        opacity: 1, 
        scale: isSelected ? 1.05 : 1,
        borderColor: isSelected ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.1)'
      }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      style={{ position: 'absolute' }}
      className={`
        w-24 h-24 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-grab z-20
        backdrop-blur-md border border-b-4 
        ${Config.bg} ${Config.border}
        ${isSelected ? 'shadow-[0_0_30px_rgba(255,255,255,0.15)] ring-2 ring-white/50' : 'shadow-lg hover:shadow-xl'}
        ${isConnecting ? 'ring-2 ring-indigo-400' : ''}
      `}
      onClick={(e) => {
        e.stopPropagation();
        onNodeClick(node.id);
      }}
    >
      <div className={`p-3 rounded-xl bg-gray-900/60 shadow-inner ${Config.color}`}>
         <Config.icon size={28} strokeWidth={1.5} />
      </div>
      <span className="text-[10px] font-bold uppercase text-gray-300 px-2 text-center leading-tight tracking-wider truncate w-full">
        {node.name}
      </span>

      <AnimatePresence>
        {isSelected && (
          <motion.div 
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

NodeComponent.displayName = "NodeComponent";
