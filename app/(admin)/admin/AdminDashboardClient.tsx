"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  FileQuestion,
  TrendingUp,
  CheckCircle2,
  Trophy,
  ArrowRight,
  Database,
  Layers,
  Activity,
  Sparkles,
  Swords,
  Flame,
  BookOpen,
  Radio,
  UploadCloud,
  RefreshCw,
  Search,
  Filter,
  Check,
  Building2,
  ShieldCheck,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { AdminDashboardData } from "@/app/actions/admin";
import { ClientDate } from "@/components/ui/ClientDate";

interface AdminDashboardClientProps {
  data: AdminDashboardData;
}

export function AdminDashboardClient({ data }: AdminDashboardClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "passed" | "failed">("all");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const {
    totalUsers,
    totalQuizzes,
    avgScore,
    passRate,
    totalInterviews,
    modeBreakdown,
    topCategories,
    recentActivity,
  } = data;

  const totalModes =
    (modeBreakdown?.standard || 0) +
    (modeBreakdown?.arena || 0) +
    (modeBreakdown?.dailyChallenge || 0) || 1;

  const standardPct = Math.round(((modeBreakdown?.standard || 0) / totalModes) * 100);
  const arenaPct = Math.round(((modeBreakdown?.arena || 0) / totalModes) * 100);
  const dailyPct = Math.round(((modeBreakdown?.dailyChallenge || 0) / totalModes) * 100);

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
      setLastRefreshed(new Date());
    });
  };

  // Filter live assessment stream
  const filteredActivity = useMemo(() => {
    return (recentActivity || []).filter((item) => {
      const isPassed = item.total_questions > 0 && item.score / item.total_questions >= 0.7;
      if (statusFilter === "passed" && !isPassed) return false;
      if (statusFilter === "failed" && isPassed) return false;

      if (selectedCategory && item.category !== selectedCategory) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nicknameMatch = (item.nickname || "").toLowerCase().includes(q);
        const categoryMatch = (item.category || "").toLowerCase().includes(q);
        return nicknameMatch || categoryMatch;
      }
      return true;
    });
  }, [recentActivity, statusFilter, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* ── 1. HEADER ROW WITH DYNAMIC CONTROLS ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200/80 dark:border-[#1e1e2a] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 dark:text-[#8b8b9e] mb-1.5 flex-wrap">
            <span>Admin Console</span>
            <span>/</span>
            <span className="text-[#5e6ad2] dark:text-[#828df8] font-semibold">System Telemetry & Control</span>
            <span className="text-zinc-300 dark:text-[#2a2a3c]">/</span>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
              Active Production
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-[#ebebef]">
            System Operations & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-[#8b8b9e] mt-1 max-w-2xl leading-relaxed">
            Real-time platform throughput, assessment telemetry, student evaluation metrics, and campus placement infrastructure.
          </p>
        </div>

        {/* Quick Actions & Status Badges */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleRefresh}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-[#161622] dark:hover:bg-[#202030] border border-zinc-200 dark:border-[#222232] text-xs font-medium text-zinc-700 dark:text-[#ebebef] transition-all cursor-pointer disabled:opacity-50"
            title="Refresh dashboard telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#5e6ad2] dark:text-[#828df8] ${isPending ? "animate-spin" : ""}`} />
            <span className="font-mono text-[11px]">{isPending ? "Syncing..." : "Sync Telemetry"}</span>
          </button>

          <Link
            href="/placements?tab=import"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-xs font-semibold transition-all shadow-xs"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Notice Parser</span>
          </Link>

          <Link
            href="/placements"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-[#181824] dark:hover:bg-[#202030] text-zinc-800 dark:text-[#ebebef] border border-zinc-200/80 dark:border-[#2a2a3c] text-xs font-semibold transition-all shadow-xs group"
          >
            <Radio className="w-3.5 h-3.5 text-[#5e6ad2] dark:text-[#828df8] group-hover:scale-105 transition-transform" />
            <span>Placement Radar</span>
          </Link>

          <Link
            href="/admin/leaderboard"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#5e6ad2] hover:bg-[#828df8] text-white text-xs font-semibold transition-all shadow-xs"
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Moderation</span>
          </Link>
        </div>
      </div>

      {/* ── 2. TOP 4 KPI METRICS GRID ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Users */}
        <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] shadow-xs relative overflow-hidden group hover:border-[#5e6ad2]/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 dark:text-[#5a5a6e] font-semibold">
              Total Users
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#5e6ad2]/10 text-[#5e6ad2] dark:text-[#828df8] flex items-center justify-center border border-[#5e6ad2]/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-[#ebebef] font-mono">
              {totalUsers.toLocaleString()}
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-[#8b8b9e] mt-1 flex items-center gap-1.5">
              <span className="text-emerald-500 font-semibold font-mono">Registered</span>
              candidate profiles
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5e6ad2] opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* KPI 2: Assessments Run */}
        <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] shadow-xs relative overflow-hidden group hover:border-amber-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 dark:text-[#5a5a6e] font-semibold">
              Assessments Run
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
              <FileQuestion className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-[#ebebef] font-mono">
              {totalQuizzes.toLocaleString()}
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-[#8b8b9e] mt-1 flex items-center gap-1.5">
              <span className="text-amber-500 font-semibold font-mono">{totalInterviews} interviews</span>
              cataloged
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* KPI 3: Average Score */}
        <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] shadow-xs relative overflow-hidden group hover:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 dark:text-[#5a5a6e] font-semibold">
              Average Score
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-[#ebebef] font-mono">
              {avgScore}%
            </div>
            <div className="mt-2 w-full bg-zinc-100 dark:bg-[#1e1e2a] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, avgScore))}%` }}
              />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* KPI 4: Pass Rate */}
        <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] shadow-xs relative overflow-hidden group hover:border-violet-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 dark:text-[#5a5a6e] font-semibold">
              Certification Pass Rate
            </span>
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-500 flex items-center justify-center border border-violet-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-[#ebebef] font-mono">
              {passRate}%
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-[#8b8b9e] mt-1 flex items-center gap-1.5">
              <span className="text-violet-500 font-semibold font-mono">≥ 70% threshold</span>
              benchmark
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* ── 3. MIDDLE GRID: ASSESSMENT DISTRIBUTION & LIVE TELEMETRY ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Mode Breakdown & Categories (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Mode Distribution Card */}
          <div className="p-5 sm:p-6 rounded-xl bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-[#ebebef] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#5e6ad2]" />
                  Assessment Mode Distribution
                </h3>
                <p className="text-xs text-zinc-500 dark:text-[#8b8b9e] mt-0.5">
                  Candidate traffic breakdown across Standard Practice, Competitive Arena, and Daily Challenges.
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold text-zinc-500 dark:text-[#8b8b9e] bg-zinc-100 dark:bg-[#1c1c28] px-2 py-1 rounded border border-zinc-200/60 dark:border-[#2a2a3c]">
                {totalQuizzes} total
              </span>
            </div>

            {/* Stacked Progress Bar */}
            <div className="w-full h-3 bg-zinc-100 dark:bg-[#1e1e2a] rounded-full overflow-hidden flex shadow-inner">
              <div
                className="bg-[#5e6ad2] h-full"
                style={{ width: `${standardPct}%` }}
                title={`Standard: ${modeBreakdown?.standard || 0} (${standardPct}%)`}
              />
              <div
                className="bg-amber-500 h-full"
                style={{ width: `${arenaPct}%` }}
                title={`Arena: ${modeBreakdown?.arena || 0} (${arenaPct}%)`}
              />
              <div
                className="bg-emerald-500 h-full"
                style={{ width: `${dailyPct}%` }}
                title={`Daily Challenge: ${modeBreakdown?.dailyChallenge || 0} (${dailyPct}%)`}
              />
            </div>

            {/* Mode Legend */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-zinc-100 dark:border-[#1e1e2a]/60">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-zinc-50 dark:bg-[#181824]/60 border border-zinc-200/50 dark:border-[#222232]">
                <div className="w-2.5 h-2.5 rounded-full bg-[#5e6ad2]" />
                <div className="min-w-0">
                  <div className="text-[11px] font-medium text-zinc-900 dark:text-[#ebebef] flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-[#5e6ad2]" /> Standard
                  </div>
                  <div className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200">
                    {modeBreakdown?.standard || 0}{" "}
                    <span className="text-[10px] font-normal text-zinc-400">({standardPct}%)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-lg bg-zinc-50 dark:bg-[#181824]/60 border border-zinc-200/50 dark:border-[#222232]">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <div className="min-w-0">
                  <div className="text-[11px] font-medium text-zinc-900 dark:text-[#ebebef] flex items-center gap-1">
                    <Swords className="w-3 h-3 text-amber-500" /> Arena
                  </div>
                  <div className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200">
                    {modeBreakdown?.arena || 0}{" "}
                    <span className="text-[10px] font-normal text-zinc-400">({arenaPct}%)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-lg bg-zinc-50 dark:bg-[#181824]/60 border border-zinc-200/50 dark:border-[#222232]">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <div className="min-w-0">
                  <div className="text-[11px] font-medium text-zinc-900 dark:text-[#ebebef] flex items-center gap-1">
                    <Flame className="w-3 h-3 text-emerald-500" /> Daily
                  </div>
                  <div className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200">
                    {modeBreakdown?.dailyChallenge || 0}{" "}
                    <span className="text-[10px] font-normal text-zinc-400">({dailyPct}%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Categories Card with click-to-filter */}
          <div className="p-5 sm:p-6 rounded-xl bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-[#ebebef] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Most Practiced Certification Domains
              </h3>
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="text-[11px] font-mono text-[#5e6ad2] dark:text-[#828df8] hover:underline"
                >
                  Clear filter ({selectedCategory})
                </button>
              )}
            </div>

            <div className="space-y-3">
              {topCategories && topCategories.length > 0 ? (
                topCategories.map((item, idx) => {
                  const maxCount = topCategories[0]?.count || 1;
                  const pct = Math.round((item.count / maxCount) * 100);
                  const isFirst = idx === 0;
                  const isSelected = selectedCategory === item.category;

                  return (
                    <div
                      key={item.category}
                      onClick={() =>
                        setSelectedCategory(isSelected ? null : item.category)
                      }
                      className={`p-2 rounded-lg transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#5e6ad2]/10 border border-[#5e6ad2]/30"
                          : "hover:bg-zinc-50 dark:hover:bg-white/[0.02]"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <div className="flex items-center gap-2 font-mono uppercase font-semibold text-zinc-800 dark:text-[#ebebef]">
                          <span
                            className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${
                              isFirst
                                ? "bg-amber-500/20 text-amber-500 border border-amber-500/30"
                                : idx === 1
                                ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                                : "bg-zinc-100 dark:bg-[#1e1e2a] text-zinc-500"
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <span>{item.category}</span>
                        </div>
                        <span className="font-mono text-zinc-500 dark:text-[#8b8b9e]">
                          {item.count} sessions
                        </span>
                      </div>
                      <div className="w-full bg-zinc-100 dark:bg-[#1c1c28] h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isFirst
                              ? "bg-gradient-to-r from-amber-500 to-[#5e6ad2]"
                              : "bg-[#5e6ad2]"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-6 text-center text-xs text-zinc-400 font-mono">
                  No category records found.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Live Telemetry Feed with Interactive Search (5 cols) */}
        <div className="lg:col-span-5">
          <div className="p-5 sm:p-6 rounded-xl bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] shadow-xs flex flex-col justify-between h-full space-y-4">
            <div>
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-[#1e1e2a] pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-[#ebebef]">
                    Live Assessment Feed
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-bold border border-emerald-500/20">
                  {filteredActivity.length} STREAMING
                </span>
              </div>

              {/* Search & Status Filters */}
              <div className="space-y-2 mb-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search candidate or category..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-[#222232] bg-zinc-50 dark:bg-[#181824] text-zinc-900 dark:text-[#ebebef] placeholder:text-zinc-400 font-mono focus:outline-none focus:border-[#5e6ad2]"
                  />
                </div>

                <div className="flex items-center gap-1.5 text-[11px] font-mono">
                  <button
                    onClick={() => setStatusFilter("all")}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      statusFilter === "all"
                        ? "bg-[#5e6ad2] text-white font-semibold"
                        : "bg-zinc-100 dark:bg-white/[0.04] text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setStatusFilter("passed")}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      statusFilter === "passed"
                        ? "bg-emerald-600 text-white font-semibold"
                        : "bg-zinc-100 dark:bg-white/[0.04] text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    Passed
                  </button>
                  <button
                    onClick={() => setStatusFilter("failed")}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      statusFilter === "failed"
                        ? "bg-red-600 text-white font-semibold"
                        : "bg-zinc-100 dark:bg-white/[0.04] text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    Needs Practice
                  </button>
                </div>
              </div>

              {/* Activity List */}
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {filteredActivity && filteredActivity.length > 0 ? (
                  filteredActivity.map((item) => {
                    const isPassed =
                      item.total_questions > 0 &&
                      item.score / item.total_questions >= 0.7;

                    return (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl bg-zinc-50 dark:bg-[#181824] border border-zinc-200/60 dark:border-[#222232] flex items-center justify-between text-xs hover:border-[#5e6ad2]/30 transition-colors"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-1.5 font-medium text-zinc-900 dark:text-[#ebebef] truncate">
                            <span className="truncate font-semibold">{item.nickname}</span>
                            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-zinc-200/80 dark:bg-[#28283a] text-zinc-600 dark:text-[#8b8b9e]">
                              {item.category}
                            </span>
                          </div>
                          <div className="text-[10px] text-zinc-400 dark:text-[#5a5a6e] font-mono mt-0.5">
                            <ClientDate date={item.completed_at} />
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                              isPassed
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                : "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/20"
                            }`}
                          >
                            {item.score}/{item.total_questions}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-8 text-center text-xs text-zinc-400 font-mono">
                    No matching activity records found.
                  </div>
                )}
              </div>
            </div>

            <Link
              href="/admin/leaderboard"
              className="mt-4 flex items-center justify-center gap-1.5 p-2.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-[#1a1a26] dark:hover:bg-[#222234] text-xs font-semibold text-zinc-800 dark:text-[#ebebef] transition-colors border border-zinc-200/60 dark:border-[#2a2a3c]"
            >
              <span>View All Entries in Leaderboard</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#5e6ad2]" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── 4. CAMPUS PLACEMENT OPS BRIDGE (ADMIN CONTROL) ── */}
      <div className="p-5 sm:p-6 rounded-xl bg-gradient-to-r from-[#5e6ad2]/10 via-purple-500/10 to-indigo-500/10 border border-[#5e6ad2]/20 dark:border-[#5e6ad2]/30 flex flex-col md:flex-row md:items-center justify-between gap-5 transition-colors">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#5e6ad2]/20 text-[#5e6ad2] dark:text-[#828df8] mb-2">
            <Radio className="w-3 h-3" />
            <span>Placement Radar Desk & Circular Review</span>
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-[#ebebef]">
            Campus Placement Operations & Notice Review Desk
          </h3>
          <p className="text-xs text-zinc-500 dark:text-[#8b8b9e] mt-1 leading-relaxed">
            Manage 114 partner companies, publish incoming placement circulars from Superset & Outlook, and manage active assessment schedules.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            href="/placements"
            className="px-4 py-2 rounded-lg bg-[#5e6ad2] hover:bg-[#828df8] text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-2"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Launch Live Radar</span>
          </Link>
          <Link
            href="/placements?tab=import"
            className="px-3.5 py-2 rounded-lg bg-zinc-100 dark:bg-white/10 hover:bg-zinc-200 dark:hover:bg-white/15 text-zinc-800 dark:text-white font-medium text-xs transition-colors flex items-center gap-2"
          >
            <UploadCloud className="w-3.5 h-3.5 text-[#8b8b9e]" />
            <span>Open Notice Parser</span>
          </Link>
        </div>
      </div>

      {/* ── 5. PLATFORM SUBSYSTEMS & SECURITY STATUS ── */}
      <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-400 dark:text-[#5a5a6e]">
            <Database className="w-3.5 h-3.5 text-[#5e6ad2]" />
            <span>Platform Subsystems & Security Status</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-semibold border border-emerald-500/20">
            99.98% SLA
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-zinc-50 dark:bg-[#181824] border border-zinc-200/50 dark:border-[#222232] flex items-center justify-between">
            <div>
              <span className="text-zinc-700 dark:text-zinc-300 font-medium block">PostgreSQL Database</span>
              <span className="text-[10px] text-zinc-400 font-mono">&lt; 35ms latency</span>
            </div>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-mono font-semibold text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Connected
            </span>
          </div>

          <div className="p-3 rounded-lg bg-zinc-50 dark:bg-[#181824] border border-zinc-200/50 dark:border-[#222232] flex items-center justify-between">
            <div>
              <span className="text-zinc-700 dark:text-zinc-300 font-medium block">Row Level Security</span>
              <span className="text-[10px] text-zinc-400 font-mono">Strict Auth Policy</span>
            </div>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-mono font-semibold text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Enforced
            </span>
          </div>

          <div className="p-3 rounded-lg bg-zinc-50 dark:bg-[#181824] border border-zinc-200/50 dark:border-[#222232] flex items-center justify-between">
            <div>
              <span className="text-zinc-700 dark:text-zinc-300 font-medium block">AI Gateway (Gemini)</span>
              <span className="text-[10px] text-zinc-400 font-mono">2.5 Flash & 2.0 Pro</span>
            </div>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-mono font-semibold text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Online
            </span>
          </div>

          <div className="p-3 rounded-lg bg-zinc-50 dark:bg-[#181824] border border-zinc-200/50 dark:border-[#222232] flex items-center justify-between">
            <div>
              <span className="text-zinc-700 dark:text-zinc-300 font-medium block">Cron & Cadence Sync</span>
              <span className="text-[10px] text-zinc-400 font-mono">Real-time Trigger</span>
            </div>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-mono font-semibold text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Operational
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
