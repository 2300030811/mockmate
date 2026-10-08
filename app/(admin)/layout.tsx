import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Trophy, LogOut, ArrowUpRight, ShieldCheck, Activity } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { AdminMobileNav } from "./AdminMobileNav";
import { AdminSidebarNav } from "./AdminSidebarNav";
import { AdminProfileFooter } from "./AdminProfileFooter";
import { profileRepository } from "@/lib/db/profile-repository";
import { HomeBackground } from "@/components/home/HomeBackground";

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
        <AdminSidebarNav />

        {/* Footer / User Profile & Logout */}
        <AdminProfileFooter email={user.email} nickname={userNickname} />
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
