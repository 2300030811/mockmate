"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/Button";
import { Sun, Moon, Building2, Swords, Trophy, Layers, Code2, Compass } from "lucide-react";
import { UserAuthSection } from "./UserAuthSection";
import { m, AnimatePresence } from "framer-motion";

// Routes where standard top header is replaced by tool-specific controls
const HIDDEN_ROUTE_PATTERNS = [
  "/session",
  "-quiz",
  "/system-design",
];

export function Header() {
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const isDark = (resolvedTheme || theme) === "dark";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isHiddenRoute = HIDDEN_ROUTE_PATTERNS.some(
    (pattern) => pathname?.includes(pattern)
  );

  if (isHiddenRoute) return null;

  const navLinks = [
    { label: "Career Path", href: "/career-path", icon: Compass },
    { label: "Placements", href: "/placements", icon: Building2, tag: "KLU" },
    { label: "Certifications", href: "/certification", icon: Trophy },
    { label: "Arena", href: "/arena", icon: Swords },
    { label: "System Design", href: "/system-design", icon: Layers },
    { label: "Daily Challenge", href: "/daily-challenge", icon: Code2 },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 h-14 z-50 border-b border-zinc-200 dark:border-[#1e1e2a] bg-white/95 dark:bg-[#0d0d12]/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: Brand Identity & Primary Navigation */}
        <div className="flex items-center gap-3 sm:gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-[22px] h-[22px] rounded-[5px] bg-[#5e6ad2] flex items-center justify-center text-[10px] font-bold text-white leading-none shadow-subtle group-hover:bg-[#4f5ac4] transition-colors">
              M
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] font-semibold text-zinc-900 dark:text-[#ebebef] tracking-[-0.01em]">
                MockMate
              </span>
              <span className="hidden sm:inline-block px-1.5 py-[1px] rounded text-[9.5px] font-medium tracking-wide uppercase bg-zinc-100 dark:bg-[#181824] text-zinc-500 dark:text-[#8b8b9e] border border-zinc-200 dark:border-[#1e1e2a]">
                v2.6
              </span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-1 border-l border-zinc-200 dark:border-[#1e1e2a] pl-4">
            {navLinks.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-2.5 py-[5px] rounded-[5px] text-[12.5px] font-medium transition-colors ${
                    isActive
                      ? "text-zinc-900 dark:text-[#ebebef] bg-zinc-100 dark:bg-white/[0.06]"
                      : "text-zinc-500 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-[#ebebef] hover:bg-zinc-100/60 dark:hover:bg-white/[0.03]"
                  }`}
                >
                  <item.icon className={`w-[13px] h-[13px] ${isActive ? "opacity-90 text-[#5e6ad2]" : "opacity-40"}`} />
                  <span>{item.label}</span>
                  {item.tag && (
                    <span className="text-[9px] font-semibold uppercase px-1 py-[0.5px] rounded bg-[#5e6ad2]/10 text-[#5e6ad2] border border-[#5e6ad2]/20">
                      {item.tag}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right: Actions, Auth, Theme Toggle */}
        <div className="flex items-center gap-2">
          <UserAuthSection />

          <div className="w-px h-4 bg-zinc-200 dark:bg-[#1e1e2a] mx-1" />

          {/* Theme Toggle Button */}
          <Button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            variant="ghost"
            size="icon"
            className="w-8 h-8 rounded-[5px] text-zinc-500 hover:text-zinc-900 dark:text-[#8b8b9e] dark:hover:text-[#ebebef] border border-transparent hover:border-zinc-200 dark:hover:border-[#1e1e2a]"
            aria-label="Toggle Theme"
          >
            {mounted && (
              isDark ? (
                <Sun className="w-3.5 h-3.5 text-zinc-400 hover:text-amber-400 transition-colors" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-zinc-600 hover:text-zinc-900 transition-colors" />
              )
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
