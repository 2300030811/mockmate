"use client";

import { memo } from "react";
import { m } from "framer-motion";
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
  Trash2,
  Cloud,
  Trophy
} from "lucide-react";
import { NavigationPill } from "@/components/ui/NavigationPill";

interface CanvasHeaderProps {
  undo: () => void;
  redo: () => void;
  historyIndex: number;
  historyLength: number;
  setPan: (p: { x: number, y: number }) => void;
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
  saveDesign: () => void;
  toggleChallengePanel: () => void;
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
  clearCanvas,
  saveDesign,
  toggleChallengePanel
}: CanvasHeaderProps) => {
  const isLight = theme === 'light';
  const isNeo = theme === 'neo';

  return (
    <header id="sd-header" className={`h-14 px-4 flex items-center justify-between z-40 shrink-0 transition-all duration-500 border-b ${isLight ? 'bg-white/90 border-gray-200 backdrop-blur-2xl shadow-[0_4px_24px_rgba(0,0,0,0.05)]' : isNeo ? 'bg-[#050212]/80 border-fuchsia-500/20 backdrop-blur-2xl shadow-[0_4px_30px_rgba(217,70,239,0.1)]' : 'bg-black/40 border-white/10 backdrop-blur-2xl shadow-[0_4px_24px_rgba(0,0,0,0.5)]'}`}>
      <div className="flex items-center gap-4">
        <NavigationPill className="scale-90 origin-left" variant={isLight ? "light" : "dark"} />
        <div className={`w-px h-6 hidden md:block ${isLight ? 'bg-gray-200' : isNeo ? 'bg-fuchsia-500/20' : 'bg-white/10'}`}></div>
        <div className="flex items-center gap-3">
          <div className={`p-1.5 rounded-lg border shadow-sm ${isNeo ? 'bg-fuchsia-500/10 border-fuchsia-500/20' : 'bg-indigo-500/10 border-indigo-500/20'}`}><Layers size={16} className={isLight ? 'text-indigo-600' : isNeo ? 'text-fuchsia-400' : 'text-indigo-400'} /></div>
          <h1 className={`text-sm font-bold truncate max-w-[120px] md:max-w-none tracking-tight ${isLight ? 'text-gray-800' : isNeo ? 'text-fuchsia-50' : 'text-gray-200'}`}>System Architect Pro</h1>
        </div>
      </div>

      <div id="sd-header-export" className="flex items-center gap-2">
        <button
          onClick={toggleChallengePanel}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400 text-[10px] font-black uppercase tracking-widest hover:bg-orange-500/20 hover:shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-all duration-300 mr-2"
        >
          <Trophy size={14} />
          Challenges
        </button>

        <div className={`flex items-center gap-1 mr-2 px-1 border-r ${isLight ? 'border-gray-200' : 'border-white/5'}`}>
          <button onClick={saveDesign} className={`p-2 transition-all duration-300 rounded-lg hover:shadow-[0_0_10px_rgba(99,102,241,0.2)] ${isLight ? 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50' : 'text-gray-500 hover:text-indigo-300 hover:bg-indigo-500/20'}`} title="Save Design"><Cloud size={18} /></button>
          <button onClick={exportSVG} className={`p-2 transition-all duration-300 rounded-lg hover:shadow-[0_0_10px_rgba(16,185,129,0.2)] ${isLight ? 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50' : 'text-gray-500 hover:text-emerald-300 hover:bg-emerald-500/20'}`} title="Export SVG"><ImageIcon size={18} /></button>
          <button onClick={copyJSON} className={`p-2 transition-all duration-300 rounded-lg hover:shadow-[0_0_10px_rgba(59,130,246,0.2)] ${isLight ? 'text-gray-400 hover:text-blue-600 hover:bg-blue-50' : 'text-gray-500 hover:text-blue-300 hover:bg-blue-500/20'}`} title="Copy JSON"><FileJson size={18} /></button>
        </div>

        <div className={`hidden md:flex items-center rounded-lg p-0.5 border ${isLight ? 'bg-gray-100 border-gray-200' : 'bg-gray-900 border-white/5'}`}>
          <button onClick={undo} disabled={historyIndex <= 0} className={`p-1.5 rounded-md disabled:opacity-20 transition-colors ${isLight ? 'hover:bg-white' : 'hover:bg-white/10'}`}><Undo2 size={14} /></button>
          <button onClick={redo} disabled={historyIndex >= historyLength - 1} className={`p-1.5 rounded-md disabled:opacity-20 transition-colors ${isLight ? 'hover:bg-white' : 'hover:bg-white/10'}`}><Redo2 size={14} /></button>
        </div>

        <div className={`hidden sm:flex items-center rounded-lg p-0.5 ml-1 border ${isLight ? 'bg-gray-100 border-gray-200' : 'bg-gray-900 border-white/5'}`}>
          <button onClick={() => setPan({ x: 0, y: 0 })} className={`p-1.5 rounded-md transition-all ${isLight ? 'text-gray-500 hover:text-gray-900 hover:bg-white' : 'text-gray-500 hover:text-gray-200 hover:bg-white/10'}`} title="Recenter"><Maximize2 size={14} /></button>
          <button onClick={() => setScale(s => Math.max(0.2, s - 0.1))} className={`p-1.5 rounded-md transition-all ${isLight ? 'text-gray-500 hover:text-gray-900 hover:bg-white' : 'text-gray-500 hover:text-gray-200 hover:bg-white/10'}`}><ZoomOut size={14} /></button>
          <span className="text-[10px] font-mono w-10 text-center text-gray-500 tabular-nums">{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale(s => Math.min(3, s + 0.1))} className={`p-1.5 rounded-md transition-all ${isLight ? 'text-gray-500 hover:text-gray-900 hover:bg-white' : 'text-gray-500 hover:text-gray-200 hover:bg-white/10'}`}><ZoomIn size={14} /></button>
        </div>

        <button onClick={() => setShowGrid(!showGrid)} className={`p-2 rounded-lg transition-all ${showGrid ? 'text-indigo-600 bg-indigo-500/10' : (isLight ? 'text-gray-400 hover:bg-gray-100' : 'text-gray-500 hover:bg-white/5')}`}><GridIcon size={16} /></button>

        <div className={`flex items-center border rounded-xl p-1 ml-1 relative group shadow-inner ${isLight ? 'bg-gray-100 border-gray-200' : isNeo ? 'bg-fuchsia-950/20 border-fuchsia-500/20' : 'bg-gray-950/50 border-white/5'}`}>
          <m.div
            layout
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={`absolute inset-y-1 rounded-lg shadow-sm ${isLight ? 'bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)]' : isNeo ? 'bg-fuchsia-500/20 shadow-[0_0_10px_rgba(217,70,239,0.3)]' : 'bg-white/10'}`}
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

        <div className={`w-px h-6 mx-1 hidden md:block ${isLight ? 'bg-gray-200' : isNeo ? 'bg-fuchsia-500/20' : 'bg-white/10'}`}></div>

        <button
          onClick={clearCanvas}
          className={`p-2 transition-all rounded-lg group ${isLight ? 'text-gray-400 hover:text-red-500 hover:bg-red-50' : 'text-gray-500 hover:text-red-400 hover:bg-red-950/30'}`}
          title="Clear All"
        >
          <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
        </button>

        <div className={`w-px h-6 mx-1 hidden md:block ${isLight ? 'bg-gray-200' : isNeo ? 'bg-fuchsia-500/20' : 'bg-white/10'}`}></div>

        <button
          id="sd-header-audit"
          onClick={handleReview}
          disabled={nodesLength === 0 || isReviewing}
          className={`
            px-4 py-1.5 rounded-lg text-xs font-black transition-all duration-300 flex items-center gap-2 border
            ${nodesLength === 0 || isReviewing
              ? 'bg-gray-800/50 text-gray-500 border-white/5 cursor-not-allowed'
              : isNeo
                ? 'bg-gradient-to-r from-fuchsia-600 to-cyan-600 hover:from-fuchsia-500 hover:to-cyan-500 text-white border-fuchsia-400/50 shadow-[0_0_20px_rgba(217,70,239,0.4)] hover:shadow-[0_0_30px_rgba(217,70,239,0.6)] hover:scale-105 active:scale-95'
                : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white border-indigo-400/50 shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] hover:scale-105 active:scale-95'}
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
