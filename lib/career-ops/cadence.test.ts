import { describe, expect, it } from "vitest";
import {
  cadenceDaysForStatus,
  calculateCadenceNextFollowUpDate,
  followUpUrgencyFromDate,
} from "@/lib/career-ops/cadence";

describe("career-ops cadence helpers", () => {
  it("computes cadence days by status and follow-up count", () => {
    expect(cadenceDaysForStatus("evaluated", 0)).toBe(3);
    expect(cadenceDaysForStatus("evaluated", 1)).toBe(4);
    expect(cadenceDaysForStatus("applied", 2)).toBe(7);
    expect(cadenceDaysForStatus("interview", 3)).toBe(6);
    expect(cadenceDaysForStatus("offer", 0)).toBeNull();
  });

  it("builds next follow-up date from reference date and cadence", () => {
    const next = calculateCadenceNextFollowUpDate({
      status: "applied",
      followUpCount: 2,
      referenceIsoDate: "2026-04-18",
    });

    expect(next).toBe("2026-04-25");
  });

  it("classifies urgency windows", () => {
    const reference = new Date("2026-04-18T00:00:00.000Z");

    expect(followUpUrgencyFromDate("2026-04-17", reference)).toBe("critical");
    expect(followUpUrgencyFromDate("2026-04-18", reference)).toBe("attention");
    expect(followUpUrgencyFromDate("2026-04-21", reference)).toBe("upcoming");
    expect(followUpUrgencyFromDate("2026-05-04", reference)).toBe("calm");
    expect(followUpUrgencyFromDate(null, reference)).toBe("calm");
  });
});
