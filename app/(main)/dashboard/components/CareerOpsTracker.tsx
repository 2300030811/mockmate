"use client";

import { memo } from "react";
import { m } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  CalendarClock,
  Target,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { CareerOpsTrackerSummary } from "@/types/career-ops";

const URGENCY_STYLE: Record<CareerOpsTrackerSummary["urgencyLevel"], string> = {
  calm: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
  upcoming: "bg-[#5e6ad2]/10 border-[#5e6ad2]/20 text-[#5e6ad2] dark:text-[#828df8]",
  attention: "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400",
  critical: "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400",
};

const URGENCY_LABEL: Record<CareerOpsTrackerSummary["urgencyLevel"], string> = {
  calm: "Calm",
  upcoming: "Upcoming",
  attention: "Needs Action",
  critical: "Critical",
};

function formatRate(value: number | null): string {
  return value == null ? "N/A" : `${value}%`;
}

export const CareerOpsTracker = memo(function CareerOpsTracker({
  tracker,
}: {
  tracker: CareerOpsTrackerSummary;
}) {
  const prefersReduced = useReducedMotion();

  // Core Funnel Milestones
  const funnelSteps = [
    { key: "evaluated", label: "Evaluated", count: tracker.statusCounts.evaluated || 0 },
    { key: "applied", label: "Applied", count: tracker.statusCounts.applied || 0 },
    { key: "interview", label: "Interview", count: tracker.statusCounts.interview || 0 },
    { key: "offer", label: "Offer", count: tracker.statusCounts.offer || 0 },
  ];

  return (
    <m.div
      initial={prefersReduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={prefersReduced ? { duration: 0 } : { duration: 0.2 }}
      className="rounded-xl border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] p-5 sm:p-6 shadow-subtle transition-colors flex flex-col justify-between min-h-[38rem]"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-[#1e1e2a] pb-2.5">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                tracker.urgencyLevel === "critical"
                  ? "bg-rose-500 animate-pulse"
                  : tracker.urgencyLevel === "attention"
                  ? "bg-amber-500 animate-pulse"
                  : "bg-[#5e6ad2]"
              }`}
            />
            <h2 className="text-xs font-mono font-semibold uppercase tracking-[0.08em] text-zinc-900 dark:text-[#ebebef]">
              Career Ops Tracker
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-[9.5px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border ${URGENCY_STYLE[tracker.urgencyLevel]}`}
            >
              {URGENCY_LABEL[tracker.urgencyLevel]}
            </span>
            <Link
              href="/career-path"
              className="text-[11px] font-mono font-medium text-[#5e6ad2] hover:text-[#525ec2] flex items-center gap-1 transition-colors group"
            >
              <span>Pipeline</span>
              <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Top KPI Telemetry Bento */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="rounded-lg border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50/70 dark:bg-[#101018] p-3 text-center transition-colors">
            <p className="text-2xl font-mono font-bold text-[#5e6ad2] dark:text-[#828df8] tabular-nums">
              {tracker.activePipelineCount}
            </p>
            <p className="text-[9.5px] uppercase tracking-wider font-mono text-zinc-500 dark:text-[#8b8b9e] mt-0.5">
              Active Pipeline
            </p>
          </div>

          <div
            className={`rounded-lg border p-3 text-center transition-colors ${
              tracker.dueTodayCount > 0
                ? "border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10"
                : "border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50/70 dark:bg-[#101018]"
            }`}
          >
            <p
              className={`text-2xl font-mono font-bold tabular-nums ${
                tracker.dueTodayCount > 0 ? "text-amber-600 dark:text-amber-400" : "text-zinc-900 dark:text-[#ebebef]"
              }`}
            >
              {tracker.dueTodayCount}
            </p>
            <p className="text-[9.5px] uppercase tracking-wider font-mono text-zinc-500 dark:text-[#8b8b9e] mt-0.5">
              Due Now
            </p>
          </div>

          <div className="rounded-lg border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50/70 dark:bg-[#101018] p-3 text-center transition-colors">
            <p className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {tracker.statusCounts.offer || 0}
            </p>
            <p className="text-[9.5px] uppercase tracking-wider font-mono text-zinc-500 dark:text-[#8b8b9e] mt-0.5">
              Offers Secured
            </p>
          </div>
        </div>

        {/* Conversion & Telemetry Strip */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-zinc-200/80 dark:border-[#1a1a26] bg-zinc-50/60 dark:bg-[#101018] px-2.5 py-1.5 text-center">
            <p className="text-[9px] font-mono uppercase tracking-wider text-zinc-400 dark:text-[#5a5a6e]">Response</p>
            <p className="text-xs font-mono font-bold text-zinc-900 dark:text-[#ebebef]">{formatRate(tracker.funnel.responseRate)}</p>
          </div>
          <div className="rounded-lg border border-zinc-200/80 dark:border-[#1a1a26] bg-zinc-50/60 dark:bg-[#101018] px-2.5 py-1.5 text-center">
            <p className="text-[9px] font-mono uppercase tracking-wider text-zinc-400 dark:text-[#5a5a6e]">Interview</p>
            <p className="text-xs font-mono font-bold text-zinc-900 dark:text-[#ebebef]">{formatRate(tracker.funnel.interviewRate)}</p>
          </div>
          <div className="rounded-lg border border-zinc-200/80 dark:border-[#1a1a26] bg-zinc-50/60 dark:bg-[#101018] px-2.5 py-1.5 text-center">
            <p className="text-[9px] font-mono uppercase tracking-wider text-zinc-400 dark:text-[#5a5a6e]">Offer Rate</p>
            <p className="text-xs font-mono font-bold text-zinc-900 dark:text-[#ebebef]">{formatRate(tracker.funnel.offerRate)}</p>
          </div>
        </div>

        {/* Visual Pipeline Funnel Stepper */}
        <div className="rounded-lg border border-zinc-200/80 dark:border-[#1a1a26] bg-zinc-50/60 dark:bg-[#101018] p-3">
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 dark:text-[#8b8b9e] mb-2.5">
            <span className="uppercase tracking-wider font-semibold">Active Pipeline Stage Flow</span>
            <span className="text-zinc-500 dark:text-[#6e6e84]">{tracker.totalApplications} total roles</span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 relative">
            {funnelSteps.map((step, idx) => {
              const hasItems = step.count > 0;
              return (
                <div key={step.key} className="flex items-center relative">
                  <div
                    className={`w-full p-2 rounded-md border text-center transition-all ${
                      hasItems
                        ? "border-[#5e6ad2]/40 bg-[#5e6ad2]/10 text-zinc-900 dark:text-[#ebebef]"
                        : "border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] text-zinc-400 dark:text-[#5a5a6e]"
                    }`}
                  >
                    <p className="text-[9px] font-mono uppercase tracking-wider truncate font-medium">
                      {step.label}
                    </p>
                    <p
                      className={`text-sm font-mono font-bold tabular-nums mt-0.5 ${
                        hasItems ? "text-[#5e6ad2] dark:text-[#828df8]" : "text-zinc-400 dark:text-[#5a5a6e]"
                      }`}
                    >
                      {step.count}
                    </p>
                  </div>
                  {idx < funnelSteps.length - 1 && (
                    <ChevronRight
                      size={12}
                      className="absolute -right-2 z-10 text-zinc-300 dark:text-[#2a2a3e] hidden sm:block pointer-events-none"
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Secondary Dispositions Pill Strip */}
          <div className="mt-2.5 pt-2 border-t border-zinc-200/60 dark:border-[#1e1e2a] flex flex-wrap items-center justify-between gap-2 text-[9.5px] font-mono text-zinc-500 dark:text-[#8b8b9e]">
            <span>Archived Outcomes:</span>
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-[#1a1a26] border border-zinc-200 dark:border-[#222232]">
                Responded: <strong className="text-zinc-700 dark:text-[#ebebef]">{tracker.statusCounts.responded || 0}</strong>
              </span>
              <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-[#1a1a26] border border-zinc-200 dark:border-[#222232]">
                Rejected: <strong className="text-zinc-700 dark:text-[#ebebef]">{tracker.statusCounts.rejected || 0}</strong>
              </span>
              <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-[#1a1a26] border border-zinc-200 dark:border-[#222232]">
                Skipped: <strong className="text-zinc-700 dark:text-[#ebebef]">{tracker.statusCounts.skip || 0}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Priority Follow-Up Queue */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b8b9e] flex items-center gap-1.5">
              <BellRing size={12} className={tracker.dueItems.length > 0 ? "text-amber-500" : "text-zinc-400"} />
              Follow-Up Mission Queue
            </h3>
            {tracker.dueItems.length > 0 && (
              <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold border border-amber-500/20">
                {tracker.dueItems.length} Due
              </span>
            )}
          </div>

          {tracker.dueItems.length === 0 ? (
            <div className="rounded-lg border border-dashed border-zinc-200 dark:border-[#1e1e2a] p-4 text-[11px] font-mono text-zinc-400 dark:text-[#6e6e84] text-center flex flex-col items-center gap-1">
              <CheckCircle2 size={16} className="text-emerald-500/70" />
              <span>All follow-up cadences are on schedule. No overdue items.</span>
            </div>
          ) : (
            <div className="space-y-2 max-h-[10.5rem] overflow-y-auto pr-1 custom-scrollbar">
              {tracker.dueItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-rose-500/30 bg-rose-500/5 dark:bg-rose-500/10 p-3 transition-colors hover:border-rose-500/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-zinc-900 dark:text-[#ebebef] truncate capitalize">
                        {item.jobRole}
                      </p>
                      <p className="text-[10.5px] font-mono text-zinc-500 dark:text-[#8b8b9e] truncate mt-0.5">
                        {item.company}
                      </p>
                    </div>
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white dark:bg-[#14141e] border border-rose-500/30 text-rose-600 dark:text-rose-400 shrink-0">
                      {item.status}
                    </span>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-rose-500/15 flex items-center justify-between text-[10px] font-mono">
                    <span className="flex items-center gap-1 text-zinc-500 dark:text-[#8b8b9e]">
                      <CalendarClock size={11} className="text-rose-500" />
                      <span>{item.nextFollowUpDate}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                        {item.daysLate > 0 ? `${item.daysLate}d Overdue` : "Due Today"}
                      </span>
                      <Link
                        href="/career-path"
                        className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-300 font-semibold transition-colors"
                      >
                        <span>Action</span>
                        <ArrowRight size={10} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Navigation Link */}
      <div className="pt-3 border-t border-zinc-200/80 dark:border-[#1e1e2a] flex items-center justify-between text-xs font-mono">
        <span className="text-[10.5px] text-zinc-400 dark:text-[#6e6e84]">Sync cadence via CRM</span>
        <Link
          href="/career-path"
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#5e6ad2] hover:text-[#525ec2] transition-colors"
        >
          <span>Open Full Tracker</span>
          <ArrowRight size={11} />
        </Link>
      </div>
    </m.div>
  );
});

