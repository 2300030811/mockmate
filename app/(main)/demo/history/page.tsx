"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { m } from "framer-motion";
import { getInterviewSessions } from "@/app/actions/interview-sessions";
import { ArrowLeft, Clock, BrainCircuit, Target, Mic, Code2, Users, ChevronRight } from "lucide-react";
import Link from "next/link";
import { ClientDate } from "@/components/ui/ClientDate";

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

const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
};

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
      <div className="min-h-screen bg-white dark:bg-[#0d0d12] text-zinc-900 dark:text-[#ebebef] pt-14 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#5e6ad2] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono text-zinc-500 dark:text-[#8b8b9e] animate-pulse">Loading Interview History...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0d12] text-zinc-900 dark:text-[#ebebef] pt-14 pb-20 selection:bg-[#5e6ad2]/20 transition-colors relative overflow-hidden">
      {/* 28px Precision Grid Background */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden="true">
        <div
          className="absolute inset-0 opacity-40 dark:opacity-25 text-zinc-400 dark:text-zinc-600"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "28px 28px",
            maskImage: "linear-gradient(to bottom, black 25%, transparent 95%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 25%, transparent 95%)",
          }}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[1px] bg-gradient-to-r from-transparent via-[#5e6ad2]/50 to-transparent dark:via-[#5e6ad2]/40" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 relative z-10 space-y-6">
        {/* Breadcrumb & Navigation Bar */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-[#1e1e2a]">
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-[#8b8b9e]">
            <Link href="/" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
              Home
            </Link>
            <span className="opacity-40">/</span>
            <Link href="/demo" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
              AI Mock Interview
            </Link>
            <span className="opacity-40">/</span>
            <span className="text-zinc-900 dark:text-[#ebebef]">History</span>
          </div>

          <Link
            href="/demo"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#5e6ad2] hover:bg-[#4f5ac4] text-white rounded-md font-medium text-xs shadow-subtle transition-all active:scale-95"
          >
            <Mic size={14} />
            <span>New Interview</span>
          </Link>
        </div>

        {/* Header Title */}
        <m.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-4"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wide uppercase bg-[#5e6ad2]/10 text-[#5e6ad2] border border-[#5e6ad2]/20 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5e6ad2]" />
              SESSION TELEMETRY ARCHIVE
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-[#ebebef]">
              Interview Performance History
            </h1>
            <p className="text-xs text-zinc-500 dark:text-[#8b8b9e] mt-1">
              {sessions.length} recorded session{sessions.length !== 1 ? "s" : ""} with real-time feedback and rubric diagnostics
            </p>
          </div>
        </m.div>

        {/* Empty State */}
        {sessions.length === 0 && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-zinc-50 dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] rounded-xl p-8"
          >
            <div className="w-12 h-12 bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 rounded-xl flex items-center justify-center mx-auto mb-4 text-[#5e6ad2]">
              <BrainCircuit size={24} />
            </div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-[#ebebef] mb-1">
              No Recorded Interviews
            </h3>
            <p className="text-xs text-zinc-500 dark:text-[#8b8b9e] mb-6 max-w-sm mx-auto">
              Launch an AI mock interview track to record your voice cadence, code compilation, and STAR rubric feedback.
            </p>
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#5e6ad2] hover:bg-[#4f5ac4] text-white rounded-lg text-xs font-semibold shadow-subtle transition-colors"
            >
              <span>Launch Your First Interview</span>
              <ChevronRight size={14} />
            </Link>
          </m.div>
        )}

        {/* Sessions List */}
        <div className="space-y-3">
          {sessions.map((session, idx) => {
            const score = session.stats?.confidenceScore ?? 0;
            return (
              <m.div
                key={session.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="group bg-white dark:bg-[#14141e] hover:border-zinc-300 dark:hover:border-[#2e2e42] border border-zinc-200 dark:border-[#1e1e2a] rounded-xl p-4 sm:p-5 transition-all shadow-subtle"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Type & Meta */}
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${
                        session.type === "technical"
                          ? "bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400"
                          : "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400"
                      }`}
                    >
                      {session.type === "technical" ? <Code2 size={20} /> : <Users size={20} />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-[#ebebef] capitalize">
                          {session.type} Simulation
                        </h3>
                        <span className="px-1.5 py-0.5 text-[9.5px] font-mono font-medium uppercase bg-zinc-100 dark:bg-[#181824] text-zinc-600 dark:text-[#8b8b9e] rounded border border-zinc-200 dark:border-[#1e1e2a]">
                          {session.difficulty}
                        </span>
                        {session.topic && (
                          <span className="px-1.5 py-0.5 text-[9.5px] font-mono bg-[#5e6ad2]/10 text-[#5e6ad2] rounded border border-[#5e6ad2]/20 truncate max-w-[200px]">
                            {session.topic}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-1 text-[11px] text-zinc-500 dark:text-[#8b8b9e]">
                        <span className="flex items-center gap-1 font-mono">
                          <Clock size={11} />
                          {formatDuration(session.duration_seconds)}
                        </span>
                        <span>•</span>
                        <span>
                          <ClientDate date={session.created_at} options={DATE_OPTIONS} />
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Score + Stats */}
                  <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
                    {session.stats && (
                      <div className="hidden md:flex items-center gap-3 text-xs text-zinc-500 dark:text-[#8b8b9e] font-mono">
                        <span>{session.stats.wpm} WPM</span>
                        <span className="w-px h-3 bg-zinc-200 dark:bg-[#1e1e2a]" />
                        <span>{session.stats.keyConcepts?.length ?? 0} concepts</span>
                        <span className="w-px h-3 bg-zinc-200 dark:bg-[#1e1e2a]" />
                        <span
                          className={
                            session.stats.sentiment === "Positive"
                              ? "text-emerald-500"
                              : session.stats.sentiment === "Anxious"
                              ? "text-amber-500"
                              : "text-zinc-500 dark:text-zinc-400"
                          }
                        >
                          {session.stats.sentiment}
                        </span>
                      </div>
                    )}

                    <div
                      className={`px-3 py-1.5 rounded-lg border font-mono font-bold text-sm tabular-nums ${
                        score > 80
                          ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                          : score > 60
                          ? "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20"
                          : "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20"
                      }`}
                    >
                      {score}% Score
                    </div>
                  </div>
                </div>

                {/* Key Concepts */}
                {session.stats?.keyConcepts && session.stats.keyConcepts.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-zinc-100 dark:border-[#1e1e2a]">
                    {session.stats.keyConcepts.slice(0, 8).map((concept, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 text-[9.5px] font-mono bg-zinc-100 dark:bg-[#181824] text-zinc-600 dark:text-[#8b8b9e] rounded border border-zinc-200 dark:border-[#1e1e2a]"
                      >
                        {concept}
                      </span>
                    ))}
                    {session.stats.keyConcepts.length > 8 && (
                      <span className="px-1.5 py-0.5 text-[9.5px] font-mono text-zinc-400">
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
