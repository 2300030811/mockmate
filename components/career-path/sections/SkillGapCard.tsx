import React from "react";
import { m } from "framer-motion";
import { ArrowRight, XCircle } from "lucide-react";
import Link from "next/link";
import { SkillGapCardProps } from "../types";

export const SkillGapCard = React.memo(({ gap, idx, getQuizLink }: SkillGapCardProps) => (
  <m.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: idx * 0.04 }}
  >
    <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] hover:border-zinc-300 dark:hover:border-[#2a2a3c] shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
          <XCircle size={16} />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-[#ebebef]">
            {gap.skill}
          </h4>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-semibold uppercase">
              Missing Competency
            </span>
            <span className="text-[11px] font-mono text-zinc-500 dark:text-[#8b8b9e] capitalize">
              {gap.importance} Priority
            </span>
          </div>
        </div>
      </div>

      {gap.recommendedQuiz && (
        <Link
          href={getQuizLink(gap.recommendedQuiz) || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#5e6ad2] hover:bg-[#4f5ac4] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto active:scale-95 shadow-[#5e6ad2]/20"
        >
          <span>Take {gap.recommendedQuiz.toUpperCase()} Quiz</span>
          <ArrowRight size={13} />
        </Link>
      )}
    </div>
  </m.div>
));

SkillGapCard.displayName = "SkillGapCard";
