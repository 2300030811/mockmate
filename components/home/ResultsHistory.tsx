"use client";

import { useEffect, useState } from "react";
import { getRecentResults } from "@/app/actions/results";
import { getRecentCareerPaths } from "@/app/actions/career-save";
import { getRecentCareerOpsApplications, getRecentCareerOpsFollowUps } from "@/app/actions/career-ops";
import { m, AnimatePresence } from "framer-motion";
import { Trophy, Clock, ChevronRight, BarChart3, RotateCcw, Briefcase, Map, BellRing } from "lucide-react";
import Link from "next/link";
import type { CareerOpsApplicationItem, CareerOpsRecentActivityItem } from "@/types/career-ops";
import { ClientDate } from "@/components/ui/ClientDate";

interface QuizResult {
  id: string;
  category: string;
  score: number;
  total_questions: number;
  completed_at: string;
}

interface CareerPathEntry {
  id: string;
  job_role: string;
  company: string;
  match_score: number;
  created_at: string;
}

const STATUS_STYLES: Record<string, string> = {
  evaluated: "bg-slate-500/10 text-slate-500",
  applied: "bg-blue-500/10 text-blue-500",
  responded: "bg-cyan-500/10 text-cyan-500",
  interview: "bg-indigo-500/10 text-indigo-500",
  offer: "bg-emerald-500/10 text-emerald-500",
  rejected: "bg-rose-500/10 text-rose-500",
  discarded: "bg-amber-500/10 text-amber-500",
  skip: "bg-gray-500/10 text-gray-500",
};

export function ResultsHistory() {
  const [results, setResults] = useState<QuizResult[]>([]);
  const [careerPaths, setCareerPaths] = useState<CareerPathEntry[]>([]);
  const [trackerApps, setTrackerApps] = useState<CareerOpsApplicationItem[]>([]);
  const [recentFollowUps, setRecentFollowUps] = useState<CareerOpsRecentActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      const [quizHistory, careerHistory, trackerHistory, followUpHistory] = await Promise.all([
        getRecentResults(),
        getRecentCareerPaths(),
        getRecentCareerOpsApplications(4),
        getRecentCareerOpsFollowUps(3)
      ]);
      setResults(quizHistory as QuizResult[]);
      setCareerPaths(careerHistory as CareerPathEntry[]);
      setTrackerApps(trackerHistory);
      setRecentFollowUps(followUpHistory);
      setLoading(false);
    }
    loadHistory();
  }, []);

  if (loading) return null;
  const hasData =
    results.length > 0 ||
    careerPaths.length > 0 ||
    trackerApps.length > 0 ||
    recentFollowUps.length > 0;
  if (!hasData) return null;

  return (
    <m.section 
      id="history"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-12 text-left"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <BarChart3 className="w-5 h-5 text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
            Your Activity
          </h2>
        </div>
      </div>

      <div className="space-y-8">
        {/* Quiz Results */}
        {results.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
              <Trophy className="w-4 h-4" /> Recent Quizzes
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <AnimatePresence mode="popLayout">
                {results.slice(0, 4).map((result, idx) => (
                  <m.div
                    key={result.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="group relative overflow-hidden bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border border-white/20 dark:border-gray-800 rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all duration-300"
                  >
                    {/* Display and Link Logic */}
                    {(() => {
                      const isArena = result.category.includes('arena');
                      const isPDF = result.category.startsWith('PDF:');
                      
                      // Sanitize category for display
                      let displayCat = result.category;
                      if (isArena) {
                        displayCat = result.category.replace(/^arena:[^:]+:/, '').toUpperCase() + " ARENA";
                      } else if (isPDF) {
                        displayCat = "PDF QUIZ";
                      } else {
                        displayCat = result.category.toUpperCase();
                      }

                      // Sanitize category for link
                      const quizSlug = result.category.replace(/^arena:[^:]+:/, '').replace(/^arena_/, '');
                      const href = isArena 
                        ? '/arena' 
                        : isPDF 
                          ? '/upload'
                          : result.category === 'daily-challenge'
                            ? '/daily-challenge'
                            : `/${quizSlug === 'pcap' ? 'pcap-quiz' : quizSlug + '-quiz'}`;

                      return (
                        <>
                          <div className="flex items-center justify-between mb-3">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                              isArena ? 'bg-red-500/10 text-red-500' : isPDF ? 'bg-purple-500/10 text-purple-500' : 'bg-blue-500/10 text-blue-500'
                            }`}>
                              {displayCat}
                            </span>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              <ClientDate date={result.completed_at} placeholder="..." />
                            </div>
                          </div>

                          <div className="flex items-end justify-between">
                            <div>
                              <p className="text-2xl font-black text-gray-900 dark:text-white">
                                {Math.round((result.score / result.total_questions) * 100)}%
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {result.score}/{result.total_questions} Correct
                              </p>
                            </div>
                            
                            <Link
                              href={href}
                              className={`p-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl transition-all duration-300 group-hover:text-white ${
                                isArena ? 'group-hover:bg-red-600' : isPDF ? 'group-hover:bg-purple-600' : 'group-hover:bg-blue-600'
                              }`}
                            >
                              <RotateCcw className="w-4 h-4" />
                            </Link>
                          </div>
                        </>
                      );
                    })()}

                    <div className="mt-3 h-1 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <m.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(result.score / result.total_questions) * 100}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className={`h-full bg-gradient-to-r ${
                          (result.score / result.total_questions) >= 0.7 
                            ? "from-emerald-500 to-teal-400" 
                            : "from-orange-500 to-yellow-400"
                        }`}
                      />
                    </div>
                  </m.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Career Paths */}
        {careerPaths.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
              <Map className="w-4 h-4" /> Career Roadmaps
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <AnimatePresence mode="popLayout">
                {careerPaths.slice(0, 4).map((path, idx) => (
                  <m.div
                    key={path.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="group relative overflow-hidden bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border border-white/20 dark:border-gray-800 rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                         <div className="p-1.5 bg-purple-500/10 rounded-lg">
                           <Briefcase className="w-4 h-4 text-purple-500" />
                         </div>
                         <span className="text-xs font-bold text-gray-700 dark:text-gray-200 truncate max-w-[120px]">
                           {path.job_role}
                         </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <ClientDate date={path.created_at} placeholder="..." />
                      </div>
                    </div>

                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-2xl font-black text-gray-900 dark:text-white">
                          {path.match_score}%
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                           Match Score
                        </p>
                      </div>
                      
                      <Link
                        href="/career-path"
                        className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-all duration-300"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>

                    <div className="mt-3 h-1 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <m.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${path.match_score}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      />
                    </div>
                  </m.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {(trackerApps.length > 0 || recentFollowUps.length > 0) && (
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
              <Briefcase className="w-4 h-4" /> Application Tracker
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {trackerApps.map((application, idx) => {
                const statusClass = STATUS_STYLES[application.status] || "bg-gray-500/10 text-gray-500";

                return (
                  <m.div
                    key={application.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="group relative overflow-hidden bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border border-white/20 dark:border-gray-800 rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-3 gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{application.jobRole}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{application.company}</p>
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${statusClass}`}>
                        {application.status}
                      </span>
                    </div>

                    <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                      <p className="flex items-center gap-1.5">
                        Next follow-up: {application.nextFollowUpDate ? <ClientDate date={application.nextFollowUpDate} /> : "Not set"}
                      </p>
                      <p>
                        Match score: {application.matchScore ?? "N/A"}
                      </p>
                    </div>

                    <Link
                      href="/career-path"
                      className="inline-flex items-center gap-1 mt-3 text-xs font-bold text-blue-500 hover:text-blue-400 transition-colors"
                    >
                      Open Tracker <ChevronRight className="w-3 h-3" />
                    </Link>
                  </m.div>
                );
              })}
            </div>

            {recentFollowUps.length > 0 && (
              <div className="rounded-2xl border border-blue-100 dark:border-blue-500/20 bg-blue-50/60 dark:bg-blue-500/5 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-300 mb-2 flex items-center gap-1.5">
                  <BellRing className="w-3.5 h-3.5" /> Recent Follow-ups
                </p>
                <div className="space-y-2">
                  {recentFollowUps.map((item) => (
                    <div
                      key={item.id}
                      className="text-xs text-gray-700 dark:text-gray-300 flex items-center justify-between gap-3"
                    >
                      <span className="truncate">
                        {item.jobRole} at {item.company}
                      </span>
                      <span className="text-blue-600 dark:text-blue-300 font-semibold uppercase tracking-wide flex items-center gap-1.5">
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
    </m.section>
  );
}

