import React from "react";
import { m } from "framer-motion";
import { ArrowRight, XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SkillGapCardProps } from "../types";

export const SkillGapCard = React.memo(({ gap, idx, getQuizLink }: SkillGapCardProps) => (
  <m.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: idx * 0.05 }}
  >
    <Card className="p-5 bg-red-50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/10 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-1">
            <XCircle className="text-red-500 dark:text-red-400" size={20} />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{gap.skill}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-500/20 uppercase tracking-wider">
                Missing
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 capitalize font-medium">{gap.importance} Priority</span>
            </div>
          </div>
        </div>

        {gap.recommendedQuiz && (
          <Link href={getQuizLink(gap.recommendedQuiz) || "#"} target="_blank" rel="noopener noreferrer">
            <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 border-none shadow-lg shadow-purple-900/20 text-white whitespace-nowrap">
              Take {gap.recommendedQuiz.toUpperCase()} Quiz
              <ArrowRight size={16} className="ml-2" />
            </Button>
          </Link>
        )}
      </div>
    </Card>
  </m.div>
));

SkillGapCard.displayName = "SkillGapCard";
