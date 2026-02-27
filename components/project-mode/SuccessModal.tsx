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
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

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
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 lg:p-10 max-w-2xl w-full shadow-2xl border border-gray-100 dark:border-gray-800 my-8 relative"
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Trophy className="text-green-600 dark:text-green-400 w-10 h-10" />
              </div>

              <h2 className="text-4xl font-black mb-3 text-gray-900 dark:text-white tracking-tight">
                Challenge Solved!
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto leading-relaxed">
                Excellent work fixing{" "}
                <span className="text-blue-600 dark:text-blue-400 font-black">
                  &quot;{project.title}&quot;
                </span>
                . Your engineering intuition is sharp!
              </p>

              {stats && (
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-5 bg-gray-50 dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-gray-800 transition-colors group hover:bg-white dark:hover:bg-white/10">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2 font-black">
                      Time Taken
                    </div>
                    <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
                      {formatTime(stats.timeTaken)}
                    </div>
                  </div>
                  <div className="p-5 bg-gray-50 dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-gray-800 transition-colors group hover:bg-white dark:hover:bg-white/10">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2 font-black">
                      Hints Used
                    </div>
                    <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
                      {stats.hintsUsed}/{project.hints?.length || 0}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Expert Solution Toggle */}
            {(project.expertSolution || project.expertExplanation) && (
              <div className="mb-8 overflow-hidden rounded-3xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                <button
                  onClick={() => setShowSolution(!showSolution)}
                  className="w-full p-4 flex items-center justify-between text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Code2 size={16} className="text-blue-500" />
                    <span>See how a Senior would solve this</span>
                  </div>
                  {showSolution ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </button>

                <AnimatePresence>
                  {showSolution && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 pt-0 space-y-6">
                        {project.expertSolution && (
                          <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm">
                            <SyntaxHighlighter
                              language="typescript"
                              style={vscDarkPlus}
                              customStyle={{
                                margin: 0,
                                padding: "1.25rem",
                                fontSize: "0.8rem",
                                background: "#0d1117",
                              }}
                            >
                              {project.expertSolution}
                            </SyntaxHighlighter>
                          </div>
                        )}
                        {project.expertExplanation && (
                          <div className="p-4 bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/10 dark:border-blue-500/20 rounded-2xl">
                            <h4 className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-2">
                              <Lightbulb size={14} />
                              Why this is better
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                              {project.expertExplanation}
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <Link href="/project-mode" className="block w-full">
                <Button className="w-full h-14 rounded-2xl text-base font-black bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20 text-white flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]">
                  Next Challenge
                  <ExternalLink size={18} />
                </Button>
              </Link>
              <button
                onClick={onReviewSolution}
                className="w-full h-14 rounded-2xl text-sm font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition-all bg-purple-50 hover:bg-purple-100 dark:bg-purple-500/10 dark:hover:bg-purple-500/20 flex items-center justify-center gap-2"
              >
                <BrainCircuit size={18} />
                Get AI Code Review
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
