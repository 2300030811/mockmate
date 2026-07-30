import React from "react";
import { Briefcase } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { MarketPulseSectionProps } from "../types";

export const MarketPulseSection = React.memo(({ marketInsights }: MarketPulseSectionProps) => {
  const confidence = marketInsights?.confidence || "medium";

  const confidenceColor: Record<string, string> = {
    high: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20",
    medium: "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/20",
    low: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2 uppercase tracking-tighter italic">
          <Briefcase className="text-emerald-500" size={20} />
          Market Pulse
        </h2>
        <span className={`text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded-md border ${confidenceColor[confidence]}`}>
          {confidence === "high" ? "🎯 High Confidence" : confidence === "medium" ? "⚡ Medium Confidence" : "📊 Estimated"}
        </span>
      </div>
      <Card className="p-6 bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Demand Heat</span>
            <div className="flex gap-1 h-3 items-center">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <div
                  key={lvl}
                  className={`w-2 h-full rounded-full transition-colors ${
                    (marketInsights?.demand === "high" && lvl <= 5) ||
                    (marketInsights?.demand === "medium" && lvl <= 3) ||
                    (lvl <= 2)
                      ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                      : "bg-emerald-200 dark:bg-emerald-950"
                  }`}
                />
              ))}
            </div>
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 block mb-1">Salary Benchmark</span>
            <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter italic">{marketInsights.salaryRange}</p>
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 block mb-2">Trend Velocity</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium selection:bg-emerald-500/20">
              {marketInsights.outlook}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
});

MarketPulseSection.displayName = "MarketPulseSection";
