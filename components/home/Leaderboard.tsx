"use client";

import { useState, useEffect, useCallback } from "react";
import { Trophy, Clock, Flame, Loader2, Trash2 } from "lucide-react";
import { getLeaderboard, deleteQuizResult } from "@/app/actions/results";
import { useAuth } from "@/components/providers/auth-provider";
import { toast } from "sonner";
import { LeaderboardItem } from "@/types/dashboard";
import { getAllCategories } from "@/lib/quiz-registry";

const CATEGORY_MAP: Record<string, string> = {
  aws: "AWS",
  azure: "Azure",
  salesforce: "Salesforce",
  mongodb: "MongoDB",
  oracle: "Oracle",
  pcap: "Python",
};

const categories = getAllCategories().map((c) => ({
  id: c.id,
  name: CATEGORY_MAP[c.id] || c.name.split(" ")[0],
}));

type Timeframe = "weekly" | "all-time";

export function Leaderboard() {
  const [activeCategory, setActiveCategory] = useState("aws");
  const [timeframe, setTimeframe] = useState<Timeframe>("weekly");
  const [data, setData] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState("");
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";

  const loadData = useCallback(async () => {
    setLoading(true);
    const results = await getLeaderboard(activeCategory, timeframe);
    setData(results);
    setLoading(false);
  }, [activeCategory, timeframe]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Weekly Countdown Timer
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const nextSunday = new Date(now);
      nextSunday.setDate(now.getDate() + (7 - now.getDay()));
      nextSunday.setHours(23, 59, 59, 999);

      const diff = nextSunday.getTime() - now.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

      setTimeLeft(`${days}d ${hours}h`);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from the leaderboard?`)) return;

    const res = await deleteQuizResult(id);
    if (res.success) {
      toast.success("Result removed from leaderboard");
      loadData();
    } else {
      toast.error("Failed to remove result");
    }
  };

  return (
    <section className="space-y-3 text-left" aria-label="Global Leaderboard">
      {/* Header & Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-[#1e1e2a] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-3.5 h-3.5 text-[#5e6ad2]" />
            <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-500 dark:text-[#8b8b9e]">
              Global Candidate Rankings
            </h2>
          </div>
          <p className="text-sm font-medium text-zinc-900 dark:text-[#ebebef] mt-0.5">
            Realtime scoring across verified cloud and algorithmic tracks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Season Countdown */}
          {timeframe === "weekly" && (
            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-[10.5px] font-medium t">
              <Clock className="w-3 h-3" />
              <span>Ends: {timeLeft}</span>
            </div>
          )}

          {/* Timeframe Toggle */}
          <div className="flex p-0.5 rounded-md bg-zinc-100 dark:bg-[#11111a] border border-zinc-200 dark:border-[#1a1a26]">
            <button
              onClick={() => setTimeframe("weekly")}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ${
                timeframe === "weekly"
                  ? "bg-white dark:bg-[#1e1e2a] text-zinc-900 dark:text-[#ebebef] shadow-subtle"
                  : "text-zinc-500 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-[#ebebef]"
              }`}
            >
              <Flame className="w-3 h-3 text-orange-500" />
              This Week
            </button>
            <button
              onClick={() => setTimeframe("all-time")}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                timeframe === "all-time"
                  ? "bg-white dark:bg-[#1e1e2a] text-zinc-900 dark:text-[#ebebef] shadow-subtle"
                  : "text-zinc-500 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-[#ebebef]"
              }`}
            >
              All Time
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills Strip */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1" role="tablist">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            role="tab"
            aria-selected={activeCategory === cat.id}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
              activeCategory === cat.id
                ? "bg-zinc-900 text-white dark:bg-[#1e1e2a] dark:text-[#ebebef] border border-transparent dark:border-[#2a2a3a]"
                : "bg-white dark:bg-[#11111a] text-zinc-500 dark:text-[#8b8b9e] border border-zinc-200 dark:border-[#1a1a26] hover:border-zinc-300 dark:hover:border-[#262636]"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Table Container (per anti-generic table_dark spec) */}
      <div className="rounded-lg border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 py-2 px-4 bg-zinc-50 dark:bg-[#0c0c10] border-b border-zinc-200 dark:border-[#1a1a26] text-[9.5px] font-medium uppercase tracking-[0.08em] text-zinc-500 dark:text-[#5a5a6e]">
          <div className="col-span-1">Rank</div>
          <div className="col-span-5">Candidate</div>
          <div className="col-span-3 text-right sm:text-left">Track / Mode</div>
          <div className="col-span-3 text-right">Score & Accuracy</div>
        </div>

        {/* Table Body */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 text-[#5e6ad2] animate-spin" />
            <span className="text-xs text-zinc-500 dark:text-[#8b8b9e]">Loading leaderboard data...</span>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-[#161622]">
            {(data.length > 0
              ? data.slice(0, 10)
              : [
                  { id: "b1", nickname: "Ananya R. (KLU-CSE)", score: 49, total_questions: 50, completed_at: "2026-09-24", isBenchmark: true },
                  { id: "b2", nickname: "Karthik V. (KLU-CSIT)", score: 47, total_questions: 50, completed_at: "2026-09-24", isBenchmark: true },
                  { id: "b3", nickname: "Sai Teja P. (KLU-ECE)", score: 45, total_questions: 50, completed_at: "2026-09-23", isBenchmark: true },
                  { id: "b4", nickname: "Meghana M. (KLU-AI&DS)", score: 44, total_questions: 50, completed_at: "2026-09-23", isBenchmark: true },
                  { id: "b5", nickname: "Rohit K. (KLU-CSE)", score: 42, total_questions: 50, completed_at: "2026-09-22", isBenchmark: true },
                ]
            ).map((entry, index) => {
              const percentage = Math.round((entry.score / entry.total_questions) * 100);
              const isTopThree = index < 3;
              const isBenchmark = "isBenchmark" in entry && entry.isBenchmark;

              return (
                <div
                  key={`${entry.nickname}-${entry.completed_at}-${index}`}
                  className="grid grid-cols-12 items-center py-2.5 px-4 text-xs transition-colors hover:bg-zinc-50 dark:hover:bg-white/[0.015]"
                >
                  {/* Rank */}
                  <div className="col-span-1 flex items-center">
                    <span
                      className={`inline-flex items-center justify-center w-5 h-5 rounded text-[11px] font-semibold tabular-nums t ${
                        index === 0
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          : index === 1
                          ? "bg-slate-500/10 text-slate-600 dark:text-slate-300 border border-slate-500/20"
                          : index === 2
                          ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20"
                          : "text-zinc-400 dark:text-[#5a5a6e]"
                      }`}
                    >
                      {index + 1}
                    </span>
                  </div>

                  {/* Candidate Nickname */}
                  <div className="col-span-5 flex items-center gap-2 min-w-0 pr-2">
                    <span className="font-semibold text-zinc-900 dark:text-[#ebebef] truncate text-[12px]">
                      {entry.nickname}
                    </span>
                    {isTopThree && (
                      <span className="hidden sm:inline-block px-1.5 py-[0.5px] rounded text-[9px] uppercase font-bold tracking-wider bg-[#5e6ad2]/10 text-[#5e6ad2]">
                        {isBenchmark ? "Benchmark" : "Elite"}
                      </span>
                    )}
                  </div>

                  {/* Track info */}
                  <div className="col-span-3 text-right sm:text-left text-zinc-400 dark:text-[#5a5a6e] text-[11px] truncate">
                    {CATEGORY_MAP[activeCategory] || activeCategory.toUpperCase()}
                  </div>

                  {/* Score & Accuracy */}
                  <div className="col-span-3 flex items-center justify-end gap-2">
                    <div className="text-right">
                      <span className="font-semibold text-zinc-900 dark:text-[#ebebef] tabular-nums t text-[12px]">
                        {entry.score}/{entry.total_questions}
                      </span>
                      <span className="ml-1.5 text-[10.5px] font-medium text-emerald-600 dark:text-emerald-400/80 tabular-nums t">
                        ({percentage}%)
                      </span>
                    </div>

                    {isAdmin && !isBenchmark && (
                      <button
                        onClick={() => handleDelete(entry.id, entry.nickname)}
                        className="p-1 text-zinc-400 hover:text-red-500 transition-colors ml-1"
                        title="Remove result"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
