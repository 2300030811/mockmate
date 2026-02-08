'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service if intended
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
      <h2 className="text-2xl font-bold mb-4 dark:text-white">Something went wrong!</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        {error.message || "An unexpected error occurred while loading the quiz."}
      </p>
      <div className="flex gap-4">
        <Button
          onClick={reset}
          variant="primary"
        >
          Try again
        </Button>
        <Button
            onClick={() => window.location.href = '/'}
            variant="ghost"
            className="text-gray-700 dark:text-gray-300"
        >
            Go Home
        </Button>
      </div>
    </div>
  );
}
