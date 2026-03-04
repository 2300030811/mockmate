'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { RotateCcw, Home, Terminal } from 'lucide-react';

export default function ProjectModeError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('[Project Mode Error]', error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
            <div className="p-8 rounded-2xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200/30 dark:border-white/10 shadow-xl max-w-md w-full">
                <div className="w-14 h-14 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                    <Terminal className="w-7 h-7 text-purple-500" />
                </div>

                <h2 className="text-xl font-bold mb-2 dark:text-white">
                    Terminal Failure!
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm leading-relaxed">
                    {process.env.NODE_ENV === "development"
                        ? error.message
                        : "An unexpected exception occurred in Project Mode. Don't worry, your progress is mostly saved."}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                        onClick={reset}
                        variant="primary"
                        className="gap-2"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Reload Workspace
                    </Button>
                    <Link href="/">
                        <Button
                            variant="ghost"
                            className="gap-2 text-gray-700 dark:text-gray-300 w-full"
                        >
                            <Home className="w-4 h-4" />
                            Main Menu
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
