"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutDashboard, Trophy, LogOut, Menu, X, ArrowUpRight, ShieldCheck } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";

interface AdminMobileNavProps {
  email?: string | null;
  nickname?: string;
}

export function AdminMobileNav({ email, nickname }: AdminMobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      {/* Mobile Header Bar */}
      <div className="flex items-center justify-between p-3.5 bg-white/95 dark:bg-[#12121a]/95 backdrop-blur-xl border-b border-zinc-200 dark:border-[#1e1e2a] sticky top-0 z-40">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#5e6ad2] rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-xs">
            M
          </div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-sm font-bold text-zinc-900 dark:text-white tracking-tight">
              MockMate
            </h1>
            <span className="text-[9px] font-mono uppercase tracking-wider text-[#5e6ad2] bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 px-1.5 py-0.5 rounded font-semibold">
              Admin
            </span>
          </div>
        </Link>
        
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-[#1c1c28] rounded-lg transition-colors"
            aria-label="Toggle admin navigation"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="fixed inset-0 top-[57px] z-30 bg-white/98 dark:bg-[#0d0d12]/98 backdrop-blur-xl overflow-y-auto flex flex-col justify-between p-4">
          <nav className="space-y-4">
            <div>
              <p className="px-3 text-[10px] font-mono font-bold text-zinc-400 dark:text-[#5a5a6e] uppercase tracking-widest mb-2">
                Platform Overview
              </p>
              <div className="space-y-1">
                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-xs font-medium text-zinc-800 dark:text-[#ebebef] hover:bg-zinc-100 dark:hover:bg-[#1c1c28] rounded-lg transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-[#5e6ad2]" />
                  <span>Executive Dashboard</span>
                </Link>

                <Link
                  href="/admin/leaderboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-xs font-medium text-zinc-800 dark:text-[#ebebef] hover:bg-zinc-100 dark:hover:bg-[#1c1c28] rounded-lg transition-colors"
                >
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span>Leaderboard Moderation</span>
                </Link>
              </div>
            </div>

            <div>
              <p className="px-3 text-[10px] font-mono font-bold text-zinc-400 dark:text-[#5a5a6e] uppercase tracking-widest mb-2">
                Public App
              </p>
              <div className="space-y-1">
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 text-xs font-medium text-zinc-600 dark:text-[#8b8b9e] hover:bg-zinc-100 dark:hover:bg-[#1c1c28] rounded-lg transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-zinc-400" />
                    <span>User Dashboard</span>
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" />
                </Link>
              </div>
            </div>
          </nav>

          <div className="pt-4 border-t border-zinc-200 dark:border-[#1e1e2a] space-y-3">
            {email && (
              <div className="px-3 py-2 bg-zinc-100 dark:bg-[#14141e] rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-zinc-900 dark:text-white">
                    {nickname || "Admin"}
                  </p>
                  <p className="text-[10px] font-mono text-zinc-400 dark:text-[#5a5a6e]">
                    {email}
                  </p>
                </div>
                <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded font-bold">
                  AUTH OK
                </span>
              </div>
            )}
            <form action={logout}>
              <button
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
