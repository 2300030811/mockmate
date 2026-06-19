import { describe, expect, it, vi } from "vitest";
import { careerOpsRepository } from "./career-ops-repository";

describe("careerOpsRepository", () => {
  it("getFollowUpCount counts correctly", async () => {
    const mockEq2 = vi.fn().mockResolvedValue({ count: 4, error: null });
    const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });
    const mockDb = {
      from: vi.fn().mockReturnValue({ select: mockSelect }),
    } as any;

    const count = await careerOpsRepository.getFollowUpCount(mockDb, "user-1", "app-1");
    expect(mockDb.from).toHaveBeenCalledWith("career_ops_follow_ups");
    expect(mockSelect).toHaveBeenCalledWith("id", { count: "exact", head: true });
    expect(mockEq1).toHaveBeenCalledWith("user_id", "user-1");
    expect(mockEq2).toHaveBeenCalledWith("application_id", "app-1");
    expect(count).toBe(4);
  });
});
