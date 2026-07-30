import React from "react";
import { Card } from "@/components/ui/Card";
import { StatCardProps } from "../types";

export const StatCard = React.memo(({ title, value, icon: Icon, subtitle, benchmark }: StatCardProps) => (
  <Card className="p-4 sm:p-6 bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 relative overflow-hidden group">
    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
      <Icon size={60} className="text-gray-900 dark:text-white sm:size-80" />
    </div>
    <h3 className="text-[9px] sm:text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">{title}</h3>
    <div className="flex items-center gap-3">
      <p className="text-2xl sm:text-3xl font-black italic tracking-tighter text-gray-900 dark:text-white truncate">
        {value}
      </p>
      {benchmark && (
        <div className="flex-1 flex gap-1 items-end h-6">
          {benchmark}
        </div>
      )}
    </div>
    {subtitle && <p className="text-[8px] sm:text-[10px] font-bold text-gray-500 mt-2 uppercase tracking-widest truncate">{subtitle}</p>}
  </Card>
));

StatCard.displayName = "StatCard";
