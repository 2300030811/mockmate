"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { m } from "framer-motion";
import { getInterviewSessions } from "@/app/actions/interview-sessions";
import { ArrowLeft, Clock, BrainCircuit, Target, Mic, Code2, Users, ChevronRight } from "lucide-react";
import Link from "next/link";

interface SessionRow {
  id: string;
  type: string;
  difficulty: string;
  topic: string | null;
  stats: { wpm: number; sentiment: string; keyConcepts: string[]; confidenceScore: number } | null;
  duration_seconds: number;
  ai_summary: string | null;
  created_at: string;
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function scoreColor(score: number) {
  if (score > 80) return "text-green-400 bg-green-500/10 border-green-500/20";
  if (score > 60) return "text-blue-400 bg-blue-500/10 border-blue-500/20";
  return "text-amber-400 bg-amber-500/10 border-amber-500/20";
}

export default function InterviewHistoryPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getInterviewSessions(50);
        setSessions(data as SessionRow[]);
      } catch (err: unknown) {
        // Only redirect to login on auth errors, not generic failures
        const message = err instanceof Error ? err.message : String(err);
        if (message.includes("auth") || message.includes("not authenticated") || message.includes("JWT")) {
          router.push("/login?redirect=/demo/history");
        }
        // For other errors, just show empty state
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 font-mono animate-pulse">Loading Interview History...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-20 pt-24 px-4 sm:px-6 relative overflow-hidden selection:bg-purple-500/30">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-96 bg-purple-600/5 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-full h-96 bg-blue-600/5 blur-[120px]" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10 space-y-8">
        {/* Header */}
        <m.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <Link
              href="/demo"
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">
                Interview <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">History</span>
              </h1>
              <p className="text-sm text-gray-500 mt-1">{sessions.length} session{sessions.length !== 1 ? "s" : ""} recorded</p>
            </div>
          </div>
          <Link
            href="/demo"
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl font-semibold text-sm flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all active:scale-95"
          >
            <Mic size={16} />
            New Interview
          </Link>
        </m.div>

        {/* Empty State */}
        {sessions.length === 0 && (
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24"
          >
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <BrainCircuit size={36} className="text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-300 mb-2">No Interviews Yet</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Complete an AI mock interview and your session will appear here with detailed analytics.
            </p>
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold transition-colors"
            >
              Start Your First Interview
              <ChevronRight size={16} />
            </Link>
          </m.div>
        )}

        {/* Sessions List */}
        <div className="space-y-4">
          {sessions.map((session, idx) => {
            const score = session.stats?.confidenceScore ?? 0;
            return (
              <m.div
                key={session.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="group bg-gray-900/60 hover:bg-gray-900/80 border border-gray-800 hover:border-gray-700 rounded-2xl p-5 sm:p-6 transition-all cursor-default"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Type & Meta */}
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      session.type === "technical"
                        ? "bg-purple-500/10 border border-purple-500/20"
                        : "bg-blue-500/10 border border-blue-500/20"
                    }`}>
                      {session.type === "technical" ? (
                        <Code2 size={22} className="text-purple-400" />
                      ) : (
                        <Users size={22} className="text-blue-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-white capitalize flex items-center gap-2 flex-wrap">
                        {session.type} Interview
                        <span className="px-2 py-0.5 text-[10px] font-semibold uppercase bg-gray-800 text-gray-400 rounded-md border border-gray-700">
                          {session.difficulty}
                        </span>
                        {session.topic && (
                          <span className="px-2 py-0.5 text-[10px] font-semibold bg-purple-500/10 text-purple-400 rounded-md border border-purple-500/20 truncate max-w-[180px]">
                            {session.topic}
                          </span>
                        )}
                      </h3>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {formatDuration(session.duration_seconds)}
                        </span>
                        <span>{formatDate(session.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Score + Stats */}
                  <div className="flex items-center gap-4">
                    {session.stats && (
                      <>
                        <div className="hidden md:flex items-center gap-3 text-xs text-gray-500">
                          <span>{session.stats.wpm} WPM</span>
                          <span className="w-px h-4 bg-gray-800" />
                          <span>{session.stats.keyConcepts?.length ?? 0} topics</span>
                          <span className="w-px h-4 bg-gray-800" />
                          <span className={session.stats.sentiment === "Positive" ? "text-green-400" : session.stats.sentiment === "Anxious" ? "text-amber-400" : "text-gray-400"}>
                            {session.stats.sentiment}
                          </span>
                        </div>
                        <div className={`px-4 py-2 rounded-xl border font-bold text-lg tabular-nums ${scoreColor(score)}`}>
                          {score}%
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Key Concepts */}
                {session.stats?.keyConcepts && session.stats.keyConcepts.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-gray-800/50">
                    {session.stats.keyConcepts.slice(0, 8).map((concept, i) => (
                      <span key={i} className="px-2 py-0.5 text-[10px] bg-gray-800/50 text-gray-400 rounded-md border border-gray-700/50">
                        {concept}
                      </span>
                    ))}
                    {session.stats.keyConcepts.length > 8 && (
                      <span className="px-2 py-0.5 text-[10px] text-gray-600">
                        +{session.stats.keyConcepts.length - 8} more
                      </span>
                    )}
                  </div>
                )}
              </m.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
