"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { ArrowRight, Zap, Target, Trophy, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getDashboardData } from "@/app/actions/dashboard";
import { Skeleton } from "@/components/ui/Skeleton";

interface DashboardStats {
  xp: number;
  streak: number;
  totalTests: number;
}

export function PersonalizedStats() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      getDashboardData()
        .then((data) => {
          if (data) setStats(data.stats);
          setError(null);
        })
        .catch((err) => {
          console.error("Failed to load dashboard stats:", err);
          setError("Failed to load stats");
        })
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (authLoading || !user) return null;
  if (error) return null;

  return (
    <div className="w-full text-left" aria-label="Personalized Telemetry">
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-[#1e1e2a] pb-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#5e6ad2]" />
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-zinc-500 dark:text-[#8b8b9e]">
            Candidate Telemetry
          </span>
        </div>
        <Link
          href="/dashboard"
          className="text-[11px] font-medium text-zinc-500 dark:text-[#8b8b9e] hover:text-[#5e6ad2] dark:hover:text-[#ebebef] transition-colors flex items-center gap-1"
        >
          View Full Dashboard
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* 4-KPI Grid (per anti-generic secondary KPI spec) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <div className="rounded-md border border-zinc-200 dark:border-[#1a1a26] bg-white dark:bg-[#11111a] px-4 py-3 flex flex-col justify-between">
              <div className="text-[10px] text-zinc-500 dark:text-[#5a5a6e] font-medium uppercase tracking-[0.06em] flex items-center justify-between">
                <span>Total XP Earned</span>
                <Zap className="w-3 h-3 text-[#5e6ad2]" />
              </div>
              <div className="mt-1 text-[22px] font-semibold tracking-[-0.02em] text-zinc-900 dark:text-[#ebebef] tabular-nums t">
                {stats?.xp?.toLocaleString() || "0"}
              </div>
              <span className="text-[10.5px] font-medium text-emerald-600 dark:text-emerald-400/80 t mt-1">
                Verified skill credits
              </span>
            </div>

            <div className="rounded-md border border-zinc-200 dark:border-[#1a1a26] bg-white dark:bg-[#11111a] px-4 py-3 flex flex-col justify-between">
              <div className="text-[10px] text-zinc-500 dark:text-[#5a5a6e] font-medium uppercase tracking-[0.06em] flex items-center justify-between">
                <span>Active Streak</span>
                <Target className="w-3 h-3 text-amber-500" />
              </div>
              <div className="mt-1 text-[22px] font-semibold tracking-[-0.02em] text-zinc-900 dark:text-[#ebebef] tabular-nums t">
                {stats?.streak || 0} <span className="text-xs font-normal text-zinc-400">days</span>
              </div>
              <span className="text-[10.5px] font-medium text-[#5e6ad2] t mt-1">
                {(stats?.streak || 0) >= 3 ? "1.5x Multiplier active" : "Daily cadence healthy"}
              </span>
            </div>

            <div className="rounded-md border border-zinc-200 dark:border-[#1a1a26] bg-white dark:bg-[#11111a] px-4 py-3 flex flex-col justify-between">
              <div className="text-[10px] text-zinc-500 dark:text-[#5a5a6e] font-medium uppercase tracking-[0.06em] flex items-center justify-between">
                <span>Quizzes Completed</span>
                <Trophy className="w-3 h-3 text-zinc-400" />
              </div>
              <div className="mt-1 text-[22px] font-semibold tracking-[-0.02em] text-zinc-900 dark:text-[#ebebef] tabular-nums t">
                {stats?.totalTests || "0"}
              </div>
              <span className="text-[10.5px] font-medium text-zinc-500 dark:text-[#5a5a6e] t mt-1">
                AWS & Azure simulations
              </span>
            </div>

            <div className="rounded-md border border-zinc-200 dark:border-[#1a1a26] bg-white dark:bg-[#11111a] px-4 py-3 flex flex-col justify-between">
              <div className="text-[10px] text-zinc-500 dark:text-[#5a5a6e] font-medium uppercase tracking-[0.06em] flex items-center justify-between">
                <span>Readiness Status</span>
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              </div>
              <div className="mt-1 text-[22px] font-semibold tracking-[-0.02em] text-zinc-900 dark:text-[#ebebef] tabular-nums t">
                Eligible
              </div>
              <span className="text-[10.5px] font-medium text-emerald-600 dark:text-emerald-400/80 t mt-1">
                KLU Drive verified
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-md border border-zinc-200 dark:border-[#1a1a26] bg-white dark:bg-[#11111a] px-4 py-3 space-y-2">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-6 w-20" />
      <Skeleton className="h-3 w-24" />
    </div>
  );
}
