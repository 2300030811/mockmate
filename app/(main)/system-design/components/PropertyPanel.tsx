"use client";

import { memo, useRef, useCallback } from "react";
import { m } from "framer-motion";
import { X, Trash2, Plus, ArrowRight, Settings, Link as LinkIcon, Layout } from "lucide-react";
import { Node, Connection, Group } from "../types";
import { NODE_CONFIG } from "../constants";

interface PropertyPanelProps {
  selectedItem: Node | Connection | Group | null;
  selectedType: "node" | "connection" | "group" | null;
  onUpdateNodes: (nodes: Node[]) => void;
  onUpdateConnections: (connections: Connection[]) => void;
  onUpdateGroups: (groups: Group[]) => void;
  nodes: Node[];
  connections: Connection[];
  groups: Group[];
  setSelectedId: (id: string | null) => void;
  addToHistory: (n: Node[], c: Connection[], g: Group[]) => void;
  deleteSelected: () => void;
  theme: "dark" | "light" | "neo";
}

export const PropertyPanel = memo(({
  selectedItem,
  selectedType,
  onUpdateNodes,
  onUpdateConnections,
  onUpdateGroups,
  nodes,
  connections,
  groups,
  setSelectedId,
  addToHistory,
  deleteSelected,
  theme
}: PropertyPanelProps) => {
  const isLight = theme === 'light';
  const isNeo = theme === 'neo';

  const lastHistoryState = useRef<string>("");

  const handleBlur = useCallback(() => {
    const currentState = JSON.stringify({ nodes, connections, groups });
    if (currentState !== lastHistoryState.current) {
      addToHistory(nodes, connections, groups);
      lastHistoryState.current = currentState;
    }
  }, [nodes, connections, groups, addToHistory]);

  // Handle focus to initialize the state if empty
  const handleFocus = useCallback(() => {
    if (!lastHistoryState.current) {
      lastHistoryState.current = JSON.stringify({ nodes, connections, groups });
    }
  }, [nodes, connections, groups]);

  if (!selectedItem) return null;

  return (
    <m.aside
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      className={`w-72 border-l z-50 flex flex-col overflow-hidden transition-all duration-500 ${isLight ? "bg-white/90 backdrop-blur-2xl border-gray-200 shadow-[-4px_0_24px_rgba(0,0,0,0.05)] text-gray-900" : isNeo ? "bg-[#050212]/80 backdrop-blur-2xl border-fuchsia-500/20 shadow-[-4px_0_30px_rgba(217,70,239,0.1)] text-cyan-50" : "bg-black/40 backdrop-blur-2xl border-white/10 shadow-[-4px_0_24px_rgba(0,0,0,0.5)] text-white"
        }`}
    >
      <div className={`h-14 px-6 border-b flex items-center justify-between shrink-0 ${isLight ? 'bg-gray-50/50 border-gray-200' : isNeo ? 'bg-fuchsia-500/10 border-fuchsia-500/20' : 'bg-gray-900/10 border-white/5'}`}>
        <div className="flex items-center gap-2">
          <Settings size={14} className="text-gray-500" />
          <h2 className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Properties</h2>
        </div>
        <button onClick={() => setSelectedId(null)} className={`p-1.5 rounded-lg transition-colors ${isLight ? 'text-gray-400 hover:text-gray-800 hover:bg-gray-200' : isNeo ? 'text-fuchsia-500/70 hover:text-cyan-400 hover:bg-fuchsia-500/20' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
        {selectedType === "node" && (() => {
          const node = selectedItem as Node;
          if (!node) return null;
          return (
            <div className="space-y-6">
              <div className={`p-4 rounded-2xl border flex items-center gap-4 ${isLight ? 'bg-gray-50 border-gray-200' : isNeo ? 'bg-fuchsia-500/5 border-fuchsia-500/20' : 'bg-white/5 border-white/5'}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${NODE_CONFIG[node.type as keyof typeof NODE_CONFIG].bg} ${NODE_CONFIG[node.type as keyof typeof NODE_CONFIG].color} shadow-inner`}>
                  {(() => { const I = NODE_CONFIG[node.type as keyof typeof NODE_CONFIG].icon; return <I size={24} /> })()}
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-tighter">{node.type}</p>
                  <p className={`text-xs font-bold ${isLight ? 'text-gray-800' : 'text-white'}`}>Component Identity</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Identifier</p>
                <input
                  className={`w-full rounded-xl p-3 text-xs font-bold outline-none transition-all duration-300 placeholder:text-gray-500 ${isLight ? 'bg-gray-100 border border-gray-200 text-gray-900 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20' : isNeo ? 'bg-[#050212]/80 border border-fuchsia-500/20 text-cyan-50 focus:border-cyan-500 focus:bg-fuchsia-500/10 focus:ring-2 focus:ring-cyan-500/20' : 'bg-black/40 border border-white/10 text-white focus:border-indigo-500 focus:bg-white/5 focus:ring-2 focus:ring-indigo-500/20'}`}
                  value={node.name}
                  placeholder="Enter name..."
                  onChange={(e) => {
                    const next = nodes.map(n => n.id === node.id ? { ...n, name: e.target.value } : n);
                    onUpdateNodes(next);
                  }}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between pl-1">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Metadata</p>
                  <button
                    className={`p-1 transition-colors ${isNeo ? 'text-fuchsia-400 hover:text-cyan-400' : 'text-indigo-400 hover:text-indigo-300'}`}
                    onClick={() => {
                      const k = prompt("Metadata key (e.g. tech, region, version)?");
                      if (k) {
                        const mx = { ...node.metadata, [k]: "Value" };
                        const next = nodes.map(n => n.id === node.id ? { ...n, metadata: mx } : n);
                        onUpdateNodes(next); addToHistory(next, connections, groups);
                      }
                    }}
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <div className={`space-y-2 rounded-xl p-2 ${isLight ? 'bg-gray-100' : isNeo ? 'bg-fuchsia-500/10' : 'bg-black/20'}`}>
                  {Object.entries(node.metadata || {}).map(([k, v]) => (
                    <div key={k} className={`flex gap-2 group p-1 transition-colors rounded-lg ${isLight ? 'hover:bg-white' : isNeo ? 'hover:bg-fuchsia-500/20' : 'hover:bg-white/5'}`}>
                      <span className="text-[9px] text-gray-500 w-16 truncate self-center font-mono">{k}</span>
                      <input
                        value={v}
                        className={`bg-transparent border-b text-[10px] font-bold flex-1 outline-none transition-all py-1 ${isLight ? 'border-gray-300 text-gray-800' : isNeo ? 'border-fuchsia-500/30 text-cyan-100' : 'border-white/5 text-white'}`}
                        onChange={(e) => {
                          const mx = { ...node.metadata, [k]: e.target.value };
                          const next = nodes.map(n => n.id === node.id ? { ...n, metadata: mx } : n);
                          onUpdateNodes(next);
                        }}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                      />
                      <button onClick={() => {
                        const mx = { ...node.metadata }; delete mx[k];
                        const nx = nodes.map(n => n.id === node.id ? { ...n, metadata: mx } : n);
                        onUpdateNodes(nx); addToHistory(nx, connections, groups);
                      }} className="opacity-0 group-hover:opacity-100 text-red-500/60 hover:text-red-500 transition-all p-1"><X size={12} /></button>
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
          const conn = selectedItem as Connection;
          if (!conn) return null;
          return (
            <div className="space-y-6">
              <div className={`p-4 rounded-2xl border flex items-center gap-4 ${isLight ? 'bg-indigo-50/50 border-indigo-100' : isNeo ? 'bg-cyan-500/5 border-cyan-500/20' : 'bg-white/5 border-white/5'}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isLight ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-500/10 text-indigo-400'}`}>
                  <LinkIcon size={24} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-tighter">Data Flow</p>
                  <p className={`text-xs font-bold ${isLight ? 'text-gray-800' : 'text-white'}`}>Interface Property</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Protocol / Label</p>
                <div className="relative group">
                  <ArrowRight size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isNeo ? 'group-focus-within:text-cyan-400' : 'group-focus-within:text-indigo-500'} ${isLight ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    className={`w-full rounded-xl py-2.5 pl-9 pr-4 text-xs font-bold outline-none border-b-2 transition-all duration-300 placeholder:text-gray-500 ${isLight ? 'bg-gray-100 border border-gray-200 border-b-indigo-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-gray-900' : isNeo ? 'bg-[#050212]/80 border border-fuchsia-500/20 border-b-cyan-500/50 focus:bg-fuchsia-500/10 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-cyan-50' : 'bg-black/40 border border-white/10 border-b-indigo-500/50 focus:bg-white/5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white'}`}
                    value={conn.label || ""}
                    placeholder="HTTPS, gRPC, TCP..."
                    onChange={(e) => {
                      const next = connections.map(c => c.id === conn.id ? { ...c, label: e.target.value } : c);
                      onUpdateConnections(next);
                    }}
                    onFocus={handleFocus}
                  onBlur={handleBlur}
                  />
                </div>
              </div>
            </div>
          )
        })()}

        {selectedType === "group" && (() => {
          const g = selectedItem as Group;
          if (!g) return null;
          return (
            <div className="space-y-6">
              <div className={`p-4 rounded-2xl border flex items-center gap-4 ${isLight ? 'bg-blue-50/50 border-blue-100' : isNeo ? 'bg-fuchsia-500/5 border-fuchsia-500/20' : 'bg-white/5 border-white/5'}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isLight ? 'bg-blue-100 text-blue-600' : 'bg-blue-500/10 text-blue-400'}`}>
                  <Layout size={24} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-tighter">Container</p>
                  <p className={`text-xs font-bold ${isLight ? 'text-gray-800' : 'text-white'}`}>VPC / Group Info</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Label</p>
                <input
                  className={`w-full rounded-xl p-3 text-xs font-bold outline-none transition-all duration-300 placeholder:text-gray-500 ${isLight ? 'bg-gray-100 border border-gray-200 text-gray-900 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20' : isNeo ? 'bg-[#050212]/80 border border-fuchsia-500/20 text-cyan-50 focus:border-cyan-500 focus:bg-fuchsia-500/10 focus:ring-2 focus:ring-cyan-500/20' : 'bg-black/40 border border-white/10 text-white focus:border-indigo-500 focus:bg-white/5 focus:ring-2 focus:ring-indigo-500/20'}`}
                  value={g.name}
                  onChange={(e) => {
                    const next = groups.map(x => x.id === g.id ? { ...x, name: e.target.value } : x);
                    onUpdateGroups(next);
                  }}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[9px] text-gray-500 pl-1 uppercase font-bold">Width</p>
                  <input
                    type="number"
                    step="20"
                    className={`w-full rounded-xl p-2.5 text-xs outline-none focus:border-indigo-500/50 ${isLight ? 'bg-gray-100 border border-gray-200 text-gray-900' : isNeo ? 'bg-fuchsia-500/5 border border-fuchsia-500/20 text-cyan-50' : 'bg-white/5 border border-white/10 text-white'}`}
                    value={g.w}
                    onChange={(e) => {
                      const next = groups.map(x => x.id === g.id ? { ...x, w: Number(e.target.value) } : x);
                      onUpdateGroups(next);
                    }}
                    onFocus={handleFocus}
                  onBlur={handleBlur}
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] text-gray-500 pl-1 uppercase font-bold">Height</p>
                  <input
                    type="number"
                    step="20"
                    className={`w-full rounded-xl p-2.5 text-xs outline-none focus:border-indigo-500/50 ${isLight ? 'bg-gray-100 border border-gray-200 text-gray-900' : isNeo ? 'bg-fuchsia-500/5 border border-fuchsia-500/20 text-cyan-50' : 'bg-white/5 border border-white/10 text-white'}`}
                    value={g.h}
                    onChange={(e) => {
                      const next = groups.map(x => x.id === g.id ? { ...x, h: Number(e.target.value) } : x);
                      onUpdateGroups(next);
                    }}
                    onFocus={handleFocus}
                  onBlur={handleBlur}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[9px] text-gray-600 pl-1 uppercase font-bold">Background Color</p>
                <div className="flex gap-2">
                  <input
                    type="color"
                    className="w-10 h-10 bg-transparent border-0 p-0 cursor-pointer overflow-hidden rounded-lg"
                    value={g.color.startsWith('rgb') ? '#6366f1' : g.color}
                    onChange={(e) => {
                      const next = groups.map(x => x.id === g.id ? { ...x, color: e.target.value } : x);
                      onUpdateGroups(next);
                    }}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                  <div className={`flex-1 text-[10px] rounded-lg flex items-center px-4 font-mono ${isLight ? 'bg-gray-100 text-gray-700' : isNeo ? 'bg-fuchsia-500/10 text-cyan-400' : 'bg-white/5 text-gray-500'}`}>
                    {g.color}
                  </div>
                </div>
              </div>
            </div>
          )
        })()}
      </div>

      <div className={`p-6 border-t shrink-0 ${isLight ? 'bg-gray-50 border-gray-200' : isNeo ? 'bg-[#050212]/50 border-fuchsia-500/20' : 'bg-black/20 border-white/5'}`}>
        <button
          onClick={deleteSelected}
          className="w-full py-3.5 rounded-2xl border border-red-500/20 text-red-500 text-xs font-black uppercase tracking-widest hover:bg-red-500/10 hover:border-red-500/40 transition-all flex items-center justify-center gap-2 group"
        >
          <Trash2 size={14} className="group-hover:rotate-12 transition-transform" />
          Delete Selection
        </button>
      </div>
    </m.aside>
  );
});

PropertyPanel.displayName = "PropertyPanel";
