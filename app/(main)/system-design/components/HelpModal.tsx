"use client";

import { memo, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Info, X, Sparkles } from "lucide-react";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTutorial: () => void;
}

export const HelpModal = memo(({ isOpen, onClose, onOpenTutorial }: HelpModalProps) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 select-none"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-modal-title"
      >
        <m.div
          initial={{ scale: 0.95, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] rounded-xl p-6 max-w-lg w-full shadow-2xl relative text-zinc-900 dark:text-[#ebebef] transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-[#1e1e2a] mb-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 flex items-center justify-center text-[#5e6ad2]">
                <Info size={16} />
              </div>
              <div>
                <h2 id="help-modal-title" className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-[#ebebef]">
                  System Architect Guide
                </h2>
                <p className="text-xs text-zinc-500 dark:text-[#8b8b9e]">
                  Workspace controls, gestures, and shortcut cheat-sheet.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#1e1e2a] transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Shortcuts Grid */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="space-y-3">
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 dark:text-[#5a5a6e]">
                Navigation & Viewport
              </p>
              <ul className="space-y-2 text-xs text-zinc-600 dark:text-[#8b8b9e]">
                <li className="flex items-center gap-2">
                  <kbd className="bg-zinc-100 dark:bg-[#1e1e2a] border border-zinc-200 dark:border-zinc-700/60 px-1.5 py-0.5 rounded font-mono text-[11px] text-zinc-800 dark:text-zinc-200">
                    Space
                  </kbd>
                  <span>Drag canvas to pan</span>
                </li>
                <li className="flex items-center gap-2">
                  <kbd className="bg-zinc-100 dark:bg-[#1e1e2a] border border-zinc-200 dark:border-zinc-700/60 px-1.5 py-0.5 rounded font-mono text-[11px] text-zinc-800 dark:text-zinc-200">
                    Ctrl
                  </kbd>
                  <span>Scroll wheel to zoom</span>
                </li>
                <li className="flex items-center gap-2">
                  <kbd className="bg-zinc-100 dark:bg-[#1e1e2a] border border-zinc-200 dark:border-zinc-700/60 px-1.5 py-0.5 rounded font-mono text-[11px] text-zinc-800 dark:text-zinc-200">
                    M-Click
                  </kbd>
                  <span>Recenter origin</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 dark:text-[#5a5a6e]">
                Editing Actions
              </p>
              <ul className="space-y-2 text-xs text-zinc-600 dark:text-[#8b8b9e]">
                <li className="flex items-center gap-2">
                  <kbd className="bg-zinc-100 dark:bg-[#1e1e2a] border border-zinc-200 dark:border-zinc-700/60 px-1.5 py-0.5 rounded font-mono text-[11px] text-zinc-800 dark:text-zinc-200">
                    Del / Backspace
                  </kbd>
                  <span>Delete selected</span>
                </li>
                <li className="flex items-center gap-2">
                  <kbd className="bg-zinc-100 dark:bg-[#1e1e2a] border border-zinc-200 dark:border-zinc-700/60 px-1.5 py-0.5 rounded font-mono text-[11px] text-zinc-800 dark:text-zinc-200">
                    Ctrl+Z
                  </kbd>
                  <span>Undo previous action</span>
                </li>
                <li className="flex items-center gap-2">
                  <kbd className="bg-zinc-100 dark:bg-[#1e1e2a] border border-zinc-200 dark:border-zinc-700/60 px-1.5 py-0.5 rounded font-mono text-[11px] text-zinc-800 dark:text-zinc-200">
                    Ctrl+Y
                  </kbd>
                  <span>Redo action</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 pt-3 border-t border-zinc-100 dark:border-[#1e1e2a]">
            <button
              onClick={onClose}
              className="flex-1 py-2 px-3 rounded-md bg-zinc-100 dark:bg-[#1e1e2a] text-zinc-700 dark:text-zinc-300 text-xs font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            >
              Dismiss
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenTutorial();
              }}
              className="flex-1 py-2 px-3 rounded-md bg-[#5e6ad2] hover:bg-[#4f5ac4] text-white text-xs font-semibold shadow-subtle border border-[#5e6ad2]/50 transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles size={13} />
              <span>Interactive Tutorial</span>
            </button>
          </div>
        </m.div>
      </m.div>
    </AnimatePresence>
  );
});

HelpModal.displayName = "HelpModal";
