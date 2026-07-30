import React from "react";
import { Award, Lightbulb } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ResumeSectionProps } from "../types";

export const ResumeSection = React.memo(({ suggestions }: ResumeSectionProps) => (
  <div className="pt-8 space-y-6">
    <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2 uppercase tracking-tighter italic">
      <Lightbulb className="text-yellow-500" size={20} />
      Resume Intel
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {suggestions.map((sug, idx) => (
        <Card key={idx} className="p-5 bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 hover:border-yellow-500/30 transition-all shadow-sm group">
          <div className="flex items-start gap-4">
            <div className={`mt-1 p-2 rounded-xl transition-transform group-hover:scale-110 ${
              sug.impact === "high" ? "bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400" :
              "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
            }`}>
              <Award size={18} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-400">{sug.category}</span>
                {sug.impact === "high" && <span className="text-[8px] uppercase font-black tracking-widest px-1.5 py-0.5 bg-orange-500/10 text-orange-500 rounded border border-orange-500/20">Critical</span>}
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-bold italic tracking-tight">
                &quot;{sug.suggestion}&quot;
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  </div>
));

ResumeSection.displayName = "ResumeSection";
