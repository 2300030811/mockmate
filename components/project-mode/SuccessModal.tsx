"use client";

import { ProjectChallenge } from "@/lib/projects/data";
import {
  Lightbulb,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Code2,
  BrainCircuit,
  X,
  Trophy,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import dynamic from "next/dynamic";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { AnimatePresence, m } from "framer-motion";
import { useState } from "react";

const SyntaxHighlighter = dynamic(
  () => import("react-syntax-highlighter/dist/esm/prism").then(mod => mod.default || (mod as any).Prism),
  { ssr: false }
);

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReviewSolution: () => void;
  project: ProjectChallenge;
  stats?: {
    timeTaken: number;
    hintsUsed: number;
  };
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
};

export function SuccessModal({
  isOpen,
  onClose,
  onReviewSolution,
  project,
  stats,
}: SuccessModalProps) {
  const [showSolution, setShowSolution] = useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <m.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            className="bg-white dark:bg-[#14141e] rounded-xl p-6 sm:p-8 max-w-xl w-full shadow-surface border border-zinc-200 dark:border-[#1e1e2a] my-8 relative text-left"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-[#1e1e2a] text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-6 h-6" />
              </div>

              <h2 className="text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-[#ebebef] tracking-tight">
                Challenge Solved
              </h2>
              <p className="text-xs text-zinc-500 dark:text-[#8b8b9e] mt-1.5 mb-6 max-w-sm mx-auto leading-relaxed">
                Successfully debugged and validated{" "}
                <span className="text-[#5e6ad2] font-semibold">
                  &quot;{project.title}&quot;
                </span>
                .
              </p>

              {stats && (
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="p-3.5 bg-zinc-50 dark:bg-[#0f0f16] rounded-lg border border-zinc-200/80 dark:border-[#1a1a26]">
                    <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 dark:text-[#6e6e84] mb-1">
                      Time Elapsed
                    </div>
                    <div className="text-lg font-semibold font-mono text-zinc-900 dark:text-[#ebebef]">
                      {formatTime(stats.timeTaken)}
                    </div>
                  </div>
                  <div className="p-3.5 bg-zinc-50 dark:bg-[#0f0f16] rounded-lg border border-zinc-200/80 dark:border-[#1a1a26]">
                    <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 dark:text-[#6e6e84] mb-1">
                      Hints Revealed
                    </div>
                    <div className="text-lg font-semibold font-mono text-[#5e6ad2]">
                      {stats.hintsUsed} / {project.hints?.length || 0}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Senior Developer Solution Accordion */}
            {(project.expertSolution || project.expertExplanation) && (
              <div className="mb-6 overflow-hidden rounded-lg border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50/50 dark:bg-[#0f0f16]">
                <button
                  onClick={() => setShowSolution(!showSolution)}
                  className="w-full px-4 py-3 flex items-center justify-between text-xs font-medium text-zinc-700 dark:text-[#c0c0d4] hover:bg-zinc-100 dark:hover:bg-[#14141e] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Code2 size={14} className="text-[#5e6ad2]" />
                    <span>Reference Architecture Solution</span>
                  </div>
                  {showSolution ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </button>

                <AnimatePresence>
                  {showSolution && (
                    <m.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 pt-0 space-y-4">
                        {project.expertSolution && (
                          <div className="rounded-md overflow-hidden border border-zinc-200 dark:border-[#1e1e2a]">
                            <SyntaxHighlighter
                              language="typescript"
                              style={vscDarkPlus}
                              customStyle={{
                                margin: 0,
                                padding: "1rem",
                                fontSize: "0.75rem",
                                background: "#0d0d12",
                              }}
                            >
                              {project.expertSolution}
                            </SyntaxHighlighter>
                          </div>
                        )}
                        {project.expertExplanation && (
                          <div className="p-3 bg-zinc-100 dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] rounded-md">
                            <h4 className="text-[10px] font-mono uppercase tracking-wider text-[#5e6ad2] mb-1 flex items-center gap-1.5">
                              <Lightbulb size={12} />
                              Senior Dev Commentary
                            </h4>
                            <p className="text-xs text-zinc-600 dark:text-[#a0a0b8] leading-relaxed">
                              {project.expertExplanation}
                            </p>
                          </div>
                        )}
                      </div>
                    </m.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Link href="/project-mode" className="block w-full">
                <Button className="w-full h-10 rounded-md text-xs font-medium bg-[#5e6ad2] hover:bg-[#4f5ac4] text-white flex items-center justify-center gap-1.5 transition-colors shadow-subtle">
                  <span>Challenge Directory</span>
                  <ExternalLink size={14} />
                </Button>
              </Link>
              <button
                onClick={onReviewSolution}
                className="w-full h-10 rounded-md text-xs font-medium text-zinc-800 dark:text-[#ebebef] bg-zinc-100 hover:bg-zinc-200 dark:bg-[#1e1e2a] dark:hover:bg-[#28283a] border border-zinc-200 dark:border-[#2a2a3c] flex items-center justify-center gap-1.5 transition-colors"
              >
                <BrainCircuit size={14} className="text-[#5e6ad2]" />
                <span>AI Code Review</span>
              </button>
            </div>
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
}
