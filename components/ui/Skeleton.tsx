import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-zinc-200/80 dark:bg-[#1e1e2a] border border-zinc-200/40 dark:border-[#2a2a3c]/30",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
