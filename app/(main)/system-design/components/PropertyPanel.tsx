"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { X, Trash2, Plus, ArrowRight, Settings, Link as LinkIcon, Layout } from "lucide-react";
import { Node, Connection, Group } from "../types";
import { NODE_CONFIG } from "../constants";

interface PropertyPanelProps {
  selectedId: string | null;
  selectedType: "node" | "connection" | "group" | null;
  nodes: Node[];
  connections: Connection[];
  groups: Group[];
  setNodes: (nodes: Node[]) => void;
  setConnections: (connections: Connection[]) => void;
  setGroups: (groups: Group[]) => void;
  setSelectedId: (id: string | null) => void;
  addToHistory: (n: Node[], c: Connection[], g: Group[]) => void;
  deleteSelected: () => void;
  theme: "dark" | "light" | "neo";
}

export const PropertyPanel = memo(({ 
  selectedId, 
  selectedType, 
  nodes, 
  connections, 
  groups, 
  setNodes, 
  setConnections, 
  setGroups, 
  setSelectedId,
  addToHistory,
  deleteSelected,
  theme
}: PropertyPanelProps) => {
  if (!selectedId) return null;

  return (
    <motion.aside 
      initial={{ x: 300, opacity: 0 }} 
      animate={{ x: 0, opacity: 1 }} 
      exit={{ x: 300, opacity: 0 }} 
      className={`w-72 border-l z-50 flex flex-col shadow-2xl overflow-hidden transition-colors duration-500 ${
        theme === "light" ? "bg-white border-gray-200" : "bg-[#080808] border-white/5"
      }`}
    >
      <div className="h-14 px-6 border-b border-white/5 flex items-center justify-between shrink-0 bg-gray-900/10">
        <div className="flex items-center gap-2">
           <Settings size={14} className="text-gray-500" />
           <h2 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Properties</h2>
        </div>
        <button onClick={() => setSelectedId(null)} className="p-1.5 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors">
          <X size={16}/>
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
        {selectedType === "node" && (() => {
          const node = nodes.find(n => n.id === selectedId);
          if (!node) return null;
          return (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${NODE_CONFIG[node.type as keyof typeof NODE_CONFIG].bg} ${NODE_CONFIG[node.type as keyof typeof NODE_CONFIG].color} shadow-inner`}>
                   {(() => { const I = NODE_CONFIG[node.type as keyof typeof NODE_CONFIG].icon; return <I size={24} /> })()}
                </div>
                <div>
                   <p className="text-[9px] font-black text-gray-500 uppercase tracking-tighter">{node.type}</p>
                   <p className="text-xs font-bold text-white">Component Identity</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Identifier</p>
                <input 
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs font-bold outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/10 transition-all placeholder:text-gray-700" 
                  value={node.name} 
                  placeholder="Enter name..."
                  onChange={(e) => {
                    const next = nodes.map(n => n.id === node.id ? { ...n, name: e.target.value } : n);
                    setNodes(next); addToHistory(next, connections, groups);
                  }} 
                />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between pl-1">
                   <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Metadata</p>
                   <button 
                     className="p-1 text-indigo-400 hover:text-indigo-300 transition-colors"
                     onClick={() => {
                        const k = prompt("Metadata key (e.g. tech, region, version)?"); 
                        if(k) { 
                           const mx = {...node.metadata, [k]: "Value"}; 
                           const next = nodes.map(n => n.id === node.id ? { ...n, metadata: mx } : n); 
                           setNodes(next); addToHistory(next, connections, groups); 
                        }
                     }}
                   >
                     <Plus size={14}/>
                   </button>
                </div>
                <div className="space-y-2 bg-black/20 rounded-xl p-2">
                  {Object.entries(node.metadata || {}).map(([k,v]) => (
                    <div key={k} className="flex gap-2 group p-1 transition-colors hover:bg-white/5 rounded-lg">
                       <span className="text-[9px] text-gray-500 w-16 truncate self-center font-mono">{k}</span>
                       <input 
                         value={v} 
                         className="bg-transparent border-b border-white/5 text-[10px] font-bold flex-1 outline-none focus:border-indigo-500 transition-all py-1" 
                         onChange={(e) => {
                           const mx = {...node.metadata, [k]: e.target.value};
                           const next = nodes.map(n => n.id === node.id ? { ...n, metadata: mx } : n);
                           setNodes(next); addToHistory(next, connections, groups);
                         }} 
                       />
                       <button onClick={() => {
                         const mx = {...node.metadata}; delete mx[k];
                         const nx = nodes.map(n => n.id === node.id ? { ...n, metadata: mx } : n);
                         setNodes(nx); addToHistory(nx, connections, groups);
                       }} className="opacity-0 group-hover:opacity-100 text-red-500/60 hover:text-red-500 transition-all p-1"><X size={12}/></button>
                    </div>
                  ))}
                  {Object.keys(node.metadata || {}).length === 0 && (
                     <p className="text-[9px] text-gray-700 italic text-center py-2">No metadata added</p>
                  )}
                </div>
              </div>
            </div>
          )
        })()}

        {selectedType === "connection" && (() => {
          const conn = connections.find(c => c.id === selectedId);
          if (!conn) return null;
          return (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-indigo-500/10 text-indigo-400">
                   <LinkIcon size={24} />
                </div>
                <div>
                   <p className="text-[9px] font-black text-gray-500 uppercase tracking-tighter">Data Flow</p>
                   <p className="text-xs font-bold text-white">Interface Property</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Protocol / Label</p>
                <div className="relative group">
                   <ArrowRight size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400" />
                   <input 
                     className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-xs font-bold outline-none border-b-indigo-500/30 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all" 
                     value={conn.label || ""} 
                     placeholder="HTTPS, gRPC, TCP..." 
                     onChange={(e) => {
                       const next = connections.map(c => c.id === conn.id ? { ...c, label: e.target.value } : c);
                       setConnections(next); addToHistory(nodes, next, groups);
                     }} 
                   />
                </div>
              </div>
            </div>
          )
        })()}

        {selectedType === "group" && (() => {
          const g = groups.find(x => x.id === selectedId);
          if (!g) return null;
          return (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-500/10 text-blue-400">
                   <Layout size={24} />
                </div>
                <div>
                   <p className="text-[9px] font-black text-gray-500 uppercase tracking-tighter">Container</p>
                   <p className="text-xs font-bold text-white">VPC / Group Info</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Label</p>
                <input 
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs font-bold outline-none focus:border-indigo-500" 
                  value={g.name} 
                  onChange={(e) => {
                    const next = groups.map(x => x.id === g.id ? { ...x, name: e.target.value } : x);
                    setGroups(next); addToHistory(nodes, connections, next);
                  }} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                   <p className="text-[9px] text-gray-600 pl-1 uppercase font-bold">Width</p>
                   <input 
                     type="number" 
                     step="20" 
                     className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500/50" 
                     value={g.w} 
                     onChange={(e) => {
                       const next = groups.map(x => x.id === g.id ? { ...x, w: Number(e.target.value) } : x);
                       setGroups(next); addToHistory(nodes, connections, next);
                     }} 
                   />
                </div>
                <div className="space-y-1">
                   <p className="text-[9px] text-gray-600 pl-1 uppercase font-bold">Height</p>
                   <input 
                     type="number" 
                     step="20" 
                     className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500/50" 
                     value={g.h} 
                     onChange={(e) => {
                       const next = groups.map(x => x.id === g.id ? { ...x, h: Number(e.target.value) } : x);
                       setGroups(next); addToHistory(nodes, connections, next);
                     }} 
                   />
                </div>
              </div>
            </div>
          )
        })()}
      </div>

      <div className="p-6 border-t border-white/5 bg-black/20 shrink-0">
        <button 
          onClick={deleteSelected} 
          className="w-full py-3.5 rounded-2xl border border-red-500/20 text-red-500 text-xs font-black uppercase tracking-widest hover:bg-red-500/10 hover:border-red-500/40 transition-all flex items-center justify-center gap-2 group"
        >
          <Trash2 size={14} className="group-hover:rotate-12 transition-transform" /> 
          Delete Selection
        </button>
      </div>
    </motion.aside>
  );
});

PropertyPanel.displayName = "PropertyPanel";
