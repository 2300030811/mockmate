import React from "react";
import { LucideIcon } from "lucide-react";
import { StatCardProps } from "../types";

export const StatCard = React.memo(({ title, value, icon: Icon, subtitle, benchmark }: StatCardProps) => (
  <div className="p-5 rounded-2xl bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] shadow-subtle relative overflow-hidden flex flex-col justify-between space-y-3">
    <div className="flex items-center justify-between">
      <span className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b8b9e]">
        {title}
      </span>
      {Icon && (
        <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-[#0d0d12] border border-zinc-200/80 dark:border-[#1e1e2a] flex items-center justify-center text-[#5e6ad2]">
          <Icon size={16} />
        </div>
      )}
    </div>

    <div className="space-y-1">
      <div className="flex items-baseline gap-3">
        <p className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-zinc-900 dark:text-[#ebebef] truncate capitalize">
          {value}
        </p>
        {benchmark && (
          <div className="flex-1 flex gap-1 items-end h-5 pb-0.5">
            {benchmark}
          </div>
        )}
      </div>

      {subtitle && (
        <p className="text-xs text-zinc-500 dark:text-[#8b8b9e] font-medium truncate">
          {subtitle}
        </p>
      )}
    </div>
  </div>
));

StatCard.displayName = "StatCard";
