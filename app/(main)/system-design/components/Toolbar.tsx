"use client";

import { memo } from "react";
import {
  MousePointer2,
  Move,
  ArrowRight,
  Box,
  Plus
} from "lucide-react";
import { NODE_CONFIG, NodeType } from "../constants";

interface ToolbarProps {
  activeTool: string;
  setActiveTool: (tool: any) => void;
  addGroup: () => void;
  addNode: (type: NodeType) => void;
  insertTemplate: (stack: "Serverless" | "Web" | "Microservices" | "Event-Driven") => void;
  theme: "dark" | "light" | "neo";
}

export const Toolbar = memo(({
  activeTool,
  setActiveTool,
  addGroup,
  addNode,
  insertTemplate,
  theme
}: ToolbarProps) => {
  const isLight = theme === 'light';
  const isNeo = theme === 'neo';

  return (
    <aside id="sd-toolbar" className={`w-16 md:w-56 border-r flex flex-col z-20 overflow-y-auto custom-scrollbar transition-all duration-500 ${isLight ? 'bg-white/90 border-gray-200 backdrop-blur-2xl shadow-[4px_0_24px_rgba(0,0,0,0.05)]' : isNeo ? 'bg-[#050212]/80 border-fuchsia-500/20 backdrop-blur-2xl shadow-[4px_0_30px_rgba(217,70,239,0.1)]' : 'bg-black/40 border-white/10 backdrop-blur-2xl shadow-[4px_0_24px_rgba(0,0,0,0.5)]'}`}>
      <div className={`p-4 border-b space-y-3 ${isLight ? 'border-gray-200' : isNeo ? 'border-fuchsia-500/20' : 'border-white/5'}`}>
        <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Navigator</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <button
            onClick={() => setActiveTool("Select")}
            className={`flex items-center gap-3 p-2 rounded-xl border transition-all duration-300 ${activeTool === "Select" ? (isNeo ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'bg-indigo-500/20 border-indigo-500/50 text-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]') : `border-transparent ${isLight ? 'text-gray-500 hover:text-gray-900 hover:bg-gray-100 hover:shadow-sm' : isNeo ? 'text-fuchsia-500/70 hover:text-cyan-400 hover:bg-fuchsia-500/10 hover:shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/10 hover:shadow-lg'}`}`}
          >
            <MousePointer2 size={16} />
            <span className="hidden md:inline text-xs font-bold">Select</span>
          </button>
          <button
            onClick={() => setActiveTool("Pan")}
            className={`flex items-center gap-3 p-2 rounded-xl border transition-all duration-300 ${activeTool === "Pan" ? (isNeo ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'bg-indigo-500/20 border-indigo-500/50 text-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]') : `border-transparent ${isLight ? 'text-gray-500 hover:text-gray-900 hover:bg-gray-100 hover:shadow-sm' : isNeo ? 'text-fuchsia-500/70 hover:text-cyan-400 hover:bg-fuchsia-500/10 hover:shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/10 hover:shadow-lg'}`}`}
          >
            <Move size={16} />
            <span className="hidden md:inline text-xs font-bold">Pan</span>
          </button>
        </div>
        <button
          id="sd-toolbar-connect"
          onClick={() => setActiveTool("Connect")}
          className={`flex w-full items-center gap-3 p-2 rounded-xl border transition-all duration-300 ${activeTool === "Connect" ? (isNeo ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'bg-indigo-500/20 border-indigo-500/50 text-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]') : `border-transparent ${isLight ? 'text-gray-500 hover:text-gray-900 hover:bg-gray-100 hover:shadow-sm' : isNeo ? 'text-fuchsia-500/70 hover:text-cyan-400 hover:bg-fuchsia-500/10 hover:shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/10 hover:shadow-lg'}`}`}
        >
          <ArrowRight size={16} />
          <span className="hidden md:inline text-xs font-bold">Connect (Link)</span>
        </button>
      </div>

      <div className={`p-4 border-b space-y-3 ${isLight ? 'border-gray-200' : isNeo ? 'border-fuchsia-500/20' : 'border-white/5'}`}>
        <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Containers</p>
        <button
          onClick={addGroup}
          className={`flex w-full items-center gap-3 p-2 rounded-xl border border-dashed transition-all duration-300 group ${isLight ? 'border-gray-300 text-gray-500 hover:border-indigo-500/50 hover:bg-indigo-500/10 hover:text-indigo-600 hover:shadow-[0_0_15px_rgba(99,102,241,0.15)]' : isNeo ? 'border-fuchsia-500/20 text-fuchsia-500/70 hover:border-cyan-500/50 hover:bg-cyan-500/10 hover:text-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]' : 'border-white/20 text-gray-400 hover:border-indigo-500/50 hover:bg-indigo-500/10 hover:text-indigo-300 hover:shadow-[0_0_15px_rgba(99,102,241,0.15)]'}`}
        >
          <Box size={16} className="group-hover:scale-110 transition-transform" />
          <span className="hidden md:inline text-xs font-bold">New Group / VPC</span>
        </button>
      </div>

      <div className="p-4 flex-1 space-y-4">
        <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Nodes</p>
        <div className="space-y-1">
          {(Object.keys(NODE_CONFIG) as NodeType[]).map(t => (
            <button
              key={t}
              onClick={() => addNode(t)}
              className={`flex w-full items-center gap-3 p-2 rounded-xl group transition-all duration-300 hover:translate-x-2 hover:shadow-lg ${isLight ? 'hover:bg-gray-100' : isNeo ? 'hover:bg-fuchsia-500/10' : 'hover:bg-white/10'}`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${NODE_CONFIG[t].bg} ${NODE_CONFIG[t].color} shadow-sm group-hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all duration-300`}>
                <div className="scale-75">{(() => { const I = NODE_CONFIG[t].icon; return <I size={18} /> })()}</div>
              </div>
              <span className={`hidden md:inline text-xs font-bold transition-colors ${isLight ? 'text-gray-600 group-hover:text-gray-900' : isNeo ? 'text-fuchsia-500/70 group-hover:text-cyan-400' : 'text-gray-400 group-hover:text-white'}`}>{t}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={`p-4 border-t space-y-3 ${isLight ? 'border-gray-200 bg-gray-50' : isNeo ? 'border-fuchsia-500/20 bg-[#050212]/50' : 'border-white/5 bg-gray-950/20'}`}>
        <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Stacks</p>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => insertTemplate("Serverless")} className="flex w-full items-center justify-center p-2 rounded-lg bg-indigo-500/10 text-indigo-400 text-[10px] font-bold border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors">Serverless</button>
          <button onClick={() => insertTemplate("Web")} className="flex w-full items-center justify-center p-2 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors">3-Tier Web</button>
          <button onClick={() => insertTemplate("Microservices")} className="flex w-full items-center justify-center p-2 rounded-lg bg-purple-500/10 text-purple-400 text-[10px] font-bold border border-purple-500/20 hover:bg-purple-500/20 transition-colors">Microservices</button>
          <button onClick={() => insertTemplate("Event-Driven")} className="flex w-full items-center justify-center p-2 rounded-lg bg-amber-500/10 text-amber-400 text-[10px] font-bold border border-amber-500/20 hover:bg-amber-500/20 transition-colors">Event-Driven</button>
        </div>
      </div>
    </aside>
  );
});

Toolbar.displayName = "Toolbar";
