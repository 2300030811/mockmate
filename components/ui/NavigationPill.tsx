"use client";

import { ArrowLeft, Home } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface NavigationPillProps {
  showBack?: boolean;
  showHome?: boolean;
  className?: string; // Allow custom positioning if needed
}

export function NavigationPill({ showBack = true, showHome = true, className = "absolute top-6 left-6 z-50" }: NavigationPillProps) {
  const router = useRouter();

  return (
    <div className={className}>
      <div className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-full shadow-lg border border-gray-200 dark:border-gray-800 transition-all hover:bg-white dark:hover:bg-gray-900">
        {showBack && (
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>
        )}
        
        {showBack && showHome && (
          <div className="w-px h-4 bg-gray-300 dark:bg-gray-700 mx-1"></div>
        )}

        {showHome && (
          <Link 
            href="/" 
            className="flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>
        )}
      </div>
    </div>
  );
}
