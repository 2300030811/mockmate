"use client";

import { memo, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import { X, Sparkles, Check, AlertTriangle, ShieldCheck } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ReviewModalProps {
  reviewResult: string | null;
  score?: {
    overall: number;
    reliability: number;
    scalability: number;
    security: number;
    seniority: string;
    grade?: string;
    issues?: string[];
    checklist?: { name: string; status: "pass" | "fail" }[];
  } | null;
  onClose: () => void;
  theme: "dark" | "light" | "neo";
  onHighlightIssue?: (issue: string) => void;
}

const getGradeColor = (grade: string) => {
  const g = grade.toUpperCase();
  if (g.startsWith("A")) return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
  if (g.startsWith("B")) return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
  if (g.startsWith("C")) return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
  return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
};

export const ReviewModal = memo(({
  reviewResult,
  score,
  onClose,
  theme,
  onHighlightIssue
}: ReviewModalProps) => {
  const isLight = theme === "light";

  useEffect(() => {
    if (!reviewResult) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [reviewResult, onClose]);

  return (
    <AnimatePresence>
      {reviewResult && (
        <m.aside
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          role="dialog"
          aria-modal="true"
          aria-label="Architectural Evaluation Report"
          className="fixed right-0 top-14 bottom-0 w-full md:w-[580px] border-l border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#0d0d12] text-zinc-900 dark:text-[#ebebef] z-50 flex flex-col shadow-2xl transition-colors select-none"
        >
          {/* Header */}
          <div className="h-12 px-5 border-b border-zinc-200 dark:border-[#1e1e2a] flex items-center justify-between shrink-0 bg-zinc-50/50 dark:bg-[#14141e]/50">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 flex items-center justify-center text-[#5e6ad2]">
                <Sparkles size={11} />
              </div>
              <span className="text-xs font-semibold tracking-tight text-zinc-900 dark:text-[#ebebef]">
                Architectural Evaluation Report
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#1e1e2a] transition-colors"
              title="Close Report"
            >
              <X size={15} />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
            {/* Top Score Cards */}
            {score && (
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 rounded-lg border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50 dark:bg-[#14141e]">
                  <p className="text-[9.5px] font-mono uppercase text-zinc-400 dark:text-[#5a5a6e]">
                    Overall Score
                  </p>
                  <p className="text-xl font-bold font-mono text-zinc-900 dark:text-[#ebebef] mt-0.5">
                    {score.overall}
                    <span className="text-xs text-zinc-400 dark:text-[#5a5a6e] font-normal">/100</span>
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50 dark:bg-[#14141e]">
                  <p className="text-[9.5px] font-mono uppercase text-zinc-400 dark:text-[#5a5a6e]">
                    Seniority Level
                  </p>
                  <p className="text-xl font-bold font-mono text-[#5e6ad2] mt-0.5">
                    {score.seniority?.toUpperCase() || "MID"}
                  </p>
                </div>

                <div className={`p-3 rounded-lg border ${getGradeColor(score.grade || "B")}`}>
                  <p className="text-[9.5px] font-mono uppercase opacity-75">
                    System Grade
                  </p>
                  <p className="text-xl font-bold font-mono mt-0.5">
                    {score.grade || "B"}
                  </p>
                </div>
              </div>
            )}

            {/* Dimension Breakdown */}
            {score && (
              <div className="p-3.5 rounded-lg border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50 dark:bg-[#14141e] space-y-2.5">
                {[
                  { label: "Reliability & Fault-Tolerance", val: score.reliability, color: "bg-blue-500" },
                  { label: "Scalability & Elasticity", val: score.scalability, color: "bg-[#5e6ad2]" },
                  { label: "Security & Zero-Trust", val: score.security, color: "bg-emerald-500" }
                ].map((s) => (
                  <div key={s.label} className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-zinc-500 dark:text-[#8b8b9e]">
                      <span>{s.label}</span>
                      <span className="font-semibold text-zinc-800 dark:text-[#ebebef]">{s.val}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-200 dark:bg-[#1e1e2a] rounded-full overflow-hidden">
                      <m.div
                        initial={{ width: 0 }}
                        animate={{ width: `${s.val}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={`h-full ${s.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Structural Bottlenecks & Alerts */}
            {score?.issues && score.issues.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
                    <AlertTriangle size={12} />
                    <span>Architectural Flags ({score.issues.length})</span>
                  </p>
                  <span className="text-[9px] font-mono text-zinc-400">Click node to inspect</span>
                </div>
                <div className="space-y-1.5">
                  {score.issues.map((issue, i) => (
                    <button
                      key={i}
                      onClick={() => onHighlightIssue?.(issue)}
                      className="w-full text-left p-2 rounded-md border border-rose-500/20 bg-rose-500/5 text-rose-700 dark:text-rose-400 hover:bg-rose-500/10 transition-colors text-xs flex items-center gap-2"
                    >
                      <span className="text-rose-500">•</span>
                      <span className="truncate">{issue}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Checklist items */}
            {score?.checklist && score.checklist.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-[#8b8b9e]">
                  Specification Verification
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {score.checklist.map((item, i) => {
                    const isPass = item.status === "pass";
                    return (
                      <div
                        key={i}
                        className={`flex items-center justify-between p-2 rounded-md border text-xs ${
                          isPass
                            ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400"
                            : "border-rose-500/20 bg-rose-500/5 text-rose-700 dark:text-rose-400"
                        }`}
                      >
                        <span className="truncate font-medium">{item.name}</span>
                        {isPass ? <Check size={12} /> : <X size={12} />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="border-t border-zinc-200 dark:border-[#1e1e2a] pt-4">
              <div className={`prose prose-xs max-w-none leading-relaxed ${
                isLight ? "prose-zinc" : "prose-invert"
              }`}>
                <ReactMarkdown>{reviewResult}</ReactMarkdown>
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="p-4 border-t border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50/50 dark:bg-[#14141e]/50">
            <button
              onClick={onClose}
              className="w-full py-2 rounded-md bg-[#5e6ad2] hover:bg-[#4f5ac4] active:bg-[#434db0] text-white text-xs font-semibold shadow-subtle border border-[#5e6ad2]/50 transition-colors"
            >
              Close Evaluation
            </button>
          </div>
        </m.aside>
      )}
    </AnimatePresence>
  );
});

ReviewModal.displayName = "ReviewModal";
