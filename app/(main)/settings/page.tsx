import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { SettingsForm } from "@/components/settings/SettingsForm";
import { HomeBackground } from "@/components/home/HomeBackground";
import { LayoutDashboard, ChevronRight, Sliders } from "lucide-react";

export const metadata = {
  title: "Settings - MockMate",
  description: "Manage your account settings, appearance, security, and preferences.",
};

interface SettingsPageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/settings");
  }

  // Preload profile on server for instantaneous hydration without layout flash
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const params = await searchParams;
  const activeTab = params.tab || "general";

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0d12] text-zinc-900 dark:text-[#ebebef] selection:bg-[#5e6ad2]/20 pb-16 pt-[72px] px-4 sm:px-6 relative overflow-hidden transition-colors duration-300">
      <HomeBackground />

      <div className="max-w-6xl mx-auto relative z-10 space-y-4 sm:space-y-5">
        {/* Navigation Breadcrumb & Header */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-500 dark:text-[#8b8b9e]">
              <Link
                href="/dashboard"
                className="hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-1"
              >
                <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400 dark:text-[#5a5a6e]" />
              <span className="text-zinc-900 dark:text-[#ebebef] font-medium flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-[#5e6ad2]" /> Settings
              </span>
            </div>

            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-[5px] bg-zinc-100 dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] text-zinc-600 dark:text-[#8b8b9e] text-[11px] font-medium tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 animate-pulse" />
              <span className="font-semibold text-zinc-800 dark:text-[#ebebef]">MockMate System</span>
              <span className="text-zinc-400 dark:text-[#5a5a6e]">•</span>
              <span className="font-mono text-xs">{user.email}</span>
            </div>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-[-0.03em] text-zinc-900 dark:text-[#ebebef] leading-tight">
              Settings & Preferences
            </h1>
            <p className="text-xs text-zinc-500 dark:text-[#8b8b9e] mt-0.5 leading-normal">
              Manage your public persona, display configuration, audio cues, security parameters, and account telemetry.
            </p>
          </div>
        </div>

        {/* Interactive Settings Workspace */}
        <SettingsForm
          initialTab={activeTab}
          initialProfile={profile ?? null}
          initialUser={user}
        />
      </div>
    </div>
  );
}

