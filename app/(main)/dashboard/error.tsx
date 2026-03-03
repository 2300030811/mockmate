'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { RotateCcw, Home, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950 flex items-center justify-center px-4 transition-colors duration-300">
      <div className="p-8 rounded-3xl bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200 dark:border-gray-800 shadow-xl max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard Error
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
          We couldn&apos;t load your dashboard data. This might be a temporary issue.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} variant="primary" className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Retry
          </Button>
          <Link href="/">
            <Button variant="outline" className="gap-2 w-full">
              <Home className="w-4 h-4" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
