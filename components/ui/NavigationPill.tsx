"use client";

import { ArrowLeft, Home } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface NavigationPillProps {
  showBack?: boolean;
  showHome?: boolean;
  className?: string; // Allow custom positioning if needed
  backHref?: string; // Optional custom link for back button
  variant?: "auto" | "dark" | "light"; // "auto" follows global, "dark" forces dark, "light" forces light
}

export function NavigationPill({ showBack = false, showHome = true, className = "absolute top-6 left-6 z-50", backHref, variant = "auto" }: NavigationPillProps) {
  const router = useRouter();

  // Resolve styling based on variant
  const containerClass = variant === "dark"
    ? "flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full shadow-lg border border-white/10 transition-all hover:bg-black/80"
    : variant === "light"
      ? "flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-gray-200 transition-all hover:bg-white"
      : "flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-full shadow-lg border border-gray-200 dark:border-gray-800 transition-all hover:bg-white dark:hover:bg-gray-900";

  const linkClass = variant === "dark"
    ? "flex items-center gap-1 text-sm font-bold text-gray-300 hover:text-white transition-colors"
    : variant === "light"
      ? "flex items-center gap-1 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors"
      : "flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors";

  const dividerClass = variant === "dark"
    ? "w-px h-4 bg-gray-700 mx-1"
    : variant === "light"
      ? "w-px h-4 bg-gray-300 mx-1"
      : "w-px h-4 bg-gray-300 dark:bg-gray-700 mx-1";

  return (
    <div className={className}>
      <div className={containerClass}>
        {showBack && (
          backHref ? (
            <Link
              href={backHref}
              className={linkClass}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </Link>
          ) : (
            <button
              onClick={() => router.back()}
              className={linkClass}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
          )
        )}

        {showBack && showHome && (
          <div className={dividerClass}></div>
        )}

        {showHome && (
          <Link
            href="/"
            className={linkClass}
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>
        )}
      </div>
    </div>
  );
}
