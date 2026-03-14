"use client";

import { memo } from "react";
import { ArrowLeft, Home } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { m } from "framer-motion";

interface NavigationPillProps {
  showBack?: boolean;
  showHome?: boolean;
  className?: string;
  backHref?: string;
  variant?: "auto" | "dark" | "light";
}

const VARIANTS = {
  dark: {
    container: "bg-gradient-to-br from-gray-900 via-black to-gray-900 shadow-[0_0_20px_rgba(0,0,0,0.3)] border-white/10 hover:border-white/20 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]",
    link: "text-gray-400 hover:text-white",
    divider: "bg-white/10"
  },
  light: {
    container: "bg-gradient-to-br from-white via-gray-50 to-white shadow-lg border-gray-200 hover:border-blue-200 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]",
    link: "text-gray-500 hover:text-blue-600",
    divider: "bg-gray-200"
  },
  auto: {
    container: "bg-gradient-to-br from-white/90 via-gray-50/90 to-white/90 dark:from-gray-900/90 dark:via-black/90 dark:to-gray-900/90 shadow-lg border-gray-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-500/30 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]",
    link: "text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-white",
    divider: "bg-gray-200 dark:bg-white/10"
  }
};

export const NavigationPill = memo(({ 
  showBack = false, 
  showHome = true, 
  className = "absolute top-6 left-6 z-50", 
  backHref, 
  variant = "auto" 
}: NavigationPillProps) => {
  const router = useRouter();
  const styles = VARIANTS[variant];

  const containerClass = `flex items-center gap-2 px-4 py-2 backdrop-blur-xl rounded-full border transition-all ${styles.container}`;
  const linkBaseClass = `flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 ${styles.link}`;
  const dividerClass = `w-px h-3 mx-1 ${styles.divider}`;

  return (
    <m.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <div className={containerClass}>
        {showBack && (
          backHref ? (
            <Link
              href={backHref}
              className={linkBaseClass}
              aria-label="Go back to previous page"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back</span>
            </Link>
          ) : (
            <button
              onClick={() => router.back()}
              className={linkBaseClass}
              aria-label="Go back"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back</span>
            </button>
          )
        )}

        {showBack && showHome && (
          <div className={dividerClass} aria-hidden="true" />
        )}

        {showHome && (
          <Link
            href="/"
            className={linkBaseClass}
            aria-label="Go to home page"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Home</span>
          </Link>
        )}
      </div>
    </m.div>
  );
});

NavigationPill.displayName = "NavigationPill";
