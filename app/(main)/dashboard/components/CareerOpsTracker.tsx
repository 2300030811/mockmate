"use client";

import { memo } from "react";
import { m } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BellRing, BriefcaseBusiness, CalendarClock, Target } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { CareerOpsTrackerSummary } from "@/types/career-ops";

const STATUS_LABELS: Record<string, string> = {
  evaluated: "Evaluated",
  applied: "Applied",
  responded: "Responded",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  discarded: "Discarded",
  skip: "Skipped",
};

const URGENCY_STYLE: Record<CareerOpsTrackerSummary["urgencyLevel"], string> = {
  calm: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
  upcoming: "bg-blue-500/10 border-blue-500/20 text-blue-500",
  attention: "bg-amber-500/10 border-amber-500/20 text-amber-500",
  critical: "bg-rose-500/10 border-rose-500/20 text-rose-500",
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

  return (
    <m.div
      initial={prefersReduced ? false : { opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={prefersReduced ? { duration: 0 } : { delay: 0.35 }}
      className="bg-white/70 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 backdrop-blur-md shadow-lg dark:shadow-none transition-colors duration-300 lg:max-h-[34rem] lg:overflow-y-auto lg:pr-3"
    >
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 flex items-center gap-2">
          <BriefcaseBusiness size={16} /> Career Ops Tracker
        </h2>
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${URGENCY_STYLE[tracker.urgencyLevel]}`}
          >
            {URGENCY_LABEL[tracker.urgencyLevel]}
          </span>
          <Link
            href="/career-path"
            className="text-[11px] font-bold text-blue-500 hover:text-blue-400 transition-colors flex items-center gap-1"
          >
            Open <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="rounded-xl border border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/10 p-3 text-center">
          <p className="text-xl font-black text-blue-700 dark:text-blue-300">{tracker.activePipelineCount}</p>
          <p className="text-[10px] uppercase tracking-widest font-bold text-blue-600/80 dark:text-blue-300/70">Active</p>
        </div>
        <div className="rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 p-3 text-center">
          <p className="text-xl font-black text-amber-700 dark:text-amber-300">{tracker.dueTodayCount}</p>
          <p className="text-[10px] uppercase tracking-widest font-bold text-amber-600/80 dark:text-amber-300/70">Due Now</p>
        </div>
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 p-3 text-center">
          <p className="text-xl font-black text-emerald-700 dark:text-emerald-300">{tracker.statusCounts.offer}</p>
          <p className="text-[10px] uppercase tracking-widest font-bold text-emerald-600/80 dark:text-emerald-300/70">Offers</p>
        </div>
      </div>

      <div className="space-y-3 mb-5">
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/40 px-2.5 py-2 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Response</p>
            <p className="text-base font-black text-gray-900 dark:text-white">{formatRate(tracker.funnel.responseRate)}</p>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/40 px-2.5 py-2 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Interview</p>
            <p className="text-base font-black text-gray-900 dark:text-white">{formatRate(tracker.funnel.interviewRate)}</p>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/40 px-2.5 py-2 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Offer</p>
            <p className="text-base font-black text-gray-900 dark:text-white">{formatRate(tracker.funnel.offerRate)}</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
          <span className="font-bold uppercase tracking-wider">Pipeline Breakdown</span>
          <span className="font-semibold">{tracker.totalApplications} total</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(tracker.statusCounts).map(([status, count]) => (
            <div
              key={status}
              className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/40 px-2.5 py-2 flex items-center justify-between"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {STATUS_LABELS[status] ?? status}
              </span>
              <span className="text-sm font-black text-gray-900 dark:text-white">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2.5">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
          <BellRing size={12} /> Follow-up Queue
        </h3>

        {tracker.dueItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-800/30 p-3 text-[11px] text-gray-500 dark:text-gray-400 text-center">
            No follow-ups due right now.
          </div>
        ) : (
          tracker.dueItems.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-rose-200 dark:border-rose-500/20 bg-rose-50/70 dark:bg-rose-500/10 p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{item.jobRole}</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{item.company}</p>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md bg-white/70 dark:bg-black/20 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300">
                  {STATUS_LABELS[item.status]}
                </span>
              </div>

              <div className="mt-2.5 flex items-center justify-between text-[10px] text-rose-700 dark:text-rose-300 font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <CalendarClock size={11} /> {item.nextFollowUpDate}
                </span>
                <span className="flex items-center gap-1">
                  <Target size={11} /> {item.daysLate > 0 ? `${item.daysLate}d late` : "due today"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </m.div>
  );
});
