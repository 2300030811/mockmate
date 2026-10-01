"use client";

import { deleteResult } from "@/app/actions/admin";
import { toast } from "sonner";
import { useState, useTransition } from "react";
import { Search, Trash2, X, Filter, Loader2, User, Trophy } from "lucide-react";
import { ClientDate } from "@/components/ui/ClientDate";

interface Result {
  id: string;
  nickname: string;
  category: string;
  score: number;
  total_questions: number;
  completed_at: string;
  session_id: string;
  quiz_mode?: string;
}

export function LeaderboardTable({ results }: { results: Result[] }) {
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const handleDelete = (id: string, nickname: string) => {
    if (!confirm(`Are you sure you want to delete the result for "${nickname || 'Guest'}"? This action is permanent.`)) {
      return;
    }

    setDeletingId(id);
    startTransition(async () => {
      const res = await deleteResult(id);
      setDeletingId(null);
      if (res.success) {
        toast.success("Leaderboard entry deleted successfully");
      } else {
        toast.error(`Failed to delete: ${res.error}`);
      }
    });
  };

  // Get unique categories for filter
  const categories = Array.from(new Set(results.map((r) => r.category))).filter(Boolean);

  // Filter results
  const filteredResults = results.filter((result) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (result.nickname || "Guest").toLowerCase().includes(term) ||
      (result.session_id || "").toLowerCase().includes(term);
    const matchesCategory = categoryFilter === "all" || result.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex flex-1 items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 sm:max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              placeholder="Search candidate or session ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] rounded-xl focus:outline-none focus:border-[#5e6ad2] text-xs text-zinc-900 dark:text-[#ebebef] placeholder:text-zinc-400 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] rounded-xl focus:outline-none focus:border-[#5e6ad2] text-xs text-zinc-900 dark:text-[#ebebef] capitalize transition-colors cursor-pointer"
            >
              <option value="all">All Domains ({results.length})</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Counter Pill */}
        <div className="text-[11px] font-mono text-zinc-500 dark:text-[#8b8b9e] self-end sm:self-center">
          Showing <span className="font-bold text-zinc-900 dark:text-white">{filteredResults.length}</span> of {results.length} entries
        </div>
      </div>

      {/* Modern Table Container */}
      <div className="rounded-xl border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50/80 dark:bg-[#161622] text-zinc-400 dark:text-[#8b8b9e] border-b border-zinc-200 dark:border-[#1e1e2a]">
              <tr>
                <th className="h-10 px-4 font-mono text-[11px] uppercase tracking-wider">Candidate / Persona</th>
                <th className="h-10 px-4 font-mono text-[11px] uppercase tracking-wider">Score & Accuracy</th>
                <th className="h-10 px-4 font-mono text-[11px] uppercase tracking-wider">Domain Category</th>
                <th className="h-10 px-4 font-mono text-[11px] uppercase tracking-wider">Submission Date</th>
                <th className="h-10 px-4 font-mono text-[11px] uppercase tracking-wider">Session Key</th>
                <th className="h-10 px-4 font-mono text-[11px] uppercase tracking-wider text-right">Purge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-[#1e1e2a]/80">
              {filteredResults.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-zinc-400 dark:text-[#5a5a6e]">
                      <Filter className="w-8 h-8 opacity-40" />
                      <p className="font-medium text-xs">No matching leaderboard entries found.</p>
                      {(searchTerm || categoryFilter !== "all") && (
                        <button
                          onClick={() => {
                            setSearchTerm("");
                            setCategoryFilter("all");
                          }}
                          className="mt-1 text-xs text-[#5e6ad2] hover:underline"
                        >
                          Clear all filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredResults.map((result) => {
                  const isPassed =
                    result.total_questions > 0 &&
                    result.score / result.total_questions >= 0.7;
                  const pct =
                    result.total_questions > 0
                      ? Math.round((result.score / result.total_questions) * 100)
                      : 0;
                  const isBeingDeleted = deletingId === result.id;

                  return (
                    <tr
                      key={result.id}
                      className="hover:bg-zinc-50/70 dark:hover:bg-[#181824] transition-colors group"
                    >
                      {/* Nickname / Persona */}
                      <td className="p-3.5 px-4 align-middle">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-[#1e1e2a] flex items-center justify-center text-zinc-500 shrink-0">
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-semibold text-zinc-900 dark:text-[#ebebef]">
                              {result.nickname || <span className="opacity-50 italic">Guest Learner</span>}
                            </span>
                            {result.quiz_mode && result.quiz_mode !== "standard" && (
                              <span className="ml-1.5 text-[9px] font-mono uppercase px-1 py-0.2 rounded bg-[#5e6ad2]/15 text-[#5e6ad2]">
                                {result.quiz_mode}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Score & Accuracy */}
                      <td className="p-3.5 px-4 align-middle">
                        <div className="inline-flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                              isPassed
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                : "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/20"
                            }`}
                          >
                            {result.score}/{result.total_questions} ({pct}%)
                          </span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-3.5 px-4 align-middle">
                        <span className="font-mono text-[11px] uppercase tracking-wide px-2 py-0.5 rounded bg-zinc-100 dark:bg-[#1c1c28] text-zinc-700 dark:text-[#8b8b9e]">
                          {result.category}
                        </span>
                      </td>

                      {/* Completed At Date */}
                      <td className="p-3.5 px-4 align-middle text-zinc-500 dark:text-[#8b8b9e] font-mono text-[11px]">
                        <ClientDate date={result.completed_at} />
                      </td>

                      {/* Session ID */}
                      <td className="p-3.5 px-4 align-middle">
                        <span
                          className="font-mono text-[10px] text-zinc-400 dark:text-[#5a5a6e] truncate max-w-[120px] block"
                          title={result.session_id}
                        >
                          {result.session_id ? result.session_id.substring(0, 12) + "..." : "—"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 px-4 align-middle text-right">
                        <button
                          onClick={() => handleDelete(result.id, result.nickname)}
                          disabled={isPending || isBeingDeleted}
                          className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-40"
                          title="Purge Result"
                          aria-label={`Purge result for ${result.nickname || 'Guest'}`}
                        >
                          {isBeingDeleted ? (
                            <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
