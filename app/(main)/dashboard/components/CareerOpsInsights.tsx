"use client";

import { memo } from "react";
import { FlaskConical, TrendingUp, TriangleAlert } from "lucide-react";
import type { CareerOpsPatternInsights } from "@/types/career-ops";

function formatRate(value: number | null): string {
  return value == null ? "N/A" : `${value}%`;
}

function impactStyle(impact: "high" | "medium" | "low"): string {
  if (impact === "high") return "text-rose-600 dark:text-rose-300 bg-rose-500/10 border-rose-500/20";
  if (impact === "medium") return "text-amber-600 dark:text-amber-300 bg-amber-500/10 border-amber-500/20";
  return "text-blue-600 dark:text-blue-300 bg-blue-500/10 border-blue-500/20";
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
  if (trend === "up") return "text-rose-600 dark:text-rose-300";
  if (trend === "down") return "text-emerald-600 dark:text-emerald-300";
  return "text-gray-500 dark:text-gray-400";
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
  if (value > 0) return "text-emerald-600 dark:text-emerald-300";
  if (value < 0) return "text-rose-600 dark:text-rose-300";
  return "text-gray-500 dark:text-gray-400";
}

function formatArchetypeDelta(value: number): string {
  if (value > 0) return `+${value}pp vs baseline`;
  if (value < 0) return `${value}pp vs baseline`;
  return "0pp vs baseline";
}

function archetypeDeltaStyle(trend: "above" | "below" | "neutral"): string {
  if (trend === "above") return "text-emerald-600 dark:text-emerald-300";
  if (trend === "below") return "text-rose-600 dark:text-rose-300";
  return "text-gray-500 dark:text-gray-400";
}

function diagnosticSeverityStyle(severity: "critical" | "watch" | "healthy"): string {
  if (severity === "critical") {
    return "text-rose-700 dark:text-rose-300 bg-rose-500/10 border-rose-500/20";
  }

  if (severity === "watch") {
    return "text-amber-700 dark:text-amber-300 bg-amber-500/10 border-amber-500/20";
  }

  return "text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border-emerald-500/20";
}

function formatDropOff(value: number | null): string {
  if (value == null) return "N/A drop";
  return `${value}% drop`;
}

function thresholdConfidenceStyle(confidence: "low" | "medium" | "high"): string {
  if (confidence === "high") {
    return "text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border-emerald-500/20";
  }

  if (confidence === "medium") {
    return "text-amber-700 dark:text-amber-300 bg-amber-500/10 border-amber-500/20";
  }

  return "text-gray-600 dark:text-gray-300 bg-gray-500/10 border-gray-500/20";
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
  const width = 42;
  const height = 14;
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
      className={`h-4 w-10 ${trendStyle(trend)}`}
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
      <circle cx={x1} cy={y1} r="1.5" className="fill-current opacity-70" />
      <circle cx={x2} cy={y2} r="1.8" className="fill-current" />
    </svg>
  );
}

export const CareerOpsInsights = memo(function CareerOpsInsights({
  insights,
}: {
  insights: CareerOpsPatternInsights;
}) {
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
    <div className="bg-white/70 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 backdrop-blur-md shadow-lg dark:shadow-none transition-colors duration-300 lg:max-h-[42rem] lg:overflow-y-auto lg:pr-3">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 flex items-center gap-2">
          <FlaskConical size={16} /> Pattern Insights
        </h2>
        <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
          {insights.totalApplications} tracked
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/40 px-3 py-2">
          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400">Apply</p>
          <p className="text-base font-black text-gray-900 dark:text-white">{formatRate(insights.rates.applyRate)}</p>
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/40 px-3 py-2">
          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400">Response</p>
          <p className="text-base font-black text-gray-900 dark:text-white">{formatRate(insights.rates.responseRate)}</p>
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/40 px-3 py-2">
          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400">Interview</p>
          <p className="text-base font-black text-gray-900 dark:text-white">{formatRate(insights.rates.interviewRate)}</p>
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/40 px-3 py-2">
          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400">Offer</p>
          <p className="text-base font-black text-gray-900 dark:text-white">{formatRate(insights.rates.offerRate)}</p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/40 px-3 py-3 mb-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400">
            Funnel Diagnostics
          </p>
          {topLeak && (
            <p className="text-[9px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500 text-right">
              Largest leak {topLeak.label} ({topLeak.dropOffRate}%)
            </p>
          )}
        </div>

        {insights.stageDiagnostics.length === 0 ? (
          <p className="text-[11px] text-gray-500 dark:text-gray-400">No stage diagnostics yet.</p>
        ) : (
          <div className="space-y-1.5">
            {insights.stageDiagnostics.map((item) => (
              <div
                key={item.stage}
                className="rounded-md border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-black/20 px-2.5 py-2 flex items-center justify-between gap-2"
              >
                <p className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                  {item.label}
                </p>
                <div className="flex items-center gap-1.5">
                  <p className="text-[10px] font-black text-gray-700 dark:text-gray-300">
                    {formatRate(item.conversionRate)} conv
                  </p>
                  <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                    {formatDropOff(item.dropOffRate)}
                  </p>
                  <span
                    className={`text-[9px] uppercase tracking-wider font-black px-2 py-1 rounded-md border ${diagnosticSeverityStyle(item.severity)}`}
                  >
                    {item.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="rounded-md px-2 py-2 text-center border border-emerald-500/20 bg-emerald-500/10">
          <p className="text-xs font-black text-emerald-700 dark:text-emerald-300">{insights.outcomeCounts.positive}</p>
          <p className="text-[9px] uppercase tracking-wider font-bold text-emerald-600/80 dark:text-emerald-300/80">Positive</p>
        </div>
        <div className="rounded-md px-2 py-2 text-center border border-rose-500/20 bg-rose-500/10">
          <p className="text-xs font-black text-rose-700 dark:text-rose-300">{insights.outcomeCounts.negative}</p>
          <p className="text-[9px] uppercase tracking-wider font-bold text-rose-600/80 dark:text-rose-300/80">Negative</p>
        </div>
        <div className="rounded-md px-2 py-2 text-center border border-amber-500/20 bg-amber-500/10">
          <p className="text-xs font-black text-amber-700 dark:text-amber-300">{insights.outcomeCounts.self_filtered}</p>
          <p className="text-[9px] uppercase tracking-wider font-bold text-amber-600/80 dark:text-amber-300/80">Filtered</p>
        </div>
        <div className="rounded-md px-2 py-2 text-center border border-blue-500/20 bg-blue-500/10">
          <p className="text-xs font-black text-blue-700 dark:text-blue-300">{insights.outcomeCounts.pending}</p>
          <p className="text-[9px] uppercase tracking-wider font-bold text-blue-600/80 dark:text-blue-300/80">Pending</p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/40 px-3 py-3 mb-4">
        <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
          <TrendingUp size={11} /> Score Threshold
        </p>
        <p className="text-sm font-black text-gray-900 dark:text-white mb-1">
          {insights.scoreThreshold.recommended == null
            ? "Not enough data"
            : `${insights.scoreThreshold.recommended}/100`}
        </p>

        {insights.scoreThreshold.recommended != null && (
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400">
              Band {insights.scoreThreshold.lowerBound}-{insights.scoreThreshold.upperBound}
            </span>
            <span
              className={`text-[9px] uppercase tracking-wider font-black px-2 py-1 rounded-md border ${thresholdConfidenceStyle(insights.scoreThreshold.confidence)}`}
            >
              {insights.scoreThreshold.confidence} confidence
            </span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400">
              n={insights.scoreThreshold.sampleSize}
            </span>
          </div>
        )}

        <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
          {insights.scoreThreshold.reasoning}
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/40 px-3 py-3 mb-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400">
            6w Velocity
          </p>
          {latestWeek ? (
            <p className="text-[9px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500">
              {formatIsoWeekLabel(latestWeek.isoWeek)} total {latestWeek.total}
            </p>
          ) : (
            <p className="text-[9px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500">
              Applied / Progressed / Offers
            </p>
          )}
        </div>

        {insights.weeklyVelocity.length === 0 ? (
          <p className="text-[11px] text-gray-500 dark:text-gray-400">No weekly activity yet.</p>
        ) : (
          <>
            <div className="h-20 flex items-end gap-1.5">
              {insights.weeklyVelocity.map((week) => (
                <div key={week.isoWeek} className="flex-1 min-w-0">
                  <div className="h-14 flex items-end justify-center gap-1">
                    <span
                      className="w-1.5 rounded-sm bg-blue-500/70 dark:bg-blue-400/80"
                      style={{ height: velocityBarHeight(week.applied, maxVelocityTotal) }}
                    />
                    <span
                      className="w-1.5 rounded-sm bg-emerald-500/70 dark:bg-emerald-400/80"
                      style={{ height: velocityBarHeight(week.progressed, maxVelocityTotal) }}
                    />
                    <span
                      className="w-1.5 rounded-sm bg-amber-500/70 dark:bg-amber-400/80"
                      style={{ height: velocityBarHeight(week.offers, maxVelocityTotal) }}
                    />
                  </div>
                  <p className="mt-1 text-center text-[9px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    {formatIsoWeekLabel(week.isoWeek)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-2 flex items-center justify-center gap-3 text-[9px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-sm bg-blue-500/70 dark:bg-blue-400/80" /> Applied
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-sm bg-emerald-500/70 dark:bg-emerald-400/80" /> Progressed
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-sm bg-amber-500/70 dark:bg-amber-400/80" /> Offers
              </span>
            </div>

            {weeklyVelocityDelta && (
              <div className="mt-2 grid grid-cols-4 gap-1.5 text-[10px]">
                <div className="rounded-md border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-black/20 px-2 py-1.5 text-center">
                  <p className="uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400">Total</p>
                  <p className={`font-black ${deltaStyle(weeklyVelocityDelta.total)}`}>
                    {formatSignedDelta(weeklyVelocityDelta.total)}
                  </p>
                </div>
                <div className="rounded-md border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-black/20 px-2 py-1.5 text-center">
                  <p className="uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400">Applied</p>
                  <p className={`font-black ${deltaStyle(weeklyVelocityDelta.applied)}`}>
                    {formatSignedDelta(weeklyVelocityDelta.applied)}
                  </p>
                </div>
                <div className="rounded-md border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-black/20 px-2 py-1.5 text-center">
                  <p className="uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400">Progressed</p>
                  <p className={`font-black ${deltaStyle(weeklyVelocityDelta.progressed)}`}>
                    {formatSignedDelta(weeklyVelocityDelta.progressed)}
                  </p>
                </div>
                <div className="rounded-md border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-black/20 px-2 py-1.5 text-center">
                  <p className="uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400">Offers</p>
                  <p className={`font-black ${deltaStyle(weeklyVelocityDelta.offers)}`}>
                    {formatSignedDelta(weeklyVelocityDelta.offers)}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/40 px-3 py-3">
          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 mb-2">
            Top Archetypes
          </p>
          {insights.archetypeBreakdown.length === 0 ? (
            <p className="text-[11px] text-gray-500 dark:text-gray-400">No archetype data yet.</p>
          ) : (
            <>
              <div className="space-y-2">
                {insights.archetypeBreakdown.slice(0, 3).map((entry) => (
                  <div key={entry.archetype} className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                      {formatDimensionLabel(entry.archetype)}
                    </p>
                    <p className="text-[11px] font-bold text-gray-600 dark:text-gray-300">
                      {entry.conversionRate}% conv ({entry.total})
                    </p>
                  </div>
                ))}
              </div>

              {insights.archetypeDeltas.length > 0 && (
                <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700 space-y-1.5">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400">
                    Baseline {insights.archetypeDeltas[0]?.baselineConversionRate}%
                  </p>
                  {insights.archetypeDeltas.slice(0, 2).map((entry) => (
                    <div key={`delta-${entry.archetype}`} className="flex items-center justify-between gap-2">
                      <p className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                        {formatDimensionLabel(entry.archetype)}
                      </p>
                      <p className={`text-[11px] font-black ${archetypeDeltaStyle(entry.trend)}`}>
                        {formatArchetypeDelta(entry.deltaPercentagePoints)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/40 px-3 py-3">
          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 mb-2">
            Primary Blockers
          </p>
          {insights.blockerAnalysis.length === 0 ? (
            <p className="text-[11px] text-gray-500 dark:text-gray-400">No blocker data yet.</p>
          ) : (
            <div className="space-y-2">
              {insights.blockerAnalysis.slice(0, 3).map((entry) => (
                <div key={entry.blocker} className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                    {formatDimensionLabel(entry.blocker)}
                  </p>
                  <p className="text-[11px] font-bold text-gray-600 dark:text-gray-300">
                    {entry.percentage}% ({entry.frequency})
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/40 px-3 py-3">
          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 mb-2">
            Gap Tags
          </p>
          {insights.blockerTagAnalysis.length === 0 ? (
            <p className="text-[11px] text-gray-500 dark:text-gray-400">No tag data yet.</p>
          ) : (
            <>
              <div className="space-y-2">
                {insights.blockerTagAnalysis.slice(0, 3).map((entry) => (
                  <div key={entry.tag} className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                      {formatDimensionLabel(entry.tag)}
                    </p>
                    <p className="text-[11px] font-bold text-gray-600 dark:text-gray-300">
                      {entry.percentage}% ({entry.frequency})
                    </p>
                  </div>
                ))}
              </div>

              {insights.blockerTagTrends.length > 0 && (
                <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 mb-1.5">
                    14d Trend
                  </p>
                  <div className="space-y-1.5">
                    {insights.blockerTagTrends.slice(0, 2).map((entry) => (
                      <div key={`trend-${entry.tag}`} className="flex items-center justify-between gap-2">
                        <p className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                          {formatDimensionLabel(entry.tag)}
                        </p>
                        <div className="flex items-center gap-1.5">
                          <TrendSparkline
                            previous={entry.previousPercentage}
                            recent={entry.recentPercentage}
                            trend={entry.trend}
                          />
                          <p className={`text-[11px] font-black ${trendStyle(entry.trend)}`}>
                            {formatDeltaPercentagePoints(entry.deltaPercentagePoints)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="space-y-2.5">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
          <TriangleAlert size={12} /> Recommended Moves
        </h3>

        {insights.recommendations.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-800/30 p-3 text-[11px] text-gray-500 dark:text-gray-400 text-center">
            Keep logging applications to unlock stronger recommendations.
          </div>
        ) : (
          insights.recommendations.map((recommendation, index) => (
            <div
              key={`${recommendation.action}-${index}`}
              className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/40 p-3"
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <p className="text-xs font-bold text-gray-900 dark:text-white leading-snug">
                  {recommendation.action}
                </p>
                <span
                  className={`text-[9px] uppercase tracking-wider font-black px-2 py-1 rounded-md border ${impactStyle(recommendation.impact)}`}
                >
                  {recommendation.impact}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                {recommendation.reasoning}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
});