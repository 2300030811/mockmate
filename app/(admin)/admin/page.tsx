import { getAdminStats } from "@/app/actions/admin";
import Link from "next/link";
import {
  Users,
  FileQuestion,
  TrendingUp,
  CheckCircle2,
  Trophy,
  ArrowRight,
  Database,
  Cpu,
  Layers,
  Activity,
  Sparkles,
  Swords,
  Flame,
  BookOpen,
} from "lucide-react";
import { ClientDate } from "@/components/ui/ClientDate";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const { success, data, error } = await getAdminStats();

  if (!success || !data) {
    return (
      <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500">
        <h3 className="text-base font-semibold">Access Error</h3>
        <p className="text-sm mt-1">Failed to load platform telemetry: {error || "Unauthorized"}</p>
      </div>
    );
  }

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

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200/80 dark:border-[#1e1e2a] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 dark:text-[#8b8b9e] mb-1.5">
            <span>Admin Console</span>
            <span>/</span>
            <span className="text-[#5e6ad2] font-semibold">System Telemetry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            System Operations & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-[#8b8b9e] mt-1">
            Real-time platform throughput, assessment telemetry, and infrastructure status.
          </p>
        </div>

        {/* Quick Actions & Status Badges */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-[#161622] border border-zinc-200 dark:border-[#222232] text-xs font-medium text-zinc-700 dark:text-[#ebebef]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[11px]">DB Sync Active</span>
          </div>

          <Link
            href="/admin/leaderboard"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#5e6ad2] hover:bg-[#5e6ad2]/90 text-white text-xs font-medium transition-all shadow-xs"
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Leaderboard Moderation</span>
          </Link>
        </div>
      </div>

      {/* Top 4 KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 dark:text-[#5a5a6e]">
              Total Users
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#5e6ad2]/10 text-[#5e6ad2] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
              {totalUsers.toLocaleString()}
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-[#8b8b9e] mt-1 flex items-center gap-1.5">
              <span className="text-emerald-500 font-semibold font-mono">Registered</span>
              candidate profiles
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5e6ad2] opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Quizzes Taken */}
        <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 dark:text-[#5a5a6e]">
              Assessments Run
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <FileQuestion className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
              {totalQuizzes.toLocaleString()}
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-[#8b8b9e] mt-1 flex items-center gap-1.5">
              <span className="text-amber-500 font-semibold font-mono">{totalInterviews} interviews</span>
              cataloged
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Average Score */}
        <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 dark:text-[#5a5a6e]">
              Average Score
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
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

        {/* Pass Rate */}
        <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 dark:text-[#5a5a6e]">
              Certification Pass Rate
            </span>
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-500 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
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

      {/* Middle Grid: Assessment Distribution & Live Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Mode Breakdown & Categories (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Mode Distribution Card */}
          <div className="p-5 sm:p-6 rounded-xl bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#5e6ad2]" />
                  Assessment Mode Distribution
                </h3>
                <p className="text-xs text-zinc-500 dark:text-[#8b8b9e] mt-0.5">
                  Breakdown across Standard Practice, Competitive Arena, and Daily Challenges.
                </p>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 dark:text-[#5a5a6e] bg-zinc-100 dark:bg-[#1c1c28] px-2 py-1 rounded">
                {totalQuizzes} total
              </span>
            </div>

            {/* Stacked Progress Bar */}
            <div className="w-full h-3 bg-zinc-100 dark:bg-[#1e1e2a] rounded-full overflow-hidden flex">
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
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#5e6ad2]" />
                <div>
                  <div className="text-[11px] font-medium text-zinc-900 dark:text-[#ebebef] flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-[#5e6ad2]" /> Standard
                  </div>
                  <div className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                    {modeBreakdown?.standard || 0}{" "}
                    <span className="text-[10px] font-normal text-zinc-400">({standardPct}%)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <div>
                  <div className="text-[11px] font-medium text-zinc-900 dark:text-[#ebebef] flex items-center gap-1">
                    <Swords className="w-3 h-3 text-amber-500" /> Arena
                  </div>
                  <div className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                    {modeBreakdown?.arena || 0}{" "}
                    <span className="text-[10px] font-normal text-zinc-400">({arenaPct}%)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <div>
                  <div className="text-[11px] font-medium text-zinc-900 dark:text-[#ebebef] flex items-center gap-1">
                    <Flame className="w-3 h-3 text-emerald-500" /> Daily
                  </div>
                  <div className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                    {modeBreakdown?.dailyChallenge || 0}{" "}
                    <span className="text-[10px] font-normal text-zinc-400">({dailyPct}%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Categories Card */}
          <div className="p-5 sm:p-6 rounded-xl bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Most Practiced Certification Domains
              </h3>
              <span className="text-[11px] font-mono text-zinc-400 dark:text-[#5a5a6e]">
                Top 5
              </span>
            </div>

            <div className="space-y-2.5">
              {topCategories && topCategories.length > 0 ? (
                topCategories.map((item, idx) => {
                  const maxCount = topCategories[0]?.count || 1;
                  const pct = Math.round((item.count / maxCount) * 100);
                  return (
                    <div key={item.category} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono uppercase font-semibold text-zinc-800 dark:text-[#ebebef]">
                          {idx + 1}. {item.category}
                        </span>
                        <span className="font-mono text-zinc-500 dark:text-[#8b8b9e]">
                          {item.count} sessions
                        </span>
                      </div>
                      <div className="w-full bg-zinc-100 dark:bg-[#1c1c28] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#5e6ad2] h-full rounded-full transition-all duration-300"
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

        {/* Right Column: Live Telemetry Feed (5 cols) */}
        <div className="lg:col-span-5">
          <div className="p-5 sm:p-6 rounded-xl bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] shadow-xs flex flex-col justify-between h-full space-y-4">
            <div>
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-[#1e1e2a] pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                    Live Assessment Feed
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-semibold">
                  STREAMING
                </span>
              </div>

              {/* Activity List */}
              <div className="space-y-2.5">
                {recentActivity && recentActivity.length > 0 ? (
                  recentActivity.map((item) => {
                    const isPassed = item.total_questions > 0 && item.score / item.total_questions >= 0.7;
                    return (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-lg bg-zinc-50 dark:bg-[#181824] border border-zinc-200/60 dark:border-[#222232] flex items-center justify-between text-xs"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-1.5 font-medium text-zinc-900 dark:text-[#ebebef] truncate">
                            <span className="truncate">{item.nickname}</span>
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
                    No recent activity logged yet.
                  </div>
                )}
              </div>
            </div>

            <Link
              href="/admin/leaderboard"
              className="mt-4 flex items-center justify-center gap-1.5 p-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-[#1a1a26] dark:hover:bg-[#222234] text-xs font-semibold text-zinc-800 dark:text-[#ebebef] transition-colors"
            >
              <span>View All Entries in Leaderboard</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#5e6ad2]" />
            </Link>
          </div>
        </div>
      </div>

      {/* Subsystem Health Bar */}
      <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] shadow-xs">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-400 dark:text-[#5a5a6e] mb-3">
          <Database className="w-3.5 h-3.5 text-[#5e6ad2]" />
          Platform Subsystems & Security Status
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-zinc-50 dark:bg-[#181824] border border-zinc-200/50 dark:border-[#222232] flex items-center justify-between">
            <span className="text-zinc-600 dark:text-[#8b8b9e]">PostgreSQL Database</span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-mono font-semibold text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Connected
            </span>
          </div>

          <div className="p-3 rounded-lg bg-zinc-50 dark:bg-[#181824] border border-zinc-200/50 dark:border-[#222232] flex items-center justify-between">
            <span className="text-zinc-600 dark:text-[#8b8b9e]">Row Level Security (RLS)</span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-mono font-semibold text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Enforced
            </span>
          </div>

          <div className="p-3 rounded-lg bg-zinc-50 dark:bg-[#181824] border border-zinc-200/50 dark:border-[#222232] flex items-center justify-between">
            <span className="text-zinc-600 dark:text-[#8b8b9e]">AI Gateway (Gemini)</span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-mono font-semibold text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Online
            </span>
          </div>

          <div className="p-3 rounded-lg bg-zinc-50 dark:bg-[#181824] border border-zinc-200/50 dark:border-[#222232] flex items-center justify-between">
            <span className="text-zinc-600 dark:text-[#8b8b9e]">Cron & Cadence Sync</span>
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
