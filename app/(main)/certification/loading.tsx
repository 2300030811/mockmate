import { Skeleton } from "@/components/ui/Skeleton";
import { HomeBackground } from "@/components/home/HomeBackground";

export default function CertificationLoading() {
  const skeletonCards = Array.from({ length: 6 });

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0d12] text-zinc-900 dark:text-[#ebebef] pt-20 relative selection:bg-[#5e6ad2]/20 overflow-hidden">
      {/* 28px Precision Dot Grid & Horizon Illumination */}
      <HomeBackground />

      <div className="relative z-10 flex flex-col items-center justify-start max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title & Subtitle Skeleton */}
        <div className="w-full flex flex-col items-center gap-3 mb-10 text-center">
          <Skeleton className="h-10 w-2/3 max-w-md rounded-xl" />
          <Skeleton className="h-4 w-1/2 max-w-sm rounded-md" />
        </div>

        {/* Cards Grid Skeleton */}
        <div className="w-full grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skeletonCards.map((_, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] shadow-subtle space-y-4"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <Skeleton className="w-20 h-6 rounded-full" />
              </div>
              <Skeleton className="w-48 h-6 rounded-lg" />
              <Skeleton className="w-full h-12 rounded-md" />
              <div className="pt-2 border-t border-zinc-100 dark:border-[#1e1e2a] flex items-center justify-between">
                <Skeleton className="w-24 h-4 rounded-md" />
                <Skeleton className="w-20 h-8 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
