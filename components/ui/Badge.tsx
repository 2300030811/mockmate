import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10.5px] font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-ring border",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-zinc-900 text-white dark:bg-[#ebebef] dark:text-[#0d0d12]",
        secondary:
          "border-zinc-200 dark:border-[#1e1e2a] bg-zinc-100 dark:bg-[#14141e] text-zinc-700 dark:text-[#8b8b9e]",
        destructive:
          "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400",
        outline:
          "border-zinc-200 dark:border-[#1e1e2a] text-zinc-700 dark:text-[#8b8b9e]",
        glass:
          "border-zinc-200 dark:border-[#1e1e2a] bg-white/50 dark:bg-white/[0.04] text-zinc-700 dark:text-[#8b8b9e]",
        success:
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        warning:
          "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
        info:
          "border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
      },
    },
    defaultVariants: {
      variant: "secondary",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
  dotColor?: string;
}

function Badge({ className, variant, dot, dotColor, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            "w-[5px] h-[5px] rounded-full shrink-0",
            dotColor || "bg-current opacity-70"
          )}
        />
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
