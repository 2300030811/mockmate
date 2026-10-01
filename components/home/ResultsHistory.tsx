"use client";

import { useEffect, useState } from "react";
import { getRecentResults } from "@/app/actions/results";
import { getRecentCareerPaths } from "@/app/actions/career-save";
import { getRecentCareerOpsApplications, getRecentCareerOpsFollowUps } from "@/app/actions/career-ops";
import { Trophy, Clock, ChevronRight, BarChart3, RotateCcw, Briefcase, Map, BellRing } from "lucide-react";
import Link from "next/link";
import type { CareerOpsApplicationItem, CareerOpsRecentActivityItem } from "@/types/career-ops";
import { ClientDate } from "@/components/ui/ClientDate";
import { isArenaCategory, parseArenaBaseCategory } from "@/lib/arena-category";

interface QuizResult {
  id: string;
  category: string;
  score: number;
  total_questions: number;
  completed_at: string;
  quiz_mode?: "standard" | "arena" | "daily-challenge";
  arena_status?: "win" | "loss" | "tie" | null;
}

interface CareerPathEntry {
  id: string;
  job_role: string;
  company: string;
  match_score: number;
  created_at: string;
}

const STATUS_STYLES: Record<string, string> = {
  evaluated: "bg-slate-500/10 text-slate-500 border border-slate-500/20",
  applied: "bg-blue-500/10 text-blue-500 border border-blue-500/20",
  responded: "bg-cyan-500/10 text-cyan-500 border border-cyan-500/20",
  interview: "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20",
  offer: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
  rejected: "bg-rose-500/10 text-rose-500 border border-rose-500/20",
  discarded: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
  skip: "bg-gray-500/10 text-gray-500 border border-gray-500/20",
};

export function ResultsHistory() {
  const [results, setResults] = useState<QuizResult[]>([]);
  const [careerPaths, setCareerPaths] = useState<CareerPathEntry[]>([]);
  const [trackerApps, setTrackerApps] = useState<CareerOpsApplicationItem[]>([]);
  const [recentFollowUps, setRecentFollowUps] = useState<CareerOpsRecentActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [recentResults, recentPaths, recentApps, followUps] = await Promise.all([
          getRecentResults(),
          getRecentCareerPaths(),
          getRecentCareerOpsApplications(4),
          getRecentCareerOpsFollowUps(3),
        ]);

        if (isMounted) {
          setResults(recentResults);
          setCareerPaths(recentPaths);
          setTrackerApps(recentApps);
          setRecentFollowUps(followUps);
        }
      } catch (err) {
        console.error("Failed to load recent activity:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const hasContent = results.length > 0 || careerPaths.length > 0 || trackerApps.length > 0;
  if (!loading && !hasContent) return null;

  return (
    <section className="text-left space-y-4" aria-label="Recent Candidate Activity">
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-[#1e1e2a] pb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-3.5 h-3.5 text-[#5e6ad2]" />
          <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-500 dark:text-[#8b8b9e]">
            Recent Candidate Activity
          </h2>
        </div>
      </div>

      <div className="space-y-6">
        {/* Quiz Results */}
        {results.length > 0 && (
          <div>
            <h3 className="text-xs font-medium text-zinc-500 dark:text-[#8b8b9e] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-zinc-400" /> Recent Assessments
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {results.slice(0, 4).map((result) => {
                const isArena = result.quiz_mode === "arena" || isArenaCategory(result.category);
                const isPDF = result.category.startsWith("PDF:");

                let displayCat = result.category;
                if (isArena) {
                  displayCat = parseArenaBaseCategory(result.category).toUpperCase() + " ARENA";
                } else if (isPDF) {
                  displayCat = "PDF QUIZ";
                } else {
                  displayCat = result.category.toUpperCase();
                }

                const quizSlug = parseArenaBaseCategory(result.category);
                const href = isArena
                  ? "/arena"
                  : isPDF
                  ? "/upload"
                  : result.quiz_mode === "daily-challenge" || result.category === "daily-challenge"
                  ? "/daily-challenge"
                  : `/${quizSlug === "pcap" ? "pcap-quiz" : quizSlug + "-quiz"}`;

                const percentage = Math.round((result.score / result.total_questions) * 100);

                return (
                  <div
                    key={result.id}
                    className="rounded-lg border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] p-4 flex flex-col justify-between hover:border-zinc-300 dark:hover:border-[#2a2a3a] transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9.5px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-[#181824] text-zinc-600 dark:text-[#8b8b9e] border border-zinc-200 dark:border-[#1e1e2a]">
                          {displayCat}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-zinc-400 dark:text-[#5a5a6e]">
                          <Clock className="w-3 h-3" />
                          <ClientDate date={result.completed_at} placeholder="..." />
                        </div>
                      </div>

                      <div className="flex items-baseline justify-between mt-3">
                        <div>
                          <p className="text-xl font-semibold text-zinc-900 dark:text-[#ebebef] tabular-nums t leading-none">
                            {percentage}%
                          </p>
                          <p className="text-[11px] text-zinc-500 dark:text-[#8b8b9e] mt-1 tabular-nums t">
                            {result.score}/{result.total_questions} Correct
                          </p>
                        </div>

                        <Link
                          href={href}
                          className="p-1.5 rounded-[5px] bg-zinc-100 dark:bg-[#181824] hover:bg-zinc-200 dark:hover:bg-[#222232] text-zinc-600 dark:text-[#ebebef] transition-colors"
                          title="Retake Quiz"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>

                    <div className="mt-3 h-1 w-full bg-zinc-100 dark:bg-[#1e1e2a] rounded-full overflow-hidden">
                      <div
                        style={{ width: `${percentage}%` }}
                        className={`h-full ${
                          percentage >= 70 ? "bg-emerald-500/80" : "bg-amber-500/80"
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Career Paths */}
        {careerPaths.length > 0 && (
          <div>
            <h3 className="text-xs font-medium text-zinc-500 dark:text-[#8b8b9e] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Map className="w-3.5 h-3.5 text-zinc-400" /> Target Roadmaps
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {careerPaths.slice(0, 4).map((path) => (
                <div
                  key={path.id}
                  className="rounded-lg border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] p-4 flex flex-col justify-between hover:border-zinc-300 dark:hover:border-[#2a2a3a] transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Briefcase className="w-3.5 h-3.5 text-[#5e6ad2] shrink-0" />
                        <span className="text-xs font-semibold text-zinc-800 dark:text-[#ebebef] truncate">
                          {path.job_role}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-400 dark:text-[#5a5a6e]">
                        <ClientDate date={path.created_at} placeholder="..." />
                      </div>
                    </div>

                    <div className="flex items-baseline justify-between mt-3">
                      <div>
                        <p className="text-xl font-semibold text-zinc-900 dark:text-[#ebebef] tabular-nums t leading-none">
                          {path.match_score}%
                        </p>
                        <p className="text-[11px] text-zinc-500 dark:text-[#8b8b9e] mt-1">
                          Role Match Score
                        </p>
                      </div>

                      <Link
                        href="/career-path"
                        className="p-1.5 rounded-[5px] bg-zinc-100 dark:bg-[#181824] hover:bg-zinc-200 dark:hover:bg-[#222232] text-zinc-600 dark:text-[#ebebef] transition-colors"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  <div className="mt-3 h-1 w-full bg-zinc-100 dark:bg-[#1e1e2a] rounded-full overflow-hidden">
                    <div
                      style={{ width: `${path.match_score}%` }}
                      className="h-full bg-[#5e6ad2]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tracker Applications */}
        {(trackerApps.length > 0 || recentFollowUps.length > 0) && (
          <div>
            <h3 className="text-xs font-medium text-zinc-500 dark:text-[#8b8b9e] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-zinc-400" /> Application Pipeline
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
              {trackerApps.map((application) => {
                const statusClass =
                  STATUS_STYLES[application.status] || "bg-zinc-100 dark:bg-[#181824] text-zinc-500";

                return (
                  <div
                    key={application.id}
                    className="rounded-lg border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] p-4 flex flex-col justify-between hover:border-zinc-300 dark:hover:border-[#2a2a3a] transition-colors"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-2 gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-zinc-900 dark:text-[#ebebef] truncate">
                            {application.jobRole}
                          </p>
                          <p className="text-[11px] text-zinc-500 dark:text-[#8b8b9e] truncate">
                            {application.company}
                          </p>
                        </div>
                        <span className={`text-[9.5px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${statusClass}`}>
                          {application.status}
                        </span>
                      </div>

                      <div className="text-[11px] text-zinc-500 dark:text-[#8b8b9e] space-y-1 mt-2">
                        <p className="flex items-center gap-1">
                          Follow-up: {application.nextFollowUpDate ? <ClientDate date={application.nextFollowUpDate} /> : "None"}
                        </p>
                        <p className="t">
                          Match score: {application.matchScore ? `${application.matchScore}%` : "Pending"}
                        </p>
                      </div>
                    </div>

                    <Link
                      href="/career-path"
                      className="inline-flex items-center gap-1 mt-3 text-[11px] font-medium text-[#5e6ad2] hover:underline"
                    >
                      Open Pipeline <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                );
              })}
            </div>

            {recentFollowUps.length > 0 && (
              <div className="rounded-md border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50 dark:bg-[#101017] p-3 text-xs">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b8b9e] mb-2 flex items-center gap-1.5">
                  <BellRing className="w-3 h-3 text-[#5e6ad2]" /> Upcoming Follow-ups
                </p>
                <div className="space-y-1.5">
                  {recentFollowUps.map((item) => (
                    <div
                      key={item.id}
                      className="text-[11.5px] text-zinc-600 dark:text-[#8b8b9e] flex items-center justify-between gap-3"
                    >
                      <span className="truncate">
                        {item.jobRole} at {item.company}
                      </span>
                      <span className="text-[#5e6ad2] font-medium uppercase tracking-wide text-[10px]">
                        {item.channel} · <ClientDate date={item.followedUpOn} />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
