"use client";

import { ProjectChallenge } from "@/lib/projects/data";
import { CheckCircle, Sun, Moon, RotateCcw, Home, Timer } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSandpack } from "@codesandbox/sandpack-react";
import React, { useState, useCallback } from "react";
import { toast } from "sonner";

interface ProjectHeaderProps {
  project: ProjectChallenge;
  activeTab: "code" | "preview";
  setActiveTab: (tab: "code" | "preview") => void;
  toggleTheme: () => void;
  isDark: boolean;
  timeElapsed: number;
  onVerify: () => void;
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
  toggleTheme,
  isDark,
  timeElapsed,
  onVerify,
}: ProjectHeaderProps) {
  const { sandpack } = useSandpack();
  const [isResetting, setIsResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleReset = useCallback(() => {
    setShowResetConfirm(false);
    setIsResetting(true);
    sandpack.resetAllFiles();
    setTimeout(() => setIsResetting(false), 1000);
    toast.info("Project reset to initial state");
  }, [sandpack]);

  return (
    <div className="h-16 lg:h-20 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 lg:px-8 shrink-0 z-20 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md sticky top-0">
      <div className="flex items-center gap-3 lg:gap-6">
        <Link
          href="/project-mode"
          className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all transform hover:scale-105 active:scale-95"
        >
          <Home size={20} />
        </Link>
        <div className="h-8 w-px bg-gray-200 dark:bg-gray-800 hidden sm:block"></div>
        <div className="ml-1">
          <h1 className="font-black text-sm lg:text-lg leading-tight text-gray-900 dark:text-gray-100 flex items-center gap-2">
            {project.title}
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span
              className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${project.difficulty === "Easy"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : project.difficulty === "Medium"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                }`}
            >
              {project.difficulty}
            </span>
            <span className="text-[10px] text-gray-400 font-medium hidden sm:inline-flex items-center gap-1.5 before:content-['•'] before:mr-1.5">
              {project.tags.join(" • ")}
            </span>
          </div>
        </div>
      </div>

      {/* Tab Switcher (Visible on small & medium screens) */}
      <div className="flex xl:hidden bg-gray-100 dark:bg-white/5 rounded-xl p-1 mx-4 flex-1 max-w-[200px]">
        <button
          onClick={() => setActiveTab("code")}
          className={`flex-1 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${activeTab === "code" ? "bg-white dark:bg-gray-800 shadow-sm text-blue-600 dark:text-blue-400" : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"}`}
        >
          Code
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`flex-1 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${activeTab === "preview" ? "bg-white dark:bg-gray-800 shadow-sm text-blue-600 dark:text-blue-400" : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"}`}
        >
          View
        </button>
      </div>

      <div className="flex items-center gap-2 lg:gap-3">
        {/* Timer Display */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 font-mono text-sm">
          <Timer size={14} className={timeElapsed > 0 ? "text-blue-500 animate-pulse" : "text-gray-400"} />
          {formatTime(timeElapsed)}
        </div>

        <button
          onClick={() => setShowResetConfirm(true)}
          disabled={isResetting}
          className={`w-10 h-10 flex items-center justify-center text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all ${isResetting ? "animate-spin text-rose-500" : ""}`}
          title="Reset Project"
        >
          <RotateCcw size={18} />
        </button>

        <Button
          onClick={toggleTheme}
          variant="glass"
          size="icon"
          className="rounded-xl border-0 shadow-none bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 w-10 h-10 transition-transform active:scale-95"
          aria-label="Toggle Theme"
        >
          <div className="w-5 h-5 relative flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              {isDark ? (
                <motion.div
                  key="sun"
                  initial={{ y: 20, opacity: 0, scale: 0.5 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: -20, opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.3, ease: "backOut" }}
                >
                  <Sun className="w-5 h-5 text-amber-500 fill-amber-500/20" />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ y: 20, opacity: 0, scale: 0.5 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: -20, opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.3, ease: "backOut" }}
                >
                  <Moon className="w-5 h-5 text-gray-700 fill-gray-900/10" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Button>

        <div className="h-8 w-px bg-gray-200 dark:bg-gray-800 mx-1 hidden sm:block"></div>

        <Button
          onClick={onVerify}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-xl shadow-blue-500/20 px-4 lg:px-6 h-10 lg:h-11 rounded-xl font-bold transition-all transform active:scale-95 text-xs lg:text-sm"
          size="sm"
        >
          <CheckCircle size={18} />
          <span className="hidden sm:inline">Verify Solution</span>
          <span className="sm:hidden">Verify</span>
        </Button>
      </div>

      {/* Custom Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-gray-800"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Reset Project?
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Are you sure you want to reset all files to their initial state? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowResetConfirm(false)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReset}
                  className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white"
                >
                  Yes, Reset
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
});
