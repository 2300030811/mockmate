import { describe, expect, it } from "vitest";
import {
  buildCareerOpsPatternInsights,
  emptyCareerOpsPatternInsights,
} from "@/lib/career-ops/patterns";
import type { CareerOpsApplicationSnapshot } from "@/lib/career-ops/summary";

function makeSnapshot(overrides: Partial<CareerOpsApplicationSnapshot>): CareerOpsApplicationSnapshot {
  const snapshot: CareerOpsApplicationSnapshot = {
    id: "app",
    job_role: "Software Engineer",
    company: "Acme",
    status: "evaluated",
    match_score: 70,
    ats_score: null,
    next_follow_up_date: null,
    updated_at: "2026-04-18T10:00:00.000Z",
    applied_on: null,
    ...overrides,
  };

  return {
    ...snapshot,
    ats_score: snapshot.ats_score ?? null,
  };
}

describe("career-ops pattern insights", () => {
  it("returns empty insight defaults", () => {
    const empty = emptyCareerOpsPatternInsights();
    expect(empty.totalApplications).toBe(0);
    expect(empty.recommendations).toHaveLength(0);
    expect(empty.rates.responseRate).toBeNull();
    expect(empty.stageDiagnostics).toHaveLength(0);
    expect(empty.archetypeDeltas).toHaveLength(0);
    expect(empty.blockerTagAnalysis).toHaveLength(0);
    expect(empty.blockerTagTrends).toHaveLength(0);
    expect(empty.weeklyVelocity).toHaveLength(0);
    expect(empty.scoreThreshold.confidence).toBe("low");
    expect(empty.scoreThreshold.sampleSize).toBe(0);
  });

  it("builds funnel, outcomes and threshold from snapshots", () => {
    const data: CareerOpsApplicationSnapshot[] = [
      makeSnapshot({ id: "1", status: "evaluated", match_score: 65 }),
      makeSnapshot({ id: "2", status: "applied", match_score: 72 }),
      makeSnapshot({ id: "3", status: "responded", match_score: 77 }),
      makeSnapshot({ id: "4", status: "interview", match_score: 81 }),
      makeSnapshot({ id: "5", status: "offer", match_score: 85 }),
      makeSnapshot({ id: "6", status: "rejected", match_score: 69 }),
      makeSnapshot({ id: "7", status: "skip", match_score: 40 }),
    ];

    const insights = buildCareerOpsPatternInsights(data);

    expect(insights.totalApplications).toBe(7);
    expect(insights.outcomeCounts.positive).toBe(3);
    expect(insights.outcomeCounts.negative).toBe(1);
    expect(insights.outcomeCounts.self_filtered).toBe(1);
    expect(insights.outcomeCounts.pending).toBe(2);

    expect(insights.rates.applyRate).toBe(83);
    expect(insights.rates.responseRate).toBe(80);
    expect(insights.rates.interviewRate).toBe(50);
    expect(insights.rates.offerRate).toBe(50);

    expect(insights.stageDiagnostics).toHaveLength(4);
    expect(insights.stageDiagnostics[0]).toMatchObject({
      stage: "evaluated_to_applied",
      conversionRate: 83,
      dropOffRate: 17,
      severity: "healthy",
    });
    expect(insights.stageDiagnostics[2]).toMatchObject({
      stage: "response_to_interview",
      conversionRate: 50,
      dropOffRate: 50,
      severity: "watch",
    });

    expect(insights.scoreByOutcome.positive.avg).toBe(81);
    expect(insights.scoreThreshold.recommended).toBe(77);
    expect(insights.scoreThreshold.lowerBound).toBe(79);
    expect(insights.scoreThreshold.upperBound).toBe(83);
    expect(insights.scoreThreshold.confidence).toBe("low");
    expect(insights.scoreThreshold.sampleSize).toBe(3);
  });

  it("emits high-impact recommendations for weak conversion", () => {
    const weakPipeline: CareerOpsApplicationSnapshot[] = [
      makeSnapshot({ id: "1", status: "evaluated", match_score: 62 }),
      makeSnapshot({ id: "2", status: "evaluated", match_score: 60 }),
      makeSnapshot({ id: "3", status: "evaluated", match_score: 58 }),
      makeSnapshot({ id: "4", status: "applied", match_score: 61 }),
      makeSnapshot({ id: "5", status: "applied", match_score: 59 }),
      makeSnapshot({ id: "6", status: "applied", match_score: 57 }),
      makeSnapshot({ id: "7", status: "rejected", match_score: 56 }),
      makeSnapshot({ id: "8", status: "discarded", match_score: 55 }),
    ];

    const insights = buildCareerOpsPatternInsights(weakPipeline);

    expect(insights.recommendations.length).toBeGreaterThan(0);
    expect(insights.recommendations.some((rec) => rec.impact === "high")).toBe(true);
    expect(
      insights.stageDiagnostics.find((item) => item.stage === "response_to_interview")?.severity
    ).toBe("critical");
  });

  it("builds archetype and blocker diagnostics", () => {
    const data: CareerOpsApplicationSnapshot[] = [
      makeSnapshot({
        id: "a1",
        status: "responded",
        match_score: 84,
        role_archetype: "frontend",
        primary_blocker: "delivery-gap",
        blocker_tags: ["system-design", "leadership"],
      }),
      makeSnapshot({
        id: "a2",
        status: "offer",
        match_score: 88,
        role_archetype: "frontend",
        primary_blocker: "delivery-gap",
        blocker_tags: ["system-design"],
      }),
      makeSnapshot({
        id: "a3",
        status: "rejected",
        match_score: 62,
        role_archetype: "backend",
        primary_blocker: "stack-mismatch",
        blocker_tags: ["system-design", "distributed-systems"],
      }),
      makeSnapshot({
        id: "a4",
        status: "discarded",
        match_score: 59,
        role_archetype: "backend",
        primary_blocker: "stack-mismatch",
        blocker_tags: ["distributed-systems"],
      }),
      makeSnapshot({
        id: "a5",
        status: "applied",
        match_score: 61,
        role_archetype: "backend",
        primary_blocker: "stack-mismatch",
        blocker_tags: ["communication"],
      }),
      makeSnapshot({
        id: "a6",
        status: "skip",
        match_score: 52,
        role_archetype: "data",
        primary_blocker: "domain-mismatch",
        blocker_tags: ["domain-knowledge"],
      }),
    ];

    const insights = buildCareerOpsPatternInsights(data);

    expect(insights.archetypeBreakdown[0]).toMatchObject({
      archetype: "backend",
      total: 3,
      conversionRate: 0,
    });
    expect(insights.archetypeBreakdown.find((item) => item.archetype === "frontend")?.conversionRate).toBe(100);

    expect(insights.archetypeDeltas[0]).toMatchObject({
      archetype: "frontend",
      baselineConversionRate: 33,
      deltaPercentagePoints: 67,
      trend: "above",
    });
    expect(insights.archetypeDeltas[1]).toMatchObject({
      archetype: "backend",
      baselineConversionRate: 33,
      deltaPercentagePoints: -33,
      trend: "below",
    });

    expect(insights.blockerAnalysis[0]).toMatchObject({
      blocker: "stack-mismatch",
      frequency: 3,
      percentage: 50,
    });

    expect(insights.blockerTagAnalysis[0]).toMatchObject({
      tag: "system-design",
      frequency: 3,
      percentage: 50,
    });

    expect(
      insights.recommendations.some((rec) =>
        rec.action.includes("stack-mismatch") || rec.reasoning.includes("stack-mismatch")
      )
    ).toBe(true);
    expect(insights.recommendations.some((rec) => rec.action.startsWith("Shift volume"))).toBe(true);
  });

  it("computes blocker tag trends across recent and previous windows", () => {
    const data: CareerOpsApplicationSnapshot[] = [
      makeSnapshot({
        id: "t1",
        updated_at: "2026-04-18T10:00:00.000Z",
        blocker_tags: ["system-design", "leadership"],
      }),
      makeSnapshot({
        id: "t2",
        updated_at: "2026-04-16T10:00:00.000Z",
        blocker_tags: ["system-design"],
      }),
      makeSnapshot({
        id: "t3",
        updated_at: "2026-04-15T10:00:00.000Z",
        blocker_tags: ["system-design"],
      }),
      makeSnapshot({
        id: "t4",
        updated_at: "2026-04-04T10:00:00.000Z",
        blocker_tags: ["system-design"],
      }),
      makeSnapshot({
        id: "t5",
        updated_at: "2026-04-03T10:00:00.000Z",
        blocker_tags: ["communication"],
      }),
      makeSnapshot({
        id: "t6",
        updated_at: "2026-04-02T10:00:00.000Z",
        blocker_tags: ["communication"],
      }),
    ];

    const insights = buildCareerOpsPatternInsights(data, new Date("2026-04-19T00:00:00.000Z"));
    const systemDesignTrend = insights.blockerTagTrends.find((item) => item.tag === "system-design");
    const communicationTrend = insights.blockerTagTrends.find((item) => item.tag === "communication");

    expect(systemDesignTrend).toMatchObject({
      recentFrequency: 3,
      previousFrequency: 1,
      recentPercentage: 100,
      previousPercentage: 33,
      deltaPercentagePoints: 67,
      trend: "up",
    });

    expect(communicationTrend).toMatchObject({
      recentFrequency: 0,
      previousFrequency: 2,
      recentPercentage: 0,
      previousPercentage: 67,
      deltaPercentagePoints: -67,
      trend: "down",
    });
  });

  it("builds weekly velocity buckets for the last six iso weeks", () => {
    const data: CareerOpsApplicationSnapshot[] = [
      makeSnapshot({
        id: "w1",
        status: "applied",
        updated_at: "2026-04-18T10:00:00.000Z",
      }),
      makeSnapshot({
        id: "w2",
        status: "responded",
        updated_at: "2026-04-16T10:00:00.000Z",
      }),
      makeSnapshot({
        id: "w3",
        status: "offer",
        updated_at: "2026-04-08T10:00:00.000Z",
      }),
      makeSnapshot({
        id: "w4",
        status: "applied",
        updated_at: "2026-02-01T10:00:00.000Z",
      }),
    ];

    const insights = buildCareerOpsPatternInsights(data, new Date("2026-04-19T00:00:00.000Z"));

    expect(insights.weeklyVelocity).toHaveLength(6);

    const currentWeek = insights.weeklyVelocity[insights.weeklyVelocity.length - 1];
    expect(currentWeek).toMatchObject({
      total: 2,
      applied: 1,
      progressed: 1,
      offers: 0,
    });

    const previousWeek = insights.weeklyVelocity[insights.weeklyVelocity.length - 2];
    expect(previousWeek).toMatchObject({
      total: 1,
      applied: 0,
      progressed: 1,
      offers: 1,
    });
  });

  it("raises threshold confidence with larger positive sample sizes", () => {
    const data: CareerOpsApplicationSnapshot[] = [
      makeSnapshot({ id: "h1", status: "responded", match_score: 70 }),
      makeSnapshot({ id: "h2", status: "interview", match_score: 72 }),
      makeSnapshot({ id: "h3", status: "offer", match_score: 74 }),
      makeSnapshot({ id: "h4", status: "responded", match_score: 76 }),
      makeSnapshot({ id: "h5", status: "interview", match_score: 78 }),
      makeSnapshot({ id: "h6", status: "offer", match_score: 80 }),
      makeSnapshot({ id: "h7", status: "responded", match_score: 82 }),
      makeSnapshot({ id: "h8", status: "offer", match_score: 84 }),
      makeSnapshot({ id: "h9", status: "rejected", match_score: 60 }),
    ];

    const insights = buildCareerOpsPatternInsights(data);

    expect(insights.scoreThreshold.sampleSize).toBe(8);
    expect(insights.scoreThreshold.confidence).toBe("high");
    expect(insights.scoreThreshold.lowerBound).toBe(73);
    expect(insights.scoreThreshold.upperBound).toBe(81);
  });
});