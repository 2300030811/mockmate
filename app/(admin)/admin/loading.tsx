export default function AdminLoading() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200/80 dark:border-[#1e1e2a] pb-6">
        <div className="space-y-2">
          <div className="h-3 w-40 bg-zinc-200 dark:bg-[#1e1e2a] rounded" />
          <div className="h-8 w-72 bg-zinc-200 dark:bg-[#1e1e2a] rounded-lg" />
          <div className="h-3 w-96 bg-zinc-200 dark:bg-[#1e1e2a] rounded" />
        </div>
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-28 bg-zinc-200 dark:bg-[#1e1e2a] rounded-lg" />
          <div className="h-8 w-36 bg-zinc-200 dark:bg-[#1e1e2a] rounded-lg" />
        </div>
      </div>

      {/* 4 Stat Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-xl bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] space-y-3"
          >
            <div className="flex justify-between items-center">
              <div className="h-3 w-20 bg-zinc-200 dark:bg-[#1e1e2a] rounded" />
              <div className="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-[#1e1e2a]" />
            </div>
            <div className="h-7 w-24 bg-zinc-200 dark:bg-[#1e1e2a] rounded-lg" />
            <div className="h-2.5 w-32 bg-zinc-200 dark:bg-[#1e1e2a] rounded" />
          </div>
        ))}
      </div>

      {/* Middle Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 p-6 rounded-xl bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] space-y-4">
          <div className="h-4 w-48 bg-zinc-200 dark:bg-[#1e1e2a] rounded" />
          <div className="h-3 w-full bg-zinc-200 dark:bg-[#1e1e2a] rounded-full" />
          <div className="grid grid-cols-3 gap-3 pt-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-zinc-200 dark:bg-[#1e1e2a] rounded-lg" />
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 p-6 rounded-xl bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] space-y-3">
          <div className="h-4 w-36 bg-zinc-200 dark:bg-[#1e1e2a] rounded" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-zinc-200 dark:bg-[#1e1e2a] rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
