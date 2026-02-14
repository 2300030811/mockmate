import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Trophy, LogOut } from "lucide-react";
import { logout } from "@/app/actions/auth";

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
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/"); // Not authorized
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-72 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-gray-200 dark:border-white/5 hidden md:flex flex-col relative z-20 shadow-xl">
        <div className="p-8 border-b border-gray-100 dark:border-white/5">
          <Link href="/" className="flex items-center gap-3 group">
             <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                M
             </div>
             <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                    MockMate
                </h1>
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400 tracking-wider uppercase">Admin Console</p>
             </div>
          </Link>
        </div>
        
        <nav className="flex-1 p-6 space-y-2">
            <p className="px-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Overview</p>
            
            <Link 
                href="/admin" 
                className="flex items-center gap-4 px-4 py-3.5 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all duration-300 font-medium group"
            >
                <div className="p-2 bg-gray-100 dark:bg-white/5 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20 transition-colors">
                    <LayoutDashboard className="w-5 h-5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                </div>
                Dashboard
            </Link>
            
            <p className="px-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-8 mb-4">Management</p>

            <Link 
                href="/admin/leaderboard" 
                className="flex items-center gap-4 px-4 py-3.5 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-orange-600 dark:hover:text-orange-400 rounded-xl transition-all duration-300 font-medium group"
            >
                <div className="p-2 bg-gray-100 dark:bg-white/5 rounded-lg group-hover:bg-orange-100 dark:group-hover:bg-orange-500/20 transition-colors">
                    <Trophy className="w-5 h-5 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors" />
                </div>
                Leaderboard
            </Link>
        </nav>

        <div className="p-6 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
            <form action={logout}>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all duration-300">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </button>
            </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
