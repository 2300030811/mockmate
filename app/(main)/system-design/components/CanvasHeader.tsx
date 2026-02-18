"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { 
  Undo2, 
  Redo2, 
  Maximize2, 
  ZoomOut, 
  ZoomIn, 
  Grid as GridIcon, 
  ImageIcon, 
  FileJson, 
  Sparkles, 
  Zap,
  Layers,
  Trash2
} from "lucide-react";
import { NavigationPill } from "@/components/ui/NavigationPill";

interface CanvasHeaderProps {
  undo: () => void;
  redo: () => void;
  historyIndex: number;
  historyLength: number;
  setPan: (p: {x:number, y:number}) => void;
  setScale: (s: (prev: number) => number) => void;
  scale: number;
  showGrid: boolean;
  setShowGrid: (v: boolean) => void;
  exportSVG: () => void;
  copyJSON: () => void;
  handleReview: () => void;
  isReviewing: boolean;
  nodesLength: number;
  theme: "dark" | "light" | "neo";
  setTheme: (t: "dark" | "light" | "neo") => void;
  clearCanvas: () => void;
}

export const CanvasHeader = memo(({ 
  undo, 
  redo, 
  historyIndex, 
  historyLength, 
  setPan, 
  setScale, 
  scale, 
  showGrid, 
  setShowGrid, 
  exportSVG, 
  copyJSON, 
  handleReview, 
  isReviewing,
  nodesLength,
  theme,
  setTheme,
  clearCanvas
}: CanvasHeaderProps) => {
  return (
    <header id="sd-header" className="h-14 px-4 border-b border-white/5 bg-[#080808]/90 backdrop-blur-md flex items-center justify-between z-40 shrink-0 shadow-lg">
      <div className="flex items-center gap-4">
        <NavigationPill className="scale-90 origin-left" />
        <div className="w-px h-6 bg-white/10 hidden md:block"></div>
        <div className="flex items-center gap-3">
           <div className="p-1.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20 shadow-sm"><Layers size={16} className="text-indigo-400" /></div>
           <h1 className="text-sm font-bold truncate max-w-[120px] md:max-w-none text-gray-200 tracking-tight">System Architect Pro</h1>
        </div>
      </div>

      <div id="sd-header-export" className="flex items-center gap-2">
        <div className="flex items-center gap-1 mr-2 px-1 border-r border-white/5">
          <button onClick={exportSVG} className="p-2 text-gray-500 hover:text-emerald-400 transition-all hover:bg-emerald-950/30 rounded-lg" title="Export SVG"><ImageIcon size={18} /></button>
          <button onClick={copyJSON} className="p-2 text-gray-500 hover:text-blue-400 transition-all hover:bg-blue-950/30 rounded-lg" title="Copy JSON"><FileJson size={18} /></button>
        </div>

        <div className="hidden md:flex items-center bg-gray-900 border border-white/5 rounded-lg p-0.5">
          <button onClick={undo} disabled={historyIndex <= 0} className="p-1.5 hover:bg-white/10 rounded-md disabled:opacity-20 transition-colors"><Undo2 size={14} /></button>
          <button onClick={redo} disabled={historyIndex >= historyLength - 1} className="p-1.5 hover:bg-white/10 rounded-md disabled:opacity-20 transition-colors"><Redo2 size={14} /></button>
        </div>
        
        <div className="hidden sm:flex items-center bg-gray-900 border border-white/5 rounded-lg p-0.5 ml-1">
          <button onClick={() => setPan({x:0, y:0})} className="p-1.5 hover:bg-white/10 rounded-md text-gray-500 hover:text-gray-200 transition-all" title="Recenter"><Maximize2 size={14} /></button>
          <button onClick={() => setScale(s => Math.max(0.2, s - 0.1))} className="p-1.5 hover:bg-white/10 rounded-md text-gray-500 hover:text-gray-200 transition-all"><ZoomOut size={14} /></button>
          <span className="text-[10px] font-mono w-10 text-center text-gray-500 tabular-nums">{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale(s => Math.min(3, s + 0.1))} className="p-1.5 hover:bg-white/10 rounded-md text-gray-500 hover:text-gray-200 transition-all"><ZoomIn size={14} /></button>
        </div>

        <button onClick={() => setShowGrid(!showGrid)} className={`p-2 rounded-lg transition-all ${showGrid ? 'text-indigo-400 bg-indigo-400/10' : 'text-gray-500 hover:bg-white/5'}`}><GridIcon size={16} /></button>
        
        <div className="flex items-center bg-gray-950/50 border border-white/5 rounded-xl p-1 ml-1 relative group shadow-inner">
          <motion.div 
            layout
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="absolute inset-y-1 bg-white/10 rounded-lg shadow-sm"
            style={{ 
              left: theme === "light" ? "4px" : theme === "dark" ? "36px" : "68px",
              width: "28px"
            }}
          />
          <button 
            onClick={() => setTheme("light")} 
            className={`relative z-10 p-1.5 rounded-lg transition-colors ${theme === "light" ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
            title="Light Mode"
          >
            <Zap size={14} fill={theme === "light" ? "currentColor" : "none"} />
          </button>
          <button 
            onClick={() => setTheme("dark")} 
            className={`relative z-10 p-1.5 rounded-lg transition-colors ${theme === "dark" ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
            title="Dark Mode"
          >
            <Zap size={14} fill={theme === "dark" ? "currentColor" : "none"} className="rotate-180" />
          </button>
          <button 
            onClick={() => setTheme("neo")} 
            className={`relative z-10 p-1.5 rounded-lg transition-colors ${theme === "neo" ? "text-indigo-400" : "text-gray-500 hover:text-indigo-400"}`}
            title="Neo-Noir Mode"
          >
            <Sparkles size={14} className={theme === "neo" ? "animate-pulse" : ""} />
          </button>
        </div>

        <div className="w-px h-6 bg-white/10 mx-1 hidden md:block"></div>

        <button 
          onClick={clearCanvas}
          className="p-2 text-gray-500 hover:text-red-400 transition-all hover:bg-red-950/30 rounded-lg group"
          title="Clear All"
        >
          <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
        </button>

        <div className="w-px h-6 bg-white/10 mx-1 hidden md:block"></div>

        <button 
          id="sd-header-audit"
          onClick={handleReview} 
          disabled={nodesLength === 0 || isReviewing} 
          className={`
            px-4 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-2 border shadow-lg
            ${nodesLength === 0 || isReviewing 
              ? 'bg-gray-800 text-gray-600 border-white/5 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-400/50 hover:shadow-indigo-500/20'}
          `}
        >
          {isReviewing ? <Sparkles className="animate-spin" size={14} /> : <Zap size={14} fill="currentColor" />}
          <span className="hidden md:inline uppercase tracking-widest">{isReviewing ? 'Analyzing' : 'Audit'}</span>
        </button>
      </div>
    </header>
  );
});

CanvasHeader.displayName = "CanvasHeader";
