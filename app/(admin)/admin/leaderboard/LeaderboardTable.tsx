"use client";

import { deleteResult } from "@/app/actions/admin";
import { toast } from "sonner";
import { useState, useTransition } from "react";
import { Search, Trash2 } from "lucide-react";

interface Result {
  id: string;
  nickname: string;
  category: string;
  score: number;
  total_questions: number;
  completed_at: string;
  session_id: string;
}

export function LeaderboardTable({ results }: { results: Result[] }) {
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const handleDelete = (id: string, nickname: string) => {
    if (!confirm(`Are you sure you want to delete the result for "${nickname || 'Guest'}"? This cannot be undone.`)) {
      return;
    }

    startTransition(async () => {
      const res = await deleteResult(id);
      if (res.success) {
        toast.success("Result deleted successfully");
      } else {
        toast.error(`Failed to delete: ${res.error}`);
      }
    });
  };

  // Get unique categories for the filter
  const categories = Array.from(new Set(results.map((r) => r.category)));

  // Filter results
  const filteredResults = results.filter((result) => {
    const matchesSearch =
      (result.nickname || "Guest").toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.session_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || result.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search nickname or session ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full sm:w-auto px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none capitalize transition-all"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-xl border bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="h-12 px-4 font-medium align-middle">Nickname</th>
              <th className="h-12 px-4 font-medium align-middle">Score</th>
              <th className="h-12 px-4 font-medium align-middle">Category</th>
              <th className="h-12 px-4 font-medium align-middle">Date</th>
               <th className="h-12 px-4 font-medium align-middle">Session ID</th>
              <th className="h-12 px-4 font-medium align-middle text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredResults.length === 0 ? (
                <tr>
                    <td colSpan={6} className="p-8 text-center opacity-50">No results found.</td>
                </tr>
            ) : filteredResults.map((result) => (
              <tr key={result.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="p-4 align-middle font-medium">
                    {result.nickname || <span className="opacity-40 italic">Guest</span>}
                </td>
                <td className="p-4 align-middle">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold
                    ${(result.score / result.total_questions) >= 0.7 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}
                  `}>
                     {result.score}/{result.total_questions}
                  </span>
                </td>
                <td className="p-4 align-middle uppercase tracking-wide text-xs opacity-70">
                  {result.category}
                </td>
                <td className="p-4 align-middle text-gray-500">
                  {new Date(result.completed_at).toLocaleDateString()}
                </td>
                 <td className="p-4 align-middle text-xs font-mono opacity-40 truncate max-w-[100px]" title={result.session_id}>
                  {result.session_id}
                </td>
                <td className="p-4 align-middle text-right">
                  <button
                    onClick={() => handleDelete(result.id, result.nickname)}
                    disabled={isPending}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                    title="Delete Result"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
}
