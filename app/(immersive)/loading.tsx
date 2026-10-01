import { HomeBackground } from "@/components/home/HomeBackground";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ImmersiveLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0d12] text-zinc-900 dark:text-[#ebebef] relative selection:bg-[#5e6ad2]/20 flex flex-col transition-colors overflow-hidden">
      {/* 28px Precision Dot Grid & Horizon Glow */}
      <HomeBackground />

      {/* Unified Platform Header Skeleton */}
      <header className="h-14 border-b border-zinc-200/80 dark:border-[#1e1e2a]/80 bg-white/85 dark:bg-[#0d0d12]/85 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#5e6ad2]/20 flex items-center justify-center text-[#5e6ad2] font-black text-sm animate-pulse">
            M
          </div>
          <span className="font-bold text-sm text-zinc-900 dark:text-[#ebebef] tracking-tight">MockMate</span>
          <span className="text-zinc-300 dark:text-zinc-700">/</span>
          <Skeleton className="w-24 h-4 rounded-md" />
        </div>

        <div className="flex items-center gap-3">
          <Skeleton className="w-20 h-7 rounded-lg hidden sm:block" />
          <Skeleton className="w-8 h-8 rounded-lg" />
        </div>
      </header>

      {/* Main Skeleton Content */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 relative z-10 flex flex-col items-center justify-start space-y-8">
        {/* Status Pill Skeleton */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5e6ad2] animate-pulse" />
            <Skeleton className="w-36 h-3.5 rounded-md" />
          </div>
        </div>

        {/* Headline & Subtitle Skeleton */}
        <div className="text-center space-y-3 w-full flex flex-col items-center">
          <Skeleton className="w-3/4 max-w-lg h-9 sm:h-11 rounded-xl" />
          <Skeleton className="w-1/2 max-w-md h-4 rounded-md" />
        </div>

        {/* Large Card Skeleton */}
        <div className="w-full bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] rounded-2xl p-6 sm:p-8 shadow-subtle space-y-6">
          {/* Dropzone Skeleton */}
          <div className="border-2 border-dashed border-zinc-200 dark:border-[#2a2a3c] rounded-xl p-10 flex flex-col items-center justify-center gap-3">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <Skeleton className="w-48 h-4 rounded-md" />
            <Skeleton className="w-32 h-3 rounded-md" />
          </div>

          {/* Controls Track Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-zinc-100 dark:border-[#1e1e2a]">
            <div className="space-y-2">
              <Skeleton className="w-16 h-3 rounded-md" />
              <Skeleton className="w-full h-10 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Skeleton className="w-20 h-3 rounded-md" />
              <Skeleton className="w-full h-10 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Skeleton className="w-24 h-3 rounded-md" />
              <Skeleton className="w-full h-10 rounded-xl" />
            </div>
          </div>

          {/* Action Button Skeleton */}
          <div className="pt-2">
            <div className="w-full h-12 rounded-xl bg-zinc-100 dark:bg-[#1e1e2a] relative overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#5e6ad2]/15 to-transparent animate-[shimmer_1.5s_infinite] -translate-x-full" />
              <span className="text-xs font-mono font-medium text-zinc-400 dark:text-zinc-500 animate-pulse">
                Loading Environment...
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
