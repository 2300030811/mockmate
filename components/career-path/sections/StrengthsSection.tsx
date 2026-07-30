import React from "react";
import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { StrengthsSectionProps } from "../types";

export const StrengthsSection = React.memo(({ strengths }: StrengthsSectionProps) => {
  if (!strengths || strengths.length === 0) return null;

  const levelColor: Record<string, string> = {
    expert: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20",
    proficient: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20",
    intermediate: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20",
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2 uppercase tracking-tighter italic">
        <Sparkles className="text-purple-500" size={20} />
        Strengths Spotlight
      </h2>
      <Card className="p-6 bg-purple-50/50 dark:bg-purple-500/5 border-purple-200 dark:border-purple-500/10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
        <div className="space-y-4">
          {strengths.map((strength, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-gray-900 dark:text-white text-sm">{strength.skill}</span>
                <span className={`text-[9px] uppercase font-black tracking-widest px-2 py-0.5 rounded border ${levelColor[strength.level] || levelColor.intermediate}`}>
                  {strength.level}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 italic">&quot;{strength.evidence}&quot;</p>
              {idx < strengths.length - 1 && <div className="h-px bg-gradient-to-r from-purple-200 to-transparent dark:from-purple-500/20 mt-3" />}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
});

StrengthsSection.displayName = "StrengthsSection";
