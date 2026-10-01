"use client";

import { ProjectChallenge } from "@/lib/projects/data";
import { CheckCircle, Sun, Moon, RotateCcw, ChevronLeft, Timer, HelpCircle, Layers } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { m, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSandpack } from "@codesandbox/sandpack-react";
import React, { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";

interface ProjectHeaderProps {
  project: ProjectChallenge;
  activeTab: "code" | "preview";
  setActiveTab: (tab: "code" | "preview") => void;
  setTheme: (theme: string) => void;
  isDark: boolean;
  timeElapsed: number;
  onVerify: () => void;
  onShowMobileInstructions?: () => void;
  onResetRequested?: () => void;
  onUndoReset?: () => void;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

export const ProjectHeader = React.memo(function ProjectHeader({
  project,
  activeTab,
  setActiveTab,
  setTheme,
  isDark,
  timeElapsed,
  onVerify,
  onShowMobileInstructions,
  onResetRequested,
  onUndoReset,
}: ProjectHeaderProps) {
  const { sandpack } = useSandpack();
  const [isResetting, setIsResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    if (!showResetConfirm) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowResetConfirm(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [showResetConfirm]);

  const handleReset = useCallback(() => {
    setShowResetConfirm(false);
    setIsResetting(true);
    onResetRequested?.();
    sandpack.resetAllFiles();
    setTimeout(() => setIsResetting(false), 800);
    toast.info("Project reset to initial state", {
      action: onUndoReset
        ? {
            label: "Undo",
            onClick: onUndoReset,
          }
        : undefined,
    });
  }, [sandpack, onResetRequested, onUndoReset]);

  return (
    <header className="h-14 border-b border-zinc-200 dark:border-[#1e1e2a] flex items-center justify-between px-3 sm:px-5 shrink-0 z-20 bg-white/95 dark:bg-[#0d0d12]/95 backdrop-blur-md sticky top-0 transition-colors">
      {/* Left: Navigation & Project Identity */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
        <Link
          href="/project-mode"
          className="w-8 h-8 flex items-center justify-center rounded-[5px] bg-zinc-100 dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] text-zinc-500 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-[#ebebef] hover:border-zinc-300 dark:hover:border-[#3a3a52] transition-colors"
          title="Back to Challenge Directory"
        >
          <ChevronLeft className="w-4 h-4" />
        </Link>

        <div className="h-4 w-px bg-zinc-200 dark:bg-[#1e1e2a] hidden sm:block" />

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-[#ebebef] truncate leading-tight">
              {project.title}
            </h1>
            <span
              className={`px-1.5 py-0.5 rounded text-[9.5px] font-mono font-medium uppercase tracking-wider border shrink-0 ${
                project.difficulty === "Easy"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  : project.difficulty === "Medium"
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
              }`}
            >
              {project.difficulty}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] font-mono text-zinc-400 dark:text-[#6e6e84] hidden sm:inline-flex items-center gap-1.5">
              {project.tags.join(" • ")}
            </span>
          </div>
        </div>
      </div>

      {/* Center: Mobile View Switcher (Code vs View) */}
      <div className="flex xl:hidden bg-zinc-100 dark:bg-[#11111a] border border-zinc-200 dark:border-[#1a1a26] rounded-md p-0.5 mx-2">
        <button
          onClick={() => setActiveTab("code")}
          className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
            activeTab === "code"
              ? "bg-white dark:bg-[#1e1e2a] text-zinc-900 dark:text-[#ebebef] shadow-subtle border border-zinc-200/80 dark:border-[#2a2a3c]"
              : "text-zinc-500 dark:text-[#8b8b9e]"
          }`}
        >
          Code
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
            activeTab === "preview"
              ? "bg-white dark:bg-[#1e1e2a] text-zinc-900 dark:text-[#ebebef] shadow-subtle border border-zinc-200/80 dark:border-[#2a2a3c]"
              : "text-zinc-500 dark:text-[#8b8b9e]"
          }`}
        >
          Preview
        </button>
      </div>

      {/* Right: Telemetry, Reset, Theme, Verify */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Timer Display */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 dark:bg-[#14141e] rounded-[5px] border border-zinc-200 dark:border-[#1e1e2a] text-zinc-700 dark:text-[#a0a0b8] font-mono text-xs">
          <Timer className={`w-3.5 h-3.5 ${timeElapsed > 0 ? "text-[#5e6ad2]" : "text-zinc-400"}`} />
          <span>{formatTime(timeElapsed)}</span>
        </div>

        {/* Reset Project Button */}
        <button
          onClick={() => setShowResetConfirm(true)}
          disabled={isResetting}
          className={`w-8 h-8 flex items-center justify-center text-zinc-500 dark:text-[#8b8b9e] hover:text-rose-500 hover:bg-rose-500/10 rounded-[5px] border border-zinc-200 dark:border-[#1e1e2a] transition-colors ${
            isResetting ? "animate-spin text-rose-500" : ""
          }`}
          title="Reset Project"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Theme Switcher Button */}
        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="w-8 h-8 flex items-center justify-center rounded-[5px] border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-100 dark:bg-[#14141e] text-zinc-600 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-[#ebebef] transition-colors"
          aria-label="Toggle Theme"
        >
          {isDark ? (
            <Sun className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-zinc-700" />
          )}
        </button>

        <div className="h-4 w-px bg-zinc-200 dark:bg-[#1e1e2a] hidden sm:block" />

        {/* Mobile Instructions Button */}
        <button
          onClick={onShowMobileInstructions}
          className="md:hidden w-8 h-8 flex items-center justify-center rounded-[5px] border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-100 dark:bg-[#14141e] text-zinc-600 dark:text-[#8b8b9e]"
          title="View Challenge Instructions"
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>

        {/* Verify Solution Button */}
        <Button
          onClick={onVerify}
          className="bg-[#5e6ad2] hover:bg-[#4f5ac4] text-white gap-1.5 shadow-subtle px-3 sm:px-4 h-8 rounded-[5px] font-medium text-xs transition-colors active:scale-95"
          size="sm"
        >
          <CheckCircle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Verify Solution</span>
          <span className="sm:hidden">Verify</span>
        </Button>
      </div>

      {/* Precision Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-dialog-title"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowResetConfirm(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") setShowResetConfirm(false);
            }}
          >
            <m.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#14141e] rounded-lg p-5 max-w-sm w-full shadow-surface border border-zinc-200 dark:border-[#1e1e2a]"
            >
              <h3 id="reset-dialog-title" className="text-sm font-semibold text-zinc-900 dark:text-[#ebebef] mb-1.5">
                Reset Project?
              </h3>
              <p className="text-xs text-zinc-500 dark:text-[#8b8b9e] mb-5 leading-relaxed">
                Are you sure you want to reset all files to their initial state? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowResetConfirm(false)}
                  className="rounded-[5px] text-xs h-8"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleReset}
                  className="rounded-[5px] text-xs h-8 bg-rose-600 hover:bg-rose-700 text-white"
                >
                  Yes, Reset
                </Button>
              </div>
            </m.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
});
