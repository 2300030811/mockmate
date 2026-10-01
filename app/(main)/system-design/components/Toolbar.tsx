"use client";

import { memo, useState, useMemo } from "react";
import {
  MousePointer2,
  Move,
  ArrowRight,
  Box,
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ShieldCheck,
  Zap,
  Activity
} from "lucide-react";
import { NODE_CONFIG, NodeType, TEMPLATES, NodeCategory } from "../constants";
import { Node, Connection } from "../types";

interface ToolbarProps {
  activeTool: string;
  setActiveTool: (tool: any) => void;
  addGroup: () => void;
  addNode: (type: NodeType) => void;
  insertTemplate: (stack: keyof typeof TEMPLATES) => void;
  theme: "dark" | "light" | "neo";
  nodes?: Node[];
  connections?: Connection[];
}

export const Toolbar = memo(({
  activeTool,
  setActiveTool,
  addGroup,
  addNode,
  insertTemplate,
  theme,
  nodes = [],
  connections = []
}: ToolbarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<NodeCategory>("All");

  const categories: NodeCategory[] = ["All", "Compute", "Data", "Network", "Async"];

  // Filter nodes based on search and category
  const filteredNodes = useMemo(() => {
    const allTypes = Object.keys(NODE_CONFIG) as NodeType[];
    return allTypes.filter((type) => {
      const config = NODE_CONFIG[type];
      const matchesCategory =
        activeCategory === "All" || config.category === activeCategory;
      const matchesSearch =
        searchQuery.trim() === "" ||
        type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        config.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        config.desc.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  // Real-time Architecture Diagnostics
  const diagnostics = useMemo(() => {
    const hasIngress = nodes.some((n) =>
      ["Client", "Load Balancer", "API Gateway", "CDN", "DNS"].includes(n.type)
    );
    const dbCount = nodes.filter((n) => n.type === "Database").length;
    const hasCache = nodes.some((n) => n.type === "Cache");
    const hasQueue = nodes.some((n) => n.type === "Message Queue");

    const issues: { text: string; pass: boolean }[] = [];

    if (nodes.length > 0) {
      if (hasIngress) {
        issues.push({ text: "Ingress layer detected", pass: true });
      } else {
        issues.push({ text: "No client/gateway ingress", pass: false });
      }

      if (dbCount > 1 || (dbCount === 1 && hasCache)) {
        issues.push({ text: "Data tier resilient / cached", pass: true });
      } else if (dbCount === 1) {
        issues.push({ text: "SPOF risk: Single DB replica", pass: false });
      }

      if (hasQueue) {
        issues.push({ text: "Async decoupling enabled", pass: true });
      }
    }

    return issues;
  }, [nodes]);

  return (
    <aside
      id="sd-toolbar"
      className="w-16 md:w-64 border-r border-zinc-200 dark:border-[#1e1e2a] bg-white/95 dark:bg-[#0d0d12]/95 backdrop-blur-md flex flex-col z-20 select-none overflow-y-auto custom-scrollbar transition-colors"
    >
      {/* 1. Primary Tools */}
      <div className="p-3 border-b border-zinc-200 dark:border-[#1e1e2a] space-y-1.5 shrink-0">
        <p className="text-[9.5px] font-mono uppercase tracking-wider text-zinc-400 dark:text-[#5a5a6e] font-semibold pl-0.5">
          Interaction Mode
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
          <button
            onClick={() => setActiveTool("Select")}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md border text-xs font-medium transition-all ${
              activeTool === "Select"
                ? "bg-[#5e6ad2]/10 border-[#5e6ad2]/40 text-[#5e6ad2] dark:text-[#7b87f5]"
                : "border-transparent text-zinc-600 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-[#ebebef] hover:bg-zinc-100 dark:hover:bg-[#14141e]"
            }`}
            title="Select & Move (V)"
          >
            <MousePointer2 size={13} className="shrink-0" />
            <span className="hidden md:inline">Select (V)</span>
          </button>
          <button
            onClick={() => setActiveTool("Pan")}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md border text-xs font-medium transition-all ${
              activeTool === "Pan"
                ? "bg-[#5e6ad2]/10 border-[#5e6ad2]/40 text-[#5e6ad2] dark:text-[#7b87f5]"
                : "border-transparent text-zinc-600 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-[#ebebef] hover:bg-zinc-100 dark:hover:bg-[#14141e]"
            }`}
            title="Pan Canvas (H / Space+Drag)"
          >
            <Move size={13} className="shrink-0" />
            <span className="hidden md:inline">Pan (H)</span>
          </button>
        </div>
        <button
          id="sd-toolbar-connect"
          onClick={() => setActiveTool("Connect")}
          className={`flex w-full items-center gap-1.5 px-2 py-1.5 rounded-md border text-xs font-medium transition-all ${
            activeTool === "Connect"
              ? "bg-[#5e6ad2]/10 border-[#5e6ad2]/40 text-[#5e6ad2] dark:text-[#7b87f5]"
              : "border-transparent text-zinc-600 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-[#ebebef] hover:bg-zinc-100 dark:hover:bg-[#14141e]"
          }`}
          title="Connect Nodes (C)"
        >
          <ArrowRight size={13} className="shrink-0" />
          <span className="hidden md:inline">Connect Edge (C)</span>
        </button>
        <button
          onClick={addGroup}
          className="flex w-full items-center gap-1.5 px-2 py-1.5 rounded-md border border-dashed border-zinc-300 dark:border-[#262638] text-zinc-600 dark:text-[#8b8b9e] hover:border-[#5e6ad2] hover:text-[#5e6ad2] hover:bg-[#5e6ad2]/5 transition-all text-xs font-medium group"
        >
          <Box size={13} className="shrink-0 group-hover:scale-105 transition-transform" />
          <span className="hidden md:inline">New Group / VPC</span>
        </button>
      </div>

      {/* 2. Search & Taxonomy Filters */}
      <div className="p-3 border-b border-zinc-200 dark:border-[#1e1e2a] space-y-2 shrink-0">
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search components..."
            className="w-full pl-7 pr-2 py-1 rounded-md text-xs bg-zinc-50 dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] text-zinc-900 dark:text-[#ebebef] placeholder:text-zinc-400 focus:outline-none focus:border-[#5e6ad2] transition-colors"
          />
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar pb-0.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium transition-colors shrink-0 ${
                activeCategory === cat
                  ? "bg-[#5e6ad2] text-white"
                  : "bg-zinc-100 dark:bg-[#14141e] text-zinc-500 dark:text-[#8b8b9e] hover:text-zinc-800 dark:hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Component Palette (High-density 2-column or filtered list) */}
      <div className="p-3 space-y-2 shrink-0">
        <div className="flex items-center justify-between pl-0.5">
          <p className="text-[9.5px] font-mono uppercase tracking-wider text-zinc-400 dark:text-[#5a5a6e] font-semibold">
            Components ({filteredNodes.length})
          </p>
          <span className="text-[9px] font-mono text-zinc-400 dark:text-[#5a5a6e]">
            Click to add
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
          {filteredNodes.map((t) => {
            const Config = NODE_CONFIG[t];
            const Icon = Config.icon;
            return (
              <button
                key={t}
                onClick={() => addNode(t)}
                title={`${t} (${Config.role}): ${Config.desc}`}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-[#161622] border border-zinc-200/60 dark:border-[#1a1a26] hover:border-[#5e6ad2]/40 transition-all text-left group"
              >
                <div className="w-6 h-6 rounded-md flex items-center justify-center bg-zinc-100 dark:bg-[#1a1a28] border border-zinc-200/80 dark:border-[#222234] text-zinc-700 dark:text-zinc-300 group-hover:border-[#5e6ad2]/50 transition-colors shrink-0">
                  <Icon size={12} className={Config.color} />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-medium text-zinc-800 dark:text-[#ebebef] block truncate leading-tight group-hover:text-[#5e6ad2]">
                    {t}
                  </span>
                  <span className="text-[8px] font-mono uppercase tracking-wider text-zinc-400 dark:text-[#5a5a6e] block truncate">
                    {Config.role}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Architecture Blueprints & Stacks (Fills the lower half intelligently) */}
      <div className="p-3 border-t border-zinc-200 dark:border-[#1e1e2a] space-y-2 shrink-0 bg-zinc-50/40 dark:bg-[#0b0b10]">
        <div className="flex items-center justify-between pl-0.5">
          <div className="flex items-center gap-1.5">
            <Sparkles size={11} className="text-[#5e6ad2]" />
            <p className="text-[9.5px] font-mono uppercase tracking-wider text-zinc-500 dark:text-[#8b8b9e] font-semibold">
              Production Blueprints
            </p>
          </div>
          <span className="text-[9px] font-mono text-zinc-400 dark:text-[#5a5a6e]">
            {Object.keys(TEMPLATES).length} stacks
          </span>
        </div>

        <div className="space-y-1.5">
          {(Object.keys(TEMPLATES) as (keyof typeof TEMPLATES)[]).map((stack) => {
            const t = TEMPLATES[stack];
            return (
              <button
                key={stack}
                onClick={() => insertTemplate(stack)}
                className="w-full text-left p-2 rounded-lg border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] hover:border-[#5e6ad2]/50 hover:bg-zinc-50 dark:hover:bg-[#181824] transition-all group"
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-semibold text-zinc-900 dark:text-[#ebebef] group-hover:text-[#5e6ad2] transition-colors">
                    {t.title}
                  </span>
                  <span className="text-[9px] font-mono text-zinc-400 dark:text-[#5a5a6e]">
                    {t.nodes.length} nodes
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 dark:text-[#8b8b9e] truncate font-mono">
                  {t.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Live Architecture Telemetry & SPOF Diagnostics (At the bottom of toolbar) */}
      <div className="p-3 border-t border-zinc-200 dark:border-[#1e1e2a] bg-zinc-100/50 dark:bg-[#09090e] shrink-0 mt-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Activity size={11} className="text-emerald-500" />
            <span className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-[#8b8b9e]">
              System Health
            </span>
          </div>
          <span className="text-[9.5px] font-mono font-semibold text-zinc-600 dark:text-zinc-300">
            {nodes.length}N / {connections.length}L
          </span>
        </div>

        {nodes.length === 0 ? (
          <p className="text-[10px] text-zinc-400 dark:text-[#5a5a6e] italic">
            Canvas is empty. Add nodes or select a blueprint above.
          </p>
        ) : (
          <div className="space-y-1">
            {diagnostics.map((diag, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[10px]">
                {diag.pass ? (
                  <CheckCircle2 size={11} className="text-emerald-500 shrink-0" />
                ) : (
                  <AlertTriangle size={11} className="text-amber-500 shrink-0" />
                )}
                <span
                  className={
                    diag.pass
                      ? "text-zinc-600 dark:text-zinc-300 truncate"
                      : "text-amber-600 dark:text-amber-400 font-medium truncate"
                  }
                >
                  {diag.text}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
});

Toolbar.displayName = "Toolbar";
