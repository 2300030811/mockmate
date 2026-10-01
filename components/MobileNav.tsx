"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Trophy, Mic, ShieldCheck, Building2 } from "lucide-react";

const HIDDEN_ROUTE_PATTERNS = [
  "/session",
  "-quiz",
  "/daily-challenge",
];

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Placements", href: "/placements", icon: Building2 },
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
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 dark:bg-[#0d0d12]/95 backdrop-blur-md border-t border-zinc-200 dark:border-[#1e1e2a] px-3 py-1.5 transition-colors"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname?.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center min-w-[50px] min-h-[44px] px-1.5 rounded-[5px] transition-colors ${
                isActive
                  ? "text-[#5e6ad2] font-semibold"
                  : "text-zinc-500 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-[#ebebef]"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <div className="relative">
                <Icon className="w-4 h-4 mb-0.5" />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#5e6ad2]" />
                )}
              </div>
              <span className="text-[9.5px] uppercase font-medium tracking-wide">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
