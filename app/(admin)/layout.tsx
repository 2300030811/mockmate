import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Trophy, LogOut, ArrowUpRight, ShieldCheck, Activity } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { AdminMobileNav } from "./AdminMobileNav";
import { profileRepository } from "@/lib/db/profile-repository";
import { HomeBackground } from "@/components/home/HomeBackground";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check admin role
  const profile = await profileRepository.getProfileFields(supabase, user.id, "role, nickname").catch(() => null);

  if (profile?.role !== "admin") {
    redirect("/"); // Not authorized
  }

  const userNickname = profile?.nickname || user.email?.split("@")[0] || "Admin";

  return (
    <div className="flex flex-col md:flex-row h-screen bg-zinc-50 dark:bg-[#0d0d12] text-zinc-900 dark:text-[#ebebef] selection:bg-[#5e6ad2]/20 overflow-hidden font-sans">
      <AdminMobileNav email={user.email} nickname={userNickname} />

      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white/95 dark:bg-[#12121a]/95 backdrop-blur-xl border-r border-zinc-200 dark:border-[#1e1e2a] hidden md:flex flex-col relative z-20 shrink-0">
        {/* Header / Brand */}
        <div className="p-5 border-b border-zinc-200 dark:border-[#1e1e2a] flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#5e6ad2] text-white flex items-center justify-center font-bold text-base shadow-xs group-hover:scale-105 transition-transform">
              M
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-zinc-900 dark:text-white tracking-tight">
                  MockMate
                </span>
                <span className="text-[9px] font-mono uppercase tracking-wider text-[#5e6ad2] bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 px-1.5 py-0.5 rounded font-semibold">
                  Admin
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-[#8b8b9e]">
                Operations Console
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3.5 space-y-5 overflow-y-auto">
          {/* Main Group */}
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-[#5a5a6e]">
              Platform Overview
            </div>
            <Link
              href="/admin"
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-zinc-700 dark:text-[#ebebef] hover:bg-zinc-100 dark:hover:bg-[#1c1c28] hover:text-[#5e6ad2] dark:hover:text-[#5e6ad2] transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-[#5e6ad2]" />
              <span>Executive Dashboard</span>
            </Link>
            <Link
              href="/admin/leaderboard"
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-zinc-700 dark:text-[#ebebef] hover:bg-zinc-100 dark:hover:bg-[#1c1c28] hover:text-[#5e6ad2] dark:hover:text-[#5e6ad2] transition-colors"
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Leaderboard Moderation</span>
            </Link>
          </div>

          {/* Quick Links */}
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
                <span>User Dashboard</span>
              </span>
              <ArrowUpRight className="w-3 h-3 text-zinc-400" />
            </Link>
            <Link
              href="/career-path"
              className="flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg text-zinc-600 dark:text-[#8b8b9e] hover:bg-zinc-100 dark:hover:bg-[#1c1c28] hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-zinc-400" />
                <span>Career Ops & Hub</span>
              </span>
              <ArrowUpRight className="w-3 h-3 text-zinc-400" />
            </Link>
          </div>

          {/* System Telemetry Status Box */}
          <div className="p-3 bg-zinc-100/80 dark:bg-[#161622] border border-zinc-200 dark:border-[#222232] rounded-xl space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-500 dark:text-[#8b8b9e] font-mono">System Health</span>
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Nominal
              </span>
            </div>
            <div className="text-[10px] text-zinc-400 dark:text-[#5a5a6e] font-mono">
              RLS Active • Multi-tier AI
            </div>
          </div>
        </nav>

        {/* Footer / User Profile & Logout */}
        <div className="p-3.5 border-t border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50/50 dark:bg-[#0f0f16]/60 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-[#5e6ad2]/20 border border-[#5e6ad2]/30 flex items-center justify-center text-[#5e6ad2] font-semibold text-xs shrink-0">
                {userNickname.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate">
                  {userNickname}
                </p>
                <p className="text-[10px] text-zinc-400 dark:text-[#5a5a6e] truncate font-mono">
                  {user.email}
                </p>
              </div>
            </div>
            <ThemeSwitcher />
          </div>

          <form action={logout}>
            <button className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20">
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative bg-zinc-50 dark:bg-[#0d0d12]">
        <HomeBackground />
        <div className="relative z-10 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
