"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/providers/providers";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Home, Sun, Moon } from "lucide-react";
import { UserAuthSection } from "./UserAuthSection";
import { motion, AnimatePresence } from "framer-motion";

export function Header() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const [scrolled, setScrolled] = useState(false);

  // Hidden Routes - where we want a specialized header or no header at all
  const isHiddenRoute = 
    pathname?.includes("/session") || 
    pathname?.includes("-quiz") || 
    pathname?.includes("/interview") ||
    pathname?.includes("/demo") ||
    pathname?.includes("/arena") ||
    pathname?.includes("/daily-challenge") ||
    pathname?.includes("/system-design") ||
    pathname?.includes("/career-path") ||
    pathname?.includes("/resume-roaster") ||
    pathname?.includes("/certification");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isHiddenRoute) return null;

  const isHomePage = pathname === "/" || pathname === "";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 pointer-events-none ${
        scrolled ? "py-2" : "py-4 sm:py-6"
      }`}
    >
      <div className={`max-w-5xl mx-auto px-4 sm:px-6 transition-all duration-500 pointer-events-auto ${scrolled ? "scale-95" : "scale-100"}`}>
        <nav 
          className={`
            flex items-center justify-between gap-2 p-1 transition-all duration-500 rounded-full border shadow-sm
            bg-white/40 dark:bg-gray-900/40 backdrop-blur-md border-gray-200/30 dark:border-white/5
            ${scrolled 
              ? "bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-gray-200/50 dark:border-white/10 shadow-2xl" 
              : "hover:bg-white/60 dark:hover:bg-gray-900/60"
            }
          `}
        >
          {/* Left: Auth & Nav Cluster */}
          <div className="flex items-center">
            <UserAuthSection />
            
            {!isHomePage && (
              <div className="flex items-center">
                <div className="w-px h-4 bg-gray-200 dark:bg-gray-800 mx-1 opacity-30"></div>
                <Link 
                  href="/" 
                  className={buttonVariants({ variant: "glass", size: "sm", className: "border-0 shadow-none bg-transparent hover:bg-black/5 dark:hover:bg-white/5 rounded-full group gap-2 px-3" })}
                >
                  <Home className="w-4 h-4 transition-transform group-hover:-translate-y-0.5 text-blue-500" />
                  <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-widest opacity-70">Home</span>
                </Link>
              </div>
            )}
          </div>

          {/* Right: Theme Toggle */}
          <div className="flex items-center">
            <Button
              onClick={toggleTheme}
              variant="glass"
              size="icon"
              className="rounded-full border-0 shadow-none bg-transparent hover:bg-black/5 dark:hover:bg-white/5 w-10 h-10 transition-transform active:scale-90"
              aria-label="Toggle Theme"
            >
              <div className="w-5 h-5 relative flex items-center justify-center overflow-hidden">
                <AnimatePresence mode="wait">
                  {isDark ? (
                    <motion.div
                      key="sun"
                      initial={{ y: 20, opacity: 0, rotate: -45 }}
                      animate={{ y: 0, opacity: 1, rotate: 0 }}
                      exit={{ y: -20, opacity: 0, rotate: 45 }}
                      transition={{ duration: 0.3, ease: "backOut" }}
                    >
                      <Sun className="w-5 h-5 text-yellow-400" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={{ y: 20, opacity: 0, rotate: 45 }}
                      animate={{ y: 0, opacity: 1, rotate: 0 }}
                      exit={{ y: -20, opacity: 0, rotate: -45 }}
                      transition={{ duration: 0.3, ease: "backOut" }}
                    >
                      <Moon className="w-5 h-5 text-gray-700" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
