"use client";

import { ProjectChallenge } from "@/lib/projects/data";
import { RefreshCw, Lightbulb, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { m, AnimatePresence } from "framer-motion";
import React from "react";

interface MobileInstructionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectChallenge;
  hintIndex: number;
  onRevealHint: () => void;
  sandpackStatus: string;
}

export const MobileInstructionsDrawer = React.memo(function MobileInstructionsDrawer({
  isOpen,
  onClose,
  project,
  hintIndex,
  onRevealHint,
  sandpackStatus,
}: MobileInstructionsDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
          />
          
          {/* Drawer */}
          <m.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white dark:bg-gray-900 rounded-t-3xl max-h-[80vh] overflow-y-auto flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Challenge</h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 space-y-6">
              {/* Description */}
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-2">Description</h4>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                  {project.description}
                </p>
              </div>

              {/* Environment Status */}
              <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-100 dark:border-blue-500/20">
                <h4 className="font-bold text-blue-700 dark:text-blue-400 mb-2 text-xs uppercase tracking-wider flex items-center gap-2">
                  <RefreshCw size={12} />
                  Environment
                </h4>
                <div className="flex items-center justify-between text-xs text-blue-600 dark:text-blue-300">
                  <span>Status</span>
                  <span
                    className={`flex items-center gap-1.5 font-bold uppercase ${
                      sandpackStatus === "running"
                        ? "text-green-500"
                        : sandpackStatus === "idle"
                          ? "text-blue-500"
                          : "text-amber-500"
                    }`}
                  >
                    <span className="relative flex h-2 w-2">
                      <span
                        className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                          sandpackStatus === "running"
                            ? "bg-green-400"
                            : sandpackStatus === "idle"
                              ? "bg-blue-400"
                              : "bg-amber-400"
                        }`}
                      ></span>
                      <span
                        className={`relative inline-flex rounded-full h-2 w-2 ${
                          sandpackStatus === "running"
                            ? "bg-green-500"
                            : sandpackStatus === "idle"
                              ? "bg-blue-500"
                              : "bg-amber-500"
                        }`}
                      ></span>
                    </span>
                    {sandpackStatus === "idle" ? "Ready" : sandpackStatus}
                  </span>
                </div>
              </div>

              {/* Hints Section */}
              {project.hints && project.hints.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <Lightbulb size={16} className="text-yellow-500" />
                      Hints {hintIndex + 1 > 0 ? `(${hintIndex + 1} Revealed)` : "(Not Revealed)"}
                    </h4>
                  </div>

                  <AnimatePresence mode="popLayout">
                    {project.hints &&
                      project.hints.length > 0 &&
                      hintIndex >= 0 &&
                      project.hints.slice(0, hintIndex + 1).map((hint, i) => (
                        <m.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mb-3 p-3 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-100 dark:border-yellow-500/20 rounded-lg text-xs text-yellow-800 dark:text-yellow-200"
                        >
                          <span className="font-bold mr-1">Hint {i + 1}:</span> {hint}
                        </m.div>
                      ))}
                  </AnimatePresence>

                  {hintIndex < project.hints.length - 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2 text-xs"
                      onClick={onRevealHint}
                    >
                      Reveal Next Hint
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Close Button at Bottom */}
            <div className="sticky bottom-0 p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <Button onClick={onClose} className="w-full">
                Got it, let&apos;s code!
              </Button>
            </div>
          </m.div>
        </>
      )}
    </AnimatePresence>
  );
});
