"use client";

import { ProjectChallenge } from "@/lib/projects/data";
import { RefreshCw, Lightbulb, Clock, TrendingUp, Cpu, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { m, AnimatePresence } from "framer-motion";
import React from "react";

interface ProjectInstructionsProps {
  project: ProjectChallenge;
  hintIndex: number;
  onRevealHint: () => void;
  sandpackStatus: string;
}

export const ProjectInstructions = React.memo(function ProjectInstructions({
  project,
  hintIndex,
  onRevealHint,
  sandpackStatus,
}: ProjectInstructionsProps) {
  return (
    <aside className="hidden xl:flex flex-col w-80 bg-zinc-50/70 dark:bg-[#0d0d12] border-r border-zinc-200 dark:border-[#1e1e2a] shrink-0 min-h-0 text-left transition-colors">
      <div className="p-5 overflow-y-auto flex-1 space-y-5 custom-scrollbar">
        {/* Challenge Header & Brief */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5e6ad2] animate-pulse" />
            <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-500 dark:text-[#8b8b9e]">
              Challenge Specification
            </h3>
          </div>
          <p className="text-xs text-zinc-600 dark:text-[#a0a0b8] leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* Sandbox Environment Telemetry Card */}
        <div className="p-3.5 rounded-lg bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] space-y-3">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 dark:text-[#8b8b9e] border-b border-zinc-200/80 dark:border-[#1a1a26] pb-2">
            <span className="flex items-center gap-1.5 text-zinc-700 dark:text-[#ebebef]">
              <RefreshCw className="w-3 h-3 text-[#5e6ad2]" />
              Environment
            </span>
            <span className="flex items-center gap-1.5 font-semibold uppercase text-[10px]">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  sandpackStatus === "running"
                    ? "bg-emerald-500 animate-pulse"
                    : sandpackStatus === "idle"
                    ? "bg-emerald-500"
                    : "bg-amber-500"
                }`}
              />
              <span
                className={
                  sandpackStatus === "running"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : sandpackStatus === "idle"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-amber-600 dark:text-amber-400"
                }
              >
                {sandpackStatus === "idle" ? "READY" : sandpackStatus.toUpperCase()}
              </span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10.5px] font-mono">
            <div className="p-2 rounded bg-zinc-50 dark:bg-[#0f0f16] border border-zinc-200/60 dark:border-[#1a1a26]">
              <div className="text-[9.5px] text-zinc-400 dark:text-[#5a5a6e]">RUNTIME</div>
              <div className="text-zinc-800 dark:text-[#ebebef] font-medium mt-0.5">
                {project.template === "vanilla" ? "Vanilla JS" : "React 18"}
              </div>
            </div>
            <div className="p-2 rounded bg-zinc-50 dark:bg-[#0f0f16] border border-zinc-200/60 dark:border-[#1a1a26]">
              <div className="text-[9.5px] text-zinc-400 dark:text-[#5a5a6e]">EST. TIME</div>
              <div className="text-zinc-800 dark:text-[#ebebef] font-medium mt-0.5">
                {project.estimatedTime || "10 mins"}
              </div>
            </div>
          </div>
        </div>

        {/* Hints Section */}
        {project.hints && project.hints.length > 0 && (
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-xs text-zinc-900 dark:text-[#ebebef] flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>
                  Hints {hintIndex + 1 > 0 ? `(${hintIndex + 1} Revealed)` : "(Not Revealed)"}
                </span>
              </h4>
            </div>

            <AnimatePresence mode="popLayout">
              {project.hints &&
                project.hints.length > 0 &&
                hintIndex >= 0 &&
                project.hints.slice(0, hintIndex + 1).map((hint, i) => (
                  <m.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-md text-xs text-amber-900 dark:text-amber-200 leading-relaxed"
                  >
                    <span className="font-semibold mr-1 font-mono text-[11px]">Hint {i + 1}:</span>{" "}
                    {hint}
                  </m.div>
                ))}
            </AnimatePresence>

            {hintIndex < project.hints.length - 1 && (
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs h-8 rounded-md border-zinc-200 dark:border-[#1e1e2a] hover:bg-zinc-100 dark:hover:bg-[#1a1a26] text-zinc-700 dark:text-[#ebebef]"
                onClick={onRevealHint}
              >
                Reveal Next Hint
              </Button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
});
