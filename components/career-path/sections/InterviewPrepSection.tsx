import React from "react";
import { Award, MessageSquare, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { InterviewPrepSectionProps } from "../types";

export const InterviewPrepSection = React.memo(({ interviewPrep }: InterviewPrepSectionProps) => (
  <div className="pt-8 space-y-8">
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <MessageSquare className="text-blue-500 dark:text-blue-400" />
        Interview Prep & Questions
      </h2>
      <div className="space-y-4">
        {interviewPrep.topQuestions.map((q: any, idx: number) => {
          const difficultyColor: Record<string, string> = {
            easy: "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-500/20",
            medium: "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-500/20",
            hard: "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/20",
          };

          const categoryIcon: Record<string, string> = {
            technical: "⚙️",
            behavioral: "💬",
            "system-design": "🏗️",
          };

          return (
            <Card key={idx} className="p-5 border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-500/5 border-gray-200 dark:border-white/10">
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex-1">&quot;{q.question}&quot;</h4>
                <div className="flex gap-2 ml-3">
                  {q.difficulty && (
                    <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded border ${difficultyColor[q.difficulty as string] || ""}`}>
                      {q.difficulty}
                    </span>
                  )}
                  {q.category && (
                    <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">
                      {categoryIcon[q.category as string] || ""} {q.category}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                <span className="font-semibold text-blue-600 dark:text-blue-400 not-italic mr-2">Why this?</span>
                {q.reason}
              </p>
            </Card>
          );
        })}
      </div>
    </div>

    {interviewPrep.starStories && interviewPrep.starStories.length > 0 && (
      <div className="space-y-6 pt-4 border-t border-gray-200 dark:border-white/10">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Sparkles className="text-yellow-500" />
          Recommended STAR Stories
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {interviewPrep.starStories.map((story: any, idx: number) => (
            <Card key={idx} className="p-5 bg-gradient-to-br from-yellow-50/50 to-orange-50/50 dark:from-yellow-500/5 dark:to-orange-500/5 border border-yellow-200/50 dark:border-yellow-500/20">
              <span className="text-[10px] uppercase font-black tracking-widest text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/20 px-2 py-1 rounded-sm block mb-3 w-max">
                {story.requirementMatch}
              </span>
              <div className="space-y-3">
                <div>
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Situation / Task</span>
                  <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">{story.situationTask}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Action</span>
                  <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">{story.action}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Result</span>
                  <p className="text-sm text-green-700 dark:text-green-400 font-bold italic">{story.result}</p>
                </div>
                {story.seniorReflection && (
                  <div className="mt-4 pt-3 border-t border-amber-200/50 dark:border-amber-500/20">
                    <span className="text-[10px] uppercase font-black tracking-widest text-purple-600 dark:text-purple-400 flex items-center gap-1 mb-1">
                      <Award size={10} /> Senior Reflection
                    </span>
                    <p className="text-sm text-purple-800 dark:text-purple-300 font-medium">{story.seniorReflection}</p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    )}
  </div>
));

InterviewPrepSection.displayName = "InterviewPrepSection";
