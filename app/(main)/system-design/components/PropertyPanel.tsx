"use client";

import { memo, useRef, useCallback, useEffect } from "react";
import { m } from "framer-motion";
import { X, Trash2, Plus, ArrowRight, Settings, Link as LinkIcon, Layout } from "lucide-react";
import { Node, Connection, Group } from "../types";
import { NODE_CONFIG } from "../constants";

interface PropertyPanelProps {
  selectedItem: Node | Connection | Group | null;
  selectedType: "node" | "connection" | "group" | null;
  onUpdateNodes: (updates: Partial<Node>) => void;
  onUpdateConnections: (updates: Partial<Connection>) => void;
  onUpdateGroups: (updates: Partial<Group>) => void;
  nodes: Node[];
  connections: Connection[];
  groups: Group[];
  setSelectedId: (id: string | null) => void;
  addToHistory: (n: Node[], c: Connection[], g: Group[]) => void;
  deleteSelected: () => void;
  theme: "dark" | "light" | "neo";
  focusConnectionId?: string | null;
  clearConnectionFocus?: () => void;
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
  theme,
  focusConnectionId,
  clearConnectionFocus
}: PropertyPanelProps) => {
  const lastHistoryState = useRef<string>("");
  const connectionInputRef = useRef<HTMLInputElement>(null);

  const handleBlur = useCallback(() => {
    const currentState = JSON.stringify({ nodes, connections, groups });
    if (currentState !== lastHistoryState.current) {
      addToHistory(nodes, connections, groups);
      lastHistoryState.current = currentState;
    }
  }, [nodes, connections, groups, addToHistory]);

  const handleFocus = useCallback(() => {
    if (!lastHistoryState.current) {
      lastHistoryState.current = JSON.stringify({ nodes, connections, groups });
    }
  }, [nodes, connections, groups]);

  useEffect(() => {
    if (focusConnectionId && connectionInputRef.current) {
      connectionInputRef.current.focus();
      if (clearConnectionFocus) clearConnectionFocus();
    }
  }, [focusConnectionId, clearConnectionFocus]);

  if (!selectedItem) return null;

  return (
    <m.aside
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      className="w-72 border-l border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#0d0d12] text-zinc-900 dark:text-[#ebebef] z-30 flex flex-col overflow-hidden select-none transition-colors"
    >
      {/* Drawer Header */}
      <div className="h-12 px-4 border-b border-zinc-200 dark:border-[#1e1e2a] flex items-center justify-between shrink-0 bg-zinc-50/50 dark:bg-[#14141e]/50">
        <div className="flex items-center gap-2">
          <Settings size={13} className="text-zinc-500" />
          <h2 className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-[#8b8b9e]">
            Inspector // Properties
          </h2>
        </div>
        <button
          onClick={() => setSelectedId(null)}
          className="p-1 rounded text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#1e1e2a] transition-colors"
          title="Close Inspector"
        >
          <X size={14} />
        </button>
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-5">
        {/* Node Properties */}
        {selectedType === "node" && (() => {
          const node = selectedItem as Node;
          if (!node) return null;
          const Config = NODE_CONFIG[node.type as keyof typeof NODE_CONFIG];
          const Icon = Config?.icon;
          return (
            <div className="space-y-4">
              <div className="p-3 rounded-lg border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50 dark:bg-[#14141e] flex items-center gap-3">
                <div className="w-9 h-9 rounded-md flex items-center justify-center bg-zinc-100 dark:bg-[#1a1a28] border border-zinc-200 dark:border-[#262638]">
                  {Icon && <Icon size={18} className={Config?.color} />}
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-mono uppercase tracking-wider text-zinc-400 dark:text-[#5a5a6e]">
                    {node.type}
                  </p>
                  <p className="text-xs font-semibold text-zinc-900 dark:text-[#ebebef] truncate">
                    {node.name}
                  </p>
                </div>
              </div>

              {/* Identifier Input */}
              <div className="space-y-1">
                <label className="text-[9.5px] font-mono uppercase tracking-wider text-zinc-500 dark:text-[#8b8b9e] pl-0.5">
                  Instance Label
                </label>
                <input
                  className="w-full rounded-md px-2.5 py-1.5 text-xs font-medium bg-zinc-50 dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] text-zinc-900 dark:text-[#ebebef] focus:border-[#5e6ad2] focus:outline-none transition-colors"
                  value={node.name}
                  placeholder="Enter component name..."
                  onChange={(e) => onUpdateNodes({ name: e.target.value })}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>

              {/* Specifications */}
              <div className="space-y-2 pt-1 border-t border-zinc-100 dark:border-[#1e1e2a]">
                <p className="text-[9.5px] font-mono uppercase tracking-wider text-zinc-500 dark:text-[#8b8b9e] pl-0.5">
                  Technical Specifications
                </p>
                <div className="space-y-2">
                  {[
                    { key: "tech", label: "Tech Stack", placeholder: "Redis, Kafka, PostgreSQL..." },
                    { key: "capacity", label: "Capacity / QPS", placeholder: "10,000 QPS, 64GB RAM..." },
                    { key: "region", label: "Region / Cloud", placeholder: "us-east-1, multi-cloud..." },
                    { key: "latency", label: "Target Latency", placeholder: "<5ms p99..." }
                  ].map((field) => (
                    <div key={field.key} className="space-y-0.5">
                      <span className="text-[9px] font-mono uppercase text-zinc-400 dark:text-[#5a5a6e] pl-0.5">
                        {field.label}
                      </span>
                      <input
                        className="w-full rounded-md px-2 py-1 text-xs font-mono bg-zinc-50 dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] text-zinc-900 dark:text-[#ebebef] focus:border-[#5e6ad2] focus:outline-none transition-colors"
                        placeholder={field.placeholder}
                        value={node.metadata?.[field.key] || ""}
                        onChange={(e) => {
                          const mx = { ...node.metadata, [field.key]: e.target.value };
                          onUpdateNodes({ metadata: mx });
                        }}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Metadata */}
              <div className="space-y-2 pt-1 border-t border-zinc-100 dark:border-[#1e1e2a]">
                <div className="flex items-center justify-between pl-0.5">
                  <p className="text-[9.5px] font-mono uppercase tracking-wider text-zinc-500 dark:text-[#8b8b9e]">
                    Custom Attributes
                  </p>
                  <button
                    className="p-1 rounded text-zinc-500 hover:text-[#5e6ad2] transition-colors"
                    onClick={() => {
                      const k = prompt("Attribute key (e.g. partition_key, max_replicas)?");
                      if (k) {
                        const cleanKey = k.trim().toLowerCase();
                        const mx = { ...node.metadata, [cleanKey]: "default" };
                        onUpdateNodes({ metadata: mx });
                        const updatedNodes = nodes.map((n) =>
                          n.id === node.id ? { ...n, metadata: mx } : n
                        );
                        addToHistory(updatedNodes, connections, groups);
                      }
                    }}
                  >
                    <Plus size={13} />
                  </button>
                </div>

                <div className="space-y-1.5 rounded-md p-2 bg-zinc-50 dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a]">
                  {Object.entries(node.metadata || {})
                    .filter(([k]) => !["tech", "capacity", "region", "az", "latency"].includes(k))
                    .map(([k, v]) => (
                      <div key={k} className="flex items-center gap-2 group text-xs">
                        <span className="text-[9.5px] font-mono text-zinc-400 dark:text-[#5a5a6e] w-18 truncate">
                          {k}
                        </span>
                        <input
                          value={v}
                          className="flex-1 bg-transparent border-b border-zinc-200 dark:border-zinc-700 py-0.5 text-xs font-mono text-zinc-900 dark:text-[#ebebef] focus:outline-none focus:border-[#5e6ad2]"
                          onChange={(e) => {
                            const mx = { ...node.metadata, [k]: e.target.value };
                            onUpdateNodes({ metadata: mx });
                          }}
                          onFocus={handleFocus}
                          onBlur={handleBlur}
                        />
                        <button
                          onClick={() => {
                            const mx = { ...node.metadata };
                            delete mx[k];
                            onUpdateNodes({ metadata: mx });
                            const updatedNodes = nodes.map((n) =>
                              n.id === node.id ? { ...n, metadata: mx } : n
                            );
                            addToHistory(updatedNodes, connections, groups);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-600 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  {Object.keys(node.metadata || {}).filter(
                    (k) => !["tech", "capacity", "region", "az", "latency"].includes(k)
                  ).length === 0 && (
                    <p className="text-[10px] text-zinc-400 dark:text-[#5a5a6e] text-center py-1">
                      No custom attributes configured
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Connection Properties */}
        {selectedType === "connection" && (() => {
          const conn = selectedItem as Connection;
          if (!conn) return null;
          return (
            <div className="space-y-4">
              <div className="p-3 rounded-lg border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50 dark:bg-[#14141e] flex items-center gap-3">
                <div className="w-9 h-9 rounded-md flex items-center justify-center bg-[#5e6ad2]/10 text-[#5e6ad2] border border-[#5e6ad2]/20">
                  <LinkIcon size={16} />
                </div>
                <div>
                  <p className="text-[9px] font-mono uppercase tracking-wider text-zinc-400 dark:text-[#5a5a6e]">
                    Topology Edge
                  </p>
                  <p className="text-xs font-semibold text-zinc-900 dark:text-[#ebebef]">
                    Data Flow Protocol
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9.5px] font-mono uppercase tracking-wider text-zinc-500 dark:text-[#8b8b9e] pl-0.5">
                  Protocol / RPC Type
                </label>
                <div className="relative">
                  <ArrowRight
                    size={12}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    ref={connectionInputRef}
                    className="w-full rounded-md pl-7 pr-2.5 py-1.5 text-xs font-mono bg-zinc-50 dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] text-zinc-900 dark:text-[#ebebef] focus:border-[#5e6ad2] focus:outline-none transition-colors"
                    value={conn.label || ""}
                    placeholder="HTTPS, gRPC, WebSocket, TCP..."
                    onChange={(e) => onUpdateConnections({ label: e.target.value })}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>
              </div>
            </div>
          );
        })()}

        {/* Group / VPC Properties */}
        {selectedType === "group" && (() => {
          const g = selectedItem as Group;
          if (!g) return null;
          return (
            <div className="space-y-4">
              <div className="p-3 rounded-lg border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50 dark:bg-[#14141e] flex items-center gap-3">
                <div className="w-9 h-9 rounded-md flex items-center justify-center bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                  <Layout size={16} />
                </div>
                <div>
                  <p className="text-[9px] font-mono uppercase tracking-wider text-zinc-400 dark:text-[#5a5a6e]">
                    Boundary Container
                  </p>
                  <p className="text-xs font-semibold text-zinc-900 dark:text-[#ebebef]">
                    VPC / Subnet
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9.5px] font-mono uppercase tracking-wider text-zinc-500 dark:text-[#8b8b9e] pl-0.5">
                  Container Name
                </label>
                <input
                  className="w-full rounded-md px-2.5 py-1.5 text-xs font-medium bg-zinc-50 dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] text-zinc-900 dark:text-[#ebebef] focus:border-[#5e6ad2] focus:outline-none transition-colors"
                  value={g.name}
                  onChange={(e) => onUpdateGroups({ name: e.target.value })}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-mono uppercase text-zinc-400 dark:text-[#5a5a6e] pl-0.5">
                    Width (px)
                  </span>
                  <input
                    type="number"
                    step="20"
                    className="w-full rounded-md px-2 py-1 text-xs font-mono bg-zinc-50 dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] text-zinc-900 dark:text-[#ebebef] focus:border-[#5e6ad2] focus:outline-none"
                    value={g.w}
                    onChange={(e) => onUpdateGroups({ w: Number(e.target.value) })}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] font-mono uppercase text-zinc-400 dark:text-[#5a5a6e] pl-0.5">
                    Height (px)
                  </span>
                  <input
                    type="number"
                    step="20"
                    className="w-full rounded-md px-2 py-1 text-xs font-mono bg-zinc-50 dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] text-zinc-900 dark:text-[#ebebef] focus:border-[#5e6ad2] focus:outline-none"
                    value={g.h}
                    onChange={(e) => onUpdateGroups({ h: Number(e.target.value) })}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-mono uppercase text-zinc-400 dark:text-[#5a5a6e] pl-0.5">
                  Boundary Accent
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    className="w-7 h-7 bg-transparent border-0 p-0 cursor-pointer rounded overflow-hidden"
                    value={g.color?.startsWith("#") ? g.color : "#5e6ad2"}
                    onChange={(e) => onUpdateGroups({ color: e.target.value })}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                  <div className="flex-1 text-[11px] rounded-md px-2.5 py-1 font-mono bg-zinc-50 dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] text-zinc-600 dark:text-zinc-400">
                    {g.color || "#5e6ad2"}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Delete Selection CTA */}
      <div className="p-3 border-t border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50/50 dark:bg-[#14141e]/50">
        <button
          onClick={deleteSelected}
          className="w-full py-2 rounded-md border border-rose-500/25 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-500/20 transition-colors flex items-center justify-center gap-1.5"
        >
          <Trash2 size={13} />
          <span>Delete Selection</span>
        </button>
      </div>
    </m.aside>
  );
});

PropertyPanel.displayName = "PropertyPanel";
