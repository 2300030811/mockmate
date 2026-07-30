import React from "react";
import { Zap } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { CompetitiveEdgeCardProps } from "../types";

export const CompetitiveEdgeCard = React.memo(({ competitiveEdge }: CompetitiveEdgeCardProps) => {
  if (!competitiveEdge) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2 uppercase tracking-tighter italic">
        <Zap className="text-yellow-500" size={20} />
        Competitive Edge
      </h2>
      <Card className="p-6 bg-yellow-50/50 dark:bg-yellow-500/5 border-yellow-200 dark:border-yellow-500/10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-semibold italic">
          {competitiveEdge}
        </p>
      </Card>
    </div>
  );
});

CompetitiveEdgeCard.displayName = "CompetitiveEdgeCard";
