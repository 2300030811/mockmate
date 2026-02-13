"use client";

import { useEffect, useState } from "react";
import { getRecentResults } from "@/app/actions/results";
import { getRecentCareerPaths } from "@/app/actions/career-save";
import { getSessionId } from "@/utils/session";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Clock, ChevronRight, BarChart3, RotateCcw, Briefcase, Map } from "lucide-react";
import Link from "next/link";

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

export function ResultsHistory() {
  const [results, setResults] = useState<QuizResult[]>([]);
  const [careerPaths, setCareerPaths] = useState<CareerPathEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      const sessionId = getSessionId();
      const [quizHistory, careerHistory] = await Promise.all([
        getRecentResults(sessionId),
        getRecentCareerPaths(sessionId)
      ]);
      setResults(quizHistory as QuizResult[]);
      setCareerPaths(careerHistory as CareerPathEntry[]);
      setLoading(false);
    }
    loadHistory();
  }, []);

  if (loading) return null;
  const hasData = results.length > 0 || careerPaths.length > 0;
  if (!hasData) return null;

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-20 text-left"
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

      <div className="space-y-12">
        {/* Quiz Results */}
        {results.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-6 flex items-center gap-2">
              <Trophy className="w-4 h-4" /> Recent Quizzes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {results.map((result, idx) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="group relative overflow-hidden bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border border-white/20 dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-500 px-2 py-1 bg-blue-500/10 rounded-md">
                        {result.category}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {new Date(result.completed_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-3xl font-black text-gray-900 dark:text-white">
                          {Math.round((result.score / result.total_questions) * 100)}%
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {result.score}/{result.total_questions} Correct
                        </p>
                      </div>
                      
                      <Link
                        href={`/${result.category === 'pcap' ? 'pcap-quiz' : result.category + '-quiz'}`}
                        className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-300"
                      >
                        <RotateCcw className="w-5 h-5" />
                      </Link>
                    </div>

                    <div className="mt-4 h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <motion.div 
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
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Career Paths */}
        {careerPaths.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-6 flex items-center gap-2">
              <Map className="w-4 h-4" /> Career Roadmaps
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {careerPaths.map((path, idx) => (
                  <motion.div
                    key={path.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="group relative overflow-hidden bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border border-white/20 dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                         <div className="p-1.5 bg-purple-500/10 rounded-lg">
                           <Briefcase className="w-4 h-4 text-purple-500" />
                         </div>
                         <span className="text-xs font-bold text-gray-700 dark:text-gray-200 truncate max-w-[120px]">
                           {path.job_role}
                         </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        {new Date(path.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-3xl font-black text-gray-900 dark:text-white">
                          {path.match_score}%
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                           Match Score
                        </p>
                      </div>
                      
                      <Link
                        href="/career-path"
                        className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-all duration-300"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Link>
                    </div>

                    <div className="mt-4 h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${path.match_score}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </motion.section>
  );
}

