import { HomeBackground } from "@/components/home/HomeBackground";

export default function SettingsLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0d12] text-zinc-900 dark:text-[#ebebef] pb-16 pt-[72px] px-4 sm:px-6 relative overflow-hidden transition-colors">
      <HomeBackground />

      <div className="max-w-6xl mx-auto relative z-10 space-y-4 sm:space-y-5 animate-pulse">
        {/* Breadcrumb & Header Skeleton */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-4 w-20 bg-zinc-200 dark:bg-[#1e1e2a] rounded" />
              <div className="h-4 w-3 bg-zinc-200 dark:bg-[#1e1e2a] rounded" />
              <div className="h-4 w-16 bg-zinc-200 dark:bg-[#1e1e2a] rounded" />
            </div>
            <div className="h-5 w-40 bg-zinc-200 dark:bg-[#1e1e2a] rounded-full" />
          </div>

          <div className="h-7 w-60 bg-zinc-200 dark:bg-[#1e1e2a] rounded-lg" />
          <div className="h-3.5 w-80 max-w-full bg-zinc-200 dark:bg-[#1e1e2a] rounded" />
        </div>

        {/* Content Layout Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 items-start">
          {/* Sidebar Tabs Skeleton */}
          <div className="lg:col-span-1 p-2 bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] rounded-xl space-y-1.5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-10 bg-zinc-100 dark:bg-[#181824] rounded-lg"
              />
            ))}
          </div>

          {/* Main Panel Skeleton */}
          <div className="lg:col-span-3 p-4 sm:p-5 bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] rounded-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-zinc-200 dark:bg-[#1e1e2a]" />
              <div className="space-y-1.5">
                <div className="h-4 w-36 bg-zinc-200 dark:bg-[#1e1e2a] rounded" />
                <div className="h-3 w-52 bg-zinc-200 dark:bg-[#1e1e2a] rounded" />
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <div className="h-3.5 w-24 bg-zinc-200 dark:bg-[#1e1e2a] rounded" />
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                {Array.from({ length: 10 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="h-9 rounded-lg bg-zinc-100 dark:bg-[#181824]"
                  />
                ))}
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="h-3.5 w-28 bg-zinc-200 dark:bg-[#1e1e2a] rounded" />
              <div className="h-9 w-full bg-zinc-100 dark:bg-[#181824] rounded-lg" />
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="h-3.5 w-28 bg-zinc-200 dark:bg-[#1e1e2a] rounded" />
              <div className="h-9 w-full bg-zinc-100 dark:bg-[#181824] rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
