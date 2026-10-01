"use client";

import { CheckCircle2, ArrowRight } from "lucide-react";

interface ModeCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  buttonText: string;
  gradient?: string;
  iconBgLight?: string;
  iconBgDark?: string;
  onClick: () => void;
  onHover?: () => void;
  iconColorClass?: string;
  buttonColorClass?: string;
  badge?: string;
}

export function ModeCard({
  title,
  description,
  icon,
  features,
  buttonText,
  onClick,
  onHover,
  badge,
}: ModeCardProps) {
  return (
    <div
      onClick={onClick}
      onMouseEnter={onHover}
      onFocus={onHover}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="group relative w-full text-left h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5e6ad2] rounded-xl border border-zinc-200 dark:border-[#1e1e2a] hover:border-[#5e6ad2] dark:hover:border-[#5e6ad2] bg-white dark:bg-[#14141e] p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 shadow-subtle cursor-pointer overflow-hidden"
    >
      <div className="relative z-10 flex-1 flex flex-col space-y-3.5">
        {/* Top Header Row with Icon & Badge */}
        <div className="flex items-center justify-between">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center border border-zinc-200 dark:border-[#222232] bg-zinc-50 dark:bg-[#101017] text-zinc-900 dark:text-[#ebebef] group-hover:scale-105 transition-transform">
            {icon}
          </div>
          {badge && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-[4px] bg-zinc-100 dark:bg-[#181824] border border-zinc-200 dark:border-[#222232] text-zinc-600 dark:text-[#8b8b9e]">
              {badge}
            </span>
          )}
        </div>

        {/* Title & Description */}
        <div>
          <h2 className="text-base sm:text-lg font-semibold tracking-[-0.015em] text-zinc-900 dark:text-[#ebebef] group-hover:text-[#5e6ad2] transition-colors">
            {title}
          </h2>
          <p className="mt-1 text-xs text-zinc-500 dark:text-[#8b8b9e] leading-relaxed line-clamp-2">
            {description}
          </p>
        </div>

        {/* Features Checklist */}
        <div className="space-y-1.5 pt-2 border-t border-zinc-100 dark:border-[#1a1a26] flex-1">
          {features.map((feature, idx) => (
            <div key={idx} className="flex items-center gap-2 text-[11.5px] text-zinc-600 dark:text-[#a0a0b2]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="pt-3 border-t border-zinc-100 dark:border-[#1a1a26] flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-800 dark:text-[#ebebef] group-hover:text-[#5e6ad2] transition-colors">
            {buttonText}
          </span>
          <div className="w-6 h-6 rounded-md bg-zinc-100 dark:bg-[#181824] group-hover:bg-[#5e6ad2] text-zinc-700 dark:text-[#ebebef] group-hover:text-white flex items-center justify-center transition-all">
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
}
