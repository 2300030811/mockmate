"use client";

import React from "react";
import {
  AlertTriangle,
  BriefcaseBusiness,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Clock,
  ExternalLink,
  ChevronDown
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

function formatRate(value: number | null): string {
  return value == null ? "-" : `${value}%`;
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
      setFeedback(`Cadence synchronized for ${updatedCount} role(s).`);
      await hydrateTracker(true);
    } catch (recomputeError) {
      console.error(recomputeError);
      setError("Could not recompute cadence.");
    } finally {
      setIsReplanning(false);
    }
  }, [hydrateTracker]);

  return (
    <div className="w-full bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] rounded-2xl p-5 sm:p-7 shadow-subtle space-y-6">
      {/* Header and Actions Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 dark:border-[#1e1e2a] pb-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-[#5e6ad2]/10 text-[#5e6ad2] flex items-center justify-center">
              <BriefcaseBusiness size={15} />
            </span>
            <h3 className="text-sm sm:text-base font-extrabold tracking-tight text-zinc-900 dark:text-[#ebebef]">
              Career Application Pipeline
            </h3>
          </div>
          <p className="text-xs text-zinc-500 dark:text-[#8b8b9e]">
            Track evaluated roles through your application funnel and keep follow-ups on cadence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => hydrateTracker(true)}
            disabled={refreshing || loading || isReplanning}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-[#1e1e2a] text-xs font-semibold text-zinc-700 dark:text-[#8b8b9e] hover:bg-zinc-100 dark:hover:bg-[#1e1e2a] transition-all cursor-pointer"
          >
            {refreshing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleAutoPlanCadence}
            disabled={loading || refreshing || isReplanning}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#5e6ad2] hover:bg-[#4f5ac4] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer active:scale-95 shadow-[#5e6ad2]/20"
          >
            {isReplanning ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
            <span>Auto-Plan Cadence</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {(feedback || error) && (
        <div
          className={`rounded-xl px-4 py-2.5 text-xs font-mono font-medium border ${
            error
              ? "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
          }`}
        >
          {error || feedback}
        </div>
      )}

      {/* KPI Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-[#0d0d12] border border-zinc-200/80 dark:border-[#1e1e2a] space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Total Tracked</span>
          <p className="text-xl sm:text-2xl font-extrabold font-mono text-zinc-900 dark:text-[#ebebef]">
            {summary.totalApplications}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-[#0d0d12] border border-zinc-200/80 dark:border-[#1e1e2a] space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Active Pipeline</span>
          <p className="text-xl sm:text-2xl font-extrabold font-mono text-[#5e6ad2]">
            {summary.activePipelineCount}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-[#0d0d12] border border-zinc-200/80 dark:border-[#1e1e2a] space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Due Today</span>
          <p className="text-xl sm:text-2xl font-extrabold font-mono text-amber-600 dark:text-amber-400">
            {summary.dueTodayCount}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-[#0d0d12] border border-zinc-200/80 dark:border-[#1e1e2a] space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Response Rate</span>
          <p className="text-xl sm:text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
            {formatRate(summary.funnel.responseRate)}
          </p>
        </div>
      </div>

      {/* Applications Feed */}
      {loading ? (
        <div className="p-8 text-center rounded-xl bg-zinc-50 dark:bg-[#0d0d12] border border-zinc-200/80 dark:border-[#1e1e2a]">
          <p className="text-xs font-mono text-zinc-400 animate-pulse">Loading tracked applications...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="p-8 text-center rounded-xl bg-zinc-50 dark:bg-[#0d0d12] border border-dashed border-zinc-200 dark:border-[#1e1e2a] space-y-1.5">
          <p className="text-xs sm:text-sm font-semibold text-zinc-700 dark:text-[#ebebef]">
            No roles currently in your pipeline tracker.
          </p>
          <p className="text-xs text-zinc-500">
            Click &quot;Track this role&quot; at the top of your analysis report to save it here.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {applications.map((app) => (
            <div
              key={app.id}
              className="p-4 rounded-xl bg-zinc-50 dark:bg-[#0d0d12] border border-zinc-200/80 dark:border-[#1e1e2a] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-zinc-900 dark:text-[#ebebef] truncate">
                    {app.jobRole}
                  </span>
                  {app.company && (
                    <span className="text-zinc-500 dark:text-zinc-400 font-mono">
                      @ {app.company}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-400">
                  <span>Match: {app.matchScore}%</span>
                  {app.nextFollowUpDate && (
                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                      <Clock size={11} />
                      Follow-up: {app.nextFollowUpDate}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <select
                  value={statusDraft[app.id] ?? app.status}
                  onChange={(e) =>
                    setStatusDraft((prev) => ({
                      ...prev,
                      [app.id]: e.target.value as CareerOpsApplicationStatus,
                    }))
                  }
                  className="py-1.5 px-2.5 rounded-lg bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] text-xs font-mono text-zinc-800 dark:text-[#ebebef] outline-none"
                >
                  {CAREER_OPS_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {STATUS_LABELS[st]}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => handleStatusSave(app.id)}
                  disabled={busyId === app.id || statusDraft[app.id] === app.status}
                  className="py-1.5 px-3 rounded-lg bg-[#5e6ad2] hover:bg-[#4f5ac4] disabled:opacity-40 text-white text-xs font-semibold transition-all cursor-pointer"
                >
                  Save
                </button>

                <button
                  type="button"
                  onClick={() => handleLogFollowUp(app.id)}
                  disabled={busyId === app.id}
                  className="py-1.5 px-2.5 rounded-lg border border-zinc-200 dark:border-[#1e1e2a] hover:bg-zinc-100 dark:hover:bg-[#1e1e2a] text-zinc-600 dark:text-[#8b8b9e] text-xs font-semibold transition-all cursor-pointer"
                  title="Log email follow-up"
                >
                  Follow-up
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
