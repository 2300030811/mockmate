"use client";

import { ProjectChallenge } from "@/lib/projects/data";
import { RefreshCw, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";

interface ProjectInstructionsProps {
  project: ProjectChallenge;
  hintIndex: number;
  onRevealHint: () => void;
  sandpackStatus: string;
}

export function ProjectInstructions({
  project,
  hintIndex,
  onRevealHint,
  sandpackStatus,
}: ProjectInstructionsProps) {
  return (
    <div className="hidden xl:flex flex-col w-80 bg-gray-50 dark:bg-gray-900/50 border-r border-gray-200 dark:border-gray-800 shrink-0 min-h-0">
      <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
        <h3 className="font-bold text-lg mb-4">Challenge</h3>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 text-sm">
          {project.description}
        </p>

        <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-100 dark:border-blue-500/20 mb-6">
          <h4 className="font-bold text-blue-700 dark:text-blue-400 mb-2 text-xs uppercase tracking-wider flex items-center gap-2">
            <RefreshCw size={12} />
            Environment
          </h4>
          <div className="flex items-center justify-between text-xs text-blue-600 dark:text-blue-300">
            <span>Status</span>
            <span
              className={`flex items-center gap-1.5 ${sandpackStatus === "running" ? "text-green-500" : "text-yellow-500"}`}
            >
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${sandpackStatus === "running" ? "bg-green-400" : "bg-yellow-400"}`}
                ></span>
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${sandpackStatus === "running" ? "bg-green-500" : "bg-yellow-500"}`}
                ></span>
              </span>
              {sandpackStatus}
            </span>
          </div>
        </div>

        {/* Hints Section */}
        {project.hints && project.hints.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Lightbulb size={16} className="text-yellow-500" />
                Hints ({hintIndex + 1}/{project.hints.length})
              </h4>
            </div>

            <AnimatePresence mode="popLayout">
              {project.hints.slice(0, hintIndex + 1).map((hint, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-3 p-3 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-100 dark:border-yellow-500/20 rounded-lg text-xs text-yellow-800 dark:text-yellow-200"
                >
                  <span className="font-bold mr-1">Hint {i + 1}:</span> {hint}
                </motion.div>
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
    </div>
  );
}
