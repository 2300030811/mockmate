"use client";

import { memo, useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Activity,
  BarChart3,
  Compass,
  TrendingUp,
  TriangleAlert,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Filter,
  Clock,
  Zap,
  Target,
  Sparkles,
} from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { CareerOpsPatternInsights } from "@/types/career-ops";

type InsightTab = "diagnostics" | "velocity" | "strategy";

function formatRate(value: number | null): string {
  return value == null ? "N/A" : `${value}%`;
}

function impactStyle(impact: "high" | "medium" | "low"): string {
  if (impact === "high") return "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20";
  if (impact === "medium") return "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20";
  return "text-[#5e6ad2] dark:text-[#828df8] bg-[#5e6ad2]/10 border-[#5e6ad2]/20";
}

function formatDimensionLabel(value: string): string {
  if (!value || value === "unknown") return "Unknown";
  return value
    .split(/[_-]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDeltaPercentagePoints(value: number): string {
  if (value > 0) return `+${value}pp`;
  if (value < 0) return `${value}pp`;
  return "0pp";
}

function trendStyle(trend: "up" | "down" | "flat"): string {
  if (trend === "up") return "text-rose-600 dark:text-rose-400";
  if (trend === "down") return "text-emerald-600 dark:text-emerald-400";
  return "text-zinc-400 dark:text-[#6e6e84]";
}

function formatIsoWeekLabel(value: string): string {
  const match = /W(\d{2})$/.exec(value);
  return match ? `W${match[1]}` : value;
}

function velocityBarHeight(value: number, maxValue: number): string {
  if (value <= 0 || maxValue <= 0) return "0%";
  return `${Math.max(Math.round((value / maxValue) * 100), 8)}%`;
}

function formatSignedDelta(value: number): string {
  if (value > 0) return `+${value}`;
  if (value < 0) return `${value}`;
  return "0";
}

function deltaStyle(value: number): string {
  if (value > 0) return "text-emerald-600 dark:text-emerald-400";
  if (value < 0) return "text-rose-600 dark:text-rose-400";
  return "text-zinc-400 dark:text-[#6e6e84]";
}

function formatArchetypeDelta(value: number): string {
  if (value > 0) return `+${value}pp vs baseline`;
  if (value < 0) return `${value}pp vs baseline`;
  return "0pp vs baseline";
}

function archetypeDeltaStyle(trend: "above" | "below" | "neutral"): string {
  if (trend === "above") return "text-emerald-600 dark:text-emerald-400";
  if (trend === "below") return "text-rose-600 dark:text-rose-400";
  return "text-zinc-400 dark:text-[#6e6e84]";
}

function diagnosticSeverityStyle(severity: "critical" | "watch" | "healthy"): string {
  if (severity === "critical") {
    return "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20";
  }
  if (severity === "watch") {
    return "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20";
  }
  return "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
}

function thresholdConfidenceStyle(confidence: "low" | "medium" | "high"): string {
  if (confidence === "high") {
    return "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
  }
  if (confidence === "medium") {
    return "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20";
  }
  return "text-zinc-600 dark:text-[#8b8b9e] bg-zinc-100 dark:bg-[#1a1a26] border-zinc-200 dark:border-[#262638]";
}

function TrendSparkline({
  previous,
  recent,
  trend,
}: {
  previous: number;
  recent: number;
  trend: "up" | "down" | "flat";
}) {
  const width = 36;
  const height = 12;
  const pad = 1;

  const maxValue = Math.max(previous, recent, 1);
  const minValue = Math.min(previous, recent, 0);
  const range = Math.max(maxValue - minValue, 1);

  const x1 = pad;
  const x2 = width - pad;
  const y1 = pad + ((maxValue - previous) / range) * (height - pad * 2);
  const y2 = pad + ((maxValue - recent) / range) * (height - pad * 2);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`h-3.5 w-9 ${trendStyle(trend)}`}
      role="img"
      aria-label="Tag trend sparkline"
    >
      <polyline
        points={`${x1},${y1} ${x2},${y2}`}
        className="fill-none stroke-current"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={x1} cy={y1} r="1.2" className="fill-current opacity-70" />
      <circle cx={x2} cy={y2} r="1.5" className="fill-current" />
    </svg>
  );
}

export const CareerOpsInsights = memo(function CareerOpsInsights({
  insights,
}: {
  insights: CareerOpsPatternInsights;
}) {
  const [activeTab, setActiveTab] = useState<InsightTab>("diagnostics");
  const prefersReduced = useReducedMotion();

  const maxVelocityTotal = insights.weeklyVelocity.reduce(
    (maxValue, item) => Math.max(maxValue, item.total),
    0
  );

  const latestWeek = insights.weeklyVelocity[insights.weeklyVelocity.length - 1] ?? null;
  const previousWeek = insights.weeklyVelocity[insights.weeklyVelocity.length - 2] ?? null;
  const weeklyVelocityDelta =
    latestWeek && previousWeek
      ? {
          total: latestWeek.total - previousWeek.total,
          applied: latestWeek.applied - previousWeek.applied,
          progressed: latestWeek.progressed - previousWeek.progressed,
          offers: latestWeek.offers - previousWeek.offers,
        }
      : null;

  const topLeak =
    [...insights.stageDiagnostics]
      .filter((item) => item.dropOffRate != null)
      .sort((a, b) => (b.dropOffRate ?? 0) - (a.dropOffRate ?? 0))[0] ?? null;

  return (
    <m.div
      initial={prefersReduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={prefersReduced ? { duration: 0 } : { duration: 0.2 }}
      className="rounded-xl border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] p-5 sm:p-6 shadow-subtle transition-colors flex flex-col justify-between min-h-[38rem]"
    >
      <div className="space-y-4">
        {/* Header with Title and Segmented Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-[#1e1e2a] pb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#5e6ad2]" />
            <h2 className="text-xs font-mono font-semibold uppercase tracking-[0.08em] text-zinc-900 dark:text-[#ebebef]">
              Pattern Insights
            </h2>
            <span className="text-[10px] font-mono text-zinc-400 dark:text-[#6e6e84] ml-1">
              ({insights.totalApplications} tracked)
            </span>
          </div>

          {/* Segmented Cockpit Switcher */}
          <div
            role="tablist"
            aria-label="Insights View"
            className="flex items-center p-0.5 rounded-lg border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50 dark:bg-[#101018]"
          >
            <button
              role="tab"
              aria-selected={activeTab === "diagnostics"}
              onClick={() => setActiveTab("diagnostics")}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono font-medium rounded-md transition-all ${
                activeTab === "diagnostics"
                  ? "bg-white dark:bg-[#1a1a26] text-[#5e6ad2] dark:text-[#828df8] shadow-xs border border-zinc-200/80 dark:border-[#262638] font-semibold"
                  : "text-zinc-500 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-[#ebebef]"
              }`}
            >
              <Activity size={11} />
              <span>Diagnostics</span>
            </button>

            <button
              role="tab"
              aria-selected={activeTab === "velocity"}
              onClick={() => setActiveTab("velocity")}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono font-medium rounded-md transition-all ${
                activeTab === "velocity"
                  ? "bg-white dark:bg-[#1a1a26] text-[#5e6ad2] dark:text-[#828df8] shadow-xs border border-zinc-200/80 dark:border-[#262638] font-semibold"
                  : "text-zinc-500 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-[#ebebef]"
              }`}
            >
              <BarChart3 size={11} />
              <span>Velocity</span>
            </button>

            <button
              role="tab"
              aria-selected={activeTab === "strategy"}
              onClick={() => setActiveTab("strategy")}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono font-medium rounded-md transition-all ${
                activeTab === "strategy"
                  ? "bg-white dark:bg-[#1a1a26] text-[#5e6ad2] dark:text-[#828df8] shadow-xs border border-zinc-200/80 dark:border-[#262638] font-semibold"
                  : "text-zinc-500 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-[#ebebef]"
              }`}
            >
              <Compass size={11} />
              <span>Strategy</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Diagnostics */}
        {activeTab === "diagnostics" && (
          <div className="space-y-3.5">
            {/* 4 Flow Rate Tiles */}
            <div className="grid grid-cols-4 gap-2">
              <div className="rounded-lg border border-zinc-200/80 dark:border-[#1a1a26] bg-zinc-50/60 dark:bg-[#101018] p-2.5 text-center">
                <p className="text-[9px] uppercase tracking-wider font-mono text-zinc-400 dark:text-[#5a5a6e]">
                  Apply Rate
                </p>
                <p className="text-sm font-mono font-bold text-zinc-900 dark:text-[#ebebef] mt-0.5">
                  {formatRate(insights.rates.applyRate)}
                </p>
              </div>

              <div className="rounded-lg border border-zinc-200/80 dark:border-[#1a1a26] bg-zinc-50/60 dark:bg-[#101018] p-2.5 text-center">
                <p className="text-[9px] uppercase tracking-wider font-mono text-zinc-400 dark:text-[#5a5a6e]">
                  Response
                </p>
                <p className="text-sm font-mono font-bold text-zinc-900 dark:text-[#ebebef] mt-0.5">
                  {formatRate(insights.rates.responseRate)}
                </p>
              </div>

              <div className="rounded-lg border border-zinc-200/80 dark:border-[#1a1a26] bg-zinc-50/60 dark:bg-[#101018] p-2.5 text-center">
                <p className="text-[9px] uppercase tracking-wider font-mono text-zinc-400 dark:text-[#5a5a6e]">
                  Interview
                </p>
                <p className="text-sm font-mono font-bold text-zinc-900 dark:text-[#ebebef] mt-0.5">
                  {formatRate(insights.rates.interviewRate)}
                </p>
              </div>

              <div className="rounded-lg border border-zinc-200/80 dark:border-[#1a1a26] bg-zinc-50/60 dark:bg-[#101018] p-2.5 text-center">
                <p className="text-[9px] uppercase tracking-wider font-mono text-zinc-400 dark:text-[#5a5a6e]">
                  Offer Rate
                </p>
                <p className="text-sm font-mono font-bold text-zinc-900 dark:text-[#ebebef] mt-0.5">
                  {formatRate(insights.rates.offerRate)}
                </p>
              </div>
            </div>

            {/* Funnel Diagnostics with Intelligent Severity */}
            <div className="rounded-lg border border-zinc-200/80 dark:border-[#1a1a26] bg-zinc-50/60 dark:bg-[#101018] p-3">
              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="text-[10px] uppercase tracking-wider font-mono font-semibold text-zinc-500 dark:text-[#8b8b9e]">
                  Funnel Stage Diagnostics
                </p>
                {topLeak && (
                  <p className="text-[9px] uppercase tracking-wider font-mono text-rose-500 dark:text-rose-400 font-semibold truncate max-w-[210px] text-right">
                    Top Leak: {topLeak.label} ({topLeak.dropOffRate}%)
                  </p>
                )}
              </div>

              {insights.stageDiagnostics.length === 0 ? (
                <p className="text-[11px] font-mono text-zinc-400 dark:text-[#5a5a6e]">
                  No stage diagnostics available.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {insights.stageDiagnostics.map((item) => {
                    const hasTraffic = item.conversionRate != null;
                    return (
                      <div
                        key={item.stage}
                        className="rounded-md border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] px-2.5 py-1.5 flex items-center justify-between gap-2 text-[10.5px] font-mono"
                      >
                        <span className="font-medium text-zinc-800 dark:text-[#ebebef] truncate">
                          {item.label}
                        </span>

                        <div className="flex items-center gap-2 shrink-0">
                          {hasTraffic ? (
                            <>
                              <span className="font-bold text-zinc-700 dark:text-[#c4c4d4]">
                                {formatRate(item.conversionRate)} conv
                              </span>
                              <span className="text-zinc-400 dark:text-[#6e6e84] text-[9.5px]">
                                {item.dropOffRate != null ? `${item.dropOffRate}% drop` : "—"}
                              </span>
                              <span
                                className={`text-[8.5px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded border ${diagnosticSeverityStyle(
                                  item.severity
                                )}`}
                              >
                                {item.severity}
                              </span>
                            </>
                          ) : (
                            <span className="text-[9px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded border border-zinc-200 dark:border-[#222232] bg-zinc-100 dark:bg-[#1a1a26] text-zinc-400 dark:text-[#6e6e84]">
                              Awaiting Data
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Outcome Disposition Bento */}
            <div className="grid grid-cols-4 gap-2">
              <div className="rounded-lg px-2 py-2 text-center border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10">
                <p className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {insights.outcomeCounts.positive}
                </p>
                <p className="text-[9px] uppercase tracking-wider font-mono text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">
                  Positive
                </p>
              </div>

              <div className="rounded-lg px-2 py-2 text-center border border-rose-500/20 bg-rose-500/5 dark:bg-rose-500/10">
                <p className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                  {insights.outcomeCounts.negative}
                </p>
                <p className="text-[9px] uppercase tracking-wider font-mono text-rose-600/80 dark:text-rose-400/80 mt-0.5">
                  Negative
                </p>
              </div>

              <div className="rounded-lg px-2 py-2 text-center border border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/10">
                <p className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                  {insights.outcomeCounts.self_filtered}
                </p>
                <p className="text-[9px] uppercase tracking-wider font-mono text-amber-600/80 dark:text-amber-400/80 mt-0.5">
                  Filtered
                </p>
              </div>

              <div className="rounded-lg px-2 py-2 text-center border border-[#5e6ad2]/20 bg-[#5e6ad2]/5 dark:bg-[#5e6ad2]/10">
                <p className="text-xs font-mono font-bold text-[#5e6ad2] dark:text-[#828df8] tabular-nums">
                  {insights.outcomeCounts.pending}
                </p>
                <p className="text-[9px] uppercase tracking-wider font-mono text-[#5e6ad2]/80 dark:text-[#828df8]/80 mt-0.5">
                  Pending
                </p>
              </div>
            </div>

            {/* Score Threshold & Calibration Engine */}
            <div className="rounded-lg border border-zinc-200/80 dark:border-[#1a1a26] bg-zinc-50/60 dark:bg-[#101018] p-3">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] uppercase tracking-wider font-mono font-semibold text-zinc-500 dark:text-[#8b8b9e] flex items-center gap-1.5">
                  <TrendingUp size={11} className="text-[#5e6ad2]" />
                  Predictive Score Threshold
                </p>

                {insights.scoreThreshold.recommended != null ? (
                  <span
                    className={`text-[9px] uppercase tracking-wider font-mono font-bold px-2 py-0.5 rounded-md border ${thresholdConfidenceStyle(
                      insights.scoreThreshold.confidence
                    )}`}
                  >
                    {insights.scoreThreshold.confidence} confidence
                  </span>
                ) : (
                  <span className="text-[9px] uppercase tracking-wider font-mono px-2 py-0.5 rounded-md border border-zinc-200 dark:border-[#222232] bg-zinc-100 dark:bg-[#1a1a26] text-zinc-500 dark:text-[#8b8b9e]">
                    Calibrating
                  </span>
                )}
              </div>

              {insights.scoreThreshold.recommended == null ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10.5px] font-mono">
                    <span className="text-zinc-600 dark:text-[#c4c4d4] font-medium">
                      Calibration Baseline
                    </span>
                    <span className="text-[#5e6ad2] dark:text-[#828df8] font-bold">
                      {insights.scoreThreshold.sampleSize} / 5 required
                    </span>
                  </div>

                  {/* Visual Calibration Progress Bar */}
                  <div className="w-full bg-zinc-200 dark:bg-[#1e1e2a] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#5e6ad2] h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(12, Math.round((insights.scoreThreshold.sampleSize / 5) * 100))
                        )}%`,
                      }}
                    />
                  </div>

                  <p className="text-[10.5px] text-zinc-500 dark:text-[#8b8b9e] leading-relaxed">
                    Threshold models automatically calibrate once 5 outcomes are recorded. Track
                    applications to unlock predictive scoring gates.
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-mono font-bold text-zinc-900 dark:text-[#ebebef]">
                      {insights.scoreThreshold.recommended}/100
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500 dark:text-[#8b8b9e]">
                      Band {insights.scoreThreshold.lowerBound}–{insights.scoreThreshold.upperBound} (n=
                      {insights.scoreThreshold.sampleSize})
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-[#8b8b9e] leading-relaxed">
                    {insights.scoreThreshold.reasoning}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Velocity */}
        {activeTab === "velocity" && (
          <div className="space-y-3.5">
            {/* 6W Velocity Histogram */}
            <div className="rounded-lg border border-zinc-200/80 dark:border-[#1a1a26] bg-zinc-50/60 dark:bg-[#101018] p-3">
              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="text-[10px] uppercase tracking-wider font-mono font-semibold text-zinc-500 dark:text-[#8b8b9e]">
                  6-Week Action Throughput
                </p>
                {latestWeek ? (
                  <p className="text-[9.5px] uppercase tracking-wider font-mono text-[#5e6ad2] dark:text-[#828df8] font-semibold">
                    {formatIsoWeekLabel(latestWeek.isoWeek)} • {latestWeek.total} total
                  </p>
                ) : (
                  <p className="text-[9.5px] uppercase tracking-wider font-mono text-zinc-400 dark:text-[#5a5a6e]">
                    Weekly Cadence
                  </p>
                )}
              </div>

              {insights.weeklyVelocity.length === 0 ? (
                <p className="text-[11px] font-mono text-zinc-400 dark:text-[#5a5a6e] py-6 text-center">
                  No weekly activity recorded yet.
                </p>
              ) : (
                <>
                  <div className="h-28 flex items-end gap-2 pt-2">
                    {insights.weeklyVelocity.map((week) => (
                      <div key={week.isoWeek} className="flex-1 min-w-0 flex flex-col items-center">
                        <div className="h-20 w-full flex items-end justify-center gap-1 px-1">
                          <span
                            title={`Applied: ${week.applied}`}
                            className="w-2 rounded-t-sm bg-[#5e6ad2] hover:brightness-110 transition-all"
                            style={{ height: velocityBarHeight(week.applied, maxVelocityTotal) }}
                          />
                          <span
                            title={`Progressed: ${week.progressed}`}
                            className="w-2 rounded-t-sm bg-emerald-500 hover:brightness-110 transition-all"
                            style={{ height: velocityBarHeight(week.progressed, maxVelocityTotal) }}
                          />
                          <span
                            title={`Offers: ${week.offers}`}
                            className="w-2 rounded-t-sm bg-amber-500 hover:brightness-110 transition-all"
                            style={{ height: velocityBarHeight(week.offers, maxVelocityTotal) }}
                          />
                        </div>
                        <p className="mt-1.5 text-center text-[9px] font-mono font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b8b9e]">
                          {formatIsoWeekLabel(week.isoWeek)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Chart Legend */}
                  <div className="mt-2.5 pt-2 border-t border-zinc-200/60 dark:border-[#1e1e2a] flex items-center justify-center gap-4 text-[9.5px] font-mono uppercase tracking-wider font-medium text-zinc-500 dark:text-[#8b8b9e]">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-xs bg-[#5e6ad2]" /> Applied
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-xs bg-emerald-500" /> Progressed
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-xs bg-amber-500" /> Offers
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Week-over-Week Momentum Deltas */}
            <div className="space-y-1.5">
              <p className="text-[10px] uppercase tracking-wider font-mono font-semibold text-zinc-500 dark:text-[#8b8b9e]">
                Momentum Telemetry (vs Prior Week)
              </p>
              {weeklyVelocityDelta ? (
                <div className="grid grid-cols-4 gap-2 text-[10px] font-mono">
                  <div className="rounded-lg border border-zinc-200/80 dark:border-[#1a1a26] bg-zinc-50/60 dark:bg-[#101018] p-2.5 text-center">
                    <p className="uppercase tracking-wider text-zinc-400 dark:text-[#5a5a6e]">Total</p>
                    <p className={`text-sm font-bold mt-0.5 ${deltaStyle(weeklyVelocityDelta.total)}`}>
                      {formatSignedDelta(weeklyVelocityDelta.total)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-zinc-200/80 dark:border-[#1a1a26] bg-zinc-50/60 dark:bg-[#101018] p-2.5 text-center">
                    <p className="uppercase tracking-wider text-zinc-400 dark:text-[#5a5a6e]">Applied</p>
                    <p className={`text-sm font-bold mt-0.5 ${deltaStyle(weeklyVelocityDelta.applied)}`}>
                      {formatSignedDelta(weeklyVelocityDelta.applied)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-zinc-200/80 dark:border-[#1a1a26] bg-zinc-50/60 dark:bg-[#101018] p-2.5 text-center">
                    <p className="uppercase tracking-wider text-zinc-400 dark:text-[#5a5a6e]">Progressed</p>
                    <p className={`text-sm font-bold mt-0.5 ${deltaStyle(weeklyVelocityDelta.progressed)}`}>
                      {formatSignedDelta(weeklyVelocityDelta.progressed)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-zinc-200/80 dark:border-[#1a1a26] bg-zinc-50/60 dark:bg-[#101018] p-2.5 text-center">
                    <p className="uppercase tracking-wider text-zinc-400 dark:text-[#5a5a6e]">Offers</p>
                    <p className={`text-sm font-bold mt-0.5 ${deltaStyle(weeklyVelocityDelta.offers)}`}>
                      {formatSignedDelta(weeklyVelocityDelta.offers)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-zinc-200 dark:border-[#1e1e2a] p-3 text-[11px] font-mono text-zinc-400 dark:text-[#6e6e84] text-center">
                  Need at least two weeks of tracking history to calculate velocity delta.
                </div>
              )}
            </div>

            {/* Cadence Assessment Status */}
            <div className="rounded-lg border border-[#5e6ad2]/20 bg-[#5e6ad2]/5 dark:bg-[#5e6ad2]/10 p-3">
              <div className="flex items-center gap-2 mb-1">
                <Zap size={12} className="text-[#5e6ad2]" />
                <span className="text-[10px] uppercase tracking-wider font-mono font-semibold text-zinc-900 dark:text-[#ebebef]">
                  Throughput Evaluation
                </span>
              </div>
              <p className="text-[11px] font-mono text-zinc-600 dark:text-[#8b8b9e] leading-relaxed">
                {latestWeek && latestWeek.total > 0
                  ? `Active search cadence with ${latestWeek.total} action${
                      latestWeek.total > 1 ? "s" : ""
                    } logged in ${formatIsoWeekLabel(latestWeek.isoWeek)}. Target 3–5 targeted applications weekly for compounding conversion stability.`
                  : "No activity logged for the active cycle. Select matched opportunities from Job Radar to ignite search velocity."}
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Strategy */}
        {activeTab === "strategy" && (
          <div className="space-y-3.5">
            {/* 3-Column Dimensional Bento */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Archetypes */}
              <div className="rounded-lg border border-zinc-200/80 dark:border-[#1a1a26] bg-zinc-50/60 dark:bg-[#101018] p-2.5">
                <p className="text-[9.5px] uppercase tracking-wider font-mono font-semibold text-zinc-500 dark:text-[#8b8b9e] mb-1.5">
                  Top Archetypes
                </p>
                {insights.archetypeBreakdown.length === 0 ? (
                  <p className="text-[10.5px] font-mono text-zinc-400 dark:text-[#5a5a6e]">
                    No archetype data yet.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {insights.archetypeBreakdown.slice(0, 2).map((entry) => (
                      <div key={entry.archetype} className="flex items-center justify-between gap-1 text-[10.5px]">
                        <span className="font-semibold text-zinc-800 dark:text-[#ebebef] truncate">
                          {formatDimensionLabel(entry.archetype)}
                        </span>
                        <span className="font-mono text-zinc-500 dark:text-[#8b8b9e] shrink-0">
                          {entry.conversionRate}% ({entry.total})
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Primary Blockers */}
              <div className="rounded-lg border border-zinc-200/80 dark:border-[#1a1a26] bg-zinc-50/60 dark:bg-[#101018] p-2.5">
                <p className="text-[9.5px] uppercase tracking-wider font-mono font-semibold text-zinc-500 dark:text-[#8b8b9e] mb-1.5">
                  Primary Blockers
                </p>
                {insights.blockerAnalysis.length === 0 ? (
                  <p className="text-[10.5px] font-mono text-zinc-400 dark:text-[#5a5a6e]">
                    No blocker data yet.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {insights.blockerAnalysis.slice(0, 2).map((entry) => (
                      <div key={entry.blocker} className="flex items-center justify-between gap-1 text-[10.5px]">
                        <span className="font-semibold text-zinc-800 dark:text-[#ebebef] truncate">
                          {formatDimensionLabel(entry.blocker)}
                        </span>
                        <span className="font-mono text-zinc-500 dark:text-[#8b8b9e] shrink-0">
                          {entry.percentage}% ({entry.frequency})
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Gap Tags */}
              <div className="rounded-lg border border-zinc-200/80 dark:border-[#1a1a26] bg-zinc-50/60 dark:bg-[#101018] p-2.5">
                <p className="text-[9.5px] uppercase tracking-wider font-mono font-semibold text-zinc-500 dark:text-[#8b8b9e] mb-1.5">
                  Gap Tags
                </p>
                {insights.blockerTagAnalysis.length === 0 ? (
                  <p className="text-[10.5px] font-mono text-zinc-400 dark:text-[#5a5a6e]">
                    No gap tags yet.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {insights.blockerTagAnalysis.slice(0, 2).map((entry) => (
                      <div key={entry.tag} className="flex items-center justify-between gap-1 text-[10.5px]">
                        <span className="font-semibold text-zinc-800 dark:text-[#ebebef] truncate">
                          {formatDimensionLabel(entry.tag)}
                        </span>
                        <span className="font-mono text-zinc-500 dark:text-[#8b8b9e] shrink-0">
                          {entry.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Prioritized Recommendations */}
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-wider font-mono font-semibold text-zinc-500 dark:text-[#8b8b9e] flex items-center gap-1.5">
                <TriangleAlert size={11} className="text-amber-500" />
                Strategic Action Blueprint
              </p>

              {insights.recommendations.length === 0 ? (
                <div className="rounded-lg border border-dashed border-zinc-200 dark:border-[#1e1e2a] p-3 text-[11px] font-mono text-zinc-400 dark:text-[#6e6e84] text-center">
                  Log additional applications to generate bespoke tactical recommendations.
                </div>
              ) : (
                <div className="space-y-2 max-h-[14rem] overflow-y-auto pr-1 custom-scrollbar">
                  {insights.recommendations.slice(0, 3).map((recommendation, index) => (
                    <div
                      key={`${recommendation.action}-${index}`}
                      className="rounded-lg border border-zinc-200/80 dark:border-[#1a1a26] bg-zinc-50/60 dark:bg-[#101018] p-3 transition-colors hover:border-[#5e6ad2]/30"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-xs font-semibold text-zinc-900 dark:text-[#ebebef] leading-snug">
                          {recommendation.action}
                        </p>
                        <span
                          className={`text-[8.5px] font-mono uppercase tracking-wider font-bold px-1.5 py-0.5 rounded border shrink-0 ${impactStyle(
                            recommendation.impact
                          )}`}
                        >
                          {recommendation.impact}
                        </span>
                      </div>
                      <p className="text-[10.5px] font-mono text-zinc-500 dark:text-[#8b8b9e] leading-relaxed">
                        {recommendation.reasoning}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation Strip */}
      <div className="pt-3 border-t border-zinc-200/80 dark:border-[#1e1e2a] flex items-center justify-between text-xs font-mono">
        <span className="text-[10.5px] text-zinc-400 dark:text-[#6e6e84]">
          Heuristic analytics engine
        </span>
        <Link
          href="/career-path"
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#5e6ad2] hover:text-[#525ec2] transition-colors"
        >
          <span>Explore Pathways</span>
          <ArrowRight size={11} />
        </Link>
      </div>
    </m.div>
  );
});