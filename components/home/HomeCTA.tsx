"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Building2, ShieldCheck, Activity } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";

export function HomeCTA() {
  const { user } = useAuth();

  return (
    <div className="space-y-3 pt-2 text-left">
      <div className="flex flex-wrap items-center gap-3">
        {/* Primary Interactive CTA (Button-in-Button Pattern with Kinetic Tension) */}
        <Link
          href="/demo"
          className="group inline-flex items-center gap-2.5 pl-4 pr-1.5 py-1.5 rounded-full text-xs font-semibold bg-zinc-900 text-white dark:bg-[#ebebef] dark:text-[#0d0d12] hover:bg-zinc-800 dark:hover:bg-white shadow-subtle active:scale-[0.98] transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#5e6ad2]" />
          <span>Start AI Interview</span>
          <span className="w-6 h-6 rounded-full bg-white/15 dark:bg-black/10 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-[0.5px] group-hover:scale-105 transition-transform">
            <ArrowRight className="w-3 h-3 text-white dark:text-[#0d0d12]" />
          </span>
        </Link>

        {/* Secondary Module Links */}
        <Link
          href="/certification"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-[6px] text-xs font-medium border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] text-zinc-700 dark:text-[#ebebef] hover:bg-zinc-50 dark:hover:bg-[#181824] hover:border-zinc-300 dark:hover:border-[#2a2a3a] transition-colors"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
          <span>Cloud Certification Hub</span>
        </Link>

        <Link
          href="/placements"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[6px] text-xs font-medium text-zinc-600 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-[#ebebef] hover:bg-zinc-100 dark:hover:bg-white/[0.04] transition-colors"
        >
          <Building2 className="w-3.5 h-3.5 text-[#5e6ad2]" />
          <span>KLU Placement Radar</span>
        </Link>

        {!user && (
          <Link
            href="/login"
            className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-[#8b8b9e] dark:hover:text-[#ebebef] ml-auto transition-colors"
          >
            Sign in with student account →
          </Link>
        )}
      </div>

      {/* Live Platform Activity Pulse Indicator */}
      <div className="flex items-center gap-2 text-[11px] text-zinc-400 dark:text-[#6e6e84] font-mono">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>1,420 mock interviews completed this week</span>
        <span>•</span>
        <span className="text-zinc-500 dark:text-[#8b8b9e]">Sub-150ms evaluation latency</span>
      </div>
    </div>
  );
}

