"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "../app/providers";

export function Header() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  // Hide header on quiz pages (immersive mode) but KEEP it on mode selection pages (/mode)
  const isInterview = pathname?.startsWith("/demo/session");
  const isAwsQuiz = pathname === "/aws-quiz"; // Exact match to avoid hiding /aws-quiz/mode
  const isAzureQuiz = pathname === "/azure-quiz"; // Exact match to avoid hiding /azure-quiz/mode

  if (isInterview || isAwsQuiz || isAzureQuiz) {
      return null;
  }

  const isHomePage = pathname === "/" || pathname === "";
  


  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4 pointer-events-none"
    >
      <div className="flex items-center gap-4 max-w-7xl mx-auto pointer-events-auto">
        {/* Home Link - Only show when not on homepage */}
        {!isHomePage && (
          <Link 
            href="/" 
            className="group flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border shadow-sm hover:scale-105 transition-all duration-300 font-semibold bg-white/80 border-gray-200 text-gray-800 hover:bg-white hover:shadow-md dark:bg-gray-900/80 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-900"
          >
            <svg 
              className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
              />
            </svg>
            <span className="hidden sm:inline">Home</span>
          </Link>
        )}



        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="ml-auto p-3 rounded-full backdrop-blur-md border shadow-lg hover:scale-110 active:scale-95 transition-all duration-300 bg-white/80 border-gray-200 hover:bg-white hover:shadow-xl dark:bg-gray-900/80 dark:border-gray-700 dark:hover:bg-gray-900"
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          <div className="w-5 h-5 relative">
            {isDark ? (
              <svg className="w-5 h-5 text-yellow-400 transition-transform duration-300 rotate-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-700 transition-transform duration-300 -rotate-90" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </div>
        </button>
      </div>
    </header>
  );
}
