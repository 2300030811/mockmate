"use client";

import React from "react";
import {
  AlertTriangle,
  BellRing,
  BriefcaseBusiness,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Send,
} from "lucide-react";
import {
  getCareerOpsTrackerData,
  logCareerOpsFollowUp,
  recomputeCareerOpsCadence,
  transitionCareerOpsStatus,
} from "@/app/actions/career-ops";
import type { CareerOpsApplicationItem, CareerOpsApplicationStatus, CareerOpsTrackerSummary } from "@/types/career-ops";
import { CAREER_OPS_STATUSES } from "@/lib/career-ops/status";
import { emptyCareerOpsTrackerSummary } from "@/lib/career-ops/summary";

const STATUS_LABELS: Record<CareerOpsApplicationStatus, string> = {
  evaluated: "Evaluated",
  applied: "Applied",
  responded: "Responded",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  discarded: "Discarded",
  skip: "Skipped",
};

const EMPTY_SUMMARY: CareerOpsTrackerSummary = emptyCareerOpsTrackerSummary();

const URGENCY_STYLE: Record<CareerOpsTrackerSummary["urgencyLevel"], string> = {
  calm: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-300",
  upcoming: "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-300",
  attention: "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-300",
  critical: "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-300",
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

function isPastIsoDate(isoDate: string | null): boolean {
  if (!isoDate) return false;
  const today = new Date();
  const yyyy = today.getUTCFullYear();
  const mm = String(today.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(today.getUTCDate()).padStart(2, "0");
  const todayIso = `${yyyy}-${mm}-${dd}`;
  return isoDate < todayIso;
}

export function CareerOpsPanel({ refreshSignal = 0 }: { refreshSignal?: number }) {
  const [summary, setSummary] = React.useState<CareerOpsTrackerSummary>(EMPTY_SUMMARY);
  const [applications, setApplications] = React.useState<CareerOpsApplicationItem[]>([]);
  const [statusDraft, setStatusDraft] = React.useState<Record<string, CareerOpsApplicationStatus>>({});
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [isReplanning, setIsReplanning] = React.useState(false);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [feedback, setFeedback] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const lastRefreshSignal = React.useRef(refreshSignal);

  const hydrateTracker = React.useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    setError(null);

    try {
      const payload = await getCareerOpsTrackerData(12);
      setSummary(payload.summary);
      setApplications(payload.applications);
      setStatusDraft((prev) => {
        const next: Record<string, CareerOpsApplicationStatus> = { ...prev };
        for (const app of payload.applications) {
          next[app.id] = next[app.id] ?? app.status;
        }
        return next;
      });
    } catch (loadError) {
      console.error(loadError);
      setError("Could not load tracker data.");
    } finally {
      if (isRefresh) setRefreshing(false);
      else setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    hydrateTracker();
  }, [hydrateTracker]);

  React.useEffect(() => {
    if (refreshSignal === lastRefreshSignal.current) return;
    lastRefreshSignal.current = refreshSignal;
    hydrateTracker(true);
  }, [refreshSignal, hydrateTracker]);

  const handleStatusSave = React.useCallback(
    async (applicationId: string) => {
      const nextStatus = statusDraft[applicationId];
      if (!nextStatus) return;

      setBusyId(applicationId);
      setFeedback(null);
      setError(null);

      try {
        const result = await transitionCareerOpsStatus({
          applicationId,
          toStatus: nextStatus,
        });

        if (!result.success) {
          setError(result.error || "Could not update application status.");
          return;
        }

        setFeedback(`Status updated to ${STATUS_LABELS[nextStatus]}.`);
        await hydrateTracker(true);
      } catch (updateError) {
        console.error(updateError);
        setError("Could not update application status.");
      } finally {
        setBusyId(null);
      }
    },
    [hydrateTracker, statusDraft]
  );

  const handleLogFollowUp = React.useCallback(
    async (applicationId: string) => {
      setBusyId(applicationId);
      setFeedback(null);
      setError(null);

      try {
        const result = await logCareerOpsFollowUp({ applicationId, channel: "email" });
        if (!result.success) {
          setError(result.error || "Could not log follow-up.");
          return;
        }

        setFeedback("Follow-up logged.");
        await hydrateTracker(true);
      } catch (followUpError) {
        console.error(followUpError);
        setError("Could not log follow-up.");
      } finally {
        setBusyId(null);
      }
    },
    [hydrateTracker]
  );

  const handleAutoPlanCadence = React.useCallback(async () => {
    setIsReplanning(true);
    setFeedback(null);
    setError(null);

    try {
      const result = await recomputeCareerOpsCadence(200);
      if (!result.success) {
        setError(result.error || "Could not recompute cadence.");
        return;
      }

      const updatedCount = result.data?.updatedCount ?? 0;
      const skippedCount = result.data?.skippedCount ?? 0;
      const failedCount = result.data?.failedCount ?? 0;

      setFeedback(
        `Cadence updated for ${updatedCount} role(s). ${skippedCount} unchanged.${
          failedCount > 0 ? ` ${failedCount} update(s) failed.` : ""
        }`
      );
      await hydrateTracker(true);
    } catch (recomputeError) {
      console.error(recomputeError);
      setError("Could not recompute cadence.");
    } finally {
      setIsReplanning(false);
    }
  }, [hydrateTracker]);

  return (
    <section className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/5 p-6 md:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2 uppercase tracking-tight">
            <BriefcaseBusiness className="text-blue-500" size={20} />
            Career Ops Tracker
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Move roles through your pipeline and keep follow-ups on cadence.
          </p>
        </div>

        <button
          type="button"
          onClick={() => hydrateTracker(true)}
          disabled={refreshing || loading || isReplanning}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-white/15 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-60 transition-colors"
        >
          {refreshing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          Refresh
        </button>

        <button
          type="button"
          onClick={handleAutoPlanCadence}
          disabled={loading || refreshing || isReplanning}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 disabled:opacity-60 transition-colors"
        >
          {isReplanning ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          Auto-Plan Cadence
        </button>
      </div>

      {(feedback || error) && (
        <div
          className={`rounded-xl px-4 py-3 text-sm font-medium border ${
            error
              ? "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-300"
              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
          }`}
        >
          {error || feedback}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="rounded-xl border border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/10 px-3 py-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-300">Total</p>
          <p className="text-xl font-black text-blue-700 dark:text-blue-200">{summary.totalApplications}</p>
        </div>
        <div className="rounded-xl border border-indigo-200 dark:border-indigo-500/20 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">Active</p>
          <p className="text-xl font-black text-indigo-700 dark:text-indigo-200">{summary.activePipelineCount}</p>
        </div>
        <div className="rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 px-3 py-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-300">Due Today</p>
          <p className="text-xl font-black text-amber-700 dark:text-amber-200">{summary.dueTodayCount}</p>
        </div>
        <div className="rounded-xl border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 px-3 py-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-rose-600 dark:text-rose-300">Overdue</p>
          <p className="text-xl font-black text-rose-700 dark:text-rose-200">{summary.overdueCount}</p>
        </div>
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-300">Avg Match</p>
          <p className="text-xl font-black text-emerald-700 dark:text-emerald-200">{summary.avgMatchScore ?? "-"}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 px-3 py-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Response Rate</p>
          <p className="text-lg font-black text-gray-900 dark:text-white">{formatRate(summary.funnel.responseRate)}</p>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 px-3 py-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Interview Rate</p>
          <p className="text-lg font-black text-gray-900 dark:text-white">{formatRate(summary.funnel.interviewRate)}</p>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 px-3 py-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Offer Rate</p>
          <p className="text-lg font-black text-gray-900 dark:text-white">{formatRate(summary.funnel.offerRate)}</p>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 px-3 py-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Pipeline Urgency</p>
          <p className={`inline-flex mt-1 text-[11px] uppercase tracking-wider font-black px-2 py-1 rounded-md border ${URGENCY_STYLE[summary.urgencyLevel]}`}>
            {URGENCY_LABEL[summary.urgencyLevel]}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-dashed border-gray-200 dark:border-white/10 p-8 text-center text-gray-500 dark:text-gray-400">
          Loading tracker entries...
        </div>
      ) : applications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 dark:border-white/10 p-8 text-center text-gray-500 dark:text-gray-400 space-y-2">
          <p className="font-semibold">No tracked roles yet.</p>
          <p className="text-sm">Use Track this role after each analysis to build your pipeline history.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((application) => {
            const overdue = isPastIsoDate(application.nextFollowUpDate);
            const isBusy = busyId === application.id;

            return (
              <div
                key={application.id}
                className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{application.jobRole}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{application.company}</p>
                  </div>

                  <span className="text-[10px] uppercase tracking-widest font-black px-2 py-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-300 border border-blue-500/20">
                    {STATUS_LABELS[application.status]}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs mb-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border ${
                      overdue
                        ? "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-300"
                        : "bg-gray-100 dark:bg-white/10 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    <BellRing size={12} /> Next: {application.nextFollowUpDate ?? "Not set"}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md border bg-gray-100 dark:bg-white/10 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300">
                    <CheckCircle2 size={12} /> Match: {application.matchScore ?? "N/A"}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md border bg-gray-100 dark:bg-white/10 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300">
                    <BriefcaseBusiness size={12} /> ATS: {application.atsScore ?? "N/A"}
                  </span>
                  {overdue && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md border bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-300">
                      <AlertTriangle size={12} /> Overdue
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={statusDraft[application.id] ?? application.status}
                    onChange={(event) =>
                      setStatusDraft((prev) => ({
                        ...prev,
                        [application.id]: event.target.value as CareerOpsApplicationStatus,
                      }))
                    }
                    className="rounded-lg border border-gray-200 dark:border-white/15 bg-white dark:bg-black/20 px-3 py-2 text-sm text-gray-800 dark:text-gray-100"
                  >
                    {CAREER_OPS_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {STATUS_LABELS[status]}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => handleStatusSave(application.id)}
                    disabled={isBusy}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 disabled:opacity-60 transition-colors"
                  >
                    {isBusy ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    Save Status
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLogFollowUp(application.id)}
                    disabled={isBusy}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-sm font-semibold hover:bg-emerald-500/20 disabled:opacity-60 transition-colors"
                  >
                    {isBusy ? <Loader2 size={14} className="animate-spin" /> : <BellRing size={14} />}
                    Log Follow-up
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
