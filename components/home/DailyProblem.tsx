"use client";

import { useState, useEffect } from "react";
import { ChevronRight, Zap, Flame, CheckCircle2, TrendingUp, Code2, Play, Terminal } from "lucide-react";
import Link from "next/link";
import { useStreak } from "@/hooks/useStreak";
import { DAILY_PROBLEMS } from "@/utils/daily-problems";

export function DailyProblem() {
  const { streak, solvedToday, isLoaded, streakMultiplier } = useStreak();
  const [problem, setProblem] = useState(DAILY_PROBLEMS[0]);
  const [activeTab, setActiveTab] = useState<"spec" | "code">("code");
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    const day = new Date().getDate();
    setProblem(DAILY_PROBLEMS[day % DAILY_PROBLEMS.length]);
  }, []);

  const handleSimulateTest = () => {
    setIsRunningTest(true);
    setTestResult(null);
    setTimeout(() => {
      setIsRunningTest(false);
      setTestResult("Test 1: Output [2, 2] == Expected [2, 2] · 14ms (Passed)");
    }, 450);
  };

  if (!isLoaded || !problem) return null;

  return (
    <div
      className="rounded-lg border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] p-5 sm:p-6 text-left transition-colors shadow-surface"
      aria-label="Daily Technical Challenge"
    >
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-[#1e1e2a] pb-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.08em] px-2 py-0.5 rounded bg-[#5e6ad2]/10 text-[#5e6ad2] border border-[#5e6ad2]/20">
              Daily Challenge
            </span>

            <span className="flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 t">
              <Zap className="w-3 h-3 fill-current" />
              {problem.points} PTS
            </span>

            {streak > 0 && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-orange-600 dark:text-orange-400 t">
                <Flame className="w-3 h-3 fill-current" />
                {streak} Day Streak
              </span>
            )}

            {streakMultiplier > 1 && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 t">
                <TrendingUp className="w-3 h-3" />
                {streakMultiplier}x XP
              </span>
            )}
          </div>

          <h3 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-[#ebebef] tracking-[-0.015em]">
            {problem.title}
          </h3>
        </div>

        {/* Tab Switcher & Full Launch CTA */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-md border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50 dark:bg-[#0e0e14] p-0.5">
            <button
              onClick={() => setActiveTab("code")}
              className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
                activeTab === "code"
                  ? "bg-white dark:bg-[#181824] text-zinc-900 dark:text-[#ebebef] shadow-subtle"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-[#8b8b9e] dark:hover:text-[#ebebef]"
              }`}
            >
              Code Preview
            </button>
            <button
              onClick={() => setActiveTab("spec")}
              className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
                activeTab === "spec"
                  ? "bg-white dark:bg-[#181824] text-zinc-900 dark:text-[#ebebef] shadow-subtle"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-[#8b8b9e] dark:hover:text-[#ebebef]"
              }`}
            >
              Description
            </button>
          </div>

          <Link
            href="/daily-challenge"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-xs font-semibold transition-all ${
              solvedToday
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-zinc-900 text-white dark:bg-[#ebebef] dark:text-[#0d0d12] hover:bg-zinc-800 dark:hover:bg-white shadow-subtle"
            }`}
          >
            {solvedToday ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Solved</span>
              </>
            ) : (
              <>
                <span>Sandbox</span>
                <ChevronRight className="w-3 h-3" />
              </>
            )}
          </Link>
        </div>
      </div>

      {/* Living Interactive Code / Spec Area */}
      <div className="mt-4">
        {activeTab === "code" ? (
          <div className="rounded-[6px] border border-zinc-200 dark:border-[#1a1a24] bg-zinc-50 dark:bg-[#0c0c12] p-3 font-mono text-xs">
            {/* Header / Test Run Trigger */}
            <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-[#1a1a26] pb-2 mb-2 text-[10.5px]">
              <span className="text-zinc-500 dark:text-[#6e6e84] flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-[#5e6ad2]" />
                solution.py · Python 3.11
              </span>
              <button
                onClick={handleSimulateTest}
                disabled={isRunningTest}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors"
              >
                <Play className="w-3 h-3 fill-current" />
                {isRunningTest ? "Running..." : "Run Test Preview"}
              </button>
            </div>

            {/* Code Body */}
            <pre className="text-zinc-700 dark:text-[#c4c4d4] leading-relaxed overflow-x-auto text-[11.5px]">
              <code>
                <span className="text-blue-500 dark:text-blue-400">def</span>{" "}
                <span className="text-yellow-600 dark:text-yellow-300">intersect</span>(nums1: list[int], nums2: list[int]) -&gt; list[int]:{"\n"}
                {"    "}counts = Counter(nums1){"\n"}
                {"    "}result = []{"\n"}
                {"    "}<span className="text-purple-600 dark:text-purple-400">for</span> x <span className="text-purple-600 dark:text-purple-400">in</span> nums2:{"\n"}
                {"        "}<span className="text-purple-600 dark:text-purple-400">if</span> counts[x] &gt; 0:{"\n"}
                {"            "}result.append(x){"\n"}
                {"            "}counts[x] -= 1{"\n"}
                {"    "}<span className="text-purple-600 dark:text-purple-400">return</span> result
              </code>
            </pre>

            {/* Test Simulation Output */}
            {testResult && (
              <div className="mt-2.5 pt-2 border-t border-zinc-200/80 dark:border-[#1a1a26] text-[10.5px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 animate-fadeIn">
                <CheckCircle2 className="w-3 h-3" />
                <span>{testResult}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2 text-xs text-zinc-600 dark:text-[#8b8b9e] leading-relaxed py-1">
            <p>{problem.description || "Given two integer arrays nums1 and nums2, return an array of their intersection. Each element in the result must appear as many times as it shows in both arrays and you may return the result in any order."}</p>
            <div className="flex items-center gap-2 pt-1 font-mono text-[10.5px] text-zinc-400 dark:text-[#6e6e84]">
              <span>Time Complexity: O(N + M)</span>
              <span>•</span>
              <span>Space Complexity: O(min(N, M))</span>
            </div>
          </div>
        )}
      </div>

      {/* Difficulty & Category Tags */}
      <div className="flex items-center justify-between pt-3 mt-3 border-t border-zinc-100 dark:border-[#1a1a26] text-[10.5px]">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded font-medium bg-zinc-100 dark:bg-[#181824] text-zinc-600 dark:text-[#8b8b9e] border border-zinc-200 dark:border-[#1e1e2a]">
            {problem.category}
          </span>
          <span
            className={`px-2 py-0.5 rounded font-medium border ${
              problem.difficulty === "Easy"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                : problem.difficulty === "Medium"
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
            }`}
          >
            {problem.difficulty}
          </span>
        </div>
        <span className="text-zinc-400 dark:text-[#5a5a6e]">
          {solvedToday ? "Streak preserved for 24h" : "Average execution: 8 mins"}
        </span>
      </div>
    </div>
  );
}

