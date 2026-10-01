import { HomeBackground } from "@/components/home/HomeBackground";
import { Skeleton } from "@/components/ui/Skeleton";

export default function MainLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0d12] text-zinc-900 dark:text-[#ebebef] relative selection:bg-[#5e6ad2]/20 flex flex-col transition-colors overflow-hidden">
      {/* 28px Precision Grid & Horizon Illumination */}
      <HomeBackground />

      {/* Main Skeleton Canvas */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 space-y-8">
        {/* Hero Banner Skeleton */}
        <div className="w-full bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] rounded-2xl p-6 sm:p-8 shadow-subtle space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#5e6ad2] animate-pulse" />
            <Skeleton className="w-32 h-3.5 rounded-md" />
          </div>
          <Skeleton className="w-72 sm:w-96 h-8 rounded-xl" />
          <Skeleton className="w-full max-w-lg h-4 rounded-md" />
        </div>

        {/* 3-Column Metrics Bento Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] shadow-subtle space-y-3"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="w-24 h-3.5 rounded-md" />
                <Skeleton className="w-8 h-8 rounded-lg" />
              </div>
              <Skeleton className="w-16 h-8 rounded-lg" />
              <Skeleton className="w-36 h-3 rounded-md" />
            </div>
          ))}
        </div>

        {/* Content Feed Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] shadow-subtle space-y-4">
            <Skeleton className="w-48 h-5 rounded-md" />
            <div className="space-y-3 pt-2">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="p-4 rounded-xl border border-zinc-100 dark:border-[#1e1e2a] flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="w-40 h-4 rounded-md" />
                    <Skeleton className="w-64 h-3 rounded-md" />
                  </div>
                  <Skeleton className="w-16 h-6 rounded-md" />
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] shadow-subtle space-y-4">
            <Skeleton className="w-36 h-5 rounded-md" />
            <div className="space-y-3 pt-2">
              {[1, 2, 3].map((k) => (
                <div key={k} className="p-3.5 rounded-xl border border-zinc-100 dark:border-[#1e1e2a] space-y-2">
                  <Skeleton className="w-28 h-3.5 rounded-md" />
                  <Skeleton className="w-full h-2 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
