'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RotateCcw, Home, AlertTriangle } from 'lucide-react';
import { HomeBackground } from '@/components/home/HomeBackground';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Dashboard Error]', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0d12] text-zinc-900 dark:text-[#ebebef] relative selection:bg-[#5e6ad2]/20 flex flex-col items-center justify-center p-4 sm:p-6 transition-colors overflow-hidden">
      {/* 28px Precision Grid & Horizon Illumination */}
      <HomeBackground />

      <div className="relative z-10 w-full max-w-md mx-auto space-y-4 text-center">
        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-xs font-mono text-rose-600 dark:text-rose-400">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          <span className="font-semibold">Dashboard Exception</span>
          <span className="opacity-40">•</span>
          <span>Data Inaccessible</span>
        </div>

        {/* Card */}
        <div className="w-full bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] rounded-2xl p-6 sm:p-8 shadow-subtle space-y-5">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
            <AlertTriangle size={24} />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-[#ebebef]">
              Dashboard Unavailable
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-[#8b8b9e] leading-relaxed">
              We couldn&apos;t load your dashboard telemetry. This is usually temporary and safe to retry.
            </p>
          </div>

          {error.digest && (
            <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-[#0d0d12] border border-zinc-200/80 dark:border-[#1e1e2a] text-[11px] font-mono text-zinc-400 dark:text-zinc-500 text-left truncate">
              Digest: {error.digest}
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={reset}
              className="w-full sm:flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold bg-[#5e6ad2] hover:bg-[#4f5ac4] text-white shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shadow-[#5e6ad2]/20"
            >
              <RotateCcw size={13} />
              <span>Retry Dashboard</span>
            </button>

            <Link
              href="/"
              className="w-full sm:flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-[#1e1e2a] hover:bg-zinc-200 dark:hover:bg-[#252536] text-zinc-800 dark:text-[#ebebef] border border-zinc-200/80 dark:border-[#2a2a3c] flex items-center justify-center gap-2 transition-all"
            >
              <Home size={13} />
              <span>Back to Hub</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
