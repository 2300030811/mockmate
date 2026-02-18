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
  insertTemplate: (stack: "Serverless" | "Web") => void;
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
  return (
    <aside id="sd-toolbar" className="w-16 md:w-56 border-r border-white/5 bg-[#080808] flex flex-col z-20 overflow-y-auto custom-scrollbar shadow-2xl">
      <div className="p-4 border-b border-white/5 space-y-3">
        <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Navigator</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <button 
            onClick={() => setActiveTool("Select")} 
            className={`flex items-center gap-3 p-2 rounded-xl border transition-all ${activeTool === "Select" ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.1)]' : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
          >
            <MousePointer2 size={16} />
            <span className="hidden md:inline text-xs font-bold">Select</span>
          </button>
          <button 
            onClick={() => setActiveTool("Pan")} 
            className={`flex items-center gap-3 p-2 rounded-xl border transition-all ${activeTool === "Pan" ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.1)]' : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
          >
            <Move size={16} />
            <span className="hidden md:inline text-xs font-bold">Pan</span>
          </button>
        </div>
        <button 
          id="sd-toolbar-connect"
          onClick={() => setActiveTool("Connect")} 
          className={`flex w-full items-center gap-3 p-2 rounded-xl border transition-all ${activeTool === "Connect" ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.1)]' : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
        >
          <ArrowRight size={16} />
          <span className="hidden md:inline text-xs font-bold">Connect (Link)</span>
        </button>
      </div>

      <div className="p-4 border-b border-white/5 space-y-3">
        <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Containers</p>
        <button 
          onClick={addGroup} 
          className="flex w-full items-center gap-3 p-2 rounded-xl border border-dashed border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/5 text-gray-400 hover:text-indigo-400 transition-all group"
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
              className="flex w-full items-center gap-3 p-2 rounded-xl hover:bg-white/5 group transition-all hover:translate-x-1"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${NODE_CONFIG[t].bg} ${NODE_CONFIG[t].color} shadow-sm group-hover:shadow-md transition-all`}>
                <div className="scale-75">{(() => { const I = NODE_CONFIG[t].icon; return <I size={18} /> })()}</div>
              </div>
              <span className="hidden md:inline text-xs font-bold text-gray-400 group-hover:text-white transition-colors">{t}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-white/5 space-y-3 bg-gray-950/20">
        <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Stacks</p>
        <div className="space-y-2">
          <button onClick={() => insertTemplate("Serverless")} className="flex w-full items-center gap-2 p-2 rounded-lg bg-indigo-500/10 text-indigo-400 text-[10px] font-bold border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors">Serverless App</button>
          <button onClick={() => insertTemplate("Web")} className="flex w-full items-center gap-2 p-2 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors">3-Tier Web</button>
        </div>
      </div>
    </aside>
  );
});

Toolbar.displayName = "Toolbar";
