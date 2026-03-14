"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function ThemeSwitcher({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  // Wait for client-side hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={cn("w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse", className)} />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <div className={cn("flex items-center gap-1.5 p-1 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-white/10 shadow-lg", className)}>
      <button
        onClick={() => setTheme("light")}
        className={cn(
          "relative p-2 rounded-xl transition-all duration-300 group overflow-hidden",
          theme === "light" 
            ? "bg-white text-amber-500 shadow-sm ring-1 ring-gray-200" 
            : "text-gray-500 hover:text-amber-500 hover:bg-white/50 dark:hover:bg-white/5"
        )}
        title="Light Mode"
      >
        <Sun className="w-4 h-4 relative z-10" />
        {theme === "light" && (
          <m.div 
            layoutId="activeTheme" 
            className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-transparent" 
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
      </button>

      <button
        onClick={() => setTheme("dark")}
        className={cn(
          "relative p-2 rounded-xl transition-all duration-300 group overflow-hidden",
          theme === "dark" 
            ? "bg-gray-800 text-indigo-400 shadow-sm ring-1 ring-white/10" 
            : "text-gray-500 hover:text-indigo-400 hover:bg-white/50 dark:hover:bg-white/5"
        )}
        title="Dark Mode"
      >
        <Moon className="w-4 h-4 relative z-10" />
        {theme === "dark" && (
          <m.div 
            layoutId="activeTheme" 
            className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent" 
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
      </button>
    </div>
  );
}
