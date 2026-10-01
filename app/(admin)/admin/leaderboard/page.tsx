import { getAllQuizResults } from "@/app/actions/admin";
import { LeaderboardTable } from "./LeaderboardTable";
import Link from "next/link";
import { ArrowLeft, Trophy, ShieldAlert } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminLeaderboardPage() {
  const { success, data, error } = await getAllQuizResults(150);

  if (!success || !data) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500">
        <h3 className="text-base font-semibold">Error loading leaderboard</h3>
        <p className="text-xs mt-1 font-mono">{error || "Failed to load data"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200/80 dark:border-[#1e1e2a] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 dark:text-[#8b8b9e] mb-1.5">
            <Link
              href="/admin"
              className="hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" /> Admin Dashboard
            </Link>
            <span>/</span>
            <span className="text-[#5e6ad2] font-semibold">Leaderboard Moderation</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Global Leaderboard Moderation
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-[#8b8b9e] mt-1">
            Audit candidate score submissions, filter categories, and purge illegitimate entries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-[#161622] border border-zinc-200 dark:border-[#222232] text-xs font-medium text-zinc-700 dark:text-[#ebebef]">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-mono text-[11px]">{data.length} Records Loaded</span>
          </div>
        </div>
      </div>

      <LeaderboardTable results={data as any[]} />
    </div>
  );
}
