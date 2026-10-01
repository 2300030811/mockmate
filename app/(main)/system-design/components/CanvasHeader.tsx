"use client";

import { memo, useState } from "react";
import Link from "next/link";
import { m, AnimatePresence } from "framer-motion";
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
  Layers,
  Trash2,
  Cloud,
  Trophy,
  Wand2,
  Sun,
  Moon,
  ChevronDown,
  Building2,
  Swords,
  Code2,
  Home,
  Check
} from "lucide-react";
import { CHALLENGES } from "../challenges";
import { UserAuthSection } from "@/components/UserAuthSection";

interface CanvasHeaderProps {
  undo: () => void;
  redo: () => void;
  historyIndex: number;
  historyLength: number;
  setPan: (p: { x: number; y: number }) => void;
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
  isChallengePanelOpen?: boolean;
  activeChallengeId?: string | null;
  autoAlignNodes: (type: "grid" | "layered" | "flow") => void;
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
  toggleChallengePanel,
  isChallengePanelOpen,
  activeChallengeId,
  autoAlignNodes
}: CanvasHeaderProps) => {
  const isLight = theme === "light";
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);

  const activeChallenge = activeChallengeId
    ? CHALLENGES.find((c) => c.id === activeChallengeId)
    : null;

  const platformRoutes = [
    { label: "Home", href: "/", icon: Home, desc: "Platform overview & metrics" },
    { label: "Placement Intelligence", href: "/placements", icon: Building2, tag: "KLU", desc: "Campus hiring radar & tier matrix" },
    { label: "Certifications & Quizzes", href: "/certification", icon: Trophy, desc: "Technical skill certification tracks" },
    { label: "Arena Battles", href: "/arena", icon: Swords, desc: "Peer-to-peer technical face-offs" },
    { label: "Daily Challenge", href: "/daily-challenge", icon: Code2, desc: "Algorithmic interview challenge" },
  ];

  return (
    <header
      id="sd-header"
      className="h-14 px-4 flex items-center justify-between z-30 shrink-0 border-b border-zinc-200 dark:border-[#1e1e2a] bg-white/95 dark:bg-[#0d0d12]/95 backdrop-blur-md transition-colors select-none"
    >
      {/* 1. Left Zone: Brand Logo, Platform Navigation Switcher & Status */}
      <div className="flex items-center gap-3">
        {/* Main Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-[22px] h-[22px] rounded-[5px] bg-[#5e6ad2] flex items-center justify-center text-[10px] font-bold text-white leading-none shadow-subtle group-hover:bg-[#4f5ac4] transition-colors">
            M
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-semibold text-zinc-900 dark:text-[#ebebef] tracking-[-0.01em]">
              MockMate
            </span>
            <span className="hidden sm:inline-block px-1.5 py-[1px] rounded text-[9px] font-mono text-zinc-500 dark:text-[#8b8b9e] bg-zinc-100 dark:bg-[#181824] border border-zinc-200 dark:border-[#1e1e2a]">
              v2.6
            </span>
          </div>
        </Link>

        <div className="w-px h-4 bg-zinc-200 dark:bg-[#1e1e2a] hidden sm:block" />

        {/* Studio Switcher & Platform Navigation Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNavMenu(!showNavMenu)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold text-zinc-800 dark:text-[#ebebef] hover:bg-zinc-100 dark:hover:bg-[#14141e] transition-colors"
          >
            <Layers size={13} className="text-[#5e6ad2]" />
            <span className="truncate max-w-[130px] sm:max-w-none">System Design Studio</span>
            <ChevronDown size={11} className="text-zinc-400" />
          </button>

          {/* Quick Platform Switcher Popover */}
          <AnimatePresence>
            {showNavMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNavMenu(false)}
                />
                <m.div
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }}
                  className="absolute left-0 mt-1.5 w-64 rounded-xl border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] p-1.5 shadow-2xl z-50 transition-colors"
                >
                  <p className="text-[9.5px] font-mono uppercase tracking-wider text-zinc-400 dark:text-[#5a5a6e] px-2.5 py-1 font-semibold">
                    Navigate Platform
                  </p>
                  <div className="space-y-0.5">
                    {platformRoutes.map((route) => {
                      const Icon = route.icon;
                      return (
                        <Link
                          key={route.href}
                          href={route.href}
                          onClick={() => setShowNavMenu(false)}
                          className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-[#1c1c2b] transition-colors group"
                        >
                          <div className="w-6 h-6 rounded-md bg-zinc-100 dark:bg-[#181824] border border-zinc-200 dark:border-[#1e1e2a] flex items-center justify-center text-zinc-500 dark:text-zinc-400 group-hover:text-[#5e6ad2] shrink-0 mt-0.5">
                            <Icon size={12} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold text-zinc-800 dark:text-[#ebebef] group-hover:text-[#5e6ad2]">
                                {route.label}
                              </span>
                              {route.tag && (
                                <span className="text-[8.5px] font-mono px-1 rounded bg-[#5e6ad2]/15 text-[#5e6ad2]">
                                  {route.tag}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-zinc-500 dark:text-[#8b8b9e] truncate">
                              {route.desc}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </m.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Mode / Active Challenge Micro-Badge */}
        {activeChallenge ? (
          <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Trophy size={11} />
            <span className="truncate max-w-[130px]">{activeChallenge.title}</span>
          </div>
        ) : (
          <div className="hidden xl:inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9.5px] font-mono text-zinc-500 dark:text-[#8b8b9e] bg-zinc-100 dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>LIVE TOPOLOGY</span>
          </div>
        )}
      </div>

      {/* 2. Center Zone: Precision Canvas Controls */}
      <div className="hidden md:flex items-center gap-1.5">
        {/* History Group */}
        <div className="flex items-center bg-zinc-100 dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] rounded-md p-0.5">
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="p-1.5 rounded text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-white dark:hover:bg-[#1e1e2a] disabled:opacity-25 disabled:pointer-events-none transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={13} />
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= historyLength - 1}
            className="p-1.5 rounded text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-white dark:hover:bg-[#1e1e2a] disabled:opacity-25 disabled:pointer-events-none transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 size={13} />
          </button>
        </div>

        {/* Viewport Zoom & Recenter */}
        <div className="flex items-center bg-zinc-100 dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] rounded-md p-0.5">
          <button
            onClick={() => setPan({ x: 0, y: 0 })}
            className="p-1.5 rounded text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-white dark:hover:bg-[#1e1e2a] transition-colors"
            title="Recenter Canvas Origin"
          >
            <Maximize2 size={13} />
          </button>
          <button
            onClick={() => setScale((s) => Math.max(0.2, s - 0.1))}
            className="p-1.5 rounded text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-white dark:hover:bg-[#1e1e2a] transition-colors"
            title="Zoom Out (Ctrl -)"
          >
            <ZoomOut size={13} />
          </button>
          <span className="text-[11px] font-mono font-medium w-11 text-center text-zinc-600 dark:text-[#8b8b9e] tabular-nums">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale((s) => Math.min(3, s + 0.1))}
            className="p-1.5 rounded text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-white dark:hover:bg-[#1e1e2a] transition-colors"
            title="Zoom In (Ctrl +)"
          >
            <ZoomIn size={13} />
          </button>
        </div>

        {/* Grid & Auto-layout Tools */}
        <div className="flex items-center bg-zinc-100 dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] rounded-md p-0.5">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-1.5 rounded transition-colors ${
              showGrid
                ? "bg-[#5e6ad2]/15 text-[#5e6ad2] dark:text-[#7b87f5]"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-white dark:hover:bg-[#1e1e2a]"
            }`}
            title="Toggle Matrix Grid"
          >
            <GridIcon size={13} />
          </button>

          {/* Auto Align Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowLayoutMenu(!showLayoutMenu)}
              className={`p-1.5 rounded transition-colors ${
                showLayoutMenu
                  ? "bg-[#5e6ad2]/15 text-[#5e6ad2] dark:text-[#7b87f5]"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-white dark:hover:bg-[#1e1e2a]"
              }`}
              title="Auto-Layout Topologies"
            >
              <Wand2 size={13} />
            </button>

            <AnimatePresence>
              {showLayoutMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowLayoutMenu(false)}
                  />
                  <m.div
                    initial={{ opacity: 0, y: 4, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.96 }}
                    className="absolute left-0 mt-1.5 w-52 rounded-lg border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] p-1 shadow-xl z-50 transition-colors"
                  >
                    {[
                      { id: "grid", label: "Grid Topology", desc: "Uniform structured rows" },
                      { id: "layered", label: "Layered Tiers", desc: "Multi-tier component stack" },
                      { id: "flow", label: "Event Pipeline", desc: "Linear message flow" }
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          autoAlignNodes(item.id as any);
                          setShowLayoutMenu(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-[#1e1e2a] transition-colors flex flex-col group"
                      >
                        <span className="text-xs font-semibold text-zinc-900 dark:text-[#ebebef] group-hover:text-[#5e6ad2]">
                          {item.label}
                        </span>
                        <span className="text-[10px] text-zinc-500 dark:text-[#8b8b9e]">
                          {item.desc}
                        </span>
                      </button>
                    ))}
                  </m.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 3. Right Zone: Challenges, Actions, User Auth & Review Architecture CTA */}
      <div id="sd-header-export" className="flex items-center gap-2">
        {/* Challenges Toggle */}
        <button
          onClick={toggleChallengePanel}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors ${
            isChallengePanelOpen || activeChallengeId
              ? "bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-400"
              : "border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50 dark:bg-[#14141e] text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700"
          }`}
        >
          <Trophy size={13} className="text-amber-500" />
          <span className="hidden sm:inline">Challenges</span>
        </button>

        {/* Action Icons */}
        <div className="flex items-center bg-zinc-100 dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] rounded-md p-0.5">
          <button
            onClick={saveDesign}
            className="p-1.5 rounded text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-white dark:hover:bg-[#1e1e2a] transition-colors"
            title="Save Architecture"
          >
            <Cloud size={13} />
          </button>
          <button
            onClick={exportSVG}
            className="p-1.5 rounded text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-white dark:hover:bg-[#1e1e2a] transition-colors"
            title="Export Architecture as SVG"
          >
            <ImageIcon size={13} />
          </button>
          <button
            onClick={copyJSON}
            className="p-1.5 rounded text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-white dark:hover:bg-[#1e1e2a] transition-colors"
            title="Copy Topology JSON"
          >
            <FileJson size={13} />
          </button>
          <button
            onClick={clearCanvas}
            className="p-1.5 rounded text-zinc-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-[#1e1e2a] transition-colors"
            title="Clear Topology Canvas"
          >
            <Trash2 size={13} />
          </button>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(isLight ? "dark" : "light")}
          className="p-1.5 rounded-md border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50 dark:bg-[#14141e] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
          title={`Switch to ${isLight ? "Dark" : "Light"} Mode`}
        >
          {isLight ? <Moon size={13} /> : <Sun size={13} />}
        </button>

        {/* User Auth Section (Guest Profile / Login) */}
        <div className="hidden sm:block">
          <UserAuthSection />
        </div>

        {/* Primary CTA: Review Architecture */}
        <button
          id="sd-header-audit"
          onClick={handleReview}
          disabled={nodesLength === 0 || isReviewing}
          className="bg-[#5e6ad2] hover:bg-[#4f5ac4] active:bg-[#434db0] text-white text-xs font-semibold px-3 py-1.5 rounded-md shadow-subtle border border-[#5e6ad2]/50 flex items-center gap-1.5 transition-all disabled:opacity-30 disabled:pointer-events-none shrink-0"
        >
          {isReviewing ? (
            <>
              <Sparkles size={13} className="animate-spin" />
              <span className="hidden sm:inline">Analyzing...</span>
            </>
          ) : (
            <>
              <Sparkles size={13} />
              <span>Review Architecture</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
});

CanvasHeader.displayName = "CanvasHeader";
