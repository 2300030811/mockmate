"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Trophy, Mic, ShieldCheck } from "lucide-react";

const HIDDEN_ROUTE_PATTERNS = [
  "/session",
  "-quiz",
  "/interview",
  "/demo",
  "/arena",
  "/daily-challenge",
  "/system-design",
  "/career-path",
  "/resume-roaster",
  "/resume-builder",
  "/ats-optimizer",
  "/certification",
  "/project-mode",
];

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Quizzes", href: "/certification", icon: Trophy },
  { label: "Interview", href: "/demo", icon: Mic },
  { label: "Dashboard", href: "/dashboard", icon: ShieldCheck },
] as const;

export function MobileNav() {
  const pathname = usePathname();

  const isHiddenRoute = HIDDEN_ROUTE_PATTERNS.some((pattern) =>
    pathname?.includes(pattern)
  );

  if (isHiddenRoute) return null;

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/85 dark:bg-gray-950/85 backdrop-blur-xl border-t border-gray-200/60 dark:border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-4 py-2"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname?.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] px-2 rounded-xl transition-all duration-200 ${
                isActive
                  ? "text-blue-600 dark:text-blue-400 font-bold scale-105"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <div className="relative">
                <Icon className="w-5 h-5 mb-0.5" />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                )}
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-90">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
