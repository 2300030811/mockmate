import { describe, expect, it } from "vitest";
import {
  defaultNextFollowUpDate,
  normalizeCareerOpsStatus,
  todayIsoDate,
} from "@/lib/career-ops/status";
import {
  buildCareerOpsTrackerSummary,
  CareerOpsApplicationSnapshot,
} from "@/lib/career-ops/summary";

describe("career-ops status helpers", () => {
  it("normalizes aliases to canonical statuses", () => {
    expect(normalizeCareerOpsStatus("screening")).toBe("interview");
    expect(normalizeCareerOpsStatus("accepted")).toBe("offer");
    expect(normalizeCareerOpsStatus("ignored")).toBe("skip");
  });

  it("uses fallback status for unknown values", () => {
    expect(normalizeCareerOpsStatus("unknown-status")).toBe("evaluated");
    expect(normalizeCareerOpsStatus("unknown-status", "applied")).toBe("applied");
  });

  it("computes follow-up defaults for active statuses", () => {
    const baseDate = new Date("2026-04-18T00:00:00.000Z");
    expect(defaultNextFollowUpDate("evaluated", baseDate)).toBe("2026-04-21");
    expect(defaultNextFollowUpDate("interview", baseDate)).toBe("2026-04-20");
    expect(defaultNextFollowUpDate("offer", baseDate)).toBeNull();
  });
});

describe("career-ops tracker summary", () => {
  it("aggregates pipeline, due and score metrics", () => {
    const snapshots: CareerOpsApplicationSnapshot[] = [
      {
        id: "1",
        job_role: "Software Engineer",
        company: "Acme",
        status: "evaluated",
        match_score: 78,
        ats_score: null,
        next_follow_up_date: "2026-04-18",
        updated_at: "2026-04-18T10:00:00.000Z",
        applied_on: null,
      },
      {
        id: "2",
        job_role: "ML Engineer",
        company: "Nova",
        status: "applied",
        match_score: 82,
        ats_score: null,
        next_follow_up_date: "2026-04-16",
        updated_at: "2026-04-18T08:00:00.000Z",
        applied_on: "2026-04-15",
      },
      {
        id: "3",
        job_role: "Backend Engineer",
        company: "Orbit",
        status: "offer",
        match_score: 91,
        ats_score: null,
        next_follow_up_date: null,
        updated_at: "2026-04-17T09:00:00.000Z",
        applied_on: "2026-04-10",
      },
      {
        id: "4",
        job_role: "Data Engineer",
        company: "Flux",
        status: "responded",
        match_score: null,
        ats_score: null,
        next_follow_up_date: "2026-04-20",
        updated_at: "2026-04-17T10:00:00.000Z",
        applied_on: "2026-04-09",
      },
    ];

    const summary = buildCareerOpsTrackerSummary(
      snapshots,
      new Date(`${todayIsoDate(new Date("2026-04-18T00:00:00.000Z"))}T00:00:00.000Z`)
    );

    expect(summary.totalApplications).toBe(4);
    expect(summary.activePipelineCount).toBe(3);
    expect(summary.avgMatchScore).toBe(84);
    expect(summary.dueTodayCount).toBe(2);
    expect(summary.overdueCount).toBe(1);
    expect(summary.upcomingCount).toBe(1);
    expect(summary.statusCounts.offer).toBe(1);
    expect(summary.statusCounts.applied).toBe(1);
    expect(summary.funnel.responseRate).toBe(67);
    expect(summary.funnel.interviewRate).toBe(33);
    expect(summary.funnel.offerRate).toBe(33);
    expect(summary.urgencyLevel).toBe("critical");
    expect(summary.dueItems[0]?.id).toBe("2");
  });
});
