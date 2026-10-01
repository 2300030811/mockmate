import { Skeleton } from "@/components/ui/Skeleton";
import { HomeBackground } from "@/components/home/HomeBackground";

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0d12] text-zinc-900 dark:text-[#ebebef] pb-20 pt-24 px-4 sm:px-6 relative overflow-hidden transition-colors duration-300">
      {/* 28px Precision Grid & Horizon Illumination */}
      <HomeBackground />

      <div className="max-w-7xl mx-auto relative z-10 space-y-6">
        {/* Profile Header Skeleton */}
        <div className="bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 sm:gap-8 shadow-subtle">
          <Skeleton className="w-24 h-24 md:w-28 md:h-28 rounded-full" />
          <div className="flex-1 space-y-3.5 text-center md:text-left">
            <Skeleton className="h-7 w-48 mx-auto md:mx-0 rounded-lg" />
            <Skeleton className="h-4 w-56 mx-auto md:mx-0 rounded-md" />
            <div className="flex flex-wrap gap-2.5 justify-center md:justify-start pt-1">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-28 rounded-full" />
            </div>
          </div>
          <div className="w-full md:w-auto flex flex-col gap-2.5">
            <Skeleton className="h-9 w-36 rounded-xl" />
            <Skeleton className="h-9 w-36 rounded-xl" />
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 sm:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] shadow-subtle flex flex-col items-center gap-2"
            >
              <Skeleton className="w-7 h-7 rounded-lg mb-1" />
              <Skeleton className="h-6 w-14 rounded-md" />
              <Skeleton className="h-3 w-16 rounded-md" />
            </div>
          ))}
        </div>

        {/* Activity + Sidebar Skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          <div className="xl:col-span-8 space-y-4">
            <Skeleton className="h-5 w-40 rounded-md" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] p-4 rounded-xl shadow-subtle flex items-center justify-between"
                >
                  <div className="flex items-center gap-3.5">
                    <Skeleton className="w-9 h-9 rounded-lg" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-32 rounded-md" />
                      <Skeleton className="h-3 w-24 rounded-md" />
                    </div>
                  </div>
                  <div className="text-right space-y-1.5">
                    <Skeleton className="h-4 w-16 rounded-md ml-auto" />
                    <Skeleton className="h-3 w-20 rounded-md ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="xl:col-span-4 space-y-4">
            {/* Badges Skeleton */}
            <div className="bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] rounded-2xl p-5 shadow-subtle">
              <Skeleton className="h-4 w-32 mb-4 rounded-md" />
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="w-11 h-11 rounded-xl mx-auto" />
                ))}
              </div>
            </div>

            {/* Career Ops Tracker Skeleton */}
            <div className="bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] rounded-2xl p-5 shadow-subtle">
              <Skeleton className="h-4 w-40 mb-4 rounded-md" />
              <div className="grid grid-cols-3 gap-2 mb-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-xl" />
                ))}
              </div>
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-xl" />
                ))}
              </div>
            </div>

            {/* Career Paths Skeleton */}
            <div className="bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] rounded-2xl p-5 shadow-subtle">
              <Skeleton className="h-4 w-32 mb-4 rounded-md" />
              <div className="space-y-2.5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
