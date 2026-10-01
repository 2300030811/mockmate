"use client";

import { memo, useState, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import {
  Radar,
  ExternalLink,
  Sparkles,
  ShieldAlert,
  Building2,
  MapPin,
  CheckCircle2,
  X,
  BookOpen,
  MessageSquare,
  Briefcase,
  RefreshCw,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  getDiscoveredJobRadarPostings,
  runTacticalJobEvaluation,
  createCareerOpsApplication,
  triggerManualRadarScan,
} from "@/app/actions/career-ops";
import type { EnrichedTacticalEvaluation } from "@/lib/career-ops/evaluator";

interface RadarPosting {
  id: string;
  company: string;
  title: string;
  location: string;
  source: string;
  url: string;
  postingStatus: string;
  gateNotes: string | null;
  isSenior: boolean;
  description: string;
  lastSeenAt: string;
}

export const JobRadarFeed = memo(function JobRadarFeed() {
  const [postings, setPostings] = useState<RadarPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [evaluatingId, setEvaluatingId] = useState<string | null>(null);
  const [activeEval, setActiveEval] = useState<EnrichedTacticalEvaluation | null>(null);
  const [evalModalOpen, setEvalModalOpen] = useState(false);
  const [trackingSuccess, setTrackingSuccess] = useState<string | null>(null);
  const [copiedOutreach, setCopiedOutreach] = useState(false);
  const [customResume, setCustomResume] = useState("");
  const [showResumeInput, setShowResumeInput] = useState(false);

  useEffect(() => {
    async function loadPostings() {
      try {
        const data = await getDiscoveredJobRadarPostings(12);
        setPostings(data);
      } finally {
        setLoading(false);
      }
    }
    loadPostings();
  }, []);

  async function handleManualScan() {
    setScanning(true);
    try {
      await triggerManualRadarScan();
      const updated = await getDiscoveredJobRadarPostings(12);
      setPostings(updated);
    } finally {
      setScanning(false);
    }
  }

  async function handleEvaluate(posting: RadarPosting) {
    setEvaluatingId(posting.id);
    try {
      const res = await runTacticalJobEvaluation({
        jobTitle: posting.title,
        company: posting.company,
        jobDescription: posting.description || `${posting.title} opening at ${posting.company}`,
        candidateResumeText: customResume.trim() || undefined,
      });

      if (res.success && res.data) {
        setActiveEval(res.data);
        setEvalModalOpen(true);
      }
    } finally {
      setEvaluatingId(null);
    }
  }

  async function handleTrack(posting: { title: string; company: string; url?: string; source?: string; isSenior?: boolean; id?: string }, score?: number) {
    const res = await createCareerOpsApplication({
      jobRole: posting.title,
      company: posting.company,
      sourceUrl: posting.url || undefined,
      matchScore: score ?? (posting.isSenior ? 30 : 80),
      notes: `Ingested from MockMate Radar (${posting.source || "feed"}).`,
    });

    if (res.success && posting.id) {
      setTrackingSuccess(posting.id);
      setTimeout(() => setTrackingSuccess(null), 3000);
    }
    return res.success;
  }

  function handleCopyOutreach(text: string) {
    navigator.clipboard.writeText(text);
    setCopiedOutreach(true);
    setTimeout(() => setCopiedOutreach(false), 2500);
  }

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] p-5 sm:p-6 shadow-subtle transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-200 dark:border-[#1e1e2a] pb-3 mb-4 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <div className="flex items-center gap-1.5">
            <Radar className="w-4 h-4 text-[#5e6ad2]" />
            <h2 className="text-xs font-mono font-semibold uppercase tracking-[0.08em] text-zinc-900 dark:text-[#ebebef]">
              Live Job Radar
            </h2>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 text-[#5e6ad2] dark:text-[#828df8] font-medium">
            Active Scrapers
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowResumeInput(!showResumeInput)}
            className="text-[11px] font-mono text-zinc-500 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-[#ebebef] flex items-center gap-1 transition-colors cursor-pointer"
          >
            {showResumeInput ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {customResume ? "Custom CV active" : "CV Context"}
          </button>

          <button
            onClick={handleManualScan}
            disabled={scanning}
            className="text-[11px] font-mono font-medium px-2.5 py-1 rounded-md border border-zinc-200 dark:border-[#1e1e2a] hover:bg-zinc-50 dark:hover:bg-[#1a1a26] text-zinc-600 dark:text-[#c4c4d4] flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${scanning ? "animate-spin text-[#5e6ad2]" : ""}`} />
            {scanning ? "Scanning..." : "Scan Now"}
          </button>
        </div>
      </div>

      {showResumeInput && (
        <div className="mb-4 p-3 rounded-lg border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50 dark:bg-[#101018] space-y-2">
          <label className="text-[10.5px] font-mono text-zinc-500 dark:text-[#8b8b9e] block">
            Custom Candidate CV / Snippet for 6-Block Analysis (optional):
          </label>
          <textarea
            value={customResume}
            onChange={(e) => setCustomResume(e.target.value)}
            placeholder="Paste your key skills, past roles, or proof points to guide the 6-block analysis..."
            rows={2}
            className="w-full text-xs font-mono p-2 rounded-md border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] text-zinc-900 dark:text-[#ebebef] placeholder:text-zinc-400 dark:placeholder:text-[#5a5a6e] focus:outline-none focus:border-[#5e6ad2]"
          />
        </div>
      )}

      {loading ? (
        <div className="py-8 text-center text-xs font-mono text-zinc-400 dark:text-[#8b8b9e]">
          Scanning enterprise job feeds...
        </div>
      ) : postings.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-200 dark:border-[#1e1e2a] p-6 text-center">
          <Radar className="w-6 h-6 mx-auto mb-2 text-zinc-400 dark:text-[#5a5a6e] opacity-60" />
          <p className="text-xs font-mono text-zinc-500 dark:text-[#8b8b9e] mb-3">
            No radar postings discovered yet in database.
          </p>
          <button
            onClick={handleManualScan}
            disabled={scanning}
            className="px-3.5 py-1.5 text-xs font-mono font-medium rounded-md bg-[#5e6ad2] text-white hover:bg-[#525ec2] transition-colors cursor-pointer shadow-sm"
          >
            Run Radar Scan Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {postings.map((p) => (
            <div
              key={p.id}
              className="rounded-lg border border-zinc-200/80 dark:border-[#1e1e2a] bg-zinc-50/50 dark:bg-[#101018] p-3.5 flex flex-col justify-between hover:border-[#5e6ad2]/40 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h3 className="text-xs font-semibold text-zinc-900 dark:text-[#ebebef] line-clamp-1">
                    {p.title}
                  </h3>
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-zinc-200/60 dark:bg-[#1e1e2a] text-zinc-600 dark:text-[#8b8b9e] shrink-0">
                    {p.source}
                  </span>
                </div>

                <div className="space-y-1 mb-2.5 text-[11px] text-zinc-500 dark:text-[#8b8b9e]">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3 h-3 text-zinc-400 dark:text-[#6e6e84]" />
                    <span className="truncate">{p.company}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-zinc-400 dark:text-[#6e6e84]" />
                    <span className="truncate">{p.location}</span>
                  </div>
                </div>

                {p.isSenior && (
                  <div className="flex items-center gap-1 text-[10px] font-mono text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded mb-2.5">
                    <ShieldAlert className="w-3 h-3 shrink-0" />
                    <span>Senior Role (Quality Gated)</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-zinc-200/60 dark:border-[#1a1a26] flex items-center justify-between gap-2">
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-mono text-zinc-400 dark:text-[#6e6e84] hover:text-[#5e6ad2] dark:hover:text-[#5e6ad2] flex items-center gap-1 transition-colors"
                >
                  Board <ExternalLink className="w-3 h-3" />
                </a>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleEvaluate(p)}
                    disabled={evaluatingId === p.id}
                    className="text-[10px] font-mono font-medium px-2 py-1 rounded-md bg-[#5e6ad2]/10 hover:bg-[#5e6ad2]/20 text-[#5e6ad2] dark:text-[#828df8] border border-[#5e6ad2]/20 flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    {evaluatingId === p.id ? "Analyzing..." : "6-Block Eval"}
                  </button>

                  <button
                    onClick={() => handleTrack(p)}
                    className="text-[10px] font-mono font-medium px-2.5 py-1 rounded-md bg-zinc-900 text-white dark:bg-[#1a1a26] dark:text-[#ebebef] border border-zinc-800 dark:border-[#28283c] hover:bg-zinc-800 dark:hover:bg-[#202030] dark:hover:border-[#5e6ad2]/40 flex items-center gap-1 transition-all cursor-pointer"
                  >
                    {trackingSuccess === p.id ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Tracked
                      </>
                    ) : (
                      <>
                        <Briefcase className="w-3 h-3" /> Track
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 6-Block Tactical Evaluation Modal (Career-Ops + Job Radar) */}
      <AnimatePresence>
        {evalModalOpen && activeEval && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <m.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] p-6 shadow-2xl space-y-6"
            >
              <div className="flex items-start justify-between border-b border-zinc-200 dark:border-[#1e1e2a] pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 text-[10px] font-mono uppercase rounded-md bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 text-[#5e6ad2] dark:text-[#828df8] font-semibold">
                      Career-Ops Tactical Evaluation
                    </span>
                    {activeEval.isCapped && (
                      <span className="px-2 py-0.5 text-[10px] font-mono uppercase rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold">
                        {activeEval.gateReason || "Gate Capped"}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-[#ebebef]">
                    {activeEval.jobTitle}
                  </h2>
                  <p className="text-xs font-mono text-zinc-500 dark:text-[#8b8b9e]">
                    {activeEval.company} • Benchmark: {activeEval.salaryFormatted}
                  </p>
                </div>
                <button
                  onClick={() => setEvalModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-[#1e1e2a] text-zinc-400 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-[#ebebef] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Match Score & TLDR */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50 dark:bg-[#101018] p-4 text-center sm:col-span-1">
                  <p className="text-3xl font-mono font-bold text-[#5e6ad2] dark:text-[#828df8]">
                    {activeEval.matchScore}%
                  </p>
                  <p className="text-[10px] font-mono uppercase text-zinc-400 dark:text-[#6e6e84] mt-1">Match Index</p>
                </div>
                <div className="rounded-xl border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50 dark:bg-[#101018] p-4 sm:col-span-3 flex flex-col justify-center">
                  <p className="text-xs font-medium text-zinc-800 dark:text-[#c4c4d4]">
                    {activeEval.data.roleSummary.tldr || "Tailored fit evaluation based on technical requirements."}
                  </p>
                  <p className="text-[11px] font-mono text-zinc-500 dark:text-[#8b8b9e] mt-1">
                    Archetype: <span className="text-[#5e6ad2] dark:text-[#828df8]">{activeEval.data.roleSummary.roleArchetype}</span> • Seniority: {activeEval.data.roleSummary.seniority}
                  </p>
                </div>
              </div>

              {/* Block B: Requirements & Gaps */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-[#8b8b9e] flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#5e6ad2]" /> CV Match & Gaps
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-2">
                    <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Matched Strengths</p>
                    {activeEval.data.cvMatch.matchedRequirements.map((r, i) => (
                      <div key={i} className="p-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
                        <p className="font-medium text-zinc-900 dark:text-[#ebebef]">{r.requirement}</p>
                        <p className="text-[11px] text-zinc-500 dark:text-[#8b8b9e] mt-0.5">{r.candidateEvidence}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">Gaps & Mitigation</p>
                    {activeEval.data.cvMatch.gaps.map((g, i) => (
                      <div key={i} className="p-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5">
                        <p className="font-medium text-zinc-900 dark:text-[#ebebef]">{g.gap}</p>
                        <p className="text-[11px] text-zinc-500 dark:text-[#8b8b9e] mt-0.5">{g.mitigationStrategy}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Block F: STAR+R Interview Story Bank */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-[#8b8b9e] flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-[#5e6ad2]" /> STAR+R Behavioral Interview Bank
                </h3>
                <div className="space-y-2.5">
                  {activeEval.data.interviewPrep.starStories.map((story, i) => (
                    <div key={i} className="rounded-lg border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50/70 dark:bg-[#101018] p-3 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-zinc-900 dark:text-[#ebebef]">{story.storyTitle}</span>
                        <span className="text-[10px] font-mono text-[#5e6ad2] dark:text-[#828df8]">{story.requirement}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-zinc-600 dark:text-[#8b8b9e] mt-2">
                        <p><strong className="text-zinc-900 dark:text-[#ebebef]">Situation:</strong> {story.situation}</p>
                        <p><strong className="text-zinc-900 dark:text-[#ebebef]">Action:</strong> {story.action}</p>
                        <p><strong className="text-zinc-900 dark:text-[#ebebef]">Result:</strong> {story.result}</p>
                        <p className="text-[#5e6ad2] dark:text-[#828df8]"><strong className="text-[#5e6ad2] dark:text-[#828df8]">Reflection (Seniority Signal):</strong> {story.reflection}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cold Outreach Hook with Copy Button */}
              {activeEval.data.personalization.outreachMessage && (
                <div className="rounded-lg border border-[#5e6ad2]/20 bg-[#5e6ad2]/5 p-3.5 text-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="font-semibold text-zinc-900 dark:text-[#ebebef]">Recruiter Cold Outreach Hook</p>
                    <button
                      onClick={() => handleCopyOutreach(activeEval.data.personalization.outreachMessage)}
                      className="text-[10px] font-mono px-2 py-0.5 rounded-md border border-[#5e6ad2]/30 text-[#5e6ad2] dark:text-[#828df8] hover:bg-[#5e6ad2]/10 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copiedOutreach ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy Note
                        </>
                      )}
                    </button>
                  </div>
                  <p className="font-mono text-[11px] text-zinc-700 dark:text-[#c4c4d4]">
                    {activeEval.data.personalization.outreachMessage}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-zinc-200 dark:border-[#1e1e2a]">
                <button
                  onClick={() => {
                    handleTrack({
                      title: activeEval.jobTitle,
                      company: activeEval.company,
                      isSenior: activeEval.isCapped,
                    }, activeEval.matchScore);
                    setEvalModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-mono font-medium bg-[#5e6ad2] text-white hover:bg-[#525ec2] flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  Track in CRM ({activeEval.matchScore}%)
                </button>

                <button
                  onClick={() => setEvalModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-mono border border-zinc-200 dark:border-[#1e1e2a] hover:bg-zinc-100 dark:hover:bg-[#1a1a26] text-zinc-700 dark:text-[#c4c4d4] transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </m.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
});
