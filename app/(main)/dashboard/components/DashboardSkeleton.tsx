import { Skeleton } from "@/components/ui/Skeleton";

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950 text-gray-900 dark:text-white pb-20 pt-24 px-4 sm:px-6 relative overflow-hidden transition-colors duration-300">
      <div className="fixed inset-0 pointer-events-none contain-strict">
        <div className="absolute top-0 left-0 w-full h-96 bg-blue-400/10 dark:bg-blue-600/5 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-full h-96 bg-purple-400/10 dark:bg-purple-600/5 blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10 space-y-8">
        {/* Profile Header Skeleton */}
        <div className="bg-white/70 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 backdrop-blur-xl flex flex-col md:flex-row items-center gap-8 shadow-lg dark:shadow-none">
          <Skeleton className="w-24 h-24 md:w-32 md:h-32 rounded-full" />
          <div className="flex-1 space-y-4 text-center md:text-left">
            <Skeleton className="h-8 w-48 mx-auto md:mx-0" />
            <Skeleton className="h-4 w-56 mx-auto md:mx-0" />
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <Skeleton className="h-7 w-24 rounded-full" />
              <Skeleton className="h-7 w-20 rounded-full" />
              <Skeleton className="h-7 w-28 rounded-full" />
            </div>
          </div>
          <div className="w-full md:w-auto flex flex-col gap-3">
            <Skeleton className="h-10 w-36 rounded-xl" />
            <Skeleton className="h-10 w-36 rounded-xl" />
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-100/50 dark:bg-gray-900/30 flex flex-col items-center gap-2">
              <Skeleton className="w-8 h-8 rounded-full mb-2" />
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>

        {/* Activity + Sidebar Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-6 w-40" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-white/70 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            {/* Badges Skeleton */}
            <div className="bg-white/70 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-lg dark:shadow-none">
              <Skeleton className="h-4 w-32 mb-6" />
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="w-12 h-12 rounded-xl mx-auto" />
                ))}
              </div>
            </div>

            {/* Career Paths Skeleton */}
            <div className="bg-white/70 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-lg dark:shadow-none">
              <Skeleton className="h-4 w-32 mb-6" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
