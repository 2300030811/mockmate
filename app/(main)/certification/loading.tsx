"use client";

import { m } from "framer-motion";

export default function CertificationLoading() {
  const skeletonCards = Array.from({ length: 6 });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950 pt-20">
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-20">
        {/* Title Skeleton */}
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 h-16 w-2/3 max-w-2xl bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"
        />

        {/* Subtitle Skeleton */}
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-12 h-6 w-1/2 max-w-xl bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"
        />

        {/* Cards Grid Skeleton */}
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-7xl w-full grid md:grid-cols-2 lg:grid-cols-3 gap-8 px-4"
        >
          {skeletonCards.map((_, idx) => (
            <div
              key={idx}
              className="h-64 bg-gray-200 dark:bg-gray-800 rounded-3xl animate-pulse"
            />
          ))}
        </m.div>
      </div>
    </div>
  );
}
