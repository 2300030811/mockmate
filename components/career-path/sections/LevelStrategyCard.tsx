import React from "react";
import { Award } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { LevelStrategyCardProps } from "../types";

export const LevelStrategyCard = React.memo(({ levelStrategy }: LevelStrategyCardProps) => {
  if (!levelStrategy) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2 uppercase tracking-tighter italic">
        <Award className="text-pink-500" size={20} />
        Leveling Strategy Tracker
      </h2>
      <Card className="p-6 bg-pink-50/50 dark:bg-pink-500/5 border-pink-200 dark:border-pink-500/10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-pink-600 dark:text-pink-400 bg-pink-100 dark:bg-pink-500/20 px-2.5 py-1 rounded-sm block">
              Detected Level
            </span>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {levelStrategy.detectedLevel}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Positioning Pitch</span>
              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                {levelStrategy.pitchStrategy}
              </p>
            </div>
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Downlevel Mitigation</span>
              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                {levelStrategy.downlevelMitigation}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
});

LevelStrategyCard.displayName = "LevelStrategyCard";
