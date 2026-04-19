import { describe, expect, it } from "vitest";
import {
  buildCadenceUpdateRows,
  isMissingCareerOpsTableError,
} from "@/lib/career-ops/recompute";

describe("career-ops cadence recompute helpers", () => {
  it("builds cadence targets from latest follow-up metadata", () => {
    const rows = buildCadenceUpdateRows(
      [
        {
          id: "app-1",
          user_id: "user-1",
          status: "applied",
          next_follow_up_date: "2026-04-20",
          applied_on: "2026-04-10",
        },
      ],
      [
        { application_id: "app-1", followed_up_on: "2026-04-12" },
        { application_id: "app-1", followed_up_on: "2026-04-15" },
      ],
      new Date("2026-04-18T00:00:00.000Z")
    );

    expect(rows).toHaveLength(1);
    expect(rows[0]).toEqual({
      applicationId: "app-1",
      userId: "user-1",
      currentDate: "2026-04-20",
      targetDate: "2026-04-22",
    });
  });

  it("uses applied_on fallback and clears terminal statuses", () => {
    const rows = buildCadenceUpdateRows(
      [
        {
          id: "app-2",
          user_id: "user-2",
          status: "responded",
          next_follow_up_date: null,
          applied_on: "2026-04-11",
        },
        {
          id: "app-3",
          user_id: "user-2",
          status: "offer",
          next_follow_up_date: "2026-04-19",
          applied_on: "2026-04-11",
        },
      ],
      [],
      new Date("2026-04-18T00:00:00.000Z")
    );

    expect(rows).toHaveLength(2);
    expect(rows[0]?.targetDate).toBe("2026-04-15");
    expect(rows[1]?.targetDate).toBeNull();
  });

  it("detects missing career-ops table errors", () => {
    expect(isMissingCareerOpsTableError({ code: "42P01", message: "relation missing" })).toBe(
      true
    );
    expect(
      isMissingCareerOpsTableError({ code: "XX000", message: "career_ops table does not exist" })
    ).toBe(true);
    expect(isMissingCareerOpsTableError({ code: "XX000", message: "generic failure" })).toBe(
      false
    );
  });
});
