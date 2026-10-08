"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Trophy,
  ArrowUpRight,
  ShieldCheck,
  Activity,
  Radio,
  Building2,
  Sparkles,
  PlayCircle,
  UploadCloud,
} from "lucide-react";

export function AdminSidebarNav() {
  const pathname = usePathname();

  const isRouteActive = (route: string) => {
    if (route === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(route);
  };

  return (
    <nav className="flex-1 p-3.5 space-y-5 overflow-y-auto">
      {/* ── 1. PLATFORM OVERVIEW & CONTROL ── */}
      <div className="space-y-1">
        <div className="px-3 pb-1 text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-[#5a5a6e]">
          Platform Telemetry
        </div>
        <Link
          href="/admin"
          className={`flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all ${
            isRouteActive("/admin")
              ? "bg-[#5e6ad2]/10 dark:bg-[#5e6ad2]/15 text-[#5e6ad2] dark:text-[#828df8] font-semibold border border-[#5e6ad2]/25 shadow-xs"
              : "text-zinc-700 dark:text-[#ebebef] hover:bg-zinc-100 dark:hover:bg-[#1c1c28] hover:text-[#5e6ad2] dark:hover:text-[#828df8]"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <LayoutDashboard className={`w-4 h-4 ${isRouteActive("/admin") ? "text-[#5e6ad2] dark:text-[#828df8]" : "text-zinc-500"}`} />
            <span>Executive Dashboard</span>
          </div>
          {isRouteActive("/admin") && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#5e6ad2] dark:bg-[#828df8] animate-pulse" />
          )}
        </Link>

        <Link
          href="/admin/leaderboard"
          className={`flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all ${
            isRouteActive("/admin/leaderboard")
              ? "bg-amber-500/10 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold border border-amber-500/25 shadow-xs"
              : "text-zinc-700 dark:text-[#ebebef] hover:bg-zinc-100 dark:hover:bg-[#1c1c28] hover:text-amber-600 dark:hover:text-amber-400"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Trophy className={`w-4 h-4 ${isRouteActive("/admin/leaderboard") ? "text-amber-500" : "text-zinc-500"}`} />
            <span>Leaderboard Moderation</span>
          </div>
          {isRouteActive("/admin/leaderboard") && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          )}
        </Link>
      </div>

      {/* ── 2. CAMPUS PLACEMENT OPS (ADMIN DIRECT CONTROL) ── */}
      <div className="space-y-1">
        <div className="px-3 pb-1 text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-[#5a5a6e]">
          Campus Recruitment Ops
        </div>
        <Link
          href="/placements"
          className="flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg text-zinc-700 dark:text-[#ebebef] hover:bg-zinc-100 dark:hover:bg-[#1c1c28] hover:text-[#5e6ad2] dark:hover:text-[#828df8] transition-all group"
        >
          <div className="flex items-center gap-2.5">
            <Building2 className="w-4 h-4 text-purple-400 group-hover:scale-105 transition-transform" />
            <div className="leading-tight">
              <div>Placement Hub & Radar</div>
              <span className="text-[10px] font-mono text-zinc-400 dark:text-[#5a5a6e]">
                114 Partner Drives
              </span>
            </div>
          </div>
          <span className="px-1.5 py-0.5 rounded font-mono text-[9px] bg-[#5e6ad2]/10 text-[#5e6ad2] dark:text-[#828df8] border border-[#5e6ad2]/20 font-bold uppercase tracking-wider">
            Live
          </span>
        </Link>
      </div>

      {/* ── 3. SHORTCUTS & APP ROADS ── */}
      <div className="space-y-1">
        <div className="px-3 pb-1 text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-[#5a5a6e]">
          Shortcuts
        </div>
        <Link
          href="/dashboard"
          className="flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg text-zinc-600 dark:text-[#8b8b9e] hover:bg-zinc-100 dark:hover:bg-[#1c1c28] hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
            <span>Candidate Dashboard</span>
          </span>
          <ArrowUpRight className="w-3 h-3 text-zinc-400" />
        </Link>
        <Link
          href="/career-path"
          className="flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg text-zinc-600 dark:text-[#8b8b9e] hover:bg-zinc-100 dark:hover:bg-[#1c1c28] hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          <span className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-zinc-400" />
            <span>Career Ops & Tracker</span>
          </span>
          <ArrowUpRight className="w-3 h-3 text-zinc-400" />
        </Link>
        <Link
          href="/demo"
          className="flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg text-zinc-600 dark:text-[#8b8b9e] hover:bg-zinc-100 dark:hover:bg-[#1c1c28] hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          <span className="flex items-center gap-2">
            <PlayCircle className="w-3.5 h-3.5 text-zinc-400" />
            <span>AI Simulation Studio</span>
          </span>
          <ArrowUpRight className="w-3 h-3 text-zinc-400" />
        </Link>
      </div>

      {/* ── 4. SYSTEM TELEMETRY BOX ── */}
      <div className="p-3 bg-zinc-100/90 dark:bg-[#161622] border border-zinc-200 dark:border-[#222232] rounded-xl space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-zinc-500 dark:text-[#8b8b9e] font-mono font-medium">System Telemetry</span>
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Nominal
          </span>
        </div>
        <div className="text-[10px] text-zinc-500 dark:text-[#6a6a82] font-mono leading-relaxed">
          RLS Active • Multi-tier AI Gateway • Supabase PG
        </div>
      </div>
    </nav>
  );
}
