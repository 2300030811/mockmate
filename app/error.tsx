'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Bot, Sparkles, RotateCcw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      {/* Animated illustration */}
      <div className="relative mx-auto w-28 h-28 mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full animate-pulse" />
        <div className="absolute inset-2 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-full" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Bot className="w-14 h-14 text-orange-500 dark:text-orange-400" />
          <Sparkles className="w-4 h-4 text-yellow-400 absolute top-1 right-3 animate-bounce" />
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Something went wrong!</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-1 max-w-md">
        {process.env.NODE_ENV === "development"
          ? error.message
          : "An unexpected error occurred. Please try again."}
      </p>
      <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">
        Bob&apos;s already looking into it. Give it another shot.
      </p>
      <div className="flex gap-4">
        <Button onClick={reset} variant="primary">
          <RotateCcw className="w-4 h-4 mr-2" />
          Try again
        </Button>
        <Button
          onClick={() => window.location.href = '/'}
          variant="ghost"
          className="text-gray-700 dark:text-gray-300"
        >
          <Home className="w-4 h-4 mr-2" />
          Go Home
        </Button>
      </div>
    </div>
  );
}
