"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "../app/providers";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Home, Sun, Moon } from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";


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
            className={buttonVariants("glass", "sm", "rounded-full group gap-2")}
          >
            <Home className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
            <span className="hidden sm:inline">Home</span>
          </Link>
        )}

        {/* Theme Toggle */}
        <Button
          onClick={toggleTheme}
          variant="glass"
          size="icon"
          className="ml-auto rounded-full"
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          <div className="w-5 h-5 relative flex items-center justify-center">
            {isDark ? (
              <Sun className="w-5 h-5 text-yellow-400 transition-transform duration-300 rotate-0" />
            ) : (
              <Moon className="w-5 h-5 text-gray-700 transition-transform duration-300 -rotate-90" />
            )}
          </div>
        </Button>
      </div>
    </header>
  );
}
