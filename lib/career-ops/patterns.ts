import { normalizeCareerOpsStatus } from "@/lib/career-ops/status";
import type { CareerOpsApplicationSnapshot } from "@/lib/career-ops/summary";
import {
  normalizePrimaryBlocker,
  normalizeRoleArchetype,
} from "@/lib/career-ops/dimensions";

export type CareerOpsOutcomeGroup = "positive" | "negative" | "self_filtered" | "pending";

export interface CareerOpsPatternScoreStats {
  avg: number | null;
  min: number | null;
  max: number | null;
  count: number;
}

export interface CareerOpsPatternRecommendation {
  action: string;
  reasoning: string;
  impact: "high" | "medium" | "low";
}

export interface CareerOpsPatternArchetypeBreakdownItem {
  archetype: string;
  total: number;
  positive: number;
  negative: number;
  selfFiltered: number;
  pending: number;
  conversionRate: number;
}

export interface CareerOpsPatternArchetypeDeltaItem {
  archetype: string;
  total: number;
  conversionRate: number;
  baselineConversionRate: number;
  deltaPercentagePoints: number;
  trend: "above" | "below" | "neutral";
}

export interface CareerOpsPatternBlockerItem {
  blocker: string;
  frequency: number;
  percentage: number;
}

export interface CareerOpsPatternBlockerTagItem {
  tag: string;
  frequency: number;
  percentage: number;
}

export interface CareerOpsPatternBlockerTagTrendItem {
  tag: string;
  recentFrequency: number;
  previousFrequency: number;
  recentPercentage: number;
  previousPercentage: number;
  deltaPercentagePoints: number;
  trend: "up" | "down" | "flat";
}

export interface CareerOpsPatternWeeklyVelocityItem {
  isoWeek: string;
  total: number;
  applied: number;
  progressed: number;
  offers: number;
}

export interface CareerOpsPatternStageDiagnosticItem {
  stage:
    | "evaluated_to_applied"
    | "applied_to_response"
    | "response_to_interview"
    | "interview_to_offer";
  label: string;
  fromCount: number;
  toCount: number;
  conversionRate: number | null;
  dropOffRate: number | null;
  severity: "critical" | "watch" | "healthy";
}

export interface CareerOpsPatternScoreThreshold {
  recommended: number | null;
  lowerBound: number | null;
  upperBound: number | null;
  confidence: "low" | "medium" | "high";
  sampleSize: number;
  reasoning: string;
}

export interface CareerOpsPatternInsights {
  totalApplications: number;
  outcomeCounts: Record<CareerOpsOutcomeGroup, number>;
  funnel: {
    evaluated: number;
    applied: number;
    responded: number;
    interview: number;
    offer: number;
    rejected: number;
    discarded: number;
    skip: number;
  };
  rates: {
    applyRate: number | null;
    responseRate: number | null;
    interviewRate: number | null;
    offerRate: number | null;
  };
  stageDiagnostics: CareerOpsPatternStageDiagnosticItem[];
  scoreByOutcome: Record<CareerOpsOutcomeGroup, CareerOpsPatternScoreStats>;
  scoreThreshold: CareerOpsPatternScoreThreshold;
  archetypeBreakdown: CareerOpsPatternArchetypeBreakdownItem[];
  archetypeDeltas: CareerOpsPatternArchetypeDeltaItem[];
  blockerAnalysis: CareerOpsPatternBlockerItem[];
  blockerTagAnalysis: CareerOpsPatternBlockerTagItem[];
  blockerTagTrends: CareerOpsPatternBlockerTagTrendItem[];
  weeklyVelocity: CareerOpsPatternWeeklyVelocityItem[];
  recommendations: CareerOpsPatternRecommendation[];
}

function classifyOutcome(status: string): CareerOpsOutcomeGroup {
  const normalized = normalizeCareerOpsStatus(status);
  if (normalized === "responded" || normalized === "interview" || normalized === "offer") {
    return "positive";
  }
  if (normalized === "rejected" || normalized === "discarded") {
    return "negative";
  }
  if (normalized === "skip") {
    return "self_filtered";
  }
  return "pending";
}

function toPercent(numerator: number, denominator: number): number | null {
  if (denominator <= 0) return null;
  return Math.round((numerator / denominator) * 100);
}

function toScoreStats(values: number[]): CareerOpsPatternScoreStats {
  if (values.length === 0) {
    return {
      avg: null,
      min: null,
      max: null,
      count: 0,
    };
  }

  const sum = values.reduce((acc, value) => acc + value, 0);
  const avg = Math.round((sum / values.length) * 10) / 10;

  return {
    avg,
    min: Math.min(...values),
    max: Math.max(...values),
    count: values.length,
  };
}

function percentile(sortedValues: number[], p: number): number {
  if (sortedValues.length === 0) return Number.NaN;
  if (sortedValues.length === 1) return sortedValues[0];

  const index = (sortedValues.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);

  if (lower === upper) return sortedValues[lower];

  const weight = index - lower;
  return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
}

function emptyScoreMap(): Record<CareerOpsOutcomeGroup, number[]> {
  return {
    positive: [],
    negative: [],
    self_filtered: [],
    pending: [],
  };
}

const DAY_MS = 24 * 60 * 60 * 1000;
const TAG_TREND_WINDOW_DAYS = 14;
const WEEKLY_VELOCITY_WEEKS = 6;

function utcDayStartMs(dateValue: Date): number {
  return Date.UTC(dateValue.getUTCFullYear(), dateValue.getUTCMonth(), dateValue.getUTCDate());
}

export function emptyCareerOpsPatternInsights(): CareerOpsPatternInsights {
  return {
    totalApplications: 0,
    outcomeCounts: {
      positive: 0,
      negative: 0,
      self_filtered: 0,
      pending: 0,
    },
    funnel: {
      evaluated: 0,
      applied: 0,
      responded: 0,
      interview: 0,
      offer: 0,
      rejected: 0,
      discarded: 0,
      skip: 0,
    },
    rates: {
      applyRate: null,
      responseRate: null,
      interviewRate: null,
      offerRate: null,
    },
    stageDiagnostics: [],
    scoreByOutcome: {
      positive: toScoreStats([]),
      negative: toScoreStats([]),
      self_filtered: toScoreStats([]),
      pending: toScoreStats([]),
    },
    scoreThreshold: {
      recommended: null,
      lowerBound: null,
      upperBound: null,
      confidence: "low",
      sampleSize: 0,
      reasoning: "Not enough positive outcome data to determine a threshold.",
    },
    archetypeBreakdown: [],
    archetypeDeltas: [],
    blockerAnalysis: [],
    blockerTagAnalysis: [],
    blockerTagTrends: [],
    weeklyVelocity: [],
    recommendations: [],
  };
}

function startOfIsoWeekUtc(inputDate: Date): Date {
  const date = new Date(
    Date.UTC(inputDate.getUTCFullYear(), inputDate.getUTCMonth(), inputDate.getUTCDate())
  );
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() - day + 1);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

function toIsoWeekLabel(inputDate: Date): string {
  const date = new Date(
    Date.UTC(inputDate.getUTCFullYear(), inputDate.getUTCMonth(), inputDate.getUTCDate())
  );
  const dayNumber = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - dayNumber + 3);

  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const firstDayNumber = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNumber + 3);

  const weekNumber = 1 + Math.round((date.getTime() - firstThursday.getTime()) / DAY_MS / 7);
  return `${date.getUTCFullYear()}-W${String(weekNumber).padStart(2, "0")}`;
}

function buildRecentIsoWeekLabels(referenceDate?: Date): string[] {
  const weekStart = startOfIsoWeekUtc(referenceDate ?? new Date());
  const labels: string[] = [];

  for (let i = WEEKLY_VELOCITY_WEEKS - 1; i >= 0; i -= 1) {
    const weekDate = new Date(weekStart);
    weekDate.setUTCDate(weekStart.getUTCDate() - i * 7);
    labels.push(toIsoWeekLabel(weekDate));
  }

  return labels;
}

function buildWeeklyVelocity(
  applications: CareerOpsApplicationSnapshot[],
  referenceDate?: Date
): CareerOpsPatternWeeklyVelocityItem[] {
  const weekLabels = buildRecentIsoWeekLabels(referenceDate);
  const weekMap = new Map<string, Omit<CareerOpsPatternWeeklyVelocityItem, "isoWeek">>();

  for (const weekLabel of weekLabels) {
    weekMap.set(weekLabel, {
      total: 0,
      applied: 0,
      progressed: 0,
      offers: 0,
    });
  }

  for (const application of applications) {
    const updated = new Date(application.updated_at);
    if (Number.isNaN(updated.getTime())) continue;

    const weekLabel = toIsoWeekLabel(updated);
    const bucket = weekMap.get(weekLabel);
    if (!bucket) continue;

    const status = normalizeCareerOpsStatus(application.status);
    bucket.total += 1;

    if (status === "applied") {
      bucket.applied += 1;
    }

    if (status === "responded" || status === "interview" || status === "offer") {
      bucket.progressed += 1;
    }

    if (status === "offer") {
      bucket.offers += 1;
    }
  }

  return weekLabels.map((weekLabel) => {
    const bucket = weekMap.get(weekLabel) ?? {
      total: 0,
      applied: 0,
      progressed: 0,
      offers: 0,
    };

    return {
      isoWeek: weekLabel,
      ...bucket,
    };
  });
}

function stageSeverity(
  stage: CareerOpsPatternStageDiagnosticItem["stage"],
  conversionRate: number | null
): CareerOpsPatternStageDiagnosticItem["severity"] {
  if (conversionRate == null) return "watch";

  if (stage === "evaluated_to_applied") {
    if (conversionRate < 40) return "critical";
    if (conversionRate < 60) return "watch";
    return "healthy";
  }

  if (stage === "applied_to_response") {
    if (conversionRate < 20) return "critical";
    if (conversionRate < 35) return "watch";
    return "healthy";
  }

  if (stage === "response_to_interview") {
    if (conversionRate < 40) return "critical";
    if (conversionRate < 60) return "watch";
    return "healthy";
  }

  if (conversionRate < 25) return "critical";
  if (conversionRate < 45) return "watch";
  return "healthy";
}

function buildStageDiagnostics(input: {
  totalEvaluatedScope: number;
  inFunnel: number;
  responseSignals: number;
  interviewSignals: number;
  offerSignals: number;
}): CareerOpsPatternStageDiagnosticItem[] {
  const stages: Array<
    Pick<CareerOpsPatternStageDiagnosticItem, "stage" | "label"> & {
      fromCount: number;
      toCount: number;
    }
  > = [
    {
      stage: "evaluated_to_applied",
      label: "Evaluated to Applied",
      fromCount: input.totalEvaluatedScope,
      toCount: input.inFunnel,
    },
    {
      stage: "applied_to_response",
      label: "Applied to Response",
      fromCount: input.inFunnel,
      toCount: input.responseSignals,
    },
    {
      stage: "response_to_interview",
      label: "Response to Interview",
      fromCount: input.responseSignals,
      toCount: input.interviewSignals,
    },
    {
      stage: "interview_to_offer",
      label: "Interview to Offer",
      fromCount: input.interviewSignals,
      toCount: input.offerSignals,
    },
  ];

  return stages.map((stage) => {
    const conversionRate = toPercent(stage.toCount, stage.fromCount);
    const dropOffRate = conversionRate == null ? null : Math.max(0, 100 - conversionRate);

    return {
      stage: stage.stage,
      label: stage.label,
      fromCount: stage.fromCount,
      toCount: stage.toCount,
      conversionRate,
      dropOffRate,
      severity: stageSeverity(stage.stage, conversionRate),
    };
  });
}

function buildRecommendations(input: {
  totalApplications: number;
  funnel: CareerOpsPatternInsights["funnel"];
  rates: CareerOpsPatternInsights["rates"];
  scoreThreshold: CareerOpsPatternInsights["scoreThreshold"];
  outcomeCounts: CareerOpsPatternInsights["outcomeCounts"];
  archetypeBreakdown: CareerOpsPatternArchetypeBreakdownItem[];
  blockerAnalysis: CareerOpsPatternBlockerItem[];
  blockerTagAnalysis: CareerOpsPatternBlockerTagItem[];
  blockerTagTrends: CareerOpsPatternBlockerTagTrendItem[];
}): CareerOpsPatternRecommendation[] {
  const recommendations: CareerOpsPatternRecommendation[] = [];

  if (input.totalApplications < 5) {
    recommendations.push({
      action: "Collect more tracker data before making major strategy changes.",
      reasoning: "Pattern insights become more reliable after at least 5 tracked applications.",
      impact: "low",
    });
    return recommendations;
  }

  if ((input.rates.applyRate ?? 100) < 55 && input.funnel.evaluated >= 5) {
    recommendations.push({
      action: "Tighten role targeting before applying.",
      reasoning:
        "Apply rate from evaluated roles is low, which usually means the feed includes too many weak-fit postings.",
      impact: "high",
    });
  }

  if ((input.rates.responseRate ?? 100) < 25 && input.funnel.applied >= 5) {
    recommendations.push({
      action: "Improve resume-job tailoring and follow-up execution.",
      reasoning:
        "Response rate from applied roles is below 25%, suggesting personalization and outreach quality need work.",
      impact: "high",
    });
  }

  const inFunnel =
    input.funnel.applied +
    input.funnel.responded +
    input.funnel.interview +
    input.funnel.offer +
    input.funnel.rejected +
    input.funnel.discarded;
  const positiveProgressionRate = toPercent(
    input.funnel.responded + input.funnel.interview + input.funnel.offer,
    inFunnel
  );

  if ((positiveProgressionRate ?? 100) < 25 && inFunnel >= 5) {
    recommendations.push({
      action: "Recalibrate role targeting toward opportunities with stronger progression potential.",
      reasoning:
        "Very few applications progress beyond initial outcomes, indicating role-fit or positioning issues before interview stages.",
      impact: "high",
    });
  }

  if ((input.rates.interviewRate ?? 100) < 50 && input.funnel.responded >= 3) {
    recommendations.push({
      action: "Strengthen screening-to-interview conversion.",
      reasoning:
        "A lower interview rate after responses can indicate weak recruiter screening narratives or role mismatch at first touch.",
      impact: "medium",
    });
  }

  if ((input.rates.offerRate ?? 100) < 35 && input.funnel.interview >= 2) {
    recommendations.push({
      action: "Prioritize deeper interview prep on target competencies.",
      reasoning:
        "Offer rate from interviews is low, so preparation depth and calibration for seniority expectations likely need adjustment.",
      impact: "medium",
    });
  }

  const decisionDenominator =
    input.outcomeCounts.positive + input.outcomeCounts.negative + input.outcomeCounts.self_filtered;
  const negativeDecisionRate = toPercent(input.outcomeCounts.negative, decisionDenominator);

  if ((negativeDecisionRate ?? 0) >= 50) {
    recommendations.push({
      action: "Bias toward higher-confidence opportunities.",
      reasoning:
        "More than half of resolved applications are negative outcomes, so stricter selection and targeting should improve efficiency.",
      impact: "medium",
    });
  }

  const topKnownBlocker = input.blockerAnalysis.find((item) => item.blocker !== "unknown");
  if (topKnownBlocker && topKnownBlocker.percentage >= 20) {
    recommendations.push({
      action: `Reduce ${topKnownBlocker.blocker} outcomes in top-of-funnel decisions.`,
      reasoning:
        `${topKnownBlocker.percentage}% of tracked applications share this blocker, so filter and preparation should explicitly target it.`,
      impact: "medium",
    });
  }

  const topTag = input.blockerTagAnalysis[0];
  if (topTag && topTag.percentage >= 25) {
    recommendations.push({
      action: `Address ${topTag.tag} skill gaps before applying at scale.`,
      reasoning:
        `${topTag.percentage}% of tracked applications include this gap tag, so focused prep here can improve conversion quality.`,
      impact: "medium",
    });
  }

  const risingTag = input.blockerTagTrends.find(
    (item) => item.trend === "up" && item.deltaPercentagePoints >= 20 && item.recentFrequency >= 2
  );
  if (risingTag) {
    recommendations.push({
      action: `Stabilize ${risingTag.tag} before it widens your rejection funnel.`,
      reasoning:
        `${risingTag.tag} grew by ${risingTag.deltaPercentagePoints} percentage points in the last 14 days versus the prior period.`,
      impact: "medium",
    });
  }

  const rankedArchetypes = input.archetypeBreakdown.filter((item) => item.total >= 2);
  const bestArchetype = [...rankedArchetypes].sort((a, b) => b.conversionRate - a.conversionRate)[0];
  const weakArchetype = rankedArchetypes.find(
    (item) => item.total >= 3 && item.conversionRate === 0
  );

  if (bestArchetype && weakArchetype && bestArchetype.archetype !== weakArchetype.archetype) {
    recommendations.push({
      action: `Shift volume from ${weakArchetype.archetype} to ${bestArchetype.archetype} roles.`,
      reasoning:
        `${bestArchetype.archetype} shows stronger progression while ${weakArchetype.archetype} has no positive outcomes in current data.`,
      impact: "medium",
    });
  }

  if (input.scoreThreshold.recommended != null) {
    recommendations.push({
      action: `Use a minimum match-score threshold near ${input.scoreThreshold.recommended}/100.`,
      reasoning: input.scoreThreshold.reasoning,
      impact: "low",
    });
  }

  return recommendations.slice(0, 4);
}

function buildArchetypeBreakdown(
  applications: CareerOpsApplicationSnapshot[]
): CareerOpsPatternArchetypeBreakdownItem[] {
  const map = new Map<
    string,
    {
      total: number;
      positive: number;
      negative: number;
      selfFiltered: number;
      pending: number;
    }
  >();

  for (const application of applications) {
    const archetype = normalizeRoleArchetype(application.role_archetype, "unknown");
    const current = map.get(archetype) ?? {
      total: 0,
      positive: 0,
      negative: 0,
      selfFiltered: 0,
      pending: 0,
    };

    const outcome = classifyOutcome(application.status);
    current.total += 1;
    if (outcome === "positive") current.positive += 1;
    if (outcome === "negative") current.negative += 1;
    if (outcome === "self_filtered") current.selfFiltered += 1;
    if (outcome === "pending") current.pending += 1;

    map.set(archetype, current);
  }

  return Array.from(map.entries())
    .map(([archetype, values]) => ({
      archetype,
      ...values,
      conversionRate: toPercent(values.positive, values.total) ?? 0,
    }))
    .sort((a, b) => b.total - a.total);
}

function buildArchetypeDeltaAnalysis(input: {
  archetypeBreakdown: CareerOpsPatternArchetypeBreakdownItem[];
  outcomeCounts: CareerOpsPatternInsights["outcomeCounts"];
  totalApplications: number;
}): CareerOpsPatternArchetypeDeltaItem[] {
  const baselineConversionRate = toPercent(
    input.outcomeCounts.positive,
    input.totalApplications
  ) ?? 0;

  return input.archetypeBreakdown
    .filter((item) => item.total >= 2)
    .map((item) => {
      const deltaPercentagePoints = item.conversionRate - baselineConversionRate;
      const trend: CareerOpsPatternArchetypeDeltaItem["trend"] =
        deltaPercentagePoints > 0
          ? "above"
          : deltaPercentagePoints < 0
            ? "below"
            : "neutral";

      return {
        archetype: item.archetype,
        total: item.total,
        conversionRate: item.conversionRate,
        baselineConversionRate,
        deltaPercentagePoints,
        trend,
      };
    })
    .sort((a, b) => {
      const deltaGap = Math.abs(b.deltaPercentagePoints) - Math.abs(a.deltaPercentagePoints);
      if (deltaGap !== 0) return deltaGap;
      return b.total - a.total;
    });
}

function buildBlockerAnalysis(
  applications: CareerOpsApplicationSnapshot[]
): CareerOpsPatternBlockerItem[] {
  const map = new Map<string, number>();

  for (const application of applications) {
    const blocker = normalizePrimaryBlocker(application.primary_blocker, "unknown");
    map.set(blocker, (map.get(blocker) ?? 0) + 1);
  }

  return Array.from(map.entries())
    .map(([blocker, frequency]) => ({
      blocker,
      frequency,
      percentage: toPercent(frequency, applications.length) ?? 0,
    }))
    .sort((a, b) => b.frequency - a.frequency);
}

function normalizeBlockerTag(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

function buildBlockerTagAnalysis(
  applications: CareerOpsApplicationSnapshot[]
): CareerOpsPatternBlockerTagItem[] {
  const map = new Map<string, number>();

  for (const application of applications) {
    const rawTags = Array.isArray(application.blocker_tags) ? application.blocker_tags : [];
    const uniqueTagsForApplication = new Set<string>();

    for (const rawTag of rawTags) {
      const normalized = normalizeBlockerTag(String(rawTag ?? ""));
      if (!normalized) continue;
      uniqueTagsForApplication.add(normalized);
    }

    for (const tag of uniqueTagsForApplication) {
      map.set(tag, (map.get(tag) ?? 0) + 1);
    }
  }

  return Array.from(map.entries())
    .map(([tag, frequency]) => ({
      tag,
      frequency,
      percentage: toPercent(frequency, applications.length) ?? 0,
    }))
    .sort((a, b) => {
      if (b.frequency !== a.frequency) return b.frequency - a.frequency;
      return a.tag.localeCompare(b.tag);
    });
}

function buildBlockerTagTrendAnalysis(
  applications: CareerOpsApplicationSnapshot[],
  referenceDate?: Date
): CareerOpsPatternBlockerTagTrendItem[] {
  const recentTagMap = new Map<string, number>();
  const previousTagMap = new Map<string, number>();
  let recentApplications = 0;
  let previousApplications = 0;

  const referenceMs = utcDayStartMs(referenceDate ?? new Date());

  for (const application of applications) {
    const updated = new Date(application.updated_at);
    if (Number.isNaN(updated.getTime())) continue;

    const daysAgo = Math.floor((referenceMs - utcDayStartMs(updated)) / DAY_MS);
    if (daysAgo < 0 || daysAgo >= TAG_TREND_WINDOW_DAYS * 2) continue;

    const targetMap = daysAgo < TAG_TREND_WINDOW_DAYS ? recentTagMap : previousTagMap;
    if (daysAgo < TAG_TREND_WINDOW_DAYS) {
      recentApplications += 1;
    } else {
      previousApplications += 1;
    }

    const rawTags = Array.isArray(application.blocker_tags) ? application.blocker_tags : [];
    const uniqueTagsForApplication = new Set<string>();

    for (const rawTag of rawTags) {
      const normalized = normalizeBlockerTag(String(rawTag ?? ""));
      if (!normalized) continue;
      uniqueTagsForApplication.add(normalized);
    }

    for (const tag of uniqueTagsForApplication) {
      targetMap.set(tag, (targetMap.get(tag) ?? 0) + 1);
    }
  }

  const allTags = new Set<string>([...recentTagMap.keys(), ...previousTagMap.keys()]);

  return Array.from(allTags)
    .map((tag) => {
      const recentFrequency = recentTagMap.get(tag) ?? 0;
      const previousFrequency = previousTagMap.get(tag) ?? 0;
      const recentPercentage = toPercent(recentFrequency, recentApplications) ?? 0;
      const previousPercentage = toPercent(previousFrequency, previousApplications) ?? 0;
      const deltaPercentagePoints = recentPercentage - previousPercentage;
      const trend: CareerOpsPatternBlockerTagTrendItem["trend"] =
        deltaPercentagePoints > 0
          ? "up"
          : deltaPercentagePoints < 0
            ? "down"
            : "flat";

      return {
        tag,
        recentFrequency,
        previousFrequency,
        recentPercentage,
        previousPercentage,
        deltaPercentagePoints,
        trend,
      };
    })
    .sort((a, b) => {
      const deltaGap = Math.abs(b.deltaPercentagePoints) - Math.abs(a.deltaPercentagePoints);
      if (deltaGap !== 0) return deltaGap;
      if (b.recentFrequency !== a.recentFrequency) return b.recentFrequency - a.recentFrequency;
      return a.tag.localeCompare(b.tag);
    });
}

export function buildCareerOpsPatternInsights(
  applications: CareerOpsApplicationSnapshot[],
  referenceDate?: Date
): CareerOpsPatternInsights {
  if (applications.length === 0) {
    return emptyCareerOpsPatternInsights();
  }

  const scoreMap = emptyScoreMap();
  const outcomeCounts: CareerOpsPatternInsights["outcomeCounts"] = {
    positive: 0,
    negative: 0,
    self_filtered: 0,
    pending: 0,
  };

  const funnel: CareerOpsPatternInsights["funnel"] = {
    evaluated: 0,
    applied: 0,
    responded: 0,
    interview: 0,
    offer: 0,
    rejected: 0,
    discarded: 0,
    skip: 0,
  };

  for (const application of applications) {
    const normalized = normalizeCareerOpsStatus(application.status);
    funnel[normalized] += 1;

    const outcome = classifyOutcome(application.status);
    outcomeCounts[outcome] += 1;

    if (typeof application.match_score === "number" && !Number.isNaN(application.match_score)) {
      scoreMap[outcome].push(application.match_score);
    }
  }

  const rates: CareerOpsPatternInsights["rates"] = {
    applyRate: null,
    responseRate: null,
    interviewRate: null,
    offerRate: null,
  };

  const inFunnel =
    funnel.applied +
    funnel.responded +
    funnel.interview +
    funnel.offer +
    funnel.rejected +
    funnel.discarded;
  const totalEvaluatedScope = funnel.evaluated + inFunnel;
  const responseSignals =
    funnel.responded + funnel.interview + funnel.offer + funnel.rejected + funnel.discarded;
  const interviewSignals = funnel.interview + funnel.offer;
  const offerSignals = funnel.offer;

  rates.applyRate = toPercent(inFunnel, totalEvaluatedScope);
  rates.responseRate = toPercent(responseSignals, inFunnel);
  rates.interviewRate = toPercent(interviewSignals, responseSignals);
  rates.offerRate = toPercent(offerSignals, interviewSignals);

  const stageDiagnostics = buildStageDiagnostics({
    totalEvaluatedScope,
    inFunnel,
    responseSignals,
    interviewSignals,
    offerSignals,
  });

  const scoreByOutcome: CareerOpsPatternInsights["scoreByOutcome"] = {
    positive: toScoreStats(scoreMap.positive),
    negative: toScoreStats(scoreMap.negative),
    self_filtered: toScoreStats(scoreMap.self_filtered),
    pending: toScoreStats(scoreMap.pending),
  };

  const positiveScores = scoreMap.positive.filter((score) => score > 0).sort((a, b) => a - b);
  const minPositive = positiveScores.length > 0 ? Math.min(...positiveScores) : null;
  const sampleSize = positiveScores.length;
  const confidence: CareerOpsPatternScoreThreshold["confidence"] =
    sampleSize >= 8 ? "high" : sampleSize >= 4 ? "medium" : "low";

  let lowerBound: number | null = null;
  let upperBound: number | null = null;

  if (sampleSize > 0) {
    lowerBound = Math.max(0, Math.floor(percentile(positiveScores, 0.25)));
    upperBound = Math.min(100, Math.ceil(percentile(positiveScores, 0.75)));

    if (lowerBound > upperBound) {
      const midpoint = Math.round((lowerBound + upperBound) / 2);
      lowerBound = midpoint;
      upperBound = midpoint;
    }
  }

  const scoreThreshold: CareerOpsPatternScoreThreshold = {
    recommended: minPositive == null ? null : Math.max(0, Math.floor(minPositive)),
    lowerBound,
    upperBound,
    confidence,
    sampleSize,
    reasoning:
      minPositive == null
        ? "Not enough positive outcome data to determine a threshold."
        : `Positive outcomes cluster around ${lowerBound}-${upperBound}; use this band as your target and treat scores below ${Math.max(0, Math.floor(minPositive))} as lower-confidence bets.`,
  };

  const archetypeBreakdown = buildArchetypeBreakdown(applications);
  const archetypeDeltas = buildArchetypeDeltaAnalysis({
    archetypeBreakdown,
    outcomeCounts,
    totalApplications: applications.length,
  });
  const blockerAnalysis = buildBlockerAnalysis(applications);
  const blockerTagAnalysis = buildBlockerTagAnalysis(applications);
  const blockerTagTrends = buildBlockerTagTrendAnalysis(applications, referenceDate);
  const weeklyVelocity = buildWeeklyVelocity(applications, referenceDate);

  const recommendations = buildRecommendations({
    totalApplications: applications.length,
    funnel,
    rates,
    scoreThreshold,
    outcomeCounts,
    archetypeBreakdown,
    blockerAnalysis,
    blockerTagAnalysis,
    blockerTagTrends,
  });

  return {
    totalApplications: applications.length,
    outcomeCounts,
    funnel,
    rates,
    stageDiagnostics,
    scoreByOutcome,
    scoreThreshold,
    archetypeBreakdown,
    archetypeDeltas,
    blockerAnalysis,
    blockerTagAnalysis,
    blockerTagTrends,
    weeklyVelocity,
    recommendations,
  };
}