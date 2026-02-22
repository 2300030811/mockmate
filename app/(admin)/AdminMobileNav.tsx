"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutDashboard, Trophy, LogOut, Menu, X } from "lucide-react";
import { logout } from "@/app/actions/auth";

export function AdminMobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      {/* Mobile Header Bar */}
      <div className="flex items-center justify-between p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 sticky top-0 z-40 shadow-sm">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
            M
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
              MockMate
            </h1>
          </div>
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="fixed inset-0 top-[73px] z-30 bg-white dark:bg-gray-900 overflow-y-auto">
          <nav className="p-6 space-y-2">
            <p className="px-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">
              Overview
            </p>

            <Link
              href="/admin"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-4 px-4 py-3.5 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all duration-300 font-medium group"
            >
              <div className="p-2 bg-gray-100 dark:bg-white/5 rounded-lg">
                <LayoutDashboard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              Dashboard
            </Link>

            <p className="px-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-8 mb-4">
              Management
            </p>

            <Link
              href="/admin/leaderboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-4 px-4 py-3.5 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-orange-600 dark:hover:text-orange-400 rounded-xl transition-all duration-300 font-medium group"
            >
              <div className="p-2 bg-gray-100 dark:bg-white/5 rounded-lg">
                <Trophy className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              Leaderboard
            </Link>
          </nav>

          <div className="p-6 mt-4 border-t border-gray-100 dark:border-white/5">
            <form action={logout}>
              <button
                className="w-full flex items-center justify-center gap-3 px-4 py-3 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-xl transition-all duration-300"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
